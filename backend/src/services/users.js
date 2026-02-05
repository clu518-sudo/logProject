import { openDb } from "../db/db.js";
import { nowNzSqlite } from "../util/time.js";

/**
 * Fetch a single user by id.
 *
 * **Inputs**: `id` (number)
 * **Output**: user row (selected profile fields) or `null`
 * **Side effects**: reads from DB
 *
 * **Logic**
 * - `SELECT ... FROM users WHERE id = ?` -> return row or null.
 */
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

/**
 * Fetch a user by username.
 *
 * **Inputs**: `username` (string)
 * **Output**: full user row (includes password hash) or `null`
 * **Side effects**: reads from DB
 */
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

/**
 * Create a new user account.
 *
 * **Inputs**: object with `username`, `passwordHash`, optional profile fields
 * **Output**: created user row (via `getUserById`)
 * **Side effects**: inserts into DB
 *
 * **Logic**
 * - INSERT -> read `lastID` -> fetch full row -> return.
 */
export async function createUser({ username, passwordHash, realName, dob, bio, avatarType, avatarKey }) {
  const db = openDb();
  try {
    const nowNz = nowNzSqlite();
    const result = await db.run(
      `INSERT INTO users (username, password_hash, real_name, dob, bio, avatar_type, avatar_key, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [username, passwordHash, realName, dob, bio, avatarType, avatarKey, nowNz, nowNz]
    );
    return await getUserById(result.lastID);
  } finally {
    await db.close();
  }
}

/**
 * Update a user's profile fields.
 *
 * **Inputs**
 * - `userId` (number)
 * - fields object (username, realName, dob, bio, avatarType, avatarKey)
 *
 * **Output**: updated user row
 * **Side effects**: updates DB
 */
export async function updateUser(userId, { username, realName, dob, bio, avatarType, avatarKey }) {
  const db = openDb();
  try {
    await db.run(
      `UPDATE users
       SET username = ?, real_name = ?, dob = ?, bio = ?, avatar_type = ?, avatar_key = ?, updated_at = ?
       WHERE id = ?`,
      [username, realName, dob, bio, avatarType, avatarKey, nowNzSqlite(), userId]
    );
    return await getUserById(userId);
  } finally {
    await db.close();
  }
}

/**
 * Set user's avatar to an uploaded image path.
 *
 * **Inputs**
 * - `userId` (number)
 * - `avatarPath` (string): URL-ish path like `/uploads/avatars/<file>`
 *
 * **Output**: updated user row
 * **Side effects**: updates DB
 */
export async function updateUserAvatarPath(userId, avatarPath) {
  const db = openDb();
  try {
    await db.run(
      `UPDATE users
       SET avatar_type = 'upload', avatar_path = ?, updated_at = ?
       WHERE id = ?`,
      [avatarPath, nowNzSqlite(), userId]
    );
    return await getUserById(userId);
  } finally {
    await db.close();
  }
}

/**
 * Check whether a username is already taken.
 *
 * **Inputs**: `username` (string)
 * **Output**: boolean
 * **Side effects**: reads DB
 */
export async function usernameExists(username) {
  const db = openDb();
  try {
    const row = await db.get("SELECT id FROM users WHERE username = ?", [username]);
    return !!row;
  } finally {
    await db.close();
  }
}

/**
 * Delete a user by id.
 *
 * **Inputs**: `userId` (number)
 * **Output**: none
 * **Side effects**: deletes from DB
 */
export async function deleteUserById(userId) {
  const db = openDb();
  try {
    await db.run("DELETE FROM users WHERE id = ?", [userId]);
  } finally {
    await db.close();
  }
}

/**
 * List users plus their article counts (admin screen).
 *
 * **Inputs**: none
 * **Output**: array of rows with `articleCount`
 * **Side effects**: reads DB
 *
 * **Logic**
 * - LEFT JOIN articles -> COUNT -> GROUP BY user id.
 */
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

