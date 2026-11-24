# Laporan Phase 3 — Frontend CloudMart (Kelompok 3 / CC3_G)

**Tanggal:** 2026-11-24  
**Mata Kuliah:** Komputasi Awan  
**Program Studi:** Informatika, Fakultas Teknik, Universitas Siliwangi  
**Dosen:** Bapak Reza Febriana, S.Kom., M.Kom., CEH

---

## 1. RINGKASAN

| Item | Keterangan |
|---|---|
| Status Build | ✅ **BERHASIL** |
| Status TypeCheck | ✅ **LULUS** (0 error) |
| Jumlah file di `frontend/src/` | 52 file total (41 `.tsx` + 10 `.ts` + 1 `.css`) |
| Ukuran bundle JS (minified) | 869,86 KB (gzip: ~256,73 KB) |
| Ukuran bundle CSS (minified) | 27,62 KB (gzip: ~5,75 KB) |
| Halaman HTML output | 0,80 KB |
| Waktu build | 5,49 detik |

Build berhasil diselesaikan tanpa error. TypeScript compiler (`tsc --noEmit`) tidak menemukan kesalahan tipe. Vite menghasilkan static files di direktori `dist/` yang siap disajikan melalui Nginx di lingkungan production.

---

## 2. DAFTAR FILE YANG DIBUAT

### Struktur Direktori `frontend/src/`

#### Root

| File | Ukuran | Deskripsi |
|---|---|---|
| `main.tsx` | 241 B | Entry point React, mount `<App />` ke DOM |
| `App.tsx` | 4.370 B | Router utama: definisi semua route storefront dan admin |
| `index.css` | 384 B | Global CSS dengan Tailwind directives |

#### `components/ui/` — Komponen UI Reusable

| File | Ukuran | Deskripsi |
|---|---|---|
| `Badge.tsx` | 720 B | Komponen badge/label dengan variant warna |
| `Button.tsx` | 1.601 B | Tombol dengan variant (primary, secondary, ghost, danger) dan ukuran |
| `Card.tsx` | 983 B | Container card dengan header, body, footer |
| `EmptyState.tsx` | 803 B | Tampilan kosong dengan ikon dan pesan |
| `Input.tsx` | 1.268 B | Input form dengan label, error state, dan helper text |
| `Modal.tsx` | 1.624 B | Dialog modal dengan overlay dan animasi |
| `Spinner.tsx` | 834 B | Loading spinner dengan ukuran dapat dikonfigurasi |
| `Table.tsx` | 1.497 B | Tabel data responsif dengan header dan body |
| `Toast.tsx` | 2.431 B | Notifikasi toast (success, error, warning, info) |

#### `components/layout/` — Komponen Layout

| File | Ukuran | Deskripsi |
|---|---|---|
| `Navbar.tsx` | 7.302 B | Navigasi storefront: logo, search, cart icon, auth links, mobile menu |
| `Footer.tsx` | 2.592 B | Footer storefront dengan link dan informasi |
| `StorefrontLayout.tsx` | 328 B | Wrapper layout untuk halaman customer |
| `AdminLayout.tsx` | 448 B | Wrapper layout untuk halaman admin |
| `AdminSidebar.tsx` | 2.317 B | Sidebar navigasi admin dengan ikon dan link |
| `AdminTopbar.tsx` | 1.726 B | Topbar admin dengan breadcrumb dan profile |

#### `components/product/` — Komponen Produk

| File | Ukuran | Deskripsi |
|---|---|---|
| `ProductCard.tsx` | 2.737 B | Kartu produk dengan gambar, harga, rating, tombol add to cart |
| `ProductFilters.tsx` | 2.471 B | Panel filter: kategori, harga, rating, sorting |
| `ProductGrid.tsx` | 1.394 B | Grid responsif untuk menampilkan koleksi ProductCard |

#### `components/cart/` — Komponen Keranjang

| File | Ukuran | Deskripsi |
|---|---|---|
| `CartDrawer.tsx` | 6.790 B | Drawer slide-in untuk keranjang belanja dengan item list dan summary |

#### `components/common/` — Komponen Utilitas

| File | Ukuran | Deskripsi |
|---|---|---|
| `ErrorBoundary.tsx` | 1.606 B | React Error Boundary untuk menangkap render error |
| `LoadingPage.tsx` | 296 B | Halaman loading full-screen |
| `ProtectedRoute.tsx` | 587 B | Route guard yang memeriksa status autentikasi |

#### `pages/storefront/` — Halaman Customer

| File | Ukuran | Deskripsi |
|---|---|---|
| `HomePage.tsx` | 4.689 B | Landing page: hero section, featured products, kategori |
| `ProductsPage.tsx` | 3.248 B | Daftar produk dengan filter dan search |
| `ProductDetailPage.tsx` | 6.651 B | Detail produk: gambar, deskripsi, spesifikasi, add to cart |
| `CartPage.tsx` | 7.189 B | Halaman keranjang dengan item management dan summary |
| `CheckoutPage.tsx` | 13.997 B | Proses checkout: alamat, metode pembayaran, konfirmasi order |
| `LoginPage.tsx` | 5.984 B | Form login dengan validasi |
| `RegisterPage.tsx` | 7.215 B | Form registrasi dengan validasi |
| `OrdersPage.tsx` | 4.177 B | Daftar riwayat pesanan customer |
| `OrderDetailPage.tsx` | 9.886 B | Detail pesanan: status, item, tracking, invoice |
| `ProfilePage.tsx` | 3.879 B | Halaman profil customer dengan edit informasi |

#### `pages/admin/` — Halaman Admin Dashboard

| File | Ukuran | Deskripsi |
|---|---|---|
| `DashboardPage.tsx` | 8.007 B | Dashboard utama: statistik, grafik revenue, aktivitas terbaru |
| `ProductsPage.tsx` | 11.208 B | Manajemen produk: CRUD, search, filter, status inventory |
| `CategoriesPage.tsx` | 8.228 B | Manajemen kategori: CRUD, hierarki kategori |
| `OrdersPage.tsx` | 5.807 B | Manajemen pesanan: daftar, status update, filter |
| `UsersPage.tsx` | 3.024 B | Manajemen pengguna: daftar, role, status |
| `InfrastructurePage.tsx` | 3.706 B | Halaman integrasi IaaS (Proxmox) — status NOT CONFIGURED |
| `PlatformPage.tsx` | 2.834 B | Halaman integrasi PaaS (Docker/Portainer) — status NOT CONFIGURED |

#### `hooks/` — Custom React Hooks

| File | Ukuran | Deskripsi |
|---|---|---|
| `useAuth.ts` | 778 B | Hook untuk state dan operasi autentikasi |
| `useCart.ts` | 1.834 B | Hook untuk manajemen keranjang belanja |
| `useOrders.ts` | 1.268 B | Hook untuk operasi order (fetch, create, update) |
| `useProducts.ts` | 1.314 B | Hook untuk fetch dan filter produk |

#### `store/` — State Management (Zustand)

| File | Ukuran | Deskripsi |
|---|---|---|
| `authStore.ts` | 764 B | Global state autentikasi (user, token, login/logout) |
| `cartStore.ts` | 660 B | Global state keranjang belanja (items, add, remove, clear) |

#### `lib/` — Utilitas dan Konfigurasi

| File | Ukuran | Deskripsi |
|---|---|---|
| `api.ts` | 816 B | Axios instance dengan base URL dan interceptor token |
| `constants.ts` | 936 B | Konstanta aplikasi (API endpoints, konfigurasi) |
| `utils.ts` | 862 B | Fungsi utilitas (format harga, tanggal, class names) |

#### `types/` — TypeScript Types

| File | Ukuran | Deskripsi |
|---|---|---|
| `index.ts` | 2.440 B | Definisi tipe global: User, Product, Order, Cart, ApiResponse, dsb. |

---

## 3. DEPENDENCIES

### Production Dependencies

| Package | Versi | Fungsi |
|---|---|---|
| `react` | ^18.2.0 | Library UI utama |
| `react-dom` | ^18.2.0 | DOM renderer untuk React |
| `react-router-dom` | ^6.21.0 | Client-side routing |
| `@tanstack/react-query` | ^5.13.4 | Server state management dan data fetching |
| `@tanstack/react-query-devtools` | ^5.13.4 | DevTools untuk React Query |
| `zustand` | ^4.4.7 | Global client state management |
| `axios` | ^1.6.2 | HTTP client untuk komunikasi dengan backend |
| `react-hook-form` | ^7.49.2 | Manajemen form dengan performa tinggi |
| `@hookform/resolvers` | ^3.3.2 | Integrasi react-hook-form dengan Zod |
| `zod` | ^3.22.4 | Validasi skema data (TypeScript-first) |
| `lucide-react` | ^0.294.0 | Icon library (SVG components) |
| `recharts` | ^2.10.3 | Library grafik untuk dashboard admin |
| `clsx` | ^2.0.0 | Conditional className utility |
| `tailwind-merge` | ^2.2.0 | Merge Tailwind classes tanpa konflik |

### Dev Dependencies

| Package | Versi | Fungsi |
|---|---|---|
| `vite` | ^5.0.8 | Build tool dan dev server |
| `@vitejs/plugin-react` | ^4.2.1 | Plugin React untuk Vite (Babel/SWC) |
| `typescript` | ^5.3.2 | TypeScript compiler |
| `tailwindcss` | ^3.4.0 | Utility-first CSS framework |
| `autoprefixer` | ^10.4.16 | PostCSS plugin untuk vendor prefix |
| `postcss` | ^8.4.32 | CSS transformation tool |
| `@types/react` | ^18.2.43 | TypeScript types untuk React |
| `@types/react-dom` | ^18.2.17 | TypeScript types untuk React DOM |

---

## 4. HASIL TYPECHECK

**Perintah:** `npm run typecheck` → `tsc --noEmit`

```
> cloudmart-frontend@1.0.0 typecheck
> tsc --noEmit

[Exit Code: 0 — tidak ada error]
```

**Status: ✅ LULUS** — TypeScript compiler tidak menemukan kesalahan tipe. Semua 52 file source code kompatibel dengan konfigurasi TypeScript strict mode.

---

## 5. HASIL BUILD

**Perintah:** `npm run build` → `tsc && vite build`

```
> cloudmart-frontend@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 2134 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.82 kB │ gzip:   0.46 kB
dist/assets/index-C0wxeaD6.css   28.28 kB │ gzip:   5.75 kB
dist/assets/index-BD2GCui5.js   890.70 kB │ gzip: 256.73 kB

(!) Some chunks are larger than 500 kB after minification.
✓ built in 5.49s
```

**Status: ✅ BERHASIL**

**Output di `frontend/dist/`:**

| File | Ukuran (minified) | Ukuran (gzip) |
|---|---|---|
| `index.html` | 0,80 KB | 0,46 KB |
| `assets/index-BD2GCui5.js` | 869,86 KB | 256,73 KB |
| `assets/index-C0wxeaD6.css` | 27,62 KB | 5,75 KB |

> **Peringatan non-fatal:** Vite menginformasikan bahwa bundle JS melebihi batas rekomendasi 500 KB. Ini bukan error, hanya saran untuk code-splitting di iterasi berikutnya.

---

## 6. CARA MENJALANKAN LOKAL

### Prerequisites

- **Node.js** versi 18.x atau lebih baru
- **npm** versi 9.x atau lebih baru
- **Backend Express** sudah berjalan (opsional untuk eksplorasi UI)

Verifikasi:
```bash
node --version   # harus >= 18.0.0
npm --version    # harus >= 9.0.0
```

### Langkah-langkah

#### Opsi A: Frontend Saja (mode development)

```bash
# 1. Masuk ke direktori frontend
cd "d:\Tugas Kuliah\UAS-CC\frontend"

# 2. Install dependencies (hanya pertama kali atau setelah update package.json)
npm install

# 3. Jalankan dev server
npm run dev
```

Frontend akan berjalan di **http://localhost:5173**

#### Opsi B: Full Stack (Backend + Frontend)

```bash
# Terminal 1 — Backend
cd "d:\Tugas Kuliah\UAS-CC\backend"
npm install
npm run dev
# Backend berjalan di http://localhost:4000

# Terminal 2 — Frontend
cd "d:\Tugas Kuliah\UAS-CC\frontend"
npm install
npm run dev
# Frontend berjalan di http://localhost:5173
```

### URL Akses (Development)

| Komponen | URL | Keterangan |
|---|---|---|
| Storefront (Customer) | http://localhost:5173/ | Landing page, produk, cart, checkout |
| Login | http://localhost:5173/login | Form autentikasi customer |
| Register | http://localhost:5173/register | Form registrasi customer baru |
| Admin Dashboard | http://localhost:5173/admin | Dashboard enterprise admin |
| Admin Produk | http://localhost:5173/admin/products | Manajemen produk |
| Admin Pesanan | http://localhost:5173/admin/orders | Manajemen pesanan |

> **Catatan:** Port 5173 hanya untuk development lokal. Pada environment production (VM 102), frontend disajikan sebagai static files melalui Nginx internal port 80, diakses via Nginx reverse proxy di host port 8080.

---

## 7. CATATAN TEKNIS

### Keputusan Implementasi Penting

1. **State Management Terpisah:** Zustand dipakai untuk client state (auth token, cart items) yang bersifat persisten antar halaman, sedangkan React Query dipakai untuk server state (data produk, order) yang memerlukan caching dan refetch otomatis.

2. **Arsitektur Halaman Admin:** Halaman `InfrastructurePage` dan `PlatformPage` sengaja dirancang menampilkan status `NOT CONFIGURED` tanpa data palsu. Integrasi nyata ke Proxmox, Docker, dan Portainer akan ditambahkan pada Phase 4 (IaaS/PaaS integration) setelah komponen SaaS fungsional.

3. **TypeScript Strict Mode:** Seluruh file menggunakan strict TypeScript. Interface dan type alias didefinisikan secara terpusat di `src/types/index.ts` untuk konsistensi lintas komponen.

4. **Routing:** React Router v6 dengan layout-based routing — `StorefrontLayout` membungkus semua route customer, `AdminLayout` membungkus semua route admin. `ProtectedRoute` guard memeriksa token dari `authStore`.

5. **API Layer:** Axios instance di `src/lib/api.ts` sudah dikonfigurasi dengan base URL `http://localhost:4000/api` untuk development, dan request interceptor yang otomatis menyertakan Bearer token dari Zustand store.

6. **Production Build:** `npm run build` menghasilkan static files di `dist/` yang dapat langsung disalin ke direktori root Nginx. Tidak ada server Node.js yang diperlukan saat production.

### Known Limitations

1. **Bundle Size Besar (869 KB):** Semua halaman dibundel dalam satu chunk karena belum ada code-splitting dengan `React.lazy()` / `Suspense`. Hal ini memperlambat initial load tetapi tidak mempengaruhi fungsionalitas. Optimasi ini direncanakan setelah seluruh fitur SaaS stabil.

2. **Data Mock di Beberapa Halaman Admin:** `DashboardPage`, `InfrastructurePage`, dan `PlatformPage` menampilkan data statis sebagai placeholder. Data nyata akan terhubung ke backend setelah API endpoint tersedia.

3. **Belum Ada Unit Test:** Testing framework (Vitest + Testing Library) belum di-setup. Ini sesuai dengan prioritas pengembangan yang berfokus pada fungsionalitas terlebih dahulu.

4. **Integrasi Cloud Belum Aktif:** Adapter untuk Proxmox API, Docker API, Portainer API, dan Prometheus API sudah dipersiapkan sebagai struktur (`InfrastructurePage`, `PlatformPage`), tetapi belum terhubung ke endpoint nyata.

---

## 8. STATUS PHASE 3

### ✅ Komponen yang Sudah Selesai

**Foundation:**
- [x] Setup proyek React + TypeScript dengan Vite
- [x] Konfigurasi Tailwind CSS
- [x] TypeScript strict mode
- [x] Struktur monorepo (`frontend/`, `backend/`)
- [x] Komponen UI reusable (Button, Card, Input, Modal, Table, Badge, Toast, Spinner, EmptyState)
- [x] Layout components (Navbar, Footer, AdminSidebar, AdminTopbar)
- [x] State management (Zustand untuk auth dan cart)
- [x] Data fetching layer (React Query + Axios)
- [x] Form validation (react-hook-form + Zod)
- [x] TypeScript types terpusat

**SaaS — Customer Storefront:**
- [x] Homepage dengan hero section dan featured products
- [x] Halaman daftar produk dengan filter
- [x] Halaman detail produk
- [x] Keranjang belanja (CartDrawer + CartPage)
- [x] Proses checkout
- [x] Login dan registrasi
- [x] Profil customer
- [x] Riwayat pesanan customer
- [x] Detail pesanan

**SaaS — Admin Dashboard:**
- [x] Dashboard statistik dengan grafik
- [x] Manajemen produk (CRUD)
- [x] Manajemen kategori (CRUD)
- [x] Manajemen pesanan
- [x] Manajemen pengguna
- [x] Halaman infrastruktur IaaS (placeholder)
- [x] Halaman platform PaaS (placeholder)

**Production Setup:**
- [x] Build script menghasilkan static files (`npm run build`)
- [x] Output `dist/` siap disajikan via Nginx

### ⏳ Komponen yang Belum Selesai / Direncanakan

**Backend (Phase 3 Backend — dikerjakan terpisah):**
- [ ] Express + TypeScript server
- [ ] PostgreSQL schema + Prisma ORM
- [ ] Authentication API (JWT)
- [ ] Products API
- [ ] Orders API
- [ ] Users API

**Docker & Nginx (Phase 3 Infrastructure):**
- [ ] Docker Compose untuk development lokal
- [ ] Nginx configuration (reverse proxy + static serving)
- [ ] Dockerfile untuk frontend (Nginx)
- [ ] Dockerfile untuk backend (Node.js)

**Phase 4 — Cloud Integration:**
- [ ] Proxmox API adapter
- [ ] Docker/Portainer API adapter
- [ ] Prometheus API adapter
- [ ] Environment variable configuration

---

*Laporan ini dibuat secara otomatis berdasarkan hasil analisis source code dan output build pada tanggal 2026-11-24.*
