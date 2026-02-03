const API_BASE = "";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
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

export async function uploadFile(path, file) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(path, { method: "POST", body: form, credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || "Upload failed";
    throw new Error(msg);
  }
  return res.json();
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch("/api/users/me/avatar", { method: "POST", body: form, credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || "Upload failed";
    throw new Error(msg);
  }
  return res.json();
}

