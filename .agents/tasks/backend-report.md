# Backend Phase 3 — Foundation Report

Generated: 2025-01-24

---

## Files Created in This Session

| File | Purpose |
|---|---|
| `src/routes/order.routes.ts` | Order CRUD routes (auth-protected) |
| `src/routes/user.routes.ts` | User profile routes (auth-protected) |
| `src/routes/admin.routes.ts` | Admin management routes (auth + ADMIN role) |
| `src/routes/infrastructure.routes.ts` | Infrastructure status route (auth + ADMIN role) |
| `src/routes/index.ts` | Route aggregator, mounts all routes under /api prefix |
| `src/app.ts` | Express app setup (helmet, cors, rate-limiting, error handler) |
| `src/index.ts` | Entry point, starts HTTP server on PORT |
| `Dockerfile` | Multi-stage Docker build (node:20-alpine, build → production) |

---

## TypeScript Check Result

```
npx tsc --noEmit
Exit code: 0 — 0 errors
```

Root cause of initial errors: `@prisma/client` types (`UserRole`, `OrderStatus`, Prisma namespace types) were not available because `prisma generate` had not been run after the schema was written. Running `npx prisma generate` resolved all 18 errors.

---

## npm install Status

All dependencies already installed (`node_modules` present). Top-level packages:

```
cloudmart-backend@1.0.0
├── @prisma/client@5.22.0
├── @types/bcrypt@5.0.2
├── @types/cors@2.8.19
├── @types/dockerode@3.3.47
├── @types/express@4.17.25
├── @types/jsonwebtoken@9.0.10
├── @types/multer@1.4.13
├── @types/node@20.19.43
├── axios@1.21.1
├── bcrypt@5.1.1
├── cors@2.8.6
├── dockerode@3.3.5
├── express-rate-limit@7.5.1
├── express@4.22.3
├── helmet@7.2.0
├── jsonwebtoken@9.0.3
├── multer@1.4.5-lts.2
├── prisma@5.22.0
├── ts-node-dev@2.0.0
├── ts-node@10.9.2
├── typescript@5.9.3
└── zod@3.25.76
```

---

## Prisma Validate Result

```
npx prisma validate
✔ The schema at prisma/schema.prisma is valid 🚀
Exit code: 0
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- PostgreSQL instance accessible from your machine

### Setup

1. Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cloudmart"
JWT_SECRET="a-random-string-of-at-least-32-characters-here"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Optional — leave empty if infrastructure not configured
PROXMOX_HOST=
PROXMOX_TOKEN_ID=
PROXMOX_TOKEN_SECRET=
PORTAINER_URL=
PORTAINER_TOKEN=
PROMETHEUS_URL=
```

2. Push schema and seed database:

```bash
cd backend
npx prisma db push
npx prisma db seed
```

3. Start development server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

---

## API Endpoint Summary

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| POST | /api/auth/register | — | — | Register new customer |
| POST | /api/auth/login | — | — | Login, returns JWT |
| GET | /api/auth/me | ✓ | any | Current user info |
| POST | /api/auth/logout | ✓ | any | Logout |
| GET | /api/products | — | — | List active products |
| GET | /api/products/:id | — | — | Product detail |
| GET | /api/categories | — | — | List categories |
| GET | /api/cart | ✓ | any | Get user's cart |
| POST | /api/cart/items | ✓ | any | Add item to cart |
| PUT | /api/cart/items/:id | ✓ | any | Update cart item quantity |
| DELETE | /api/cart/items/:id | ✓ | any | Remove cart item |
| POST | /api/orders | ✓ | any | Create order from cart |
| GET | /api/orders | ✓ | any | List user's orders |
| GET | /api/orders/:id | ✓ | any | Order detail |
| GET | /api/users/profile | ✓ | any | Get user profile |
| PUT | /api/users/profile | ✓ | any | Update user profile |
| GET | /api/admin/stats | ✓ | ADMIN | Dashboard statistics |
| GET | /api/admin/orders | ✓ | ADMIN | All orders |
| PATCH | /api/admin/orders/:id/status | ✓ | ADMIN | Update order status |
| GET | /api/admin/users | ✓ | ADMIN | All users |
| GET | /api/admin/products | ✓ | ADMIN | All products |
| POST | /api/admin/products | ✓ | ADMIN | Create product |
| PUT | /api/admin/products/:id | ✓ | ADMIN | Update product |
| DELETE | /api/admin/products/:id | ✓ | ADMIN | Delete product |
| GET | /api/admin/categories | ✓ | ADMIN | All categories |
| POST | /api/admin/categories | ✓ | ADMIN | Create category |
| PUT | /api/admin/categories/:id | ✓ | ADMIN | Update category |
| DELETE | /api/admin/categories/:id | ✓ | ADMIN | Delete category |
| GET | /api/infrastructure/status | ✓ | ADMIN | Infrastructure status (Proxmox/Portainer/Prometheus) |

---

## What Still Needs to Be Done

### Frontend (Phase 3 — not started)
- Monorepo setup under `frontend/`
- React + TypeScript + Vite (dev) / Nginx (production)
- Pages: homepage, product catalog, product detail, cart, checkout, auth, profile, order management, admin dashboard, product/inventory management

### Docker Compose
- Root-level `docker-compose.yml` orchestrating: `backend` (port 4000 internal), `frontend` (Nginx port 80 internal), `nginx` reverse proxy (port 8080 host), `postgres` (port 5432 internal only)
- Nginx config for reverse proxy and static file serving

### Deployment (Phase 4 — after SaaS is functional)
- Deploy to VM 102 (192.168.18.35) in the Proxmox IaaS environment
- Verify port 8080 available before deployment
- Configure environment variables on server
- PaaS integration: Portainer API, container lifecycle management scoped to CloudMart resources only
- IaaS integration: Proxmox API adapter (already stubbed in `src/adapters/`)
- Monitoring integration: Prometheus metrics adapter (already stubbed)
