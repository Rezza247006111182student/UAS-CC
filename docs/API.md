# CloudMart — API Documentation

Base URL (development): `http://localhost:4000/api`

---

## Authentication

Semua endpoint yang memerlukan autentikasi menggunakan **Bearer JWT** di header:

```
Authorization: Bearer <token>
```

Token diperoleh dari response `POST /api/auth/login` atau `POST /api/auth/register`.

---

## 1. Auth Endpoints

| Method | Path               | Auth | Description              |
|--------|--------------------|------|--------------------------|
| POST   | /auth/register     | ❌   | Registrasi akun baru (role: CUSTOMER) |
| POST   | /auth/login        | ❌   | Login dan dapatkan JWT token |
| GET    | /auth/me           | ✅   | Ambil data profil pengguna yang sedang login |
| POST   | /auth/logout       | ✅   | Logout (invalidasi sisi client) |

### POST /auth/register

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "string (JWT)",
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "CUSTOMER"
    }
  }
}
```

### POST /auth/login

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "string (JWT)",
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "CUSTOMER | ADMIN"
    }
  }
}
```

> Rate limit: 10 request/15 menit per IP (authLimiter middleware).

---

## 2. Products Endpoints

| Method | Path           | Auth | Description                    |
|--------|----------------|------|--------------------------------|
| GET    | /products      | ❌   | Daftar produk (dengan filter, search, pagination) |
| GET    | /products/:id  | ❌   | Detail satu produk berdasarkan ID |

### GET /products

**Query Parameters:**
- `search` — filter nama produk (string)
- `category` — filter berdasarkan category slug atau ID
- `page` — nomor halaman (default: 1)
- `limit` — jumlah per halaman (default: 12)
- `sortBy` — field untuk sort: `price`, `name`, `created_at` (default: `created_at`)
- `order` — `asc` atau `desc` (default: `desc`)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "description": "string | null",
      "price": "number",
      "category_id": "uuid",
      "image_urls": ["string"],
      "is_active": true,
      "created_at": "ISO8601",
      "updated_at": "ISO8601",
      "category": { "id": "uuid", "name": "string", "slug": "string" },
      "inventory": { "quantity": 50, "reserved_quantity": 0 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 15,
    "totalPages": 2
  }
}
```

---

## 3. Categories Endpoints

| Method | Path         | Auth | Description          |
|--------|--------------|------|----------------------|
| GET    | /categories  | ❌   | Daftar semua kategori aktif |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "description": "string | null",
      "image_url": "string | null",
      "is_active": true
    }
  ]
}
```

---

## 4. Cart Endpoints

Semua cart endpoint memerlukan autentikasi (CUSTOMER atau ADMIN).

| Method | Path              | Auth | Description                  |
|--------|-------------------|------|------------------------------|
| GET    | /cart             | ✅   | Ambil isi keranjang belanja   |
| POST   | /cart/items       | ✅   | Tambahkan produk ke keranjang |
| PATCH  | /cart/items/:id   | ✅   | Update jumlah item di keranjang |
| DELETE | /cart/items/:id   | ✅   | Hapus item dari keranjang     |

### POST /cart/items

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

### PATCH /cart/items/:id

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response GET /cart (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "items": [
      {
        "id": "uuid",
        "cart_id": "uuid",
        "product_id": "uuid",
        "quantity": 2,
        "price_at_add": "number",
        "product": {
          "id": "uuid",
          "name": "string",
          "price": "number",
          "image_urls": ["string"],
          "inventory": { "quantity": 50 }
        }
      }
    ]
  }
}
```

---

## 5. Orders Endpoints

| Method | Path        | Auth | Description                      |
|--------|-------------|------|----------------------------------|
| POST   | /orders     | ✅   | Buat pesanan baru (checkout)      |
| GET    | /orders     | ✅   | Daftar pesanan milik user yang login |
| GET    | /orders/:id | ✅   | Detail satu pesanan               |

### POST /orders (Checkout)

**Request Body:**
```json
{
  "addressId": "uuid (opsional, jika sudah punya alamat tersimpan)",
  "addressData": {
    "recipientName": "string",
    "phone": "string",
    "street": "string",
    "city": "string",
    "province": "string",
    "postalCode": "string"
  },
  "notes": "string (opsional)",
  "paymentMethod": "string (contoh: BANK_TRANSFER)"
}
```

> Jika `addressId` tidak diberikan, `addressData` wajib diisi. Order menggunakan database transaction untuk menjamin konsistensi stok dan data pesanan.

> Harga dihitung di backend berdasarkan data di database, bukan dari nilai yang dikirim frontend.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "subtotal": "number",
    "shipping_cost": 15000,
    "total": "number",
    "payment": {
      "reference_code": "string",
      "status": "PENDING"
    }
  }
}
```

---

## 6. Users Endpoints

| Method | Path           | Auth | Description            |
|--------|----------------|------|------------------------|
| GET    | /users/profile | ✅   | Ambil profil user login |
| PUT    | /users/profile | ✅   | Update profil user login |

### PUT /users/profile

**Request Body:**
```json
{
  "name": "string (opsional)",
  "phone": "string (opsional)"
}
```

---

## 7. Admin Endpoints

Semua endpoint admin memerlukan autentikasi dan role `ADMIN`. Customer yang mencoba mengakses endpoint ini akan mendapat **403 Forbidden**.

| Method | Path                        | Auth (ADMIN) | Description                      |
|--------|-----------------------------|--------------|----------------------------------|
| GET    | /admin/stats                | ✅ ADMIN     | Statistik dashboard (revenue, orders, products, customers) |
| GET    | /admin/orders               | ✅ ADMIN     | Daftar semua pesanan (paginated)  |
| PATCH  | /admin/orders/:id/status    | ✅ ADMIN     | Update status pesanan             |
| GET    | /admin/users                | ✅ ADMIN     | Daftar semua pengguna             |
| GET    | /admin/products             | ✅ ADMIN     | Daftar semua produk (termasuk inactive) |
| POST   | /admin/products             | ✅ ADMIN     | Tambah produk baru                |
| PUT    | /admin/products/:id         | ✅ ADMIN     | Update produk                     |
| DELETE | /admin/products/:id         | ✅ ADMIN     | Hapus produk                      |
| GET    | /admin/categories           | ✅ ADMIN     | Daftar semua kategori             |
| POST   | /admin/categories           | ✅ ADMIN     | Tambah kategori baru              |
| PUT    | /admin/categories/:id       | ✅ ADMIN     | Update kategori                   |
| DELETE | /admin/categories/:id       | ✅ ADMIN     | Hapus kategori                    |

### GET /admin/stats Response (200):
```json
{
  "success": true,
  "data": {
    "totalRevenue": "number",
    "totalOrders": "number",
    "totalProducts": "number",
    "totalCustomers": "number",
    "recentOrders": [ { "id": "uuid", "status": "string", "total": "number", "created_at": "ISO8601" } ]
  }
}
```

### PATCH /admin/orders/:id/status Request Body:
```json
{
  "status": "PROCESSING | SHIPPED | DELIVERED | CANCELLED"
}
```

### POST /admin/products Request Body:
```json
{
  "name": "string",
  "slug": "string",
  "description": "string (opsional)",
  "price": "number",
  "category_id": "uuid",
  "image_urls": ["string"],
  "quantity": "number (stok awal)"
}
```

---

## 8. Infrastructure Endpoints

| Method | Path                   | Auth (ADMIN) | Description                           |
|--------|------------------------|--------------|---------------------------------------|
| GET    | /infrastructure/status | ✅ ADMIN     | Status koneksi Proxmox, Portainer, Prometheus |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "proxmox": { "status": "CONNECTED | NOT_CONFIGURED | ERROR", "version": "string" },
    "portainer": { "status": "CONNECTED | NOT_CONFIGURED | ERROR" },
    "prometheus": { "status": "CONNECTED | NOT_CONFIGURED | ERROR" }
  }
}
```

---

## 9. Error Response Format

Semua error menggunakan format yang konsisten:

```json
{
  "success": false,
  "message": "string (deskripsi error)",
  "errors": [ { "field": "string", "message": "string" } ]
}
```

| HTTP Status | Keterangan                              |
|-------------|-----------------------------------------|
| 400         | Bad Request — validasi input gagal      |
| 401         | Unauthorized — token tidak ada/invalid  |
| 403         | Forbidden — role tidak memiliki akses   |
| 404         | Not Found — resource tidak ditemukan    |
| 409         | Conflict — data sudah ada (email duplikat) |
| 429         | Too Many Requests — rate limit tercapai |
| 500         | Internal Server Error                   |
