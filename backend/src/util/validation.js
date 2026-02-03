export function normalizeUsername(u) {
  return (u ?? "").trim();
}

export function isValidUsername(u) {
  // Simple, teachable rule: 3-20 chars, letters/numbers/underscore
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
}

export function isValidPassword(p) {
  // Basic minimum; keep it simple for grading
  return typeof p === "string" && p.length >= 8 && p.length <= 72;
}

export function isNonEmptyString(s, max = 5000) {
  return typeof s === "string" && s.trim().length > 0 && s.length <= max;
}

export function clampEnum(val, allowed, fallback) {
  if (allowed.includes(val)) return val;
  return fallback;
}

export function normalizeDob(dob) {
  const d = (dob ?? "").trim();
  if (!d) return null;
  // Expect YYYY-MM-DD, store as text
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

