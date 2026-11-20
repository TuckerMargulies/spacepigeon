// Best-effort, per-instance rate limits for public endpoints.
const buckets = new Map();

/** True if this key may act now; records the hit. */
export function allow(key, max, windowMs, now = Date.now()) {
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear();
  return true;
}

export function resetRateLimits() {
  buckets.clear();
}
