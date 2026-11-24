# CloudMart — Database Documentation

## 1. Overview

CloudMart menggunakan **PostgreSQL 15** sebagai database utama, diakses melalui **Prisma ORM** (v5). Schema didefinisikan di `backend/prisma/schema.prisma`.

---

## 2. Schema — Semua Tabel

### 2.1 `users`

Menyimpan akun pengguna (admin dan customer).

| Kolom          | Tipe       | Keterangan                            |
|----------------|------------|---------------------------------------|
| id             | UUID (PK)  | Auto-generated UUID                   |
| email          | String     | Unik, digunakan untuk login           |
| name           | String     | Nama tampilan pengguna                |
| password_hash  | String     | Hash bcrypt, **tidak pernah dikirim ke API** |
| role           | Enum       | `CUSTOMER` (default) atau `ADMIN`     |
| phone          | String?    | Nomor telepon (opsional)              |
| is_active      | Boolean    | Default `true`; `false` = dinonaktifkan |
| created_at     | DateTime   | Waktu registrasi                      |
| updated_at     | DateTime   | Waktu update terakhir                 |

### 2.2 `categories`

Kategori produk.

| Kolom       | Tipe      | Keterangan                       |
|-------------|-----------|----------------------------------|
| id          | UUID (PK) |                                  |
| name        | String    | Nama kategori                    |
| slug        | String    | Unik, URL-friendly               |
| description | String?   | Deskripsi kategori               |
| image_url   | String?   | URL gambar kategori              |
| is_active   | Boolean   | Default `true`                   |
| created_at  | DateTime  |                                  |
| updated_at  | DateTime  |                                  |

### 2.3 `products`

Katalog produk.

| Kolom       | Tipe       | Keterangan                            |
|-------------|------------|---------------------------------------|
| id          | UUID (PK)  |                                       |
| name        | String     | Nama produk                           |
| slug        | String     | Unik, URL-friendly                    |
| description | String?    | Deskripsi produk                      |
| price       | Decimal    | Harga dalam Rupiah (presisi 15,2)     |
| category_id | UUID (FK)  | Referensi ke `categories.id`          |
| image_urls  | String[]   | Array URL gambar produk               |
| is_active   | Boolean    | Default `true`                        |
| created_at  | DateTime   |                                       |
| updated_at  | DateTime   |                                       |

### 2.4 `inventory`

Stok setiap produk (relasi 1:1 dengan products).

| Kolom             | Tipe      | Keterangan                              |
|-------------------|-----------|-----------------------------------------|
| id                | UUID (PK) |                                         |
| product_id        | UUID (FK) | Unik, referensi ke `products.id`        |
| quantity          | Int       | Stok tersedia                           |
| reserved_quantity | Int       | Stok yang sudah dipesan (pending order) |
| updated_at        | DateTime  |                                         |

### 2.5 `carts`

Keranjang belanja per pengguna.

| Kolom      | Tipe      | Keterangan                   |
|------------|-----------|------------------------------|
| id         | UUID (PK) |                              |
| user_id    | UUID (FK) | Referensi ke `users.id`      |
| created_at | DateTime  |                              |
| updated_at | DateTime  |                              |

### 2.6 `cart_items`

Item di dalam keranjang belanja.

| Kolom        | Tipe      | Keterangan                            |
|--------------|-----------|---------------------------------------|
| id           | UUID (PK) |                                       |
| cart_id      | UUID (FK) | Referensi ke `carts.id`               |
| product_id   | UUID (FK) | Referensi ke `products.id`            |
| quantity     | Int       | Jumlah item                           |
| price_at_add | Decimal   | Harga saat item ditambahkan ke keranjang |
| created_at   | DateTime  |                                       |
| updated_at   | DateTime  |                                       |

### 2.7 `addresses`

Alamat pengiriman milik pengguna.

| Kolom          | Tipe      | Keterangan                     |
|----------------|-----------|--------------------------------|
| id             | UUID (PK) |                                |
| user_id        | UUID (FK) | Referensi ke `users.id`        |
| recipient_name | String    | Nama penerima                  |
| phone          | String    | Nomor telepon penerima         |
| street         | String    | Alamat jalan                   |
| city           | String    | Kota                           |
| province       | String    | Provinsi                       |
| postal_code    | String    | Kode pos                       |
| is_default     | Boolean   | Default `false`                |
| created_at     | DateTime  |                                |
| updated_at     | DateTime  |                                |

### 2.8 `orders`

Pesanan yang sudah dibuat.

| Kolom          | Tipe      | Keterangan                                   |
|----------------|-----------|----------------------------------------------|
| id             | UUID (PK) |                                              |
| user_id        | UUID (FK) | Referensi ke `users.id`                      |
| address_id     | UUID (FK) | Nullable, referensi ke `addresses.id`        |
| status         | Enum      | `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| notes          | String?   | Catatan dari customer                        |
| payment_method | String?   | Metode pembayaran                            |
| subtotal       | Decimal   | Total harga produk (sebelum ongkir)          |
| shipping_cost  | Decimal   | Ongkos kirim (default 15.000)                |
| total          | Decimal   | subtotal + shipping_cost                     |
| created_at     | DateTime  |                                              |
| updated_at     | DateTime  |                                              |

### 2.9 `order_items`

Item di dalam setiap pesanan (snapshot harga saat checkout).

| Kolom      | Tipe      | Keterangan                       |
|------------|-----------|----------------------------------|
| id         | UUID (PK) |                                  |
| order_id   | UUID (FK) | Referensi ke `orders.id`         |
| product_id | UUID (FK) | Referensi ke `products.id`       |
| quantity   | Int       | Jumlah item                      |
| unit_price | Decimal   | Harga satuan saat checkout       |
| subtotal   | Decimal   | unit_price × quantity            |
| created_at | DateTime  |                                  |

### 2.10 `payments`

Informasi pembayaran per pesanan (relasi 1:1 dengan orders).

| Kolom          | Tipe      | Keterangan                                   |
|----------------|-----------|----------------------------------------------|
| id             | UUID (PK) |                                              |
| order_id       | UUID (FK) | Unik, referensi ke `orders.id`               |
| status         | Enum      | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`   |
| amount         | Decimal   | Jumlah pembayaran                            |
| method         | String?   | Metode pembayaran                            |
| reference_code | String    | Unik, kode referensi transaksi               |
| paid_at        | DateTime? | Waktu pembayaran berhasil                    |
| created_at     | DateTime  |                                              |
| updated_at     | DateTime  |                                              |

### 2.11 `activity_logs`

Log aktivitas pengguna di dalam aplikasi.

| Kolom      | Tipe      | Keterangan                              |
|------------|-----------|-----------------------------------------|
| id         | UUID (PK) |                                         |
| user_id    | UUID (FK) | Nullable, referensi ke `users.id`       |
| action     | String    | Deskripsi aksi (contoh: `user.login`)   |
| entity     | String?   | Nama entitas yang dimodifikasi          |
| entity_id  | String?   | ID entitas yang dimodifikasi            |
| metadata   | Json?     | Data tambahan dalam format JSON         |
| created_at | DateTime  |                                         |

### 2.12 `deployment_logs`

Log aktivitas deployment/operasi infrastruktur (PaaS layer).

| Kolom      | Tipe      | Keterangan                              |
|------------|-----------|-----------------------------------------|
| id         | UUID (PK) |                                         |
| service    | String    | Nama service (docker, portainer, dsb.)  |
| action     | String    | Aksi yang dilakukan                     |
| status     | String    | Status hasil aksi                       |
| message    | String?   | Pesan detail                            |
| metadata   | Json?     | Data tambahan dalam format JSON         |
| created_at | DateTime  |                                         |

---

## 3. Diagram Relasi (ERD — text)

```
users ──────┬─── carts ──── cart_items ──── products ──── inventory
            │                                   │
            ├─── orders ─── order_items ─────── ┘
            │       │
            │       └─── payments
            │
            ├─── addresses ──── orders (FK address_id)
            │
            └─── activity_logs

categories ──── products

deployment_logs (standalone)
```

---

## 4. Instruksi Setup

### Prasyarat
- Docker Engine atau PostgreSQL 15 yang sudah berjalan secara lokal
- Node.js 18+

### 4.1 Jalankan PostgreSQL via Docker

```bash
# Dari root project
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres -d
```

Atau dengan environment variables manual:

```bash
docker run -d \
  --name cloudmart-postgres \
  -e POSTGRES_USER=cloudmart \
  -e POSTGRES_PASSWORD=changeme_strong_password \
  -e POSTGRES_DB=cloudmart_db \
  -p 5432:5432 \
  postgres:15-alpine
```

### 4.2 Siapkan file .env backend

```bash
cd backend
cp .env.example .env
# Edit .env: isi DATABASE_URL, JWT_SECRET
```

Contoh `DATABASE_URL`:
```
DATABASE_URL=postgresql://cloudmart:changeme_strong_password@localhost:5432/cloudmart_db
```

### 4.3 Sinkronisasi schema

```bash
cd backend
npx prisma generate
npx prisma db push
```

Output yang diharapkan: `Your database is now in sync with your Prisma schema.`

### 4.4 Jalankan seed

```bash
npm run db:seed
```

Output yang diharapkan: `Seed completed successfully.`

---

## 5. Seed Credentials (Development Only)

| Role     | Email                        | Password      |
|----------|------------------------------|---------------|
| Admin    | admin@cloudmart.local        | Admin123!     |
| Customer | customer@cloudmart.local     | Customer123!  |

> **PENTING:** Kredensial ini hanya untuk development. Jangan gunakan di environment production.

Seed juga mengisi:
- 5 kategori: Electronics, Clothing, Books, Home & Garden, Sports
- 15 produk dengan gambar (via picsum.photos) dan data inventory

---

## 6. Prisma Migrate vs db push

| Aspek              | `db push`                                 | `prisma migrate`                          |
|--------------------|-------------------------------------------|-------------------------------------------|
| Kapan digunakan    | Development (iterasi cepat)               | Production / staging                      |
| File migrasi       | Tidak dibuat                              | Dibuat di `prisma/migrations/`            |
| Riwayat perubahan  | Tidak ada                                 | Tercatat per migrasi                      |
| Rollback           | Manual                                    | Via file migrasi                          |
| Rekomendasi        | ✅ Saat ini cukup untuk tugas akademik    | Sebaiknya digunakan sebelum production deployment |

Untuk proyek ini (akademik), `db push` sudah memadai. Jika diperlukan untuk deployment ke VM 102, sebaiknya beralih ke `prisma migrate deploy`.

---

## 7. Backup Procedure

```bash
# Backup ke file SQL
docker exec cloudmart-postgres pg_dump -U cloudmart cloudmart_db > backup_$(date +%Y%m%d).sql

# Restore dari file SQL
docker exec -i cloudmart-postgres psql -U cloudmart cloudmart_db < backup_YYYYMMDD.sql
```

---

## 8. Enum Values

| Enum           | Values                                              |
|----------------|-----------------------------------------------------|
| `UserRole`     | `CUSTOMER`, `ADMIN`                                 |
| `OrderStatus`  | `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `PaymentStatus`| `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`          |
