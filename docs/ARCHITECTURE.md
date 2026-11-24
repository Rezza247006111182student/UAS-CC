# CloudMart — System Architecture

---

## 1. Diagram Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        SAAS LAYER                               │
│                     CloudMart Application                       │
│                                                                 │
│  Browser ──► Nginx (port 8080/80)                               │
│               ├── /api/* ──► Express Backend (port 4000)        │
│               │                   └── Prisma ORM                │
│               │                         └── PostgreSQL (5432)  │
│               └── /* ──────► React SPA (Vite / Nginx static)   │
└──────────────────────────────┬──────────────────────────────────┘
                               │  berjalan di atas
┌──────────────────────────────▼──────────────────────────────────┐
│                        PAAS LAYER                               │
│                 Docker + Portainer + Monitoring                  │
│                                                                 │
│  Docker Engine (VM 102 — 192.168.18.35)                         │
│  ├── container: web1 (nginx:latest, port 8081)                  │
│  ├── container: web2 (nginx:latest, port 8082)                  │
│  ├── container: portainer (port 9443)                           │
│  ├── container: prometheus (port 9090)                          │
│  ├── container: cadvisor                                        │
│  └── container: grafana (port 3000)                             │
└──────────────────────────────┬──────────────────────────────────┘
                               │  berjalan di atas
┌──────────────────────────────▼──────────────────────────────────┐
│                        IAAS LAYER                               │
│               Proxmox VE + VM Debian + Cloudflare               │
│                                                                 │
│  Windows (host fisik)                                           │
│  └── VMware Workstation (hypervisor tipe 2)                     │
│       └── Proxmox VE 9.2.2 (UI: port 8006)                     │
│            ├── VM 100 (Debian-1, 192.168.18.31, Apache)         │
│            ├── VM 101 (Debian-2, 192.168.18.33, Apache)         │
│            └── VM 102 (Debian-3, 192.168.18.35, Docker host)   │
│                                                                 │
│  Cloudflare Tunnel ──► kelompok3ccg.dpdns.org                   │
│  ├── web.kelompok3ccg.dpdns.org  ──► VM Apache pages            │
│  └── proxmox.kelompok3ccg.dpdns.org ──► Proxmox VE UI           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Cloud Model Mapping (NIST SP 800-145)

| Layer   | Teknologi                        | Model     | Penjelasan                                     |
|---------|----------------------------------|-----------|------------------------------------------------|
| IaaS    | Proxmox VE + VMware + Cloudflare | Infrastructure as a Service | Menyediakan VM, storage, networking virtual. Pengguna mengontrol OS dan aplikasi. |
| PaaS    | Docker + Portainer + Monitoring  | Platform as a Service | Menyediakan platform runtime kontainer. Pengguna hanya deploy aplikasi, tidak perlu kelola OS. |
| SaaS    | CloudMart (React + Express + PG) | Software as a Service | Aplikasi siap pakai yang diakses via browser. Pengguna tidak perlu mengelola infrastruktur. |

---

## 3. Tech Stack

| Komponen      | Teknologi          | Versi      | Keterangan                            |
|---------------|--------------------|------------|---------------------------------------|
| Runtime       | Node.js            | 18+        | Backend runtime                       |
| Backend       | Express.js         | 4.x        | HTTP server framework                 |
| Language      | TypeScript         | 5.x        | Strongly-typed JS                     |
| ORM           | Prisma             | 5.x        | Database toolkit + migration          |
| Database      | PostgreSQL         | 15         | Relational database                   |
| Frontend      | React              | 18.x       | UI library                            |
| Build tool    | Vite               | 5.x        | Frontend bundler + dev server         |
| CSS           | Tailwind CSS       | 3.x        | Utility-first CSS                     |
| Auth          | JWT (jsonwebtoken) | 9.x        | Stateless authentication              |
| Password      | bcrypt             | 5.x        | Password hashing                      |
| Validation    | Zod                | 3.x        | Schema validation (backend)           |
| Container     | Docker             | 24+        | Containerization                      |
| Reverse Proxy | Nginx              | alpine     | Static file serving + API proxy       |
| Tunnel        | Cloudflare Tunnel  | cloudflared | Secure outbound-only tunnel          |

---

## 4. Folder Structure

```
UAS-CC/
├── backend/                 # Express + TypeScript API server
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data awal
│   ├── src/
│   │   ├── config/          # Environment config (Zod schema)
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # Auth, roleGuard, rateLimiter, errorHandler
│   │   ├── routes/          # Route definitions
│   │   ├── services/        # Business logic
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   ├── .env.example         # Template environment variables
│   └── Dockerfile           # Backend container image
│
├── frontend/                # React + TypeScript SPA
│   ├── src/
│   │   ├── api/             # API client (axios instances)
│   │   ├── components/      # Reusable UI components
│   │   │   ├── cart/        # CartDrawer, CartItem
│   │   │   ├── layout/      # Navbar, Footer, AdminLayout
│   │   │   └── product/     # ProductCard
│   │   ├── context/         # AuthContext, CartContext
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/
│   │   │   ├── admin/       # Dashboard, Products, Categories, Orders, Users
│   │   │   └── storefront/  # Home, Catalog, ProductDetail, Cart, Checkout, Orders
│   │   ├── types/           # TypeScript interfaces (snake_case sesuai Prisma)
│   │   └── App.tsx          # Router dan route definitions
│   └── Dockerfile           # Frontend container image (multi-stage + Nginx)
│
├── docker/
│   └── nginx/
│       └── nginx.conf       # Reverse proxy config (SPA + API routing)
│
├── docs/                    # Dokumentasi teknis
│   ├── API.md
│   ├── DATABASE.md
│   ├── TESTING.md
│   ├── ARCHITECTURE.md      # (file ini)
│   └── ACADEMIC_EVIDENCE.md
│
├── .agents/tasks/           # Laporan dan catatan agen AI
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Dev override (expose ports)
├── .env.example             # Template root environment
├── PROJECT_CONTEXT.md       # Sumber kebenaran proyek
└── README.md                # Quick start guide
```

---

## 5. Port Mapping

| Service           | Mode Development   | Mode Production   |
|-------------------|--------------------|-------------------|
| Frontend (Vite)   | localhost:5173     | internal (Nginx)  |
| Backend (Express) | localhost:4000     | internal:4000     |
| PostgreSQL        | localhost:5432     | internal:5432     |
| Nginx (proxy)     | —                  | localhost:8080    |

---

## 6. Data Flow — Customer Checkout

```
Customer Browser
    │
    ▼ POST /api/orders
Nginx (proxy)
    │
    ▼
Express Backend
    │  1. Autentikasi JWT
    │  2. Ambil cart items dari DB
    │  3. Hitung harga di backend (tidak percaya frontend)
    │  4. Mulai database transaction:
    │     a. Buat address (jika baru)
    │     b. Buat order record
    │     c. Buat order_items (snapshot harga)
    │     d. Kurangi inventory.quantity
    │     e. Tambah inventory.reserved_quantity
    │     f. Buat payment record (status PENDING)
    │     g. Kosongkan cart_items
    │  5. Commit transaction
    │
    ▼
PostgreSQL
    └── Semua operasi atomic — jika satu gagal, semua di-rollback
```

---

## 7. Security Architecture

| Komponen         | Mekanisme                                      |
|------------------|------------------------------------------------|
| Password         | bcrypt hash (salt rounds: 10)                  |
| Autentikasi      | JWT Bearer token (expire: 7d)                  |
| Otorisasi        | roleGuard middleware (ADMIN / CUSTOMER)         |
| Rate Limiting    | express-rate-limit pada auth endpoints         |
| CORS             | CORS_ORIGIN env var, hanya origin terdaftar    |
| Input Validation | Zod schema validation pada semua request body  |
| SQL Injection    | Prisma parameterized queries (tidak ada raw SQL) |
| Secrets          | Environment variables, tidak di-commit ke repo  |
