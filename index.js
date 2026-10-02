/**
 * index.js  (application entry point)
 *
 * Bootstraps the Express server and mounts all route modules.
 */

const express = require("express");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────
// Global middleware
// ──────────────────────────────────────────────
app.use(express.json()); // Parse JSON request bodies

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use("/products", productRoutes);

// ──────────────────────────────────────────────
// 404 fallback
// ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// ──────────────────────────────────────────────
// Global error handler
// ──────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅  Server running at http://localhost:${PORT}`);
    console.log(`📦  Products API → http://localhost:${PORT}/products`);
    console.log(`🗄️   Cache TTL     → 60 seconds`);
  });
}

module.exports = app;
