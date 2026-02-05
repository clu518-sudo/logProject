import fs from "node:fs";
import path from "node:path";
import {
  getArticleById,
  updateHeaderImage,
  updateHeaderImageStatus,
} from "./articles.js";
import { generateImagePromptFromArticle } from "./text_generation.js";
import { generateImage, saveImageFromUrl } from "./image_generation.js";

const running = new Set();

function stripHtml(html) {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Start AI header image generation in the background.
 *
 * - Returns immediately (does not block the request).
 * - Marks the article `header_image_status` as `generating`.
 * - On success: saves image to `uploads/header-images/` and sets `header_image_path`.
 * - On failure: marks status `failed`.
 */
export function startAiHeaderImageGeneration(articleId) {
  if (!articleId) return;
  if (running.has(articleId)) return;
  running.add(articleId);

  setImmediate(async () => {
    try {
      const current = await getArticleById(articleId);
      if (!current) return;

      // If the user already uploaded a header image, never overwrite it.
      if (current.header_image_path) {
        await updateHeaderImageStatus(articleId, "ready");
        return;
      }

      await updateHeaderImageStatus(articleId, "generating");

      const plain = stripHtml(current.content_html).slice(0, 2000);
      const prompt = await generateImagePromptFromArticle(current.title, plain);
      const imageUrl = await generateImage(prompt, "1280*720", {
        watermark: false,
        promptExtend: true,
      });

      const uploadsDir = path.resolve(process.cwd(), "uploads", "header-images");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const filename = `ai_generated_${articleId}_${Date.now()}.png`;
      await saveImageFromUrl(imageUrl, uploadsDir, filename);

      // Check again right before writing the header image to avoid overwriting manual uploads.
      const latest = await getArticleById(articleId);
      if (!latest || latest.header_image_path) {
        await updateHeaderImageStatus(articleId, latest?.header_image_path ? "ready" : "none");
        return;
      }

      const relPath = `/uploads/header-images/${filename}`;
      await updateHeaderImage(articleId, relPath);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("AI header image generation failed", { articleId, error: e });
      try {
        await updateHeaderImageStatus(articleId, "failed");
      } catch {
        // ignore
      }
    } finally {
      running.delete(articleId);
    }
  });
}

