import { openDb } from "../db/db.js";

// List articles with optional search and sorting.
// Logic: build WHERE clauses -> choose ORDER BY -> query DB -> return rows.
export async function listArticles({ q, sort, order, mineUserId }) {
  const db = openDb();
  const where = [];
  const params = [];

  if (q) {
    where.push("(lower(title) LIKE ? OR lower(content_html) LIKE ?)");
    const like = `%${q.toLowerCase()}%`;
    params.push(like, like);
  }

  if (mineUserId) {
    where.push("author_user_id = ?");
    params.push(mineUserId);
  } else {
    where.push("is_published = 1");
  }

  const orderBy =
    sort === "title"
      ? "a.title"
      : sort === "username"
      ? "u.username"
      : "a.created_at";
  const orderDir = order === "asc" ? "ASC" : "DESC";

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  try {
    return await db.all(
      `SELECT a.id, a.title, a.created_at, a.updated_at, a.is_published,
              a.header_image_path,
              u.id AS author_id, u.username AS author_username,
              u.avatar_type AS author_avatar_type, u.avatar_key AS author_avatar_key, u.avatar_path AS author_avatar_path
       FROM articles a
       JOIN users u ON u.id = a.author_user_id
       ${whereSql}
       ORDER BY ${orderBy} ${orderDir}`,
      params
    );
  } finally {
    await db.close();
  }
}

// Fetch a single article with author info.
// Logic: join articles/users -> return row or null.
export async function getArticleById(id) {
  const db = openDb();
  try {
    const row = await db.get(
      `SELECT a.*, u.username AS author_username, u.real_name AS author_real_name,
              u.avatar_type AS author_avatar_type, u.avatar_key AS author_avatar_key, u.avatar_path AS author_avatar_path
       FROM articles a
       JOIN users u ON u.id = a.author_user_id
       WHERE a.id = ?`,
      [id]
    );
    return row || null;
  } finally {
    await db.close();
  }
}

// Insert a new article and return the full row.
// Logic: insert -> fetch by lastID -> return.
export async function createArticle({
  authorUserId,
  title,
  contentHtml,
  isPublished,
}) {
  const db = openDb();
  try {
    const result = await db.run(
      `INSERT INTO articles (author_user_id, title, content_html, is_published)
       VALUES (?,?,?,?)`,
      [authorUserId, title, contentHtml, isPublished ? 1 : 0]
    );
    return await getArticleById(result.lastID);
  } finally {
    await db.close();
  }
}

// Update an existing article and return the new row.
// Logic: update fields -> fetch by id -> return.
export async function updateArticle(id, { title, contentHtml, isPublished }) {
  const db = openDb();
  try {
    await db.run(
      `UPDATE articles
       SET title = ?, content_html = ?, is_published = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [title, contentHtml, isPublished ? 1 : 0, id]
    );
    return await getArticleById(id);
  } finally {
    await db.close();
  }
}

// Update the header image path for an article.
// Logic: update header path + updated_at -> fetch by id.
export async function updateHeaderImage(id, headerPath) {
  const db = openDb();
  try {
    await db.run(
      `UPDATE articles SET header_image_path = ?, updated_at = datetime('now') WHERE id = ?`,
      [headerPath, id]
    );
    return await getArticleById(id);
  } finally {
    await db.close();
  }
}

// Delete an article by id.
// Logic: run DELETE statement -> close DB.
export async function deleteArticle(id) {
  const db = openDb();
  try {
    await db.run("DELETE FROM articles WHERE id = ?", [id]);
  } finally {
    await db.close();
  }
}
