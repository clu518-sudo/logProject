import { openDb } from "../db/db.js";

export async function createImage({ ownerUserId, articleId, path, mime }) {
  const db = openDb();
  try {
    const result = await db.run(
      `INSERT INTO images (owner_user_id, article_id, path, mime)
       VALUES (?,?,?,?)`,
      [ownerUserId, articleId ?? null, path, mime]
    );
    return result.lastID;
  } finally {
    await db.close();
  }
}

