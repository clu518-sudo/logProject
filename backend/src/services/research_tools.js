import dns from "node:dns/promises";

const SERPER_ENDPOINT = "https://google.serper.dev/search";

function isPrivateIpv4(ip) {
  const parts = ip.split(".").map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isPrivateIpv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;
  return false;
}

async function assertSafeUrl(inputUrl) {
  let url;
  try {
    url = new URL(inputUrl);
  } catch {
    throw new Error("Invalid URL");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Blocked URL protocol");
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Blocked localhost URL");
  }

  const lookups = await dns.lookup(hostname, { all: true });
  for (const entry of lookups) {
    if (entry.family === 4 && isPrivateIpv4(entry.address)) {
      throw new Error("Blocked private IP");
    }
    if (entry.family === 6 && isPrivateIpv6(entry.address)) {
      throw new Error("Blocked private IP");
    }
  }
  return url;
}

async function readResponseBody(res, maxBytes) {
  if (!res.body) return "";
  const chunks = [];
  let total = 0;
  for await (const chunk of res.body) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error("Response exceeds size limit");
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function searchWeb({ query, limit = 6 }) {
  const apiKey = process.env.SERPER_API_KEY || "";
  if (!apiKey) {
    throw new Error("Missing SERPER_API_KEY for web search");
  }
  const res = await fetch(SERPER_ENDPOINT, {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: limit }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const organic = Array.isArray(data?.organic) ? data.organic : [];
  return organic.map((item) => ({
    title: item?.title || "",
    url: item?.link || "",
    snippet: item?.snippet || "",
    publisher: item?.source || "",
    publishedAt: item?.date || "",
  }));
}

export async function fetchUrl({ url, timeoutMs = 8000, maxBytes = 1_500_000 }) {
  const safeUrl = await assertSafeUrl(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(safeUrl.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "research-agent/1.0" },
    });
    if (!res.ok) {
      throw new Error(`Fetch failed (${res.status})`);
    }
    return await readResponseBody(res, maxBytes);
  } finally {
    clearTimeout(timer);
  }
}

export function extractText(html) {
  if (!html) return "";
  let text = html;
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<\/(p|div|li|br|h\d)>/gi, "\n");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/gi, " ");
  text = text.replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n");
  text = text.replace(/[ \t]+/g, " ").trim();
  return text;
}
