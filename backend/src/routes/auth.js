import express from "express";
import bcrypt from "bcrypt";
import { randomToken, setCookie, clearCookie, parseCookies } from "../util/http.js";
import { getUserByUsername } from "../services/users.js";
import { createSession, deleteSessionByToken, getSessionExpiresAt } from "../services/sessions.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: { code: "bad_request", message: "Missing credentials" } });
    const user = await getUserByUsername(username.trim());
    if (!user) return res.status(401).json({ error: { code: "invalid_credentials", message: "Invalid credentials" } });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: { code: "invalid_credentials", message: "Invalid credentials" } });
    const token = randomToken(32);
    const { expires } = await createSession(user.id, token);
    setCookie(res, "sid", token, { httpOnly: true, sameSite: "Lax", expires });
    return res.json({
      id: user.id,
      username: user.username,
      realName: user.real_name,
      isAdmin: !!user.is_admin,
      avatarType: user.avatar_type,
      avatarKey: user.avatar_key,
      avatarPath: user.avatar_path
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = parseCookies(req).sid;
    if (token) await deleteSessionByToken(token);
    clearCookie(res, "sid");
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

router.get("/me", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: { code: "unauthenticated", message: "Login required" } });
  return res.json({
    id: req.user.id,
    username: req.user.username,
    realName: req.user.real_name,
    dob: req.user.dob,
    bio: req.user.bio,
    avatarType: req.user.avatar_type,
    avatarKey: req.user.avatar_key,
    avatarPath: req.user.avatar_path,
    isAdmin: !!req.user.is_admin
  });
});

export default router;

