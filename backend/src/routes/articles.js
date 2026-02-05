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
  updateHeaderImageStatus,
} from "../services/articles.js";
import { createImage } from "../services/images.js";
import { startAiHeaderImageGeneration } from "../services/article_header_image_ai.js";
import { articleEvents } from "../services/article_events.js";

// Create a router for article-related endpoints.
const router = express.Router();
// Multer upload handlers for header images and editor images.
const headerUpload = imageUpload("header-images").single("image");
const editorUpload = imageUpload("article-images").single("image");

// List articles with optional filters.
// Logic: read query params -> enforce auth for "mine" -> query DB -> map fields -> return list.
router.get("/articles", async (req, res, next) => {
  try {
    const mine = req.query.mine === "true";
    if (mine && !req.user)
      return res.status(401).json({
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
        headerImageStatus: a.header_image_status || "none",
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

// Server-Sent Events stream for article updates (header image generation).
// Logic: keep connection open -> push events -> client reloads when needed.
router.get("/articles/events", async (req, res, next) => {
  try {
    const mine = req.query.mine === "true";
    if (mine && !req.user) {
      return res.status(401).json({
        error: { code: "unauthenticated", message: "Login required" },
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Send an initial comment so proxies establish the stream.
    res.write(": ok\n\n");

    const send = (payload) => {
      res.write(`event: article\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const onUpdated = (ev) => {
      if (!ev) return;
      if (mine) {
        if (req.user?.is_admin) return send(ev);
        if (ev.authorUserId !== req.user?.id) return;
        return send(ev);
      }
      // Public stream: only published article updates.
      if (!ev.isPublished) return;
      return send(ev);
    };

    articleEvents.on("article.updated", onUpdated);

    req.on("close", () => {
      articleEvents.off("article.updated", onUpdated);
    });
  } catch (e) {
    return next(e);
  }
});

// Create a new article for the logged-in user.
// Logic: validate title -> create record -> return created article.
router.post("/articles", requireAuth, async (req, res, next) => {
  try {
    const { title, contentHtml, isPublished, generateHeaderImage } = req.body || {};
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
    // If the client indicates no header image was uploaded, start AI generation in the background.
    if (generateHeaderImage !== false && !article.header_image_path) {
      await updateHeaderImageStatus(article.id, "generating");
      startAiHeaderImageGeneration(article.id);
    }
    const refreshed = await getArticleById(article.id);
    return res.status(201).json(refreshed);
  } catch (e) {
    return next(e);
  }
});

// Get a single article by id.
// Logic: fetch article -> enforce draft access rules -> return full article payload.
router.get("/articles/:id", async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.sendStatus(404);
    if (!article.is_published) {
      if (
        !req.user ||
        (req.user.id !== article.author_user_id && !req.user.is_admin)
      ) {
        return res.status(403).json({
          error: { code: "forbidden", message: "Draft not accessible" },
        });
      }
    }
    return res.json({
      id: article.id,
      title: article.title,
      contentHtml: article.content_html,
      headerImagePath: article.header_image_path,
      headerImageStatus: article.header_image_status || "none",
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

// Update an article (author or admin only).
// Logic: fetch -> authorize -> validate title -> update -> return updated.
router.patch("/articles/:id", requireAuth, async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.sendStatus(404);
    if (article.author_user_id !== req.user.id && !req.user.is_admin) {
      return res
        .status(403)
        .json({ error: { code: "forbidden", message: "Not allowed" } });
    }
    const { title, contentHtml, isPublished, generateHeaderImage } = req.body || {};
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
    if (
      generateHeaderImage === true &&
      !updated.header_image_path &&
      updated.header_image_status !== "generating"
    ) {
      await updateHeaderImageStatus(updated.id, "generating");
      startAiHeaderImageGeneration(updated.id);
      return res.json(await getArticleById(updated.id));
    }
    return res.json(updated);
  } catch (e) {
    return next(e);
  }
});

// Delete an article (author or admin only).
// Logic: fetch -> authorize -> delete -> return 204.
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

// Upload or remove an article header image.
// Logic: handle upload -> authorize -> optional remove -> update header path.
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

// Upload an inline image for the editor.
// Logic: handle upload -> authorize -> create image record -> return URL.
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
