const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 5;

const buckets = new Map();

export function checkResearchRateLimit(key) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const list = buckets.get(key) || [];
  const pruned = list.filter((ts) => ts >= windowStart);
  if (pruned.length >= MAX_RUNS) {
    const retryAfterMs = pruned[0] + WINDOW_MS - now;
    buckets.set(key, pruned);
    return { ok: false, retryAfterMs };
  }
  pruned.push(now);
  buckets.set(key, pruned);
  return { ok: true, retryAfterMs: 0 };
}
