import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeFilename(originalName) {
  const ext = path.extname(originalName || "").toLowerCase().slice(0, 10);
  const name = crypto.randomBytes(16).toString("hex");
  return `${name}${ext || ""}`;
}

function createStorage(subdir) {
  const baseDir = path.resolve(process.cwd(), "uploads", subdir);
  ensureDir(baseDir);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, baseDir),
    filename: (req, file, cb) => cb(null, safeFilename(file.originalname))
  });
}

export function imageUpload(subdir) {
  return multer({
    storage: createStorage(subdir),
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED.has(file.mimetype)) return cb(new Error("Only image uploads allowed"));
      return cb(null, true);
    }
  });
}

export function getRelativeUploadPath(file, subdir) {
  return `/uploads/${subdir}/${file.filename}`;
}

