// Base URL for API calls (empty means same origin).
const API_BASE = "";

/**
 * Call the backend API with shared defaults (JSON + cookies).
 *
 * **Inputs**
 * - `path` (string): e.g. `"/api/articles"`
 * - `options` (object): `fetch` options (method, body, headers...)
 *
 * **Output**
 * - Returns parsed response:
 *   - `null` when status is 204 (No Content)
 *   - JSON object/array when response is JSON
 *   - string when response is plain text
 *
 * **Side effects**
 * - Sends an HTTP request with `credentials: "include"` (cookies)
 *
 * **Logic**
 * - `fetch()` -> if 204 => null -> parse JSON/text -> if !ok throw -> return data.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 204) return null;
  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const msg = data?.error?.message || "Request failed";
    const code = data?.error?.code || "error";
    throw new Error(`${code}: ${msg}`);
  }
  return data;
}

/**
 * Upload an image file using `multipart/form-data`.
 *
 * **Inputs**
 * - `path` (string): upload endpoint (e.g. `"/api/articles/1/header-image"`)
 * - `file` (File): browser File object
 *
 * **Output**: parsed JSON response from the server
 * **Side effects**: sends HTTP request with cookies
 *
 * **Logic**
 * - Build `FormData` -> append file -> POST -> throw on error -> return JSON.
 */
export async function uploadFile(path, file) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(path, {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || "Upload failed";
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Upload the current user's avatar image.
 *
 * **Inputs**: `file` (File)
 * **Output**: server JSON with avatar info
 * **Side effects**: sends HTTP request with cookies
 */
export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch("/api/users/me/avatar", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || "Upload failed";
    throw new Error(msg);
  }
  return res.json();
}
