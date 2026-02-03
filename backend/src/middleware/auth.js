import { parseCookies } from "../util/http.js";
import { getSessionByTokenHash } from "../services/sessions.js";
import { getUserById } from "../services/users.js";

export async function attachUser(req, res, next) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.sid;
    if (!token) return next();
    const session = await getSessionByTokenHash(token);
    if (!session) return next();
    const user = await getUserById(session.user_id);
    if (!user) return next();
    req.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: { code: "unauthenticated", message: "Login required" } });
  return next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: { code: "unauthenticated", message: "Login required" } });
  if (!req.user.is_admin) return res.status(403).json({ error: { code: "forbidden", message: "Admin only" } });
  return next();
}

