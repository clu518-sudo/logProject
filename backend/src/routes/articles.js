import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { imageUpload, getRelativeUploadPath } from "../util/uploads.js";
import { isNonEmptyString } from "../util/validation.js";
import {
  createArticle,
  deleteArticle,
  getArticleById,
  listArticles,
  updateArticle,
  updateHeaderImage,
} from "../services/articles.js";
import { createImage } from "../services/images.js";

const router = express.Router();
const headerUpload = imageUpload("header-images").single("image");
const editorUpload = imageUpload("article-images").single("image");

router.get("/articles", async (req, res, next) => {
  try {
    const mine = req.query.mine === "true";
    if (mine && !req.user)
      return res
        .status(401)
        .json({
          error: { code: "unauthenticated", message: "Login required" },
        });
    const articles = await listArticles({
      q: req.query.q || "",
      sort: req.query.sort || "date",
      order: req.query.order || "desc",
      mineUserId: mine ? req.user.id : null,
    });
    return res.json(
      articles.map((a) => ({
        id: a.id,
        title: a.title,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        isPublished: !!a.is_published,
        headerImagePath: a.header_image_path,
        author: {
          id: a.author_id,
          username: a.author_username,
          avatarType: a.author_avatar_type,
          avatarKey: a.author_avatar_key,
          avatarPath: a.author_avatar_path,
        },
      }))
    );
  } catch (e) {
    return next(e);
  }
});

router.post("/articles", requireAuth, async (req, res, next) => {
  try {
    const { title, contentHtml, isPublished } = req.body || {};
    if (!isNonEmptyString(title, 200))
      return res
        .status(400)
        .json({ error: { code: "invalid_title", message: "Title required" } });
    const article = await createArticle({
      authorUserId: req.user.id,
      title: title.trim(),
      contentHtml: (contentHtml ?? "").trim(),
      isPublished: isPublished !== false,
    });
    return res.status(201).json(article);
  } catch (e) {
    return next(e);
  }
});

router.get("/articles/:id", async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.sendStatus(404);
    if (!article.is_published) {
      if (
        !req.user ||
        (req.user.id !== article.author_user_id && !req.user.is_admin)
      ) {
        return res
          .status(403)
          .json({
            error: { code: "forbidden", message: "Draft not accessible" },
          });
      }
    }
    return res.json({
      id: article.id,
      title: article.title,
      contentHtml: article.content_html,
      headerImagePath: article.header_image_path,
      isPublished: !!article.is_published,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      author: {
        id: article.author_user_id,
        username: article.author_username,
        realName: article.author_real_name,
        avatarType: article.author_avatar_type,
        avatarKey: article.author_avatar_key,
        avatarPath: article.author_avatar_path,
      },
    });
  } catch (e) {
    return next(e);
  }
});

router.patch("/articles/:id", requireAuth, async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.sendStatus(404);
    if (article.author_user_id !== req.user.id && !req.user.is_admin) {
      return res
        .status(403)
        .json({ error: { code: "forbidden", message: "Not allowed" } });
    }
    const { title, contentHtml, isPublished } = req.body || {};
    if (!isNonEmptyString(title ?? article.title, 200)) {
      return res
        .status(400)
        .json({ error: { code: "invalid_title", message: "Title required" } });
    }
    const updated = await updateArticle(article.id, {
      title: (title ?? article.title).trim(),
      contentHtml: (contentHtml ?? article.content_html).trim(),
      isPublished:
        isPublished === undefined ? !!article.is_published : isPublished,
    });
    return res.json(updated);
  } catch (e) {
    return next(e);
  }
});

router.delete("/articles/:id", requireAuth, async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.sendStatus(404);
    if (article.author_user_id !== req.user.id && !req.user.is_admin) {
      return res
        .status(403)
        .json({ error: { code: "forbidden", message: "Not allowed" } });
    }
    await deleteArticle(article.id);
    return res.sendStatus(204);
  } catch (e) {
    return next(e);
  }
});

router.post("/articles/:id/header-image", requireAuth, (req, res, next) => {
  headerUpload(req, res, async (err) => {
    if (err)
      return res
        .status(400)
        .json({ error: { code: "upload_error", message: err.message } });
    try {
      const article = await getArticleById(req.params.id);
      if (!article) return res.sendStatus(404);
      if (article.author_user_id !== req.user.id && !req.user.is_admin) {
        return res
          .status(403)
          .json({ error: { code: "forbidden", message: "Not allowed" } });
      }
      if (req.query.remove === "true") {
        const updated = await updateHeaderImage(article.id, null);
        return res.json(updated);
      }
      if (!req.file)
        return res
          .status(400)
          .json({ error: { code: "no_file", message: "No file uploaded" } });
      const relPath = getRelativeUploadPath(req.file, "header-images");
      const updated = await updateHeaderImage(article.id, relPath);
      return res.json(updated);
    } catch (e) {
      return next(e);
    }
  });
});

router.post("/articles/:id/images", requireAuth, (req, res, next) => {
  editorUpload(req, res, async (err) => {
    if (err)
      return res
        .status(400)
        .json({ error: { code: "upload_error", message: err.message } });
    if (!req.file)
      return res
        .status(400)
        .json({ error: { code: "no_file", message: "No file uploaded" } });
    try {
      const article = await getArticleById(req.params.id);
      if (!article) return res.sendStatus(404);
      if (article.author_user_id !== req.user.id && !req.user.is_admin) {
        return res
          .status(403)
          .json({ error: { code: "forbidden", message: "Not allowed" } });
      }
      const relPath = getRelativeUploadPath(req.file, "article-images");
      await createImage({
        ownerUserId: req.user.id,
        articleId: req.params.id,
        path: relPath,
        mime: req.file.mimetype,
      });
      return res.json({ url: relPath });
    } catch (e) {
      return next(e);
    }
  });
});

export default router;
