# CloudMart — Skenario Demonstrasi UAS

**Mata kuliah:** Komputasi Awan (Semester 5)  
**Kelompok:** 3 — CC3_G  
**Dosen:** Bapak Reza Febriana, S.Kom., M.Kom., CEH  
**Universitas:** Universitas Siliwangi

---

## Pendahuluan

Proyek ini mensimulasikan ketiga model layanan cloud menurut NIST SP 800-145:

| Model | Deskripsi singkat                                      | Implementasi                     |
|-------|--------------------------------------------------------|----------------------------------|
| **IaaS** | Menyediakan komputasi, storage, dan jaringan virtual; pengguna mengelola OS ke atas | Proxmox VE + VM Debian + Cloudflare Tunnel |
| **PaaS** | Menyediakan platform runtime; pengguna hanya deploy aplikasi | Docker Engine + Portainer + Prometheus + Grafana |
| **SaaS** | Menyediakan software siap pakai via browser; pengguna tidak perlu mengelola infrastruktur | Aplikasi CloudMart (e-commerce) |

---

## Skenario 1 — SaaS: Customer Journey

**Tujuan:** Mendemonstrasikan bahwa CloudMart berfungsi sebagai SaaS e-commerce lengkap yang dapat digunakan tanpa pengetahuan teknis tentang infrastruktur di bawahnya.

**Cloud Model:** Software as a Service (SaaS)

**Langkah Demonstrasi:**

1. **Akses Aplikasi**
   - Buka browser, navigasi ke `http://localhost:8080` (atau URL tunnel jika sudah deployed ke VM)
   - Halaman beranda CloudMart tampil dengan daftar produk dan kategori

2. **Registrasi Akun Baru**
   - Klik tombol "Register" di navbar
   - Isi nama, email, dan password (min. 8 karakter)
   - Submit → sistem otomatis membuat akun dengan role CUSTOMER
   - Redirect ke halaman beranda sebagai pengguna yang sudah login

3. **Browse Katalog Produk**
   - Navigasi ke menu "Products" / "Katalog"
   - Gunakan filter kategori (Electronics, Clothing, Books, dll.)
   - Gunakan kolom pencarian untuk mencari produk tertentu
   - Klik produk → halaman detail produk tampil dengan gambar, harga, deskripsi, stok

4. **Tambah ke Keranjang**
   - Di halaman detail produk, klik tombol "Add to Cart"
   - CartDrawer tampil dari kanan, item sudah masuk keranjang
   - Ubah jumlah item di keranjang
   - Lanjutkan belanja atau klik "Checkout"

5. **Proses Checkout**
   - Halaman checkout menampilkan ringkasan order
   - Isi data penerima: nama, nomor telepon, alamat lengkap
   - Pilih metode pembayaran simulasi (Bank Transfer)
   - Klik "Place Order" → backend memproses order dalam satu database transaction
   - Halaman konfirmasi tampil dengan nomor referensi pembayaran

6. **Lihat Riwayat Pesanan**
   - Navigasi ke menu "My Orders" / profil pengguna
   - Daftar semua pesanan tampil dengan status terkini
   - Klik pesanan → detail lengkap: produk, harga, alamat, payment info

**Hasil yang Diharapkan:**
- Semua langkah berjalan tanpa intervensi teknis dari pengguna
- Data persisten di database PostgreSQL
- Harga divalidasi oleh backend (tidak bisa dimanipulasi dari frontend)
- Stok berkurang setelah checkout berhasil

**Keterangan SaaS:**
> Pengguna hanya berinteraksi dengan antarmuka web. Mereka tidak tahu (dan tidak perlu tahu) bahwa aplikasi berjalan di atas Docker container, di dalam VM Debian, di dalam Proxmox VE, yang di-virtualisasi oleh VMware di atas Windows.

---

## Skenario 2 — SaaS: Admin Dashboard Management

**Tujuan:** Mendemonstrasikan fitur manajemen toko dari sisi admin.

**Cloud Model:** Software as a Service (SaaS — multi-tenant, role-based)

**Langkah Demonstrasi:**

1. **Login sebagai Admin**
   - Buka `http://localhost:8080/admin` atau navigasi ke halaman login
   - Gunakan kredensial: `admin@cloudmart.local` / `Admin123!`
   - Redirect ke Admin Dashboard

2. **Lihat Statistik Dashboard**
   - Dashboard menampilkan:
     - Total revenue dari semua pesanan
     - Total orders
     - Total produk aktif
     - Total customer terdaftar
     - Daftar pesanan terbaru

3. **Manajemen Produk**
   - Navigasi ke menu "Products" di admin sidebar
   - Daftar semua produk tampil (termasuk yang inactive)
   - Klik "Add Product" → form tambah produk baru
   - Isi nama, slug, deskripsi, harga, kategori, URL gambar, stok
   - Submit → produk dan inventory record dibuat
   - Edit produk yang sudah ada: klik tombol edit, ubah data
   - Hapus produk: konfirmasi lalu delete

4. **Manajemen Kategori**
   - Navigasi ke "Categories"
   - Tambah, edit, atau hapus kategori

5. **Manajemen Pesanan**
   - Navigasi ke "Orders"
   - Daftar semua pesanan dari semua customer tampil
   - Update status pesanan: PENDING → PROCESSING → SHIPPED → DELIVERED
   - Lihat detail setiap pesanan

6. **Manajemen Pengguna**
   - Navigasi ke "Users"
   - Daftar semua akun pengguna (customer dan admin)

**Verifikasi Otorisasi:**
- Coba akses `http://localhost:8080/admin` dengan akun customer → redirect ke halaman utama / tampil 403
- API test: `GET /api/admin/stats` dengan customer token → 403 Forbidden

**Keterangan SaaS:**
> Admin mengelola toko melalui web interface tanpa perlu SSH ke server atau mengoperasikan database secara langsung. Ini adalah karakteristik utama SaaS.

---

## Skenario 3 — PaaS: Platform Container Management

**Tujuan:** Mendemonstrasikan bahwa Docker dan Portainer menyediakan platform untuk menjalankan aplikasi tanpa harus mengelola OS secara mendalam.

**Cloud Model:** Platform as a Service (PaaS)

**Prasyarat:** Docker Engine berjalan di VM 102 (192.168.18.35)

**Langkah Demonstrasi:**

1. **Akses Portainer**
   - Buka browser: `https://192.168.18.35:9443`
   - Login dengan kredensial administrator Portainer
   - Dashboard tampil: jumlah container, images, volumes

2. **Lihat Container yang Berjalan**
   - Menu "Containers" → daftar container: web1, web2, portainer, prometheus, cadvisor, grafana
   - Setiap container menampilkan status (running/stopped), port mapping, image yang digunakan

3. **Monitoring via Grafana**
   - Buka `http://192.168.18.35:3000`
   - Login ke Grafana
   - Buka dashboard "cAdvisor Exporter" (ID: 14282)
   - Lihat grafik CPU usage dan memory usage container web1 secara realtime

4. **Lihat Metrics di Prometheus**
   - Buka `http://192.168.18.35:9090`
   - Query CPU: `max_over_time((rate(container_cpu_usage_seconds_total{name="web1"}[15s]) * 100)[10m:5s])`
   - Query memory: `max_over_time(container_memory_working_set_bytes{name="web1"}[10m]) / 1024 / 1024`

5. **Deploy Container Baru via Portainer**
   - Di Portainer: menu "Containers" → "Add container"
   - Image: `nginx:alpine`, port mapping 8083:80
   - Deploy → container berjalan dalam hitungan detik

**Hasil yang Diharapkan:**
- Container dapat di-deploy, monitor, dan kelola tanpa SSH langsung ke server
- Metrics CPU dan memory tampil realtime
- PaaS menyembunyikan kompleksitas OS dari developer

**Keterangan PaaS:**
> Developer hanya perlu menentukan image dan konfigurasi. Docker (PaaS) yang menangani isolasi proses, networking, dan resource management. Portainer menyediakan antarmuka manajemen (control plane) yang mudah digunakan.

---

## Skenario 4 — IaaS: Virtual Infrastructure Management

**Tujuan:** Mendemonstrasikan bahwa Proxmox VE menyediakan infrastruktur virtual (compute, storage, network) yang dapat diprovisioning dan dikelola seperti IaaS publik.

**Cloud Model:** Infrastructure as a Service (IaaS)

**Langkah Demonstrasi:**

1. **Akses Proxmox Web UI**
   - Lokal (saat di jaringan yang sama): `https://[IP-Proxmox]:8006`
   - Publik via tunnel: `https://proxmox.kelompok3ccg.dpdns.org`
   - Login sebagai root

2. **Lihat Resource Pool**
   - Dashboard Proxmox menampilkan:
     - Total CPU yang dialokasikan vs tersedia
     - Total RAM yang digunakan
     - Disk usage pada `local-lvm`
   - Ini analog dengan "Resource Pool" di AWS EC2 atau GCP Compute Engine

3. **Manajemen VM**
   - Lihat daftar VM: VM 100 (Debian-1), VM 101 (Debian-2), VM 102 (Debian-3)
   - Setiap VM menampilkan: status, CPU, RAM, disk yang dialokasikan
   - Start/Stop/Restart VM dari web UI

4. **Akses Console VM**
   - Klik VM 102 → tab "Console" → terminal langsung ke VM tanpa SSH

5. **Akses SSH ke VM**
   - Dari laptop: `ssh sammi01@192.168.18.35`
   - Login berhasil → akses sistem operasi Debian penuh
   - Ini analog dengan "SSH ke EC2 instance" di AWS

6. **Lihat Web Server VM**
   - Buka `https://web.kelompok3ccg.dpdns.org`
   - Landing page bertema pesawat tempur tampil (konten dari `/var/www/html` di salah satu VM)

**Keterangan IaaS:**
> Proxmox VE berperan sebagai "cloud provider" yang mengelola hardware virtual. Administrator (Kelompok 3) dapat membuat dan mengkonfigurasi VM sesuai kebutuhan — persis seperti yang dilakukan cloud provider kepada pelanggan enterprise.

---

## Mapping ke Teori NIST Cloud Computing

Berdasarkan NIST SP 800-145 (*The NIST Definition of Cloud Computing*):

### Essential Characteristics

| Karakteristik                   | Implementasi di Proyek                           |
|---------------------------------|--------------------------------------------------|
| On-demand self-service          | VM dapat dibuat/dihapus via Proxmox UI tanpa intervensi manual pihak lain |
| Broad network access            | Aplikasi CloudMart dapat diakses via browser dari mana saja (via Cloudflare Tunnel) |
| Resource pooling                | Proxmox membagi resource CPU/RAM fisik ke beberapa VM (multi-tenancy) |
| Rapid elasticity                | Container Docker dapat distart/stop dalam detik   |
| Measured service                | Prometheus + Grafana mengukur penggunaan CPU dan memori secara realtime |

### Service Models

| Model | Contoh Publik    | Implementasi Proyek                          |
|-------|-----------------|----------------------------------------------|
| IaaS  | AWS EC2, GCP VM | Proxmox VE mengelola VM Debian               |
| PaaS  | Heroku, GKE     | Docker + Portainer mengelola container       |
| SaaS  | Gmail, Shopify  | CloudMart — aplikasi e-commerce siap pakai   |

### Deployment Model

Proyek ini menggunakan **Private Cloud** (infrastruktur milik sendiri, dioperasikan untuk keperluan satu organisasi — dalam hal ini, Kelompok 3 Universitas Siliwangi).
