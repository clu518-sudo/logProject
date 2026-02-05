import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import { openDb, getDbPath } from "./db.js";

// Initialize the database if it does not exist yet.
// Logic: check db file -> create if missing -> ensure passwords are hashed.
export async function initDbIfNeeded() {
  const dbPath = getDbPath();
  const exists = fs.existsSync(dbPath);
  if (!exists) {
    await initDbForce();
  }
  await ensureArticleHeaderImageStatusColumn();
  await ensureHashedPasswords();
}

// Force-create database schema from SQL file.
// Logic: load db-init.sql -> execute statements -> close connection.
export async function initDbForce() {
  const sqlPath = path.resolve(process.cwd(), "..", "db", "db-init.sql");
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`db-init.sql not found at ${sqlPath}`);
  }
  const sql = fs.readFileSync(sqlPath, "utf-8");
  const db = openDb();
  try {
    await db.exec(sql);
  } finally {
    await db.close();
  }
}

// Migrate any old plaintext passwords into secure bcrypt hashes.
// Logic: find rows with PLAINTEXT: prefix -> hash -> update.
async function ensureHashedPasswords() {
  const db = openDb();
  try {
    const users = await db.all(
      "SELECT id, password_hash FROM users WHERE password_hash LIKE 'PLAINTEXT:%'"
    );
    for (const user of users) {
      const raw = user.password_hash.replace("PLAINTEXT:", "");
      const hash = await bcrypt.hash(raw, 10);
      await db.run("UPDATE users SET password_hash = ? WHERE id = ?", [
        hash,
        user.id,
      ]);
    }
  } finally {
    await db.close();
  }
}

// Ensure the articles table supports AI header image generation status.
// Logic: check PRAGMA table_info -> ALTER TABLE if missing -> backfill ready status.
async function ensureArticleHeaderImageStatusColumn() {
  const db = openDb();
  try {
    const cols = await db.all("PRAGMA table_info(articles)");
    const has = cols?.some((c) => c?.name === "header_image_status");
    if (!has) {
      await db.run(
        "ALTER TABLE articles ADD COLUMN header_image_status TEXT NOT NULL DEFAULT 'none'"
      );
    }
    // Backfill: if an article already has a header image path, mark it ready.
    await db.run(
      `UPDATE articles
       SET header_image_status = 'ready'
       WHERE header_image_path IS NOT NULL
         AND header_image_path <> ''
         AND (header_image_status IS NULL OR header_image_status = 'none')`
    );
  } finally {
    await db.close();
  }
}

// Allow running this file directly from the command line.
// Logic: if this module is the entry script, initialize and exit.
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  initDbForce()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log("DB initialized.");
      process.exit(0);
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    });
}
