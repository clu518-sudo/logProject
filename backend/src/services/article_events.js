import { EventEmitter } from "node:events";

export const articleEvents = new EventEmitter();
articleEvents.setMaxListeners(0);

export function emitArticleUpdated(articleRow) {
  if (!articleRow) return;
  articleEvents.emit("article.updated", {
    id: articleRow.id,
    headerImagePath: articleRow.header_image_path,
    headerImageStatus: articleRow.header_image_status || "none",
    isPublished: !!articleRow.is_published,
    authorUserId: articleRow.author_user_id,
    updatedAt: articleRow.updated_at,
  });
}

