import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";

// Absolute path to the SQLite database file.
const DB_PATH = path.resolve(process.cwd(), "data", "app.db");

// Ensure the folder for the DB file exists.
// Logic: compute parent dir -> create recursively if missing.
function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Return the database file path for other modules.
export function getDbPath() {
  return DB_PATH;
}

// Open a SQLite connection with foreign keys enabled.
// Logic: make sure data dir exists -> open db -> enable FK -> wrap in promises.
export function openDb() {
  ensureDataDir();
  const db = new sqlite3.Database(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON;");
  return wrapDb(db);
}

// Wrap sqlite3 callback APIs into promise-based methods.
// Logic: return an object with exec/run/get/all/close using Promises.
function wrapDb(db) {
  return {
    raw: db,
    exec(sql) {
      return new Promise((resolve, reject) => {
        db.exec(sql, (err) => (err ? reject(err) : resolve()));
      });
    },
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
      });
    },
    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        db.close((err) => (err ? reject(err) : resolve()));
      });
    },
  };
}
