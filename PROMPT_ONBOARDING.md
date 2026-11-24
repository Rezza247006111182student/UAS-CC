# Prompt Awal untuk Orang/Agen yang Baru Clone Repository

> Salin seluruh isi file ini sebagai instruksi pertama setelah clone, atau bacalah sendiri sebelum mulai bekerja.

---

Kamu baru saja melakukan clone repository proyek mata kuliah **Komputasi Awan** (Semester 5, Universitas Siliwangi), Kelompok 3 / CC3_G. Sebelum melakukan apa pun:

1. **Baca `PROJECT_CONTEXT.md` dari awal sampai akhir.** File itu sumber kebenaran tentang konteks, status, dan aturan pembaruan. Jangan hanya melihat struktur folder.
2. Baca juga `PROSEDUR_AKSES.md` untuk alamat, port, dan prosedur akses setiap komponen.
3. Ringkas kembali pemahamanmu dalam 5–8 baris: tujuan proyek, peta tugas, arsitektur IaaS, alamat penting, dan status terkini. Tanyakan bagian yang masih bertanda `[BELUM DIKONFIRMASI]` sebelum mengambil keputusan.

## Konteks singkat (ringkasan, bukan pengganti kedua file di atas)

- Tujuan besar: simulasi berurutan **IaaS → PaaS → SaaS**.
- **Tugas 1 (IaaS):** Proxmox VE 9.2.2 di dalam VMware Workstation mode NAT, tiga VM Debian (`192.168.18.31`, `192.168.18.33`, `192.168.18.35`) ber-Apache, Cloudflare Tunnel, domain `kelompok3ccg.dpdns.org`.
- **Tugas 2 (jembatan ke PaaS):** Docker dengan `web1:8081` dan `web2:8082`, Portainer `:9443`, cAdvisor → Prometheus `:9090` → Grafana `:3000`, uji beban JMeter 200–1000 user pada `192.168.18.35`.
- **Tugas 3 (PaaS)** dan **Tugas 4 (SaaS):** belum ada informasi.
- Akses admin: `sammi01` **hanya untuk VM Debian**. Host Proxmox memakai akun administrator (default `root` / `root@pam`).
- Status terbaru: tunnel khusus Proxmox sudah **HEALTHY** dengan connector di host Proxmox; hostname `proxmox.kelompok3ccg.dpdns.org` sudah dibuat dan **Proxied**; sedang diperbaiki dari `ERR_TOO_MANY_REDIRECTS` dengan Service `HTTPS localhost:8006` + **No TLS Verify**.

## Aturan kerja wajib

- Komunikasi dan laporan memakai **Bahasa Indonesia akademik**; istilah teknis Inggris boleh tetap dipakai.
- **Jangan menulis fakta yang belum dikonfirmasi.** Tandai `[BELUM DIKONFIRMASI]` dan tanyakan kepada pengguna.
- Setiap kali ada progres, keputusan, atau perubahan: perbarui bagian **Status Terkini** di `PROJECT_CONTEXT.md`, tambahkan **satu baris di Changelog paling atas**, dan perbarui tanggal "Terakhir diperbarui". Jangan menghapus riwayat lama.
- Jangan menyimpan kata sandi, token Cloudflare, atau kunci privat di file/repository. Gunakan placeholder.
- **Jangan commit atau push** tanpa permintaan eksplisit.
- Sebelum mengubah file, baca file terkait dan ikuti gaya serta konvensi yang sudah ada. Gunakan tool baca/cari terlebih dahulu.
- Untuk laporan PDF yang sudah jadi, jangan langsung mengubahnya; minta file sumber yang dapat diedit jika revisi diperlukan.
- Saat menganalisis, sertakan dasar pengukuran/klaim dan bedakan antara fakta dan interpretasi.

## Tugas yang mungkin diminta

1. Melanjutkan perbaikan akses Proxmox via Cloudflare Tunnel.
2. Menyusun atau merevisi laporan Tugas 1 dan Tugas 2.
3. Merancang PaaS di atas Docker/Portainer, lalu SaaS di atasnya.
4. Menjawab pertanyaan teknis IaaS, Docker, monitoring, dan uji beban.
5. Memperbarui dokumentasi (`PROSEDUR_AKSES.md`, `PROJECT_CONTEXT.md`).

## Cara mulai

Jawab dengan format singkat:

```text
Sudah dibaca: <daftar file>
Pemahaman: <5–8 baris ringkasan>
Hal belum dikonfirmasi: <daftar>
Langkah berikutnya yang saya usulkan: <1–3 poin>
```
