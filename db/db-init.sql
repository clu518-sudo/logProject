-- Personal Blogging System (SQLite)
-- Schema + seed data for demo/testing
-- Note: password hashes are bcrypt hashes for known demo passwords (see README).

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  real_name TEXT,
  dob TEXT,
  bio TEXT,
  avatar_type TEXT NOT NULL DEFAULT 'predefined' CHECK (avatar_type IN ('predefined','upload')),
  avatar_key TEXT,
  avatar_path TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL DEFAULT '',
  header_image_path TEXT,
  header_image_status TEXT NOT NULL DEFAULT 'none' CHECK (header_image_status IN ('none','generating','ready','failed')),
  is_published INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  author_user_id INTEGER NOT NULL,
  parent_comment_id INTEGER,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id INTEGER NOT NULL,
  article_id INTEGER,
  path TEXT NOT NULL,
  mime TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
);

CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_articles_author ON articles(author_user_id);
CREATE INDEX idx_articles_created ON articles(created_at);
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Demo users:
-- Password for all demo users: Password123!
-- These hashes were generated with bcrypt (10 rounds).
INSERT INTO users (username, password_hash, real_name, dob, bio, avatar_type, avatar_key, is_admin)
VALUES
  ('alice', 'PLAINTEXT:Password123!', 'Alice Example', '2000-01-02', 'I like writing about tech and uni life.', 'predefined', 'pikachu', 0),
  ('bob',   'PLAINTEXT:Password123!', 'Bob Example',   '1999-05-10', 'Coffee, books, and small projects.',     'predefined', 'bulbasaur', 0),
  ('admin', 'PLAINTEXT:Password123!', 'Admin User',    '1990-12-12', 'Admin account for Swing testing.',       'predefined', 'charmander', 1);

-- Sample articles (including a draft)
INSERT INTO articles (author_user_id, title, content_html, is_published)
VALUES
  (1, 'Welcome to the Blog', '<p>Hello! This is a seeded article. Try editing me after you log in.</p>', 1),
  (2, 'My First Post', '<p>This is Bob''s first post. You can add comments and replies.</p>', 1),
  (1, 'Draft: Ideas for next week', '<p><strong>Draft</strong> content (only visible in "My articles").</p>', 0);

-- Sample comments with nested replies (any depth supported by parent_comment_id)
INSERT INTO comments (article_id, author_user_id, parent_comment_id, content)
VALUES
  (1, 2, NULL, 'Nice post!'),
  (1, 1, 1,    'Thanks Bob!'),
  (1, 2, 2,    'You are welcome.'),
  (1, 3, 3,    'Admin here: please keep it friendly.'),
  (2, 1, NULL, 'Good start, Bob.'),
  (2, 2, 5,    'Thanks Alice!');

