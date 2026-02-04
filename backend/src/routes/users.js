import express from "express";
import bcrypt from "bcrypt";
import path from "node:path";
import { requireAuth } from "../middleware/auth.js";
import { imageUpload, getRelativeUploadPath } from "../util/uploads.js";
import {
  normalizeUsername,
  isValidUsername,
  isValidPassword,
  normalizeDob,
} from "../util/validation.js";
import {
  createUser,
  getUserById,
  getUserByUsername,
  updateUser,
  updateUserAvatarPath,
  usernameExists,
  deleteUserById,
} from "../services/users.js";
import { deleteSessionsForUser } from "../services/sessions.js";

// Create a router for user-related endpoints.
const router = express.Router();

// Multer middleware for single avatar file uploads.
const avatarUpload = imageUpload("avatars").single("avatar");

// Default avatar options (Pokemon-themed)
const DEFAULT_AVATARS = [
  "pikachu_no_border.png",
  "charmander_no_border.png",
  "squirtle_no_border.png",
  "bulbasaur_no_border.png",
  "eevee_no_border.png",
  "gengar_no_border.png",
];

/**
 * Resolve the absolute filesystem path for a predefined avatar image.
 *
 * **Inputs**: `key` (string) avatar identifier (supports legacy values)
 * **Output**: absolute path to an image on disk
 * **Side effects**: none
 *
 * **Logic**
 * - Map legacy keys -> choose filename -> `path.resolve(...uploads/avatars/<file>)`.
 */
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
    gengar: "gengar_no_border.png",
  };
  const filename = keyMap[key] || "pikachu_no_border.png";
  return path.resolve(process.cwd(), "uploads", "avatars", filename);
}

/**
 * GET `/api/users/exists?username=...`
 *
 * Check if a username is available for registration.
 *
 * **Inputs (query)**
 * - `username` (string)
 *
 * **Output**
 * - `{ available: boolean }`
 *
 * **Logic**
 * - Normalize -> if empty => not available -> check DB -> invert result.
 */
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

/**
 * POST `/api/users`
 *
 * Create a new user (register).
 *
 * **Inputs (body JSON)**
 * - `username`, `password`
 * - optional: `realName`, `dob`, `bio`, `avatarKey`
 *
 * **Output (201)**
 * - Created user profile (no password hash)
 *
 * **Errors**
 * - 400 invalid username/password
 * - 409 username already exists
 *
 * **Side effects**
 * - Inserts user row in DB
 *
 * **Logic**
 * - Normalize/validate -> uniqueness check -> bcrypt.hash -> insert -> return profile.
 */
router.post("/users", async (req, res, next) => {
  try {
    const { username, password, realName, dob, bio, avatarKey } =
      req.body || {};
    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized))
      return res
        .status(400)
        .json({
          error: { code: "invalid_username", message: "Invalid username" },
        });
    if (!isValidPassword(password))
      return res
        .status(400)
        .json({
          error: { code: "invalid_password", message: "Invalid password" },
        });
    if (await usernameExists(normalized))
      return res
        .status(409)
        .json({
          error: { code: "username_taken", message: "Username already exists" },
        });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      username: normalized,
      passwordHash,
      realName: (realName ?? "").trim() || null,
      dob: normalizeDob(dob),
      bio: (bio ?? "").trim() || null,
      avatarType: "predefined",
      avatarKey: avatarKey || "pikachu",
    });
    return res.status(201).json({
      id: user.id,
      username: user.username,
      realName: user.real_name,
      dob: user.dob,
      bio: user.bio,
      avatarType: user.avatar_type,
      avatarKey: user.avatar_key,
    });
  } catch (e) {
    return next(e);
  }
});

/**
 * PATCH `/api/users/me` (auth required)
 *
 * Update current user's profile fields and avatar selection mode.
 *
 * **Inputs (body JSON)**
 * - optional: `username`, `realName`, `dob`, `bio`
 * - avatar controls: `avatarKey` (choose predefined) OR `avatarType: "upload"`
 *
 * **Output (200)**
 * - Updated profile fields
 *
 * **Side effects**
 * - Updates user row in DB
 *
 * **Logic**
 * - Validate username -> check conflicts -> decide avatar type/key -> update -> return.
 */
router.patch("/users/me", requireAuth, async (req, res, next) => {
  try {
    const { username, realName, dob, bio, avatarKey, avatarType } =
      req.body || {};
    const normalized = normalizeUsername(username ?? req.user.username);
    if (!isValidUsername(normalized))
      return res
        .status(400)
        .json({
          error: { code: "invalid_username", message: "Invalid username" },
        });
    const existing = await getUserByUsername(normalized);
    if (existing && existing.id !== req.user.id) {
      return res
        .status(409)
        .json({
          error: { code: "username_taken", message: "Username already exists" },
        });
    }
    const hasAvatarKey =
      typeof avatarKey === "string" && avatarKey.trim().length > 0;
    const wantsUpload = avatarType === "upload";
    let nextAvatarType = req.user.avatar_type || "predefined";
    if (hasAvatarKey) {
      nextAvatarType = "predefined";
    } else if (wantsUpload) {
      if (!req.user.avatar_path) {
        return res
          .status(400)
          .json({
            error: {
              code: "no_uploaded_avatar",
              message: "No uploaded avatar available",
            },
          });
      }
      nextAvatarType = "upload";
    }
    const nextAvatarKey = hasAvatarKey
      ? avatarKey.trim()
      : req.user.avatar_key || "pikachu";
    const updated = await updateUser(req.user.id, {
      username: normalized,
      realName: (realName ?? "").trim() || null,
      dob: normalizeDob(dob),
      bio: (bio ?? "").trim() || null,
      avatarType: nextAvatarType,
      avatarKey: nextAvatarKey,
    });
    return res.json({
      id: updated.id,
      username: updated.username,
      realName: updated.real_name,
      dob: updated.dob,
      bio: updated.bio,
      avatarType: updated.avatar_type,
      avatarKey: updated.avatar_key,
      avatarPath: updated.avatar_path,
    });
  } catch (e) {
    return next(e);
  }
});

/**
 * DELETE `/api/users/me` (auth required)
 *
 * Delete the current user's account.
 *
 * **Side effects**
 * - Deletes all sessions for the user
 * - Deletes the user row
 *
 * **Output**: 204 No Content
 */
router.delete("/users/me", requireAuth, async (req, res, next) => {
  try {
    await deleteSessionsForUser(req.user.id);
    await deleteUserById(req.user.id);
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

/**
 * POST `/api/users/me/avatar` (auth required)
 *
 * Upload a custom avatar image file for the current user.
 *
 * **Inputs**
 * - Multipart form field: `avatar` (image file)
 *
 * **Output (200)**
 * - `{ id, avatarType, avatarPath }`
 *
 * **Side effects**
 * - Writes file to disk (`uploads/avatars`)
 * - Updates `users.avatar_path` + `users.avatar_type`
 */
router.post("/users/me/avatar", requireAuth, (req, res, next) => {
  avatarUpload(req, res, async (err) => {
    if (err)
      return res
        .status(400)
        .json({ error: { code: "upload_error", message: err.message } });
    if (!req.file)
      return res
        .status(400)
        .json({ error: { code: "no_file", message: "No file uploaded" } });
    try {
      const relPath = getRelativeUploadPath(req.file, "avatars");
      const updated = await updateUserAvatarPath(req.user.id, relPath);
      return res.json({
        id: updated.id,
        avatarType: updated.avatar_type,
        avatarPath: updated.avatar_path,
      });
    } catch (e) {
      return next(e);
    }
  });
});

/**
 * GET `/api/users/:id/avatar`
 *
 * Serve a user's avatar image (uploaded avatar if present, otherwise predefined).
 *
 * **Inputs**: path param `id`
 * **Output**: image bytes (via `res.sendFile`)
 * **Errors**: 404 if user doesn't exist
 *
 * **Logic**
 * - Load user -> if uploaded -> send uploaded file -> else send predefined file.
 */
router.get("/users/:id/avatar", async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.sendStatus(404);
    if (user.avatar_type === "upload" && user.avatar_path) {
      return res.sendFile(
        path.resolve(
          process.cwd(),
          user.avatar_path.replace("/uploads/", "uploads/")
        )
      );
    }
    // Serve predefined avatar image
    const avatarPath = getDefaultAvatarPath(user.avatar_key || "pikachu");
    return res.sendFile(avatarPath);
  } catch (e) {
    return next(e);
  }
});

export default router;
