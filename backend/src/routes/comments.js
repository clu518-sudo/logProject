import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { isNonEmptyString } from "../util/validation.js";
import { createComment, deleteComment, getCommentById, listCommentsForArticle } from "../services/comments.js";
import { getArticleById } from "../services/articles.js";

const router = express.Router();

router.get("/articles/:id/comments", async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.sendStatus(404);
    const comments = await listCommentsForArticle(req.params.id);
    return res.json(comments.map((c) => ({
      id: c.id,
      articleId: c.article_id,
      authorUserId: c.author_user_id,
      parentCommentId: c.parent_comment_id,
      content: c.content,
      createdAt: c.created_at,
      author: { 
        username: c.author_username, 
        realName: c.author_real_name,
        avatarType: c.author_avatar_type,
        avatarKey: c.author_avatar_key,
        avatarPath: c.author_avatar_path
      }
    })));
  } catch (e) {
    return next(e);
  }
});

router.post("/articles/:id/comments", requireAuth, async (req, res, next) => {
  try {
    const { content, parentCommentId } = req.body || {};
    if (!isNonEmptyString(content, 2000)) {
      return res.status(400).json({ error: { code: "invalid_content", message: "Content required" } });
    }
    const article = await getArticleById(req.params.id);
    if (!article) return res.sendStatus(404);
    const id = await createComment({
      articleId: req.params.id,
      authorUserId: req.user.id,
      parentCommentId: parentCommentId ?? null,
      content: content.trim()
    });
    return res.status(201).json({ id });
  } catch (e) {
    return next(e);
  }
});

router.delete("/comments/:id", requireAuth, async (req, res, next) => {
  try {
    const comment = await getCommentById(req.params.id);
    if (!comment) return res.sendStatus(404);
    const article = await getArticleById(comment.article_id);
    const isArticleAuthor = article && article.author_user_id === req.user.id;
    if (comment.author_user_id !== req.user.id && !isArticleAuthor && !req.user.is_admin) {
      return res.status(403).json({ error: { code: "forbidden", message: "Not allowed" } });
    }
    await deleteComment(comment.id);
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

export default router;

