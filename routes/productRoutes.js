/**
 * routes/productRoutes.js
 *
 * Declares all /products endpoints and wires the correct
 * middleware → controller chain for each HTTP method.
 *
 * Request flow:
 *   Route → Middleware → Controller → Service → Database
 */

const { Router } = require("express");
const productController = require("../controllers/productController");
const {
  cacheMiddleware,
  invalidateCacheMiddleware,
} = require("../middleware/cache");

const router = Router();

// ── GET  /products          → check cache → controller ──────────────────────
router.get("/", cacheMiddleware, productController.getAllProducts);

// ── GET  /products/:id      → check cache → controller ──────────────────────
router.get("/:id", cacheMiddleware, productController.getProductById);

// ── POST /products          → invalidate cache after success → controller ───
router.post("/", invalidateCacheMiddleware, productController.createProduct);

// ── PUT  /products/:id      → invalidate cache after success → controller ───
router.put("/:id", invalidateCacheMiddleware, productController.replaceProduct);

// ── PATCH /products/:id     → invalidate cache after success → controller ───
router.patch("/:id", invalidateCacheMiddleware, productController.updateProduct);

// ── DELETE /products/:id    → invalidate cache after success → controller ───
router.delete("/:id", invalidateCacheMiddleware, productController.deleteProduct);

module.exports = router;
