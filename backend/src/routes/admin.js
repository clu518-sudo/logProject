import express from "express";
import { requireAdmin } from "../middleware/auth.js";
import { listUsersWithCounts, deleteUserById } from "../services/users.js";
import { deleteSessionsForUser } from "../services/sessions.js";

const router = express.Router();

router.get("/users", requireAdmin, async (req, res, next) => {
  try {
    const users = await listUsersWithCounts();
    return res.json(users.map((u) => ({
      id: u.id,
      username: u.username,
      realName: u.real_name,
      dob: u.dob,
      bio: u.bio,
      avatarType: u.avatar_type,
      avatarKey: u.avatar_key,
      avatarPath: u.avatar_path,
      isAdmin: !!u.is_admin,
      articleCount: u.articleCount
    })));
  } catch (e) {
    return next(e);
  }
});

router.delete("/users/:id", requireAdmin, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    await deleteSessionsForUser(userId);
    await deleteUserById(userId);
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

export default router;

