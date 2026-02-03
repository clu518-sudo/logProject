import { openDb } from "../db/db.js";
import { sha256Hex } from "../util/http.js";

const SESSION_DAYS = 7;

export function getSessionExpiresAt() {
  const now = new Date();
  now.setDate(now.getDate() + SESSION_DAYS);
  return now;
}

export async function createSession(userId, rawToken) {
  const db = openDb();
  const tokenHash = sha256Hex(rawToken);
  const expires = getSessionExpiresAt();
  try {
    await db.run(
      "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?,?,?)",
      [tokenHash, userId, expires.toISOString()]
    );
    return { tokenHash, expires };
  } finally {
    await db.close();
  }
}

export async function getSessionByTokenHash(rawToken) {
  const db = openDb();
  const tokenHash = sha256Hex(rawToken);
  try {
    const row = await db.get(
      "SELECT * FROM sessions WHERE token_hash = ? AND expires_at > datetime('now')",
      [tokenHash]
    );
    return row || null;
  } finally {
    await db.close();
  }
}

export async function deleteSessionByToken(rawToken) {
  const db = openDb();
  const tokenHash = sha256Hex(rawToken);
  try {
    await db.run("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
  } finally {
    await db.close();
  }
}

export async function deleteSessionsForUser(userId) {
  const db = openDb();
  try {
    await db.run("DELETE FROM sessions WHERE user_id = ?", [userId]);
  } finally {
    await db.close();
  }
}

