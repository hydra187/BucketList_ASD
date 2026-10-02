const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("../index");

describe("Products API and TTL Cache Test Suite", () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test("GET /products returns 200 with X-Cache: MISS on initial call", async () => {
    const res = await fetch(`${baseUrl}/products`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("x-cache"), "MISS");

    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 5);
  });

  test("GET /products returns 200 with X-Cache: HIT on subsequent call", async () => {
    const res = await fetch(`${baseUrl}/products`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("x-cache"), "HIT");
    assert.ok(res.headers.get("x-cache-age"));
    assert.ok(res.headers.get("x-cache-created-at"));

    const data = await res.json();
    assert.ok(Array.isArray(data));
  });

  test("GET /products/:id returns 200 for existing product", async () => {
    const res = await fetch(`${baseUrl}/products/1`);
    assert.strictEqual(res.status, 200);
    const product = await res.json();
    assert.strictEqual(product.id, 1);
    assert.strictEqual(product.name, "Laptop");
  });

  test("GET /products/:id returns 404 for non-existent product", async () => {
    const res = await fetch(`${baseUrl}/products/9999`);
    assert.strictEqual(res.status, 404);
    const err = await res.json();
    assert.ok(err.error.includes("not found"));
  });

  test("POST /products rejects invalid payloads with 400", async () => {
    const res = await fetch(`${baseUrl}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", price: -10 }),
    });
    assert.strictEqual(res.status, 400);
    const err = await res.json();
    assert.ok(err.error.includes("Validation failed"));
  });

  test("POST /products creates product with 201 and invalidates cache", async () => {
    const newProduct = {
      name: "Mechanical Keyboard",
      price: 119.99,
      category: "Electronics",
      stock: 40,
    };

    const res = await fetch(`${baseUrl}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    assert.strictEqual(res.status, 201);
    const created = await res.json();
    assert.strictEqual(created.name, newProduct.name);
    assert.strictEqual(created.price, newProduct.price);
    assert.ok(created.id);

    // Verify cache invalidation: Next GET /products should be MISS and contain new product
    const getRes = await fetch(`${baseUrl}/products`);
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.headers.get("x-cache"), "MISS");

    const products = await getRes.json();
    const found = products.find((p) => p.name === "Mechanical Keyboard");
    assert.ok(found);
  });

  test("PUT /products/:id replaces existing product and invalidates cache", async () => {
    const updated = {
      name: "Ultra Laptop Pro",
      price: 1299.99,
      category: "Electronics",
      stock: 15,
    };

    const res = await fetch(`${baseUrl}/products/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.id, 1);
    assert.strictEqual(body.name, "Ultra Laptop Pro");
  });

  test("PATCH /products/:id partially updates product", async () => {
    const patch = { price: 95.5 };

    const res = await fetch(`${baseUrl}/products/4`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.id, 4);
    assert.strictEqual(body.price, 95.5);
    assert.strictEqual(body.name, "Running Shoes");
  });

  test("DELETE /products/:id deletes product successfully", async () => {
    const res = await fetch(`${baseUrl}/products/2`, {
      method: "DELETE",
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.message.includes("deleted"));

    // Verify it's gone
    const checkRes = await fetch(`${baseUrl}/products/2`);
    assert.strictEqual(checkRes.status, 404);
  });

  test("DELETE /products/:id returns 404 for nonexistent id", async () => {
    const res = await fetch(`${baseUrl}/products/9999`, {
      method: "DELETE",
    });
    assert.strictEqual(res.status, 404);
  });

  test("Unknown route returns 404 JSON fallback", async () => {
    const res = await fetch(`${baseUrl}/non-existent-route`);
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.ok(body.error);
  });
});
