/**
 * controllers/productController.js
 *
 * HTTP layer — translates Express req/res into service calls.
 * Never contains business logic or SQL/DB access.
 *
 * Flow: Route → Middleware → Controller → Service → Database
 */

const productService = require("../services/productService");

// ──────────────────────────────────────────────
// GET /products
// ──────────────────────────────────────────────
const getAllProducts = (req, res) => {
  try {
    const products = productService.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// GET /products/:id
// ──────────────────────────────────────────────
const getProductById = (req, res) => {
  try {
    const product = productService.getProductById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// POST /products
// ──────────────────────────────────────────────
const createProduct = (req, res) => {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// PUT /products/:id
// ──────────────────────────────────────────────
const replaceProduct = (req, res) => {
  try {
    const product = productService.replaceProduct(req.params.id, req.body);
    res.status(200).json(product);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// PATCH /products/:id
// ──────────────────────────────────────────────
const updateProduct = (req, res) => {
  try {
    const product = productService.updateProduct(req.params.id, req.body);
    res.status(200).json(product);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────
// DELETE /products/:id
// ──────────────────────────────────────────────
const deleteProduct = (req, res) => {
  try {
    const result = productService.deleteProduct(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct,
};
