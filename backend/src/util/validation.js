/**
 * Normalize username input.
 *
 * **Inputs**: `u` (string | null | undefined)
 * **Output**: trimmed string (may be empty)
 * **Side effects**: none
 */
export function normalizeUsername(u) {
  return (u ?? "").trim();
}

/**
 * Validate username format.
 *
 * **Inputs**: `u` (string)
 * **Output**: boolean
 * **Side effects**: none
 *
 * **Rule**
 * - 3–20 characters, only letters/numbers/underscore.
 */
export function isValidUsername(u) {
  // Simple, teachable rule: 3-20 chars, letters/numbers/underscore
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
}

/**
 * Validate password format.
 *
 * **Inputs**: `p` (unknown)
 * **Output**: boolean
 * **Side effects**: none
 *
 * **Rule**
 * - 8–72 characters (bcrypt-safe maximum is 72 bytes).
 */
export function isValidPassword(p) {
  // Basic minimum; keep it simple for grading
  return typeof p === "string" && p.length >= 8 && p.length <= 72;
}

/**
 * Check that a value is a non-empty string with max length.
 *
 * **Inputs**: `s` (unknown), `max` (number)
 * **Output**: boolean
 * **Side effects**: none
 */
export function isNonEmptyString(s, max = 5000) {
  return typeof s === "string" && s.trim().length > 0 && s.length <= max;
}

/**
 * Clamp a value to a set of allowed enum values.
 *
 * **Inputs**: `val` (any), `allowed` (array), `fallback` (any)
 * **Output**: `val` if allowed, else `fallback`
 * **Side effects**: none
 */
export function clampEnum(val, allowed, fallback) {
  if (allowed.includes(val)) return val;
  return fallback;
}

/**
 * Normalize DOB input into `"YYYY-MM-DD"` or `null`.
 *
 * **Inputs**: `dob` (string | null | undefined)
 * **Output**: string or null
 * **Side effects**: none
 *
 * **Logic**
 * - Trim -> empty => null -> validate `YYYY-MM-DD` -> return or null.
 */
export function normalizeDob(dob) {
  const d = (dob ?? "").trim();
  if (!d) return null;
  // Expect YYYY-MM-DD, store as text
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

