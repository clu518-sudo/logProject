import { openDb } from "../db/db.js";
import { sha256Hex } from "../util/http.js";
import { formatNzSqlite, nowNzSqlite } from "../util/time.js";

// Number of days before a session expires.
const SESSION_DAYS = 7;

/**
 * Calculate when a new login session should expire.
 *
 * **Inputs**: none (uses current time)
 * **Output**: `Date` object representing expiry time
 * **Side effects**: none
 *
 * **Logic**
 * - Take `now` -> add 7 days -> return.
 */
export function getSessionExpiresAt() {
  const now = new Date();
  now.setDate(now.getDate() + SESSION_DAYS);
  return now;
}

/**
 * Create a session row in the database for a logged-in user.
 *
 * **Inputs**
 * - `userId` (number): user primary key
 * - `rawToken` (string): the secret session token we will also store in a cookie
 *
 * **Output**
 * - `{ tokenHash, expires }` where:
 *   - `tokenHash` is the SHA-256 hash stored in DB (safer than storing raw token)
 *   - `expires` is a `Date`
 *
 * **Side effects**
 * - Inserts a row into the `sessions` table
 *
 * **Key term**
 * - *Session cookie*: the browser stores a cookie (here `sid`) and sends it on each request.
 *
 * **Logic**
 * - Hash raw token -> compute expiry -> INSERT -> return details.
 */
export async function createSession(userId, rawToken) {
  const db = openDb();
  const tokenHash = sha256Hex(rawToken);
  const expires = getSessionExpiresAt();
  try {
    const nowNz = nowNzSqlite();
    await db.run(
      "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?,?,?,?)",
      [tokenHash, userId, formatNzSqlite(expires), nowNz]
    );
    return { tokenHash, expires };
  } finally {
    await db.close();
  }
}

/**
 * Find an active (not expired) session by a raw cookie token.
 *
 * **Inputs**: `rawToken` (string)
 * **Output**: session row object or `null`
 * **Side effects**: reads from DB
 *
 * **Logic**
 * - Hash raw token -> query DB for match AND not expired -> return.
 */
export async function getSessionByTokenHash(rawToken) {
  const db = openDb();
  const tokenHash = sha256Hex(rawToken);
  try {
    const row = await db.get(
      "SELECT * FROM sessions WHERE token_hash = ? AND expires_at > ?",
      [tokenHash, nowNzSqlite()]
    );
    return row || null;
  } finally {
    await db.close();
  }
}

/**
 * Delete one session by raw token (logout).
 *
 * **Inputs**: `rawToken` (string)
 * **Output**: none
 * **Side effects**: deletes from DB
 *
 * **Logic**
 * - Hash raw token -> DELETE matching rows.
 */
export async function deleteSessionByToken(rawToken) {
  const db = openDb();
  const tokenHash = sha256Hex(rawToken);
  try {
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
  } finally {
    await db.close();
  }
}

/**
 * Delete all sessions for a user id (used when deleting a user).
 *
 * **Inputs**: `userId` (number)
 * **Output**: none
 * **Side effects**: deletes from DB
 */
export async function deleteSessionsForUser(userId) {
  const db = openDb();
  try {
    await db.run("DELETE FROM sessions WHERE user_id = ?", [userId]);
  } finally {
    await db.close();
  }
}

