import { openDb } from "../db/db.js";
import { nowNzSqlite } from "../util/time.js";
import { emitResearchUpdated } from "./article_events.js";

// Fetch the research row for an article (or null).
// Logic: query by article_id -> return row or null.
export async function getArticleResearch(articleId) {
  const db = openDb();
  try {
    const row = await db.get(
      `SELECT *
       FROM article_research
       WHERE article_id = ?`,
      [articleId]
    );
    return row || null;
  } finally {
    await db.close();
  }
}

// Create or update the research row for an article.
// Logic: read current -> merge -> insert or update -> emit event.
export async function upsertArticleResearch(articleId, fields = {}) {
  const db = openDb();
  try {
    const existing = await db.get(
      "SELECT * FROM article_research WHERE article_id = ?",
      [articleId]
    );
    const nowNz = nowNzSqlite();
    const next = {
      status: fields.status ?? existing?.status ?? "none",
      summaryMd: fields.summaryMd ?? existing?.summary_md ?? "",
      sourcesJson: fields.sourcesJson ?? existing?.sources_json ?? "[]",
      questionsJson: fields.questionsJson ?? existing?.questions_json ?? "[]",
      errorMessage: fields.errorMessage ?? existing?.error_message ?? null,
      expiresAt: fields.expiresAt ?? existing?.expires_at ?? null,
    };

    if (!existing) {
      await db.run(
        `INSERT INTO article_research
         (article_id, status, summary_md, sources_json, questions_json, error_message, created_at, updated_at, expires_at)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          articleId,
          next.status,
          next.summaryMd,
          next.sourcesJson,
          next.questionsJson,
          next.errorMessage,
          nowNz,
          nowNz,
          next.expiresAt,
        ]
      );
    } else {
      await db.run(
        `UPDATE article_research
         SET status = ?,
             summary_md = ?,
             sources_json = ?,
             questions_json = ?,
             error_message = ?,
             updated_at = ?,
             expires_at = ?
         WHERE article_id = ?`,
        [
          next.status,
          next.summaryMd,
          next.sourcesJson,
          next.questionsJson,
          next.errorMessage,
          nowNz,
          next.expiresAt,
          articleId,
        ]
      );
    }

    const row = await db.get(
      "SELECT * FROM article_research WHERE article_id = ?",
      [articleId]
    );
    const articleRow = await db.get(
      "SELECT id, is_published, author_user_id FROM articles WHERE id = ?",
      [articleId]
    );
    emitResearchUpdated(row, articleRow);
    return row || null;
  } finally {
    await db.close();
  }
}
