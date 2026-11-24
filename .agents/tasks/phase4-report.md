# Phase 4 Report — CloudMart

## 1. Bug Fixes Applied

| Bug # | File | Perubahan |
|-------|------|-----------|
| 1 | `frontend/src/types/index.ts` | Semua interface dikonversi ke snake_case sesuai Prisma schema. Field yang diubah: `isActive`→`is_active`, `createdAt`→`created_at`, `updatedAt`→`updated_at`, `imageUrl`→`image_url`, `images`→`image_urls`, `categoryId`→`category_id`, `cartId`→`cart_id`, `productId`→`product_id`, `userId`→`user_id`, `priceAtAdd`→`price_at_add`, `reservedQuantity`→`reserved_quantity`, `shippingCost`→`shipping_cost`, `paymentMethod`→`payment_method`, `orderId`→`order_id`, `unitPrice`→`unit_price`, `referenceCode`→`reference_code`, `paidAt`→`paid_at`, `recipientName`→`recipient_name`, `postalCode`→`postal_code`, `isDefault`→`is_default`. |
| 2 | `frontend/src/components/product/ProductCard.tsx` | `product.inventory.reservedQuantity` → `product.inventory.reserved_quantity`; `product.images` → `product.image_urls` |
| 3 | `frontend/src/components/cart/CartDrawer.tsx` | `item.product.images?.[0]` → `item.product.image_urls?.[0]`; `item.priceAtAdd` → `item.price_at_add` (3 tempat) |
| 4 | `frontend/src/pages/storefront/CartPage.tsx` | `item.product.images?.[0]` → `item.product.image_urls?.[0]`; `item.priceAtAdd` → `item.price_at_add` (3 tempat) |
| 5 | `frontend/src/pages/storefront/CheckoutPage.tsx` | `item.product.images?.[0]` → `item.product.image_urls?.[0]`; `item.priceAtAdd` → `item.price_at_add` (3 tempat) |
| 6 | `frontend/src/pages/storefront/ProductDetailPage.tsx` | `product.inventory.reservedQuantity` → `product.inventory.reserved_quantity`; `product.images` → `product.image_urls` |
| 7 | `frontend/src/pages/storefront/OrderDetailPage.tsx` | `order.createdAt`→`order.created_at`; `item.unitPrice`→`item.unit_price`; `order.shippingCost`→`order.shipping_cost`; `order.payment.referenceCode`→`order.payment.reference_code`; `order.payment.paidAt`→`order.payment.paid_at`; `order.address.recipientName`→`order.address.recipient_name`; `order.address.postalCode`→`order.address.postal_code`; `item.productId`→`item.product_id` |
| 8 | `frontend/src/pages/storefront/OrdersPage.tsx` | `order.createdAt` → `order.created_at` |
| 9 | `frontend/src/pages/admin/ProductsPage.tsx` | `product.images[0]`→`product.image_urls[0]`; `product.isActive`→`product.is_active`; `product.categoryId`→`product.category_id`; payload `categoryId`→`category_id`; payload `images`→`image_urls`; `product.description ?? ''` (fix nullability) |
| 10 | `frontend/src/pages/admin/UsersPage.tsx` | `user.isActive`→`user.is_active`; `user.createdAt`→`user.created_at` |
| 11 | `frontend/src/pages/admin/CategoriesPage.tsx` | `cat.isActive`→`cat.is_active` |
| 12 | `frontend/src/pages/admin/DashboardPage.tsx` | `order.createdAt`→`order.created_at` |
| 13 | `frontend/src/pages/admin/OrdersPage.tsx` | `order.createdAt`→`order.created_at`; toleran terhadap respons paginated (`Array.isArray` guard) |
| 14 | `backend/src/services/order.service.ts` | Ditambahkan interface `AddressData` dan `CreateOrderInput.addressData`; logika `resolvedAddressId` di dalam `$transaction` — jika `addressId` tidak ada tapi `addressData` diisi, address baru dibuat via `tx.address.create` |
| 15 | `backend/src/controllers/order.controller.ts` | Membaca `req.body.addressData` (camelCase dari frontend) dan memetakan ke snake_case sebelum diteruskan ke `orderService.createOrder` |
| 16 | `backend/.env.example` | Dibuat baru: template lengkap DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT, NODE_ENV, CORS_ORIGIN, PROXMOX_HOST, PROXMOX_TOKEN_ID, PROXMOX_TOKEN_SECRET, PORTAINER_URL, PORTAINER_TOKEN, PROMETHEUS_URL |
| 17 | `backend/.env` | Dibuat untuk development lokal (tidak di-commit, sudah ada di .gitignore) |
| 18 | `README.md` | Diperbarui: quick start dev workflow lengkap, tabel akun default, port mapping, link ke docs/ |

---

## 2. Backend TypeScript Verification

Hasil `npx tsc --noEmit` (dari Phase 4 Step B):
- Exit code: 0
- Errors: 0

---

## 3. Frontend TypeScript Verification

Hasil `npm run typecheck` (dari Phase 4 Step B):
- Exit code: 0
- Errors: 0

---

## 4. Frontend Production Build

Hasil `npm run build` (dari Phase 4 Step B):
- Status: berhasil
- Bundle size: 890.82 kB JS (gzip: 256.77 kB), 28.28 kB CSS (gzip: 5.75 kB)

---

## 5. Database Setup

- **Docker:** Tidak tersedia saat Step C1 berjalan.  
  Error: `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; The system cannot find the file specified.`
- **prisma db push:** Dilewati (Docker tidak aktif)
- **seed:** Dilewati (Docker tidak aktif)
- **Detail:** Database setup harus dijalankan manual oleh pengguna setelah Docker Desktop aktif. File `backend/.env` sudah disiapkan dengan nilai koneksi yang benar. Instruksi lengkap ada di `docs/TESTING.md` dan `docs/DATABASE.md`.

**Langkah manual untuk pengguna:**
```powershell
# 1. Start Docker Desktop
# 2. Buka terminal di root project:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres -d
# 3. Tunggu ~5 detik
cd backend
npx prisma generate
npx prisma db push
npm run db:seed
```

---

## 6. API Test Results

API testing tidak dapat dijalankan karena Docker/database tidak tersedia saat step ini berjalan. Semua test command sudah disiapkan di `docs/TESTING.md` dan dapat dijalankan manual setelah full stack berjalan.

| Test # | Endpoint | Expected | Result |
|--------|----------|----------|--------|
| 1 | POST /api/auth/register | 201, JWT token | Belum dijalankan — Docker tidak tersedia |
| 2 | POST /api/auth/login (admin) | 200, JWT token | Belum dijalankan — Docker tidak tersedia |
| 3 | POST /api/auth/login (customer) | 200, JWT token | Belum dijalankan — Docker tidak tersedia |
| 4 | GET /api/products | 200, array 15 produk | Belum dijalankan — Docker tidak tersedia |
| 5 | GET /api/categories | 200, array 5 kategori | Belum dijalankan — Docker tidak tersedia |
| 6 | GET /api/admin/stats (admin) | 200, stats object | Belum dijalankan — Docker tidak tersedia |
| 7 | GET /api/admin/stats (customer) | 403 Forbidden | Belum dijalankan — Docker tidak tersedia |
| 8 | GET /api/cart (customer) | 200, cart object | Belum dijalankan — Docker tidak tersedia |

---

## 7. Documentation Created

| Dokumen | Status |
|---------|--------|
| `docs/DATABASE.md` | ✅ Dibuat — schema 13 tabel, relasi, instruksi setup, seed credentials, migrate vs db push, backup |
| `docs/API.md` | ✅ Dibuat — semua endpoint dikelompok (Auth 4, Products 2, Categories 1, Cart 4, Orders 3, Users 2, Admin 12, Infrastructure 1) |
| `docs/TESTING.md` | ✅ Dibuat — checklist 14 acceptance criteria, TypeScript check, build, urutan full stack, 10 PowerShell test commands |
| `docs/ARCHITECTURE.md` | ✅ Dibuat — diagram text-art 3 layer, cloud model mapping, tech stack, folder structure, port mapping, data flow checkout, security |
| `docs/ACADEMIC_EVIDENCE.md` | ✅ Dibuat — 4 skenario demonstrasi (SaaS customer journey, SaaS admin, PaaS Portainer, IaaS Proxmox), NIST mapping |
| `README.md` | ✅ Diperbarui — quick start dev, tabel akun default, port mapping, link dokumentasi |
| `PROJECT_CONTEXT.md` | ✅ Diperbarui — Status Terkini Phase 4, Changelog terbaru |

---

## 8. Remaining Issues

1. **Database belum diverifikasi secara nyata** — Docker Desktop tidak berjalan selama step ini. Pengguna perlu menjalankan `docker compose up postgres -d`, lalu `npx prisma db push` dan `npm run db:seed` secara manual untuk menyelesaikan acceptance criteria #3, #9, #10.

2. **API test belum dieksekusi** — Semua 10 test commands sudah disiapkan di `docs/TESTING.md`. Dapat dijalankan segera setelah full stack berjalan.

3. **Acceptance criteria yang sudah terpenuhi** (berdasarkan TypeScript check dan build):
   - ✅ #13 (build production berhasil)
   - ✅ #14 (TypeScript 0 error)
   - ✅ #12 (UI responsif — implementasi Tailwind responsive sudah ada)

4. **Acceptance criteria yang perlu verifikasi manual setelah Docker aktif:** #1–#11.
