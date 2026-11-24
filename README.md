# CloudMart

Simulasi aplikasi SaaS e-commerce untuk mata kuliah Komputasi Awan (Semester 5), Program Studi Informatika, Universitas Siliwangi. Proyek ini membangun platform toko online lengkap di atas infrastruktur IaaS (Proxmox) dan PaaS (Docker/Portainer) yang telah dibangun pada tugas sebelumnya.

Kelompok 3 — CC3_G.

---

## Prasyarat

- Node.js 18 atau lebih baru
- Docker Engine
- Docker Compose v2 (sudah termasuk dalam Docker Desktop)

---

## Quick Start — Development (Tanpa Docker)

### 1. Siapkan environment backend

```bash
cd backend
cp .env.example .env
```

Edit file `.env` dan isi nilai berikut:

| Variabel         | Contoh nilai                                                       |
|------------------|--------------------------------------------------------------------|
| `DATABASE_URL`   | `postgresql://cloudmart:changeme_strong_password@localhost:5432/cloudmart_db` |
| `JWT_SECRET`     | String acak minimal 32 karakter                                    |
| `JWT_EXPIRES_IN` | `7d`                                                               |
| `PORT`           | `4000`                                                             |
| `CORS_ORIGIN`    | `http://localhost:5173`                                            |

### 2. Jalankan PostgreSQL

```bash
# Dari root project
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres -d
```

### 3. Sinkronisasi schema dan seed data

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Jalankan backend

```bash
cd backend
npm run dev
# Backend berjalan di http://localhost:4000
```

### 5. Jalankan frontend (terminal terpisah)

```bash
cd frontend
npm install
npm run dev
# Frontend berjalan di http://localhost:5173
```

---

## Akun Default (Development)

| Role     | Email                        | Password      |
|----------|------------------------------|---------------|
| Admin    | admin@cloudmart.local        | Admin123!     |
| Customer | customer@cloudmart.local     | Customer123!  |

> Akun ini hanya untuk environment development. Jangan gunakan di production.

---

## Cara Menjalankan (Production Mode via Docker)

```bash
# 1. Salin file konfigurasi dan isi variabel yang diperlukan
cp .env.example .env

# 2. Jalankan seluruh stack
docker compose up --build
```

Aplikasi dapat diakses di **http://localhost:8080** setelah semua service sehat.

---

## Cara Menjalankan (Development Mode via Docker)

Mode ini mengekspos port backend dan database ke host agar mudah di-debug.

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

| Layanan              | URL / Alamat              |
|----------------------|---------------------------|
| Aplikasi (via Nginx) | http://localhost:8080     |
| Backend API          | http://localhost:4000     |
| PostgreSQL           | localhost:5432            |
| Frontend dev server  | http://localhost:5173 (hanya mode tanpa Docker) |

---

## Port yang Digunakan

| Service    | Port (Dev) | Port (Prod Docker) |
|------------|------------|--------------------|
| Frontend   | 5173       | internal           |
| Backend    | 4000       | 4000 (dev overlay) |
| PostgreSQL | 5432       | 5432 (dev overlay) |
| Nginx      | —          | 8080               |

---

## Variabel Lingkungan

Salin `.env.example` menjadi `.env` dan sesuaikan nilainya. Variabel yang wajib diisi:

| Variabel        | Keterangan                                      |
|-----------------|-------------------------------------------------|
| `DB_USER`       | Username PostgreSQL (untuk Docker Compose)      |
| `DB_PASSWORD`   | Password PostgreSQL — ganti dari default        |
| `DB_NAME`       | Nama database                                   |
| `JWT_SECRET`    | Secret key JWT, minimal 32 karakter acak        |
| `JWT_EXPIRES_IN`| Masa berlaku token, contoh `7d`                 |

Variabel integrasi infrastruktur (`PROXMOX_HOST`, `PORTAINER_URL`, dll.) bersifat opsional. Jika kosong, fitur monitoring akan menampilkan status **NOT CONFIGURED** tanpa menghambat fungsi e-commerce.

---

## Arsitektur

```
Browser
  └─ Nginx (host:8080)
       ├─ /api/*  → Express backend (internal:4000)
       └─ /*      → React SPA via Nginx (internal:80)
                       └─ PostgreSQL (internal:5432)
```

Semua service berjalan dalam Docker network `cloudmart-internal`. PostgreSQL tidak diekspos ke jaringan host pada mode production.

Untuk arsitektur lengkap termasuk lapisan IaaS dan PaaS, lihat [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Dokumentasi

| Dokumen                                       | Isi                                        |
|-----------------------------------------------|--------------------------------------------|
| [docs/API.md](docs/API.md)                    | Semua endpoint API, request/response shape |
| [docs/DATABASE.md](docs/DATABASE.md)          | Schema database, setup, seed               |
| [docs/TESTING.md](docs/TESTING.md)            | Panduan testing, checklist, PowerShell commands |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)  | Arsitektur sistem, tech stack, folder structure |
| [docs/ACADEMIC_EVIDENCE.md](docs/ACADEMIC_EVIDENCE.md) | Skenario demonstrasi UAS, mapping NIST |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)      | Konteks proyek, status, changelog          |

---

## Lisensi

Proyek akademik — tidak untuk distribusi komersial.
