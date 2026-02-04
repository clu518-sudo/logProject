import { parseCookies } from "../util/http.js";
import { getSessionByTokenHash } from "../services/sessions.js";
import { getUserById } from "../services/users.js";

/**
 * Attach the currently logged-in user (if any) to `req.user`.
 *
 * **Inputs**
 * - `req`: Express request. We read cookies from `req.headers.cookie`.
 * - `res`: Express response (not used here).
 * - `next`: Callback to move to the next middleware/route.
 *
 * **Output**
 * - No return value you use; it calls `next()` when finished.
 *
 * **Side effects**
 * - May set `req.user = user` when a valid session exists.
 *
 * **Key term**
 * - *Middleware*: a function that runs before your route handler. It can modify `req`/`res`.
 *
 * **Logic**
 * - Read `sid` cookie -> find session -> find user -> attach -> continue.
 */
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

/**
 * Require that the request is authenticated.
 *
 * **Inputs**: `req`, `res`, `next` (Express middleware signature)
 * **Output**: either sends `401` JSON or calls `next()`
 * **Side effects**: writes to the HTTP response on failure
 *
 * **Logic**
 * - If `req.user` is missing -> respond 401 -> stop.
 * - Else -> continue.
 */
export function requireAuth(req, res, next) {
  if (!req.user)
    return res
      .status(401)
      .json({ error: { code: "unauthenticated", message: "Login required" } });
  return next();
}

/**
 * Require that the request is from an admin user.
 *
 * **Inputs**: `req`, `res`, `next`
 * **Output**: `401` if not logged in, `403` if not admin, otherwise continue.
 * **Side effects**: writes to the HTTP response on failure
 *
 * **Logic**
 * - Not logged in -> 401.
 * - Logged in but not admin -> 403.
 * - Admin -> continue.
 */
export function requireAdmin(req, res, next) {
  if (!req.user)
    return res
      .status(401)
      .json({ error: { code: "unauthenticated", message: "Login required" } });
  if (!req.user.is_admin)
    return res
      .status(403)
      .json({ error: { code: "forbidden", message: "Admin only" } });
  return next();
}
