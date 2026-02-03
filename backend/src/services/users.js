import { openDb } from "../db/db.js";

export async function getUserById(id) {
  const db = openDb();
  try {
    const row = await db.get(
      "SELECT id, username, real_name, dob, bio, avatar_type, avatar_key, avatar_path, is_admin, created_at, updated_at FROM users WHERE id = ?",
      [id]
    );
    return row || null;
  } finally {
    await db.close();
  }
}

export async function getUserByUsername(username) {
  const db = openDb();
  try {
    const row = await db.get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return row || null;
  } finally {
    await db.close();
  }
}

export async function createUser({ username, passwordHash, realName, dob, bio, avatarType, avatarKey }) {
  const db = openDb();
  try {
    const result = await db.run(
      `INSERT INTO users (username, password_hash, real_name, dob, bio, avatar_type, avatar_key)
       VALUES (?,?,?,?,?,?,?)`,
      [username, passwordHash, realName, dob, bio, avatarType, avatarKey]
    );
    return await getUserById(result.lastID);
  } finally {
    await db.close();
  }
}

export async function updateUser(userId, { username, realName, dob, bio, avatarType, avatarKey }) {
  const db = openDb();
  try {
    await db.run(
      `UPDATE users
       SET username = ?, real_name = ?, dob = ?, bio = ?, avatar_type = ?, avatar_key = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [username, realName, dob, bio, avatarType, avatarKey, userId]
    );
    return await getUserById(userId);
  } finally {
    await db.close();
  }
}

export async function updateUserAvatarPath(userId, avatarPath) {
  const db = openDb();
  try {
    await db.run(
      `UPDATE users
       SET avatar_type = 'upload', avatar_path = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [avatarPath, userId]
    );
    return await getUserById(userId);
  } finally {
    await db.close();
  }
}

export async function usernameExists(username) {
  const db = openDb();
  try {
    const row = await db.get("SELECT id FROM users WHERE username = ?", [username]);
    return !!row;
  } finally {
    await db.close();
  }
}

export async function deleteUserById(userId) {
  const db = openDb();
  try {
    await db.run("DELETE FROM users WHERE id = ?", [userId]);
  } finally {
    await db.close();
  }
}

export async function listUsersWithCounts() {
  const db = openDb();
  try {
    return await db.all(
      `SELECT u.id, u.username, u.real_name, u.dob, u.bio, u.avatar_type, u.avatar_key, u.avatar_path, u.is_admin,
              u.created_at, u.updated_at,
              COUNT(a.id) AS articleCount
       FROM users u
       LEFT JOIN articles a ON a.author_user_id = u.id
       GROUP BY u.id
       ORDER BY u.username ASC`
    );
  } finally {
    await db.close();
  }
}

