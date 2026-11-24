# PROJECT_CONTEXT.md — Proyek Komputasi Awan (Simulasi IaaS / PaaS / SaaS)

> **Untuk agen AI:** baca file ini dulu sebelum membantu. File ini adalah sumber kebenaran tentang konteks proyek.
> **Aturan update:** setiap kali pengguna melaporkan progres, keputusan, atau perubahan, perbarui bagian **Status Terkini** dan tambahkan satu baris di **Changelog** (paling atas = terbaru). Jangan menghapus riwayat. Jangan menulis fakta yang belum dikonfirmasi pengguna; tandai dengan `[BELUM DIKONFIRMASI]`.
> **Bahasa:** pengguna berkomunikasi dalam Bahasa Indonesia (campur istilah teknis Inggris). Balas dalam bahasa yang dipakai pengguna. Laporan ditulis dalam Bahasa Indonesia akademik.

Terakhir diperbarui: 2026-11-24

---

## 1. Ringkasan Proyek

Mata kuliah **Komputasi Awan (Semester 5)**, Program Studi Informatika, Fakultas Teknik, Universitas Siliwangi. Dosen pengampu: Bapak Reza Febriana, S.Kom., M.Kom., CEH.

Tujuan besar: membuat proyek kecil yang **mensimulasikan tiga model layanan cloud (IaaS, PaaS, SaaS)**. Pekerjaan dibagi menjadi beberapa tugas yang saling berurutan; hasil tugas sebelumnya menjadi infrastruktur untuk tugas berikutnya.

**Kelompok 3** (kode berkas: CC3_G):

| Nama | NIM |
|---|---|
| M. Gibran Fajar | 24700611181 |
| Muhammad Rezza (pengguna/penulis percakapan ini) | 247006111182 |
| Sammi Zaki Fadillah | 24700611187 |
| Mochamad Dzikra Rahayu | 247006111201 |
| Farrell Di Derych Putra Pratama | 247006111202 |

> Catatan: NIM Gibran dan Sammi di dokumen hanya 11 digit (kemungkinan typo, seharusnya 12 digit seperti lainnya). `[BELUM DIKONFIRMASI]`

---

## 2. Peta Tugas dan Status

| # | Tugas | Model layanan | Status | Dokumen |
|---|---|---|---|---|
| 1 | Rancangan Infrastruktur Virtual Private Server berbasis Cloud (UTS) | **IaaS** | Draf laporan selesai | `247006111182_MUHAMMADREZZA_G.pdf` |
| 2 | Tugas asinkronus: Docker, Portainer, Monitoring, Uji Beban | Kontainer di atas IaaS (jembatan menuju PaaS) `[BELUM DIKONFIRMASI]` | Laporan Bagian A dan B selesai | `CC3_G_DockerMonitoring.pdf` |
| 3 | PaaS | PaaS | `[BELUM DIKONFIRMASI]` belum ada informasi | – |
| 4 | SaaS | SaaS | `[BELUM DIKONFIRMASI]` belum ada informasi | – |

---

## 3. Tugas 1 — IaaS (Proxmox + Debian + Cloudflare Tunnel)

**Soal/tujuan:** menyimulasikan layanan IaaS tanpa server fisik, dengan tiga tingkat akses: cloud provider, administrator server, dan pengguna akhir.

**Arsitektur (nested virtualization):**

```
Windows (host fisik)
 └─ VMware Workstation (hypervisor tipe 2)
     └─ Proxmox VE 9.2.2 (cloud provider)  [8 GB RAM, 4 core, 80 GB disk, NAT]
         ├─ Debian-1 (VM 100)  192.168.18.31  Apache
         ├─ Debian-2 (VM 101)  192.168.18.33  Apache
         └─ Debian-3 (VM 102)  192.168.18.35  Apache (server "Deploy")
 cloudflared (Cloudflare Tunnel) di tiap server → jaringan Cloudflare → pengguna
```

- Spesifikasi tiap VM Debian: 2 GB RAM, 1 socket 1 core, disk 32 GB di `local-lvm` (VirtIO SCSI single), SeaBIOS/i440fx, NIC VirtIO di bridge `vmbr0`, firewall aktif.
- Jaringan: segmen 192.168.18.0/24. Web UI Proxmox di port 8006. Tanpa IP publik dan tanpa port forwarding (tunnel outbound-only).
- Domain gratis: `kelompok3ccg.dpdns.org` (DigitalPlat), nameserver dialihkan ke Cloudflare. Contoh hostname publik: `web.kelompok3ccg.dpdns.org`.
- Akses publik Proxmox ditambahkan setelah UTS: tunnel khusus dengan connector di host Proxmox, hostname `proxmox.kelompok3ccg.dpdns.org`, DNS Proxied. Konfigurasi Public Hostname sedang diperbaiki karena `ERR_TOO_MANY_REDIRECTS` (Service perlu `HTTPS localhost:8006` + No TLS Verify). `[BELUM DIKONFIRMASI: hasil uji akhir setelah perbaikan]`
- Akses admin: SSH dengan user `sammi01` + sudo (autentikasi kata sandi).
- Konten web: tiga landing page bertema pesawat tempur (MiG-31 Foxhound, Su-47 Berkut, F-14 Tomcat) di `/var/www/html`.
- Kesimpulan laporan: tujuan simulasi IaaS tercapai; keterbatasan utama adalah performa akibat dua lapis virtualisasi.

---

## 4. Tugas 2 — Docker, Portainer, Monitoring, Uji Beban (tugas asinkronus)

**Soal (kutipan inti):** efisiensi sumber daya host adalah kunci pada arsitektur cloud. Kontainer (Docker) lebih ringan daripada VM berbasis hypervisor karena berbagi kernel OS host. Mahasiswa diminta **menguji dan menganalisis secara langsung seberapa efektif kontainer Docker mengelola alokasi CPU saat menerima beban request yang bervariasi dari client.**

**Lingkungan uji:**
- Host Docker: server Debian pada infrastruktur IaaS Tugas 1, IP **192.168.18.35**. Debian GNU/Linux 12 (bookworm).
- Kontainer: `web1` (nginx, port 8081) dan `web2` (nginx, port 8082), Portainer (https://192.168.18.35:9443).
- Monitoring: cAdvisor → Prometheus (scrape interval 5 detik, port 9090) → Grafana (port 3000, dashboard cAdvisor Exporter ID 14282).
- Remote access: PuTTY via SSH dari laptop.
- Klien uji beban: Apache JMeter 5.6.3 di laptop. Target `GET http://192.168.18.35:8081/` (halaman statis nginx).

**Skenario uji beban:** thread 200, 400, 600, 800, 1000; ramp-up 10 detik; 50 iterasi per thread. `web1` di-restart dan idle ±10 detik sebelum tiap uji. Nilai yang dicatat adalah nilai **puncak**.

**Pengujian fungsional (8 kebutuhan):** SSH login, pull image dari registry, buat/jalankan/hentikan/hapus kontainer, operasi via Portainer, monitoring via Grafana dan Prometheus. Semua berstatus OK.

**Query Prometheus yang dipakai:**
- CPU: `max_over_time((rate(container_cpu_usage_seconds_total{name="web1"}[15s]) * 100)[10m:5s])`
- Memori: `max_over_time(container_memory_working_set_bytes{name="web1"}[10m]) / 1024 / 1024`

**Hasil (puncak, kontainer web1):**

| User request | CPU puncak (%) | Memori puncak (MiB) |
|---|---|---|
| 200 | 0,31 | 5,08 |
| 400 | 3,19 | 5,11 |
| 600 | 28,41 | 6,79 |
| 800 | 28,42 | 7,02 |
| 1000 | 28,41 | 7,77 |

Data tambahan: uji 400 user di JMeter = 20.000 sampel, error 0%, rata-rata respons 10,20 ms, throughput 1.988,7 req/detik. Batas memori kontainer 1,921 GiB. `docker stats` saat beban menunjukkan CPU 24,19%.

**Interpretasi di laporan:** CPU rendah di 200–400 user, naik tajam di 600 user lalu mendatar di ±28% pada 800–1000 user; memori naik bertahap tetapi sangat kecil; semua request berhasil tanpa error.

---

## 5. Konsep Kunci untuk Analisis (jika agen diminta membantu menulis/menganalisis)

- Kontainer berbagi kernel host (namespace + cgroup), sehingga overhead lebih kecil daripada VM dengan kernel sendiri.
- Alokasi CPU kontainer diatur lewat cgroup; persentase `docker stats`/cAdvisor dihitung relatif terhadap 1 core (bisa melebihi 100% pada multi-core) `[verifikasi sebelum dipakai di laporan]`.
- Efektivitas pengelolaan CPU baru terbukti kuat jika ada pembanding atau pembatas, misalnya `--cpus` / `--cpu-shares` / `cpuset`, dan/atau pembanding VM vs kontainer. Laporan saat ini **belum** memakai batas CPU eksplisit `[BELUM DIKONFIRMASI apakah ada di bagian lain tugas]`.

---

## 6. Status Terkini

- **Sedang dikerjakan:** pengguna menyusun konteks proyek ini dan melanjutkan tugas Komputasi Awan (simulasi IaaS, PaaS, SaaS).
- **Sudah selesai (draf):** laporan IaaS (Tugas 1); laporan Docker Bagian A dan B (Tugas 2).
- **Dokumen pendukung baru:** `PROSEDUR_AKSES.md` berisi prosedur akses Proxmox (lokal dan publik via tunnel), VM Debian (SSH/konsol), web via Cloudflare Tunnel, `web1`/`web2`, Portainer, Prometheus, Grafana, dan JMeter; kredensial sengaja tidak ditulis. Beberapa alamat/akun ditandai `[BELUM DIKONFIRMASI]`.
- **Prompt onboarding (2026-11-24):** `PROMPT_ONBOARDING.md` berisi instruksi siap pakai untuk orang/agen yang baru clone repo: urutan membaca, ringkasan konteks, aturan kerja, dan format jawaban awal.
- **Progres terbaru (2026-11-21):** connector Cloudflare dipasang di host Proxmox, tunnel berstatus HEALTHY, Public Hostname `proxmox.kelompok3ccg.dpdns.org` dibuat dan DNS Proxied. Akses web masih terkendala `ERR_TOO_MANY_REDIRECTS`; dugaan Service Public Hostname masih `HTTP`. Pengguna memilih **tanpa Cloudflare Access**, cukup kata sandi administrator yang kuat.
- **Catatan akun:** `sammi01` hanya untuk VM Debian; host Proxmox memakai akun administrator (default `root`). Upaya SSH dengan `sammi01` menghasilkan `Permission denied`.
- **Update 2026-11-24:** pengguna sudah mengubah Service Type Public Hostname menjadi `HTTPS`. `[BELUM DIKONFIRMASI: No TLS Verify, mode SSL/TLS, dan hasil uji akses akhir]`
- **Berikutnya:** pastikan No TLS Verify aktif dan mode SSL/TLS bukan Flexible, lalu uji dari luar jaringan. Setelah itu baru revisi laporan/PaaS/SaaS.
- **Deadline:** `[BELUM DIKONFIRMASI]`

---

## 7. Changelog (terbaru di atas)

- 2026-11-24 — Prompt onboarding dibuat untuk orang/agen yang baru clone repository; status update Service Type Proxmox juga dicatat | file terdampak: `PROMPT_ONBOARDING.md`, `PROJECT_CONTEXT.md` | langkah berikutnya: konfirmasi hasil uji akses Proxmox dari luar jaringan
- 2026-11-21 — Tunnel khusus Proxmox aktif (connector di host, HEALTHY) dan Public Hostname proxied; akses web terkendala redirect loop, panduan perbaikan dan prosedur publik ditambahkan | file terdampak: `PROSEDUR_AKSES.md`, `PROJECT_CONTEXT.md` | langkah berikutnya: Service → HTTPS + No TLS Verify, cek mode SSL/TLS, uji dari luar jaringan
- 2026-11-21 — Dokumen `PROSEDUR_AKSES.md` dibuat untuk prosedur akses seluruh komponen IaaS dan Docker/Portainer/monitoring | file terdampak: `PROSEDUR_AKSES.md`, `PROJECT_CONTEXT.md` | langkah berikutnya: konfirmasi IP Proxmox, hostname publik VM 100/101, serta kredensial Layanan
- 2026-11-21 — File konteks dibuat dari dua laporan: laporan IaaS (UTS) dan laporan Docker (tugas asinkronus).
- 2026-10-08 — (dari dokumen) pembangunan infrastruktur IaaS dan deployment web di Proxmox/Debian.
- 2026-11-10 — (dari dokumen) pengujian beban JMeter 200–1000 user pada `web1`, data Prometheus/Grafana diambil.

---

## 8. Template Entri Changelog

```
- YYYY-MM-DD — <apa yang dikerjakan/diputuskan> | file terdampak: <nama berkas> | langkah berikutnya: <opsional>
```
