# CloudMart — Testing Guide

---

## 1. Acceptance Criteria Phase 4 (Checklist)

Centang setiap item setelah diverifikasi secara manual atau otomatis.

| # | Kriteria                                   | Cara Verifikasi                              | Status |
|---|--------------------------------------------|----------------------------------------------|--------|
| 1 | Frontend dapat dijalankan                 | `npm run dev` di folder `frontend` → buka http://localhost:5173 | ☐ |
| 2 | Backend dapat dijalankan                  | `npm run dev` di folder `backend` → `Listening on port 4000` | ☐ |
| 3 | PostgreSQL dapat diakses                  | `npx prisma db push` mengembalikan 0 error   | ☐ |
| 4 | Register dan login berhasil               | Test 1–3 di bawah PASS                       | ☐ |
| 5 | Role admin dan customer berfungsi         | Test 7 (403 untuk customer ke admin) PASS    | ☐ |
| 6 | Produk dapat dikelola admin               | POST/PUT/DELETE /api/admin/products berhasil | ☐ |
| 7 | Customer dapat melihat katalog            | GET /api/products mengembalikan data         | ☐ |
| 8 | Shopping cart berfungsi                   | Test 8 (GET /api/cart) PASS                  | ☐ |
| 9 | Checkout berhasil                         | POST /api/orders mengembalikan order dengan reference_code | ☐ |
| 10| Order tersimpan di database               | GET /api/orders mengembalikan order yang baru dibuat | ☐ |
| 11| Admin dapat mengelola pesanan             | PATCH /api/admin/orders/:id/status berhasil  | ☐ |
| 12| UI responsif                              | Buka di browser mobile (DevTools 375px)      | ☐ |
| 13| Build production berhasil                 | `npm run build` di frontend, 0 error         | ☐ |
| 14| TypeScript check 0 error                  | `npx tsc --noEmit` backend + frontend        | ☐ |

---

## 2. TypeScript Verification

### Backend
```powershell
cd "d:\Tugas Kuliah\UAS-CC\backend"
npx tsc --noEmit
```
Expected: tidak ada output (exit code 0 = 0 error).

### Frontend
```powershell
cd "d:\Tugas Kuliah\UAS-CC\frontend"
npm run typecheck
```
Expected: tidak ada output (exit code 0).

---

## 3. Frontend Production Build

```powershell
cd "d:\Tugas Kuliah\UAS-CC\frontend"
npm run build
```

Expected output:
```
✓ built in X.XXs
dist/index.html
dist/assets/index-[hash].js    ~890 kB (gzip: ~257 kB)
dist/assets/index-[hash].css   ~28 kB (gzip: ~6 kB)
```

---

## 4. Urutan Menjalankan Full Stack Lokal

```powershell
# Step 1: Pastikan Docker sudah berjalan

# Step 2: Start PostgreSQL
cd "d:\Tugas Kuliah\UAS-CC"
docker compose -f docker-compose.yml -f docker-compose.dev.yml up postgres -d

# Step 3: Tunggu ~5 detik, lalu sinkronisasi schema
cd backend
npx prisma generate
npx prisma db push

# Step 4: Jalankan seed data
npm run db:seed

# Step 5: Start backend (terminal terpisah)
npm run dev
# Backend berjalan di http://localhost:4000

# Step 6: Start frontend (terminal baru)
cd "d:\Tugas Kuliah\UAS-CC\frontend"
npm run dev
# Frontend berjalan di http://localhost:5173
```

---

## 5. API Test Commands (PowerShell)

Jalankan setelah full stack berjalan (backend di port 4000, database terisi seed).

### Test 1 — Register Customer Baru

```powershell
try {
  $r1 = Invoke-RestMethod -Method POST `
    -Uri "http://localhost:4000/api/auth/register" `
    -ContentType "application/json" `
    -Body '{"name":"Test User","email":"test@example.com","password":"Test1234!"}'
  Write-Host "Test 1 PASS: token diterima = $($r1.data.token.Substring(0,20))..."
} catch { Write-Host "Test 1 FAIL: $($_.Exception.Message)" }
```

### Test 2 — Login Admin

```powershell
try {
  $r2 = Invoke-RestMethod -Method POST `
    -Uri "http://localhost:4000/api/auth/login" `
    -ContentType "application/json" `
    -Body '{"email":"admin@cloudmart.local","password":"Admin123!"}'
  $adminToken = $r2.data.token
  Write-Host "Test 2 PASS: admin token diterima"
} catch { Write-Host "Test 2 FAIL: $($_.Exception.Message)" }
```

### Test 3 — Login Customer

```powershell
try {
  $r3 = Invoke-RestMethod -Method POST `
    -Uri "http://localhost:4000/api/auth/login" `
    -ContentType "application/json" `
    -Body '{"email":"customer@cloudmart.local","password":"Customer123!"}'
  $customerToken = $r3.data.token
  Write-Host "Test 3 PASS: customer token diterima"
} catch { Write-Host "Test 3 FAIL: $($_.Exception.Message)" }
```

### Test 4 — Daftar Produk

```powershell
try {
  $r4 = Invoke-RestMethod -Method GET -Uri "http://localhost:4000/api/products"
  Write-Host "Test 4 PASS: $($r4.data.Count) produk, total=$($r4.pagination.total)"
} catch { Write-Host "Test 4 FAIL: $($_.Exception.Message)" }
```

### Test 5 — Daftar Kategori

```powershell
try {
  $r5 = Invoke-RestMethod -Method GET -Uri "http://localhost:4000/api/categories"
  Write-Host "Test 5 PASS: $($r5.data.Count) kategori"
} catch { Write-Host "Test 5 FAIL: $($_.Exception.Message)" }
```

### Test 6 — Admin Stats

```powershell
try {
  $headers6 = @{"Authorization" = "Bearer $adminToken"}
  $r6 = Invoke-RestMethod -Method GET `
    -Uri "http://localhost:4000/api/admin/stats" -Headers $headers6
  Write-Host "Test 6 PASS: revenue=$($r6.data.totalRevenue), orders=$($r6.data.totalOrders)"
} catch { Write-Host "Test 6 FAIL: $($_.Exception.Message)" }
```

### Test 7 — Otorisasi: Customer Tidak Dapat Akses Admin

```powershell
try {
  $headers7 = @{"Authorization" = "Bearer $customerToken"}
  Invoke-RestMethod -Method GET `
    -Uri "http://localhost:4000/api/admin/stats" -Headers $headers7
  Write-Host "Test 7 FAIL: seharusnya 403"
} catch {
  if ($_.Exception.Response.StatusCode -eq 403) {
    Write-Host "Test 7 PASS: 403 Forbidden dikembalikan"
  } else {
    Write-Host "Test 7 PARTIAL: $($_.Exception.Message)"
  }
}
```

### Test 8 — Ambil Cart Customer

```powershell
try {
  $headers8 = @{"Authorization" = "Bearer $customerToken"}
  $r8 = Invoke-RestMethod -Method GET `
    -Uri "http://localhost:4000/api/cart" -Headers $headers8
  Write-Host "Test 8 PASS: cart items=$($r8.data.items.Count)"
} catch { Write-Host "Test 8 FAIL: $($_.Exception.Message)" }
```

### Test 9 — Tambah Produk ke Cart

```powershell
# Ambil product ID dari test 4 dulu
try {
  $firstProduct = $r4.data[0].id
  $headers9 = @{"Authorization" = "Bearer $customerToken"}
  $body9 = "{`"productId`":`"$firstProduct`",`"quantity`":1}"
  $r9 = Invoke-RestMethod -Method POST `
    -Uri "http://localhost:4000/api/cart/items" `
    -Headers $headers9 -ContentType "application/json" -Body $body9
  Write-Host "Test 9 PASS: item ditambahkan ke cart"
} catch { Write-Host "Test 9 FAIL: $($_.Exception.Message)" }
```

### Test 10 — Checkout

```powershell
try {
  $headers10 = @{"Authorization" = "Bearer $customerToken"}
  $checkoutBody = @{
    addressData = @{
      recipientName = "Test User"
      phone = "081234567890"
      street = "Jl. Test No. 1"
      city = "Tasikmalaya"
      province = "Jawa Barat"
      postalCode = "46114"
    }
    paymentMethod = "BANK_TRANSFER"
  } | ConvertTo-Json
  $r10 = Invoke-RestMethod -Method POST `
    -Uri "http://localhost:4000/api/orders" `
    -Headers $headers10 -ContentType "application/json" -Body $checkoutBody
  Write-Host "Test 10 PASS: order ID=$($r10.data.id), ref=$($r10.data.payment.reference_code)"
} catch { Write-Host "Test 10 FAIL: $($_.Exception.Message)" }
```

---

## 6. Security Checks (Manual)

| Check                      | Cara Verifikasi                                              |
|----------------------------|--------------------------------------------------------------|
| Password tidak ter-expose  | `GET /api/auth/me` — pastikan `password_hash` tidak ada di response |
| JWT diperlukan             | Panggil `/api/cart` tanpa token → harus 401                  |
| Admin-only endpoint        | Panggil `/api/admin/stats` dengan customer token → harus 403 |
| Rate limiting auth         | POST `/api/auth/login` > 10x dalam 15 menit → harus 429      |
| Input validation           | POST register dengan email tidak valid → harus 400           |

---

## 7. Build dan TypeCheck — Hasil Phase 4

Berdasarkan step sebelumnya (Phase 4):

| Komponen | Perintah                 | Hasil                                   |
|----------|--------------------------|-----------------------------------------|
| Backend TypeScript | `npx tsc --noEmit` | Exit code 0, 0 error              |
| Frontend TypeScript | `npm run typecheck` | Exit code 0, 0 error              |
| Frontend Build | `npm run build`     | Berhasil: 890.82 kB JS, 28.28 kB CSS |
