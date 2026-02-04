import crypto from "node:crypto";

/**
 * Send a JSON response with a status code.
 *
 * **Inputs**
 * - `res`: Express response
 * - `status`: HTTP status code (e.g. 200, 400)
 * - `body`: any JSON-serializable value (optional)
 *
 * **Output**
 * - Writes to the HTTP response and ends it.
 *
 * **Side effects**
 * - Sets status + content-type header.
 *
 * **Logic**
 * - Set status -> set JSON header -> `JSON.stringify(body)` -> `res.end()`.
 */
export function json(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (body === undefined) return res.end();
  return res.end(JSON.stringify(body));
}

/**
 * Send an empty 204 (No Content) response.
 *
 * **Inputs**: `res`
 * **Output**: ends response
 * **Side effects**: sets status to 204
 */
export function noContent(res) {
  res.status(204);
  return res.end();
}

/**
 * Send a standard error JSON object.
 *
 * **Inputs**
 * - `status`: HTTP status (400/401/403/500...)
 * - `code`: machine-readable error code
 * - `message`: human-readable message
 * - `details`: optional extra info
 *
 * **Output**: `{ error: { code, message, details } }`
 * **Side effects**: writes response
 */
export function errorJson(res, status, code, message, details) {
  return json(res, status, { error: { code, message, details } });
}

/**
 * Parse HTTP cookies from `req.headers.cookie`.
 *
 * **Inputs**: `req` (Express request)
 * **Output**: object like `{ sid: "tokenValue" }`
 * **Side effects**: none
 *
 * **Logic**
 * - Split cookie header by `;` -> split by `=` -> decodeURIComponent values.
 */
export function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

/**
 * Set a cookie header.
 *
 * **Inputs**
 * - `name`, `value`: cookie key/value
 * - `opts`: options like `httpOnly`, `sameSite`, `expires`
 *
 * **Output**: writes `Set-Cookie` header
 * **Side effects**: modifies response headers
 *
 * **Key term**
 * - *HttpOnly*: browser JS cannot read the cookie (helps against XSS).
 */
export function setCookie(res, name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push("Path=/");
  if (opts.httpOnly !== false) parts.push("HttpOnly");
  parts.push(`SameSite=${opts.sameSite ?? "Lax"}`);
  if (opts.maxAgeSeconds != null) parts.push(`Max-Age=${Math.floor(opts.maxAgeSeconds)}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  if (opts.secure) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

/**
 * Clear (delete) a cookie in the browser.
 *
 * **Inputs**: `res`, `name`
 * **Output**: writes `Set-Cookie` header with `Max-Age=0`
 * **Side effects**: modifies response headers
 */
export function clearCookie(res, name) {
  res.setHeader("Set-Cookie", `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

/**
 * SHA-256 hash helper.
 *
 * **Inputs**: `input` (string)
 * **Output**: hex string
 * **Side effects**: none
 */
export function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Generate a cryptographically random, URL-safe token.
 *
 * **Inputs**: `bytes` (number) random byte count
 * **Output**: string (base64url)
 * **Side effects**: none
 */
export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

