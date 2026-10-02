/**
 * database/db.js
 *
 * In-memory "database" simulating a real data store.
 * Exports a products array and raw CRUD helpers so the
 * service layer stays decoupled from data storage details.
 */

let products = [
  { id: 1, name: "Laptop",     price: 999.99,  category: "Electronics", stock: 50 },
  { id: 2, name: "Headphones", price: 149.99,  category: "Electronics", stock: 200 },
  { id: 3, name: "Coffee Mug", price: 12.99,   category: "Kitchen",     stock: 500 },
  { id: 4, name: "Running Shoes", price: 89.99, category: "Sports",     stock: 75 },
  { id: 5, name: "Novel Book", price: 19.99,   category: "Books",       stock: 300 },
];

let nextId = products.length + 1;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Return a shallow copy of the full list */
const findAll = () => [...products];

/** Return a single product by id, or undefined */
const findById = (id) => products.find((p) => p.id === Number(id));

/** Insert a new product and return it */
const insert = (data) => {
  const product = { id: nextId++, ...data };
  products.push(product);
  return product;
};

/** Replace an existing product entirely; return updated or null */
const replace = (id, data) => {
  const idx = products.findIndex((p) => p.id === Number(id));
  if (idx === -1) return null;
  products[idx] = { id: Number(id), ...data };
  return products[idx];
};

/** Merge partial fields into an existing product; return updated or null */
const merge = (id, data) => {
  const idx = products.findIndex((p) => p.id === Number(id));
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data, id: Number(id) };
  return products[idx];
};

/** Remove a product by id; return true if found, false otherwise */
const remove = (id) => {
  const before = products.length;
  products = products.filter((p) => p.id !== Number(id));
  return products.length < before;
};

module.exports = { findAll, findById, insert, replace, merge, remove };
