import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";

const DB_PATH = path.resolve(process.cwd(), "data", "app.db");

function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getDbPath() {
  return DB_PATH;
}

export function openDb() {
  ensureDataDir();
  const db = new sqlite3.Database(DB_PATH);
  db.exec("PRAGMA foreign_keys = ON;");
  return wrapDb(db);
}

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
    }
  };
}

