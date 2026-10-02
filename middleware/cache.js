/**
 * middleware/cache.js
 *
 * In-memory TTL cache with:
 *  - 1-minute Time To Live per entry
 *  - Timestamp tracking for every stored value
 *  - X-Cache: HIT / MISS response headers
 *  - Cache invalidation helpers for mutation routes
 */

const TTL_MS = 60 * 1000; // 1 minute in milliseconds

/**
 * Internal cache store.
 * Shape: { [key]: { value: any, createdAt: number } }
 */
const store = {};

// ──────────────────────────────────────────────
// Core cache utilities (used by service layer)
// ──────────────────────────────────────────────

/**
 * Retrieve a value from the cache.
 * Returns the stored value if it exists AND has not expired.
 * If expired, the entry is deleted and null is returned.
 *
 * @param {string} key
 * @returns {{ value: any, createdAt: number } | null}
 */
const get = (key) => {
  const entry = store[key];
  if (!entry) return null;

  const age = Date.now() - entry.createdAt;
  if (age > TTL_MS) {
    // Entry has expired — evict it
    delete store[key];
    return null;
  }

  return entry;
};

/**
 * Store a value in the cache together with a creation timestamp.
 *
 * @param {string} key
 * @param {any}    value
 */
const set = (key, value) => {
  store[key] = { value, createdAt: Date.now() };
};

/**
 * Delete one specific key from the cache.
 *
 * @param {string} key
 */
const del = (key) => {
  delete store[key];
};

/**
 * Flush the entire cache — called after any mutation so that
 * subsequent reads always return fresh data.
 */
const flush = () => {
  Object.keys(store).forEach((k) => delete store[k]);
};

// ──────────────────────────────────────────────
// Express middleware
// ──────────────────────────────────────────────

/**
 * cacheMiddleware
 *
 * Sits in front of GET route handlers.
 * - On HIT  → sets X-Cache: HIT  and responds immediately with cached data.
 * - On MISS → sets X-Cache: MISS and calls next() so the controller runs.
 *   After the controller sends its response the result is stored in the cache.
 */
const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const entry = get(key);

  if (entry) {
    // ── Cache HIT ──────────────────────────────
    res.setHeader("X-Cache", "HIT");
    res.setHeader(
      "X-Cache-Age",
      `${Math.floor((Date.now() - entry.createdAt) / 1000)}s`
    );
    res.setHeader("X-Cache-Created-At", new Date(entry.createdAt).toISOString());
    return res.status(200).json(entry.value);
  }

  // ── Cache MISS ─────────────────────────────
  res.setHeader("X-Cache", "MISS");

  // Intercept res.json so we can cache the payload before it's sent
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      set(key, body);
    }
    return originalJson(body);
  };

  next();
};

/**
 * invalidateCacheMiddleware
 *
 * Attached to POST / PUT / PATCH / DELETE routes.
 * Flushes the entire cache AFTER a successful mutation so
 * subsequent GETs always fetch fresh data.
 */
const invalidateCacheMiddleware = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      flush();
    }
    return originalJson(body);
  };
  next();
};

module.exports = {
  cacheMiddleware,
  invalidateCacheMiddleware,
  // Expose low-level helpers for testing / manual use
  cacheGet: get,
  cacheSet: set,
  cacheDel: del,
  cacheFlush: flush,
  TTL_MS,
};
