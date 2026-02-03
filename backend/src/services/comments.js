import { openDb } from "../db/db.js";

export async function listCommentsForArticle(articleId) {
  const db = openDb();
  try {
    return await db.all(
      `SELECT c.id, c.article_id, c.author_user_id, c.parent_comment_id, c.content, c.created_at,
              u.username AS author_username, u.real_name AS author_real_name,
              u.avatar_type AS author_avatar_type, u.avatar_key AS author_avatar_key, u.avatar_path AS author_avatar_path
       FROM comments c
       JOIN users u ON u.id = c.author_user_id
       WHERE c.article_id = ?
       ORDER BY c.created_at ASC`,
      [articleId]
    );
  } finally {
    await db.close();
  }
}

export async function createComment({ articleId, authorUserId, parentCommentId, content }) {
  const db = openDb();
  try {
    const result = await db.run(
      `INSERT INTO comments (article_id, author_user_id, parent_comment_id, content)
       VALUES (?,?,?,?)`,
      [articleId, authorUserId, parentCommentId, content]
    );
    return result.lastID;
  } finally {
    await db.close();
  }
}

export async function getCommentById(id) {
  const db = openDb();
  try {
    const row = await db.get("SELECT * FROM comments WHERE id = ?", [id]);
    return row || null;
  } finally {
    await db.close();
  }
}

export async function deleteComment(id) {
  const db = openDb();
  try {
    await db.run("DELETE FROM comments WHERE id = ?", [id]);
  } finally {
    await db.close();
  }
}

