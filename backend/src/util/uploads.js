import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

// Upload constraints.
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]);

/**
 * Ensure a directory exists for file storage.
 *
 * **Inputs**: `dir` (string, absolute or relative path)
 * **Output**: none
 * **Side effects**: may create folders on disk
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Generate a safe random filename while keeping the original extension.
 *
 * **Inputs**: `originalName` (string) like `"photo.png"`
 * **Output**: random filename like `"a1b2c3...png"`
 * **Side effects**: none
 *
 * **Logic**
 * - Take extension -> create random 16-byte hex name -> combine.
 */
function safeFilename(originalName) {
  const ext = path.extname(originalName || "").toLowerCase().slice(0, 10);
  const name = crypto.randomBytes(16).toString("hex");
  return `${name}${ext || ""}`;
}

/**
 * Create a Multer disk storage configuration for a given upload subfolder.
 *
 * **Inputs**: `subdir` (string) e.g. `"avatars"`
 * **Output**: Multer `diskStorage` config object
 * **Side effects**: ensures the upload directory exists on disk
 *
 * **Logic**
 * - Resolve `uploads/<subdir>` -> create if missing -> configure destination + filename.
 */
function createStorage(subdir) {
  const baseDir = path.resolve(process.cwd(), "uploads", subdir);
  ensureDir(baseDir);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, baseDir),
    filename: (req, file, cb) => cb(null, safeFilename(file.originalname))
  });
}

/**
 * Create an Express middleware for uploading images.
 *
 * **Inputs**: `subdir` (string) folder inside `uploads/`
 * **Output**: Multer instance (you usually call `.single("fieldName")` on it)
 * **Side effects**: writes uploaded files to disk
 *
 * **Key term**
 * - *Multer*: a library that parses `multipart/form-data` (file uploads) in Express.
 *
 * **Logic**
 * - Set disk storage -> enforce size limit -> allow only specific image MIME types.
 */
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

/**
 * Convert a Multer file record into a URL path the frontend can use.
 *
 * **Inputs**
 * - `file`: Multer file object (we use `file.filename`)
 * - `subdir`: upload folder name
 *
 * **Output**: string like `"/uploads/avatars/<filename>"`
 * **Side effects**: none
 */
export function getRelativeUploadPath(file, subdir) {
  return `/uploads/${subdir}/${file.filename}`;
}

