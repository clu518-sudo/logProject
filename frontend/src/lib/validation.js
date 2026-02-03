export function normalizeUsername(u) {
  return (u ?? "").trim();
}

export function isValidUsername(u) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
}

export function isValidPassword(p) {
  return typeof p === "string" && p.length >= 8 && p.length <= 72;
}

export function normalizeDob(dob) {
  const d = (dob ?? "").trim();
  if (!d) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
  return d;
}

export function isNonEmptyString(s, max = 5000) {
  return typeof s === "string" && s.trim().length > 0 && s.length <= max;
}
