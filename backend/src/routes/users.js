import express from "express";
import bcrypt from "bcrypt";
import path from "node:path";
import { requireAuth } from "../middleware/auth.js";
import { imageUpload, getRelativeUploadPath } from "../util/uploads.js";
import { normalizeUsername, isValidUsername, isValidPassword, normalizeDob } from "../util/validation.js";
import { createUser, getUserById, getUserByUsername, updateUser, updateUserAvatarPath, usernameExists, deleteUserById } from "../services/users.js";
import { deleteSessionsForUser } from "../services/sessions.js";

const router = express.Router();

const avatarUpload = imageUpload("avatars").single("avatar");

// Default avatar options (Pokemon-themed)
const DEFAULT_AVATARS = [
  "pikachu_no_border.png",
  "charmander_no_border.png",
  "squirtle_no_border.png",
  "bulbasaur_no_border.png",
  "eevee_no_border.png",
  "gengar_no_border.png"
];

function getDefaultAvatarPath(key) {
  // Map old color keys to new pokemon avatars for backward compatibility
  const keyMap = {
    blue: "squirtle_no_border.png",
    red: "charmander_no_border.png",
    green: "bulbasaur_no_border.png",
    purple: "gengar_no_border.png",
    orange: "charmander_no_border.png",
    gray: "eevee_no_border.png",
    pikachu: "pikachu_no_border.png",
    charmander: "charmander_no_border.png",
    squirtle: "squirtle_no_border.png",
    bulbasaur: "bulbasaur_no_border.png",
    eevee: "eevee_no_border.png",
    gengar: "gengar_no_border.png"
  };
  const filename = keyMap[key] || "pikachu_no_border.png";
  return path.resolve(process.cwd(), "uploads", "avatars", filename);
}

router.get("/users/exists", async (req, res, next) => {
  try {
    const username = normalizeUsername(req.query.username);
    if (!username) return res.json({ available: false });
    const exists = await usernameExists(username);
    return res.json({ available: !exists });
  } catch (e) {
    return next(e);
  }
});

router.post("/users", async (req, res, next) => {
  try {
    const { username, password, realName, dob, bio, avatarKey } = req.body || {};
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) return res.status(400).json({ error: { code: "invalid_username", message: "Invalid username" } });
    if (!isValidPassword(password)) return res.status(400).json({ error: { code: "invalid_password", message: "Invalid password" } });
    if (await usernameExists(normalized)) return res.status(409).json({ error: { code: "username_taken", message: "Username already exists" } });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      username: normalized,
      passwordHash,
      realName: (realName ?? "").trim() || null,
      dob: normalizeDob(dob),
      bio: (bio ?? "").trim() || null,
      avatarType: "predefined",
      avatarKey: avatarKey || "pikachu"
    });
    return res.status(201).json({
      id: user.id,
      username: user.username,
      realName: user.real_name,
      dob: user.dob,
      bio: user.bio,
      avatarType: user.avatar_type,
      avatarKey: user.avatar_key
    });
  } catch (e) {
    return next(e);
  }
});

router.patch("/users/me", requireAuth, async (req, res, next) => {
  try {
    const { username, realName, dob, bio, avatarKey, avatarType } = req.body || {};
    const normalized = normalizeUsername(username ?? req.user.username);
    if (!isValidUsername(normalized)) return res.status(400).json({ error: { code: "invalid_username", message: "Invalid username" } });
    const existing = await getUserByUsername(normalized);
    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ error: { code: "username_taken", message: "Username already exists" } });
    }
    const hasAvatarKey = typeof avatarKey === "string" && avatarKey.trim().length > 0;
    const wantsUpload = avatarType === "upload";
    let nextAvatarType = req.user.avatar_type || "predefined";
    if (hasAvatarKey) {
      nextAvatarType = "predefined";
    } else if (wantsUpload) {
      if (!req.user.avatar_path) {
        return res.status(400).json({ error: { code: "no_uploaded_avatar", message: "No uploaded avatar available" } });
      }
      nextAvatarType = "upload";
    }
    const nextAvatarKey = hasAvatarKey ? avatarKey.trim() : (req.user.avatar_key || "pikachu");
    const updated = await updateUser(req.user.id, {
      username: normalized,
      realName: (realName ?? "").trim() || null,
      dob: normalizeDob(dob),
      bio: (bio ?? "").trim() || null,
      avatarType: nextAvatarType,
      avatarKey: nextAvatarKey
    });
    return res.json({
      id: updated.id,
      username: updated.username,
      realName: updated.real_name,
      dob: updated.dob,
      bio: updated.bio,
      avatarType: updated.avatar_type,
      avatarKey: updated.avatar_key,
      avatarPath: updated.avatar_path
    });
  } catch (e) {
    return next(e);
  }
});

router.delete("/users/me", requireAuth, async (req, res, next) => {
  try {
    await deleteSessionsForUser(req.user.id);
    await deleteUserById(req.user.id);
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

router.post("/users/me/avatar", requireAuth, (req, res, next) => {
  avatarUpload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: { code: "upload_error", message: err.message } });
    if (!req.file) return res.status(400).json({ error: { code: "no_file", message: "No file uploaded" } });
    try {
      const relPath = getRelativeUploadPath(req.file, "avatars");
      const updated = await updateUserAvatarPath(req.user.id, relPath);
      return res.json({
        id: updated.id,
        avatarType: updated.avatar_type,
        avatarPath: updated.avatar_path
      });
    } catch (e) {
      return next(e);
    }
  });
});

router.get("/users/:id/avatar", async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.sendStatus(404);
    if (user.avatar_type === "upload" && user.avatar_path) {
      return res.sendFile(path.resolve(process.cwd(), user.avatar_path.replace("/uploads/", "uploads/")));
    }
    // Serve predefined avatar image
    const avatarPath = getDefaultAvatarPath(user.avatar_key || "pikachu");
    return res.sendFile(avatarPath);
  } catch (e) {
    return next(e);
  }
});

export default router;

