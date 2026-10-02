# Products API — Layered Express Application with TTL Cache

A workshop Express.js application demonstrating a clean layered architecture with in-memory TTL-based caching.

---

## Project Structure

```
Asd workshop/
├── index.js                  ← Entry point, boots the server
├── package.json
│
├── routes/
│   └── productRoutes.js      ← URL definitions + middleware wiring
│
├── controllers/
│   └── productController.js  ← HTTP layer (req → service → res)
│
├── services/
│   └── productService.js     ← Business logic + input validation
│
├── database/
│   └── db.js                 ← In-memory data store + CRUD helpers
│
└── middleware/
    └── cache.js              ← TTL cache + HIT/MISS headers + invalidation
```

---

## Request Flow

```
Request
  └─► Route (productRoutes.js)
        └─► Middleware (cache.js)
              └─► Controller (productController.js)
                    └─► Service (productService.js)
                          └─► Database (db.js)
```

---

## Caching Behaviour

| Feature | Detail |
|---|---|
| TTL | **60 seconds** per cache entry |
| Timestamp | Every entry stores `createdAt` (Unix ms) |
| Expiry check | On every GET — evicts stale entries before serving |
| HIT header | `X-Cache: HIT` + `X-Cache-Age` + `X-Cache-Created-At` |
| MISS header | `X-Cache: MISS` |
| Invalidation | Full cache flush after any successful POST / PUT / PATCH / DELETE |

---

## API Endpoints

### GET /products
Returns all products. Cached for 60 s.

```bash
curl http://localhost:3000/products
# X-Cache: MISS (first call)
# X-Cache: HIT  (within 60 s)
```

### GET /products/:id
Returns a single product. Cached independently.

```bash
curl http://localhost:3000/products/1
```

### POST /products
Creates a product. **Invalidates entire cache.**

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Tablet","price":299.99,"category":"Electronics","stock":100}'
```

### PUT /products/:id
Full replacement. **Invalidates entire cache.**

```bash
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Gaming Laptop","price":1499.99,"category":"Electronics","stock":30}'
```

### PATCH /products/:id
Partial update. **Invalidates entire cache.**

```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":1099.99}'
```

### DELETE /products/:id
Deletes a product. **Invalidates entire cache.**

```bash
curl -X DELETE http://localhost:3000/products/1
```

---

## Running Locally

```bash
npm install
npm start        # node index.js  →  http://localhost:3000
npm run dev      # nodemon (auto-reload on file save)
```

---

## Response Headers (GET endpoints)

### Cache MISS
```
X-Cache: MISS
```

### Cache HIT
```
X-Cache: HIT
X-Cache-Age: 12s
X-Cache-Created-At: 2026-09-30T05:16:02.584Z
```
# BucketList_ASD
