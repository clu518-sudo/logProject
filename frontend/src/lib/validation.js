/**
 * Normalize username input for validation and API calls.
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
 */
export function isValidUsername(u) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
}

/**
 * Validate password length (frontend copy of backend rules).
 *
 * **Inputs**: `p` (unknown)
 * **Output**: boolean
 * **Side effects**: none
 */
export function isValidPassword(p) {
  return typeof p === "string" && p.length >= 8 && p.length <= 72;
}

/**
 * Normalize DOB input into `"YYYY-MM-DD"` or `""` for invalid/empty.
 *
 * **Inputs**: `dob` (string | null | undefined)
 * **Output**: string (either valid date or empty)
 * **Side effects**: none
 */
export function normalizeDob(dob) {
  const d = (dob ?? "").trim();
  if (!d) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  return d;
}

/**
 * Check that a value is a non-empty string and under a max length.
 *
 * **Inputs**: `s` (unknown), `max` (number)
 * **Output**: boolean
 * **Side effects**: none
 */
export function isNonEmptyString(s, max = 5000) {
  return typeof s === "string" && s.trim().length > 0 && s.length <= max;
}
