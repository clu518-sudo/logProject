import { openDb } from "../db/db.js";
import { nowNzSqlite } from "../util/time.js";

// Save an uploaded image record and return its id.
// Logic: insert row -> return lastID.
export async function createImage({ ownerUserId, articleId, path, mime }) {
  const db = openDb();
  try {
    const result = await db.run(
      `INSERT INTO images (owner_user_id, article_id, path, mime, created_at)
       VALUES (?,?,?,?,?)`,
      [ownerUserId, articleId ?? null, path, mime, nowNzSqlite()]
    );
    return result.lastID;
  } finally {
    await db.close();
  }
}

