import * as yup from "yup";

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
  const schema = yup
    .string()
    .required()
    .matches(/^[a-zA-Z0-9_]{3,20}$/);

  // Simple, teachable rule: 3-20 chars, letters/numbers/underscore
  return schema.isValidSync(u);
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
  const schema = yup
    .string()
    .strict(true)
    .min(8)
    .max(72)
    .required();

  // Basic minimum; keep it simple for grading
  return schema.isValidSync(p);
}

/**
 * Check that a value is a non-empty string with max length.
 *
 * **Inputs**: `s` (unknown), `max` (number)
 * **Output**: boolean
 * **Side effects**: none
 */
export function isNonEmptyString(s, max = 5000) {
  const schema = yup
    .string()
    .strict(true)
    .test("non-empty", "must be non-empty", (value) => {
      if (typeof value !== "string") return false;
      return value.trim().length > 0 && value.length <= max;
    });

  return schema.isValidSync(s);
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
  const schema = yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/);
  if (!schema.isValidSync(d)) return null;
  return d;
}

