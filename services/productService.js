/**
 * services/productService.js
 *
 * Business-logic layer.
 * Receives plain data, validates it, and delegates persistence
 * to the database layer.  Never touches req / res.
 */

const db = require("../database/db");

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const validateProductFields = (data, requireAll = true) => {
  const errors = [];

  if (requireAll || data.name !== undefined) {
    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
      errors.push("name must be a non-empty string");
    }
  }
  if (requireAll || data.price !== undefined) {
    if (data.price === undefined || typeof data.price !== "number" || data.price < 0) {
      errors.push("price must be a non-negative number");
    }
  }
  if (requireAll || data.category !== undefined) {
    if (!data.category || typeof data.category !== "string" || data.category.trim() === "") {
      errors.push("category must be a non-empty string");
    }
  }
  if (requireAll || data.stock !== undefined) {
    if (data.stock === undefined || !Number.isInteger(data.stock) || data.stock < 0) {
      errors.push("stock must be a non-negative integer");
    }
  }

  return errors;
};

// ──────────────────────────────────────────────
// Service methods
// ──────────────────────────────────────────────

const getAllProducts = () => {
  return db.findAll();
};

const getProductById = (id) => {
  const product = db.findById(id);
  if (!product) {
    const err = new Error(`Product with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return product;
};

const createProduct = (data) => {
  const errors = validateProductFields(data, true);
  if (errors.length) {
    const err = new Error(`Validation failed: ${errors.join("; ")}`);
    err.status = 400;
    throw err;
  }

  return db.insert({
    name:     data.name.trim(),
    price:    Number(data.price),
    category: data.category.trim(),
    stock:    Number(data.stock),
  });
};

const replaceProduct = (id, data) => {
  // Ensure the product exists first
  getProductById(id); // throws 404 if not found

  const errors = validateProductFields(data, true);
  if (errors.length) {
    const err = new Error(`Validation failed: ${errors.join("; ")}`);
    err.status = 400;
    throw err;
  }

  return db.replace(id, {
    name:     data.name.trim(),
    price:    Number(data.price),
    category: data.category.trim(),
    stock:    Number(data.stock),
  });
};

const updateProduct = (id, data) => {
  // Ensure the product exists first
  getProductById(id); // throws 404 if not found

  const errors = validateProductFields(data, false);
  if (errors.length) {
    const err = new Error(`Validation failed: ${errors.join("; ")}`);
    err.status = 400;
    throw err;
  }

  const patch = {};
  if (data.name     !== undefined) patch.name     = data.name.trim();
  if (data.price    !== undefined) patch.price    = Number(data.price);
  if (data.category !== undefined) patch.category = data.category.trim();
  if (data.stock    !== undefined) patch.stock    = Number(data.stock);

  return db.merge(id, patch);
};

const deleteProduct = (id) => {
  const removed = db.remove(id);
  if (!removed) {
    const err = new Error(`Product with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return { message: `Product ${id} deleted successfully` };
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  replaceProduct,
  updateProduct,
  deleteProduct,
};
