# PROSEDUR AKSES KOMPONEN PROYEK KOMPUTASI AWAN — KELOMPOK 3 (CC3_G)

Dokumen ini merangkum prosedur mengakses setiap komponen yang diekspos pada hasil Tugas 1 (IaaS: Proxmox + Debian + Cloudflare Tunnel) dan Tugas 2 (Docker, Portainer, Prometheus, Grafana).

Disusun: 2026-11-21

> Kata sandi, token tunnel, dan kredensial lain **tidak ditulis** di dokumen ini. Peroleh dari administrator/pengelola laboratorium. Data yang belum dikonformasi pengguna ditandai `[BELUM DIKONFIRMASI]`.

---

## 1. Prasyarat

1. Host fisik Windows dan VMware Workstation dalam keadaan menyala; VM Proxmox VE 9.2.2 berstatus running.
2. VM Debian 100, 101, dan 102 berstatus running di Proxmox. Minimal VM 102 (`192.168.18.35`) harus aktif untuk layanan Tugas 2.
3. Laptop/klien berada pada jaringan yang dapat menjangkau segmen `192.168.18.0/24` (misalnya adapter VMware yang sesuai atau rute internal laboratorium). `[BELUM DIKONFIRMASI: metode koneksi laptop ke segmen ini]`
4. Untuk akses publik, layanan `cloudflared` pada server terkait harus aktif. Akses publik tidak memerlukan IP publik maupun port forwarding. Tunnel khusus Proxmox memakai connector yang berjalan langsung di host Proxmox.
5. Siapkan browser modern, klien SSH (PuTTY), dan opsional Apache JMeter 5.6.3.
6. Siapkan kredensial dari administrator: akun administrator Proxmox (default `root@pam`), user SSH `sammi01` **khusus VM Debian**, Portainer, dan Grafana.

---

## 2. Ringkasan alamat akses

| No | Komponen | Alamat | Port / Protokol | Jangkauan |
|---|---|---|---|---|
| 1 | Proxmox Web UI (lokal) | `https://<IP-Proxmox>:8006` | 8006 / HTTPS | Jaringan internal |
| 1a | Proxmox Web UI (publik via Cloudflare Tunnel) | `https://proxmox.kelompok3ccg.dpdns.org` | 443 via Cloudflare → HTTPS `localhost:8006` | Internet |
| 2 | VM Debian-1 (VM 100, Apache) | `192.168.18.31` | 22 / SSH, 80 / HTTP | Jaringan internal |
| 3 | VM Debian-2 (VM 101, Apache) | `192.168.18.33` | 22 / SSH, 80 / HTTP | Jaringan internal |
| 4 | VM Debian-3 (VM 102, Apache + Docker) | `192.168.18.35` | 22 / SSH, 80 / HTTP | Jaringan internal |
| 5 | Web publik IaaS | `http://web.kelompok3ccg.dpdns.org` | 80/443 via Cloudflare | Internet |
| 6 | Kontainer nginx `web1` | `http://192.168.18.35:8081` | 8081 / HTTP | Jaringan internal |
| 7 | Kontainer nginx `web2` | `http://192.168.18.35:8082` | 8082 / HTTP | Jaringan internal |
| 8 | Portainer | `https://192.168.18.35:9443` | 9443 / HTTPS | Jaringan internal |
| 9 | Prometheus | `http://192.168.18.35:9090` | 9090 / HTTP | Jaringan internal |
| 10 | Grafana | `http://192.168.18.35:3000` | 3000 / HTTP | Jaringan internal |

Keterangan:

- IP Proxmox belum dicantumkan di dokumen sumber. `[BELUM DIKONFIRMASI]`
- Tunnel khusus Proxmox sudah dibuat dengan connector di host Proxmox dan berstatus HEALTHY (2026-11-21). Public Hostname `proxmox.kelompok3ccg.dpdns.org` sudah dibuat dan DNS-nya Proxied.
- Hostname publik untuk dua VM lainnya (MiG-31 dan Su-47) belum dicantumkan; hanya contoh `web.kelompok3ccg.dpdns.org` yang diketahui. `[BELUM DIKONFIRMASI]`
- Cara Prometheus dan Grafana dijalankan (kontainer atau layanan host) belum dikonfirmasi, namun alamat portnya tercantum di laporan Tugas 2.

---

## 3. Prosedur akses per komponen

### 3.1 Web UI Proxmox (peringkat cloud provider)

1. Pada browser, buka `https://<IP-Proxmox>:8006`.
2. Jika muncul peringatan sertifikat self-signed, terima sertifikat tersebut (wajar untuk instalasi Proxmox default).
3. Masukkan akun administrator Proxmox (pada instalasi default `root@pam`). `[BELUM DIKONFIRMASI: akun yang dipakai kelompok]`
4. Di panel kiri, pilih node Proxmox, lalu lihat **Summary** untuk status CPU, memori, dan penyimpanan.
5. Buka **Servers / VM** untuk melihat VM 100, 101, dan 102. Dari sini dapat dilakukan Start, Shutdown, Reboot, dan pembukaan **Console**.
6. Verifikasi: ketiga VM berstatus *running*, firewall aktif, dan NIC terhubung ke bridge `vmbr0`.
7. Jika VM perlu dipulihkan tanpa SSH, gunakan tombol **Console** pada VM yang bersangkutan.

### 3.1.1 Akses Proxmox Web UI melalui Cloudflare Tunnel (publik)

1. Pastikan tunnel khusus Proxmox di **Zero Trust → Networks → Tunnels** berstatus HEALTHY dan connector berjalan di host Proxmox (`systemctl status cloudflared`).
2. Buka tab **Public Hostname**, lalu edit hostname `proxmox` pada domain `kelompok3ccg.dpdns.org`.
3. Ubah **Service Type** menjadi **HTTPS** dengan URL `localhost:8006`. Ini adalah dropdown **Service** pada halaman Public Hostname, **bukan** tipe record DNS `HTTPS` di menu DNS → Records. Jangan memakai `HTTP`, karena Proxmox akan mengarahkan HTTP → HTTPS berulang sehingga browser menampilkan `ERR_TOO_MANY_REDIRECTS`.
4. Pada **Additional application settings → TLS**, aktifkan **No TLS Verify** karena sertifikat bawaan Proxmox bersifat self-signed.
5. Jika redirect loop masih terjadi, aktifkan pula **HTTP2 Origin** dan **Disable Chunked Encoding** pada tab pengaturan HTTP, lalu simpan.
6. Di menu **DNS → Records**, biarkan record `proxmox` tetap bertipe **CNAME** dengan Target `<id-tunnel>.cfargotunnel.com` dan Proxy status **Proxied**. Kolom **Priority** tidak diperlukan; hapus record bertipe `HTTPS` atau `SRV` jika terlanjur dibuat.
7. Di `dash.cloudflare.com` → domain → **SSL/TLS → Overview**, pastikan **Encryption mode** berupa `Full` atau `Full (strict)`, bukan `Flexible`. Periksa juga tidak ada Redirect Rule/Page Rule yang mengarahkan HTTPS kembali ke HTTP.
8. Uji dari luar jaringan (HP/kuota seluler, bukan WiFi laboratorium) dengan membuka `https://proxmox.kelompok3ccg.dpdns.org`. Halaman login Proxmox harus tampil.
9. Login dengan akun administrator (`root@pam` pada instalasi default), lalu verifikasi halaman Summary node dan konsol VM dapat dibuka.
10. Jika browser masih menyimpan redirect lama, hapus cookies hostname tersebut atau gunakan mode incognito sebelum menguji ulang.

### 3.2 Akses administrasi VM Debian melalui SSH (peringkat administrator server)

1. Buka PuTTY, isi **Host Name** dengan alamat VM: `192.168.18.31`, `192.168.18.33`, atau `192.168.18.35`; port `22`.
2. Gunakan user `sammi01` dan kata sandi yang diberikan administrator.
3. Alternatif jika jaringan internal tidak terjangkau dari laptop: Proxmox Web UI → VM → **Console**, lalu login dengan user yang sama.
4. Perintah verifikasi setelah login:

   ```bash
   hostname
   ip a
   systemctl status apache2
   df -h
   ```

5. Untuk VM 102 (`192.168.18.35`), tambahkan verifikasi layanan Docker dan kontainer:

   ```bash
   systemctl status docker
   docker ps
   ```

6. Jika koneksi gagal: pastikan VM menyala, alamat IP masih sesuai, adapter jaringan laptop aktif, dan aturan firewall Proxmox/VM mengizinkan port 22.

### 3.3 Web statis melalui Cloudflare Tunnel (peringkat pengguna akhir)

1. Pastikan `cloudflared` aktif pada server yang dipakai:

   ```bash
   systemctl status cloudflared
   ```

2. Buka browser dan akses `http://web.kelompok3ccg.dpdns.org` (atau `https://` jika pengalihan HTTPS sudah diaktifkan).
3. Verifikasi konten landing page pesawat tempur yang sesuai dengan VM tujuan.
4. Jika gagal: cek status tunnel di dashboard Cloudflare, konfigurasi `cloudflared`, nameserver domain di Cloudflare, serta status Apache/nginx pada server tujuan.
5. Catatan: hostname untuk MiG-31 dan Su-47 belum dikonfirmasi dalam dokumen sumber. `[BELUM DIKONFIRMASI]`

### 3.4 Kontainer nginx `web1` dan `web2` (Tugas 2)

1. SSH ke `192.168.18.35`, lalu jalankan `docker ps` dan pastikan `web1` dan `web2` berstatus *Up*.
2. Dari browser pada jaringan internal:
   - `http://192.168.18.35:8081/` → `web1`
   - `http://192.168.18.35:8082/` → `web2`
3. Halaman statis nginx harus tampil. Jika tidak, periksa pemetaan port dengan `docker port web1` dan `docker port web2`.
4. Sesuai prosedur uji beban, lakukan `docker restart web1` dan tunggu sekitar 10 detik sebelum setiap pengujian.

### 3.5 Portainer

1. Buka `https://192.168.18.35:9443` pada browser.
2. Terima peringatan sertifikat self-signed jika muncul.
3. Pada penggunaan pertama, buat akun administrator Portainer. `[BELUM DIKONFIRMASI: kredensial yang dipakai kelompok]`
4. Pilih environment **Local**, lalu masuk ke menu **Containers**, **Images**, **Volumes**, dan **Networks**.
5. Verifikasi: `web1`, `web2`, dan kontainer pendukung monitoring terlihat. Operasi Start/Stop/Remove dapat dilakukan dari sini.
6. Jika halaman tidak terbuka, cek `systemctl status docker` dan `docker ps` pada `192.168.18.35`.

### 3.6 Prometheus

1. Buka `http://192.168.18.35:9090` pada browser.
2. Pilih **Status → Targets** dan pastikan target cAdvisor berstatus *UP* (scrape interval 5 detik).
3. Masukkan query pada tab **Graph**, antara lain:

   ```promql
   max_over_time((rate(container_cpu_usage_seconds_total{name="web1"}[15s]) * 100)[10m:5s])
   ```

   ```promql
   max_over_time(container_memory_working_set_bytes{name="web1"}[10m]) / 1024 / 1024
   ```

4. Query tersebut menampilkan nilai CPU dan memori `web1` dalam rentang 10 menit terakhir yang dipakai saat uji beban.

### 3.7 Grafana

1. Buka `http://192.168.18.35:3000` pada browser dan login dengan akun Grafana kelompok. `[BELUM DIKONFIRMASI: kredensial yang dipakai]`
2. Pastikan data source Prometheus sudah terhubung ke endpoint Prometheus. `[BELUM DIKONFIRMASI: alamat yang diisi pada data source]`
3. Buka **Dashboards → Import**, masukkan ID dashboard cAdvisor Exporter `14282`, lalu pilih data source Prometheus.
4. Verifikasi: panel CPU dan memori menampilkan data kontainer `web1`; sesuaikan variabel `name` jika diperlukan.
5. Jika panel kosong, periksa status target Prometheus dan nama kontainer pada query (`name="web1"`).

### 3.8 Uji beban dengan JMeter (opsional, sesuai Tugas 2)

1. Jalankan Apache JMeter 5.6.3 pada laptop.
2. Set target `GET http://192.168.18.35:8081/` (halaman statis nginx).
3. Gunakan skenario: thread 200, 400, 600, 800, 1000; ramp-up 10 detik; 50 iterasi per thread.
4. Sebelum tiap skenario, restart `web1` dan tunggu idle sekitar 10 detik.
5. Catat nilai puncak CPU dan memori dari Prometheus/Grafana, lalu bandingkan dengan tabel hasil pada laporan Tugas 2.

---

## 4. Pemecahan masalah umum

| Gejala | Pemeriksaan |
|---|---|
| Proxmox `:8006` atau SSH tidak bisa diakses | VM Proxmox menyala, alamat IP benar, adapter jaringan laptop aktif, firewall mengizinkan port |
| Web publik error / tidak tampil | `systemctl status cloudflared`, konfigurasi tunnel, nameserver Cloudflare, status Apache/nginx |
| Portainer, Prometheus, atau Grafana tidak merespons | `systemctl status docker`, `docker ps`, pastikan kontainer/layanan berjalan |
| Grafana tidak menampilkan data | Target Prometheus *UP*, data source benar, query memakai `name="web1"` |
| Penyimpanan Proxmox hampir penuh | `df -h` dan `pvesm status`; ingat 3×32 GB dialokasikan di atas disk 80 GB secara thin-provisioned |
| `ERR_TOO_MANY_REDIRECTS` pada hostname Proxmox | Service Public Hostname masih `HTTP`; ubah ke `HTTPS localhost:8006` + No TLS Verify; pastikan mode SSL/TLS bukan `Flexible`; hapus cookies browser |
| Tunnel Proxmox berstatus DOWN | `systemctl status cloudflared` dan `journalctl -u cloudflared -n 50` di host; cek token serta koneksi outbound 443/7844 |
| Error 502/1006 pada hostname Proxmox | Mapping Public Hostname salah atau origin mati; cek `curl -k -I https://127.0.0.1:8006` di host Proxmox |
| SSH Proxmox `Permission denied` | Gunakan `root` untuk host Proxmox; `sammi01` hanya berlaku pada VM Debian; cek `/var/log/auth.log` |

---

## 5. Catatan keamanan

- Jangan menyimpan kata sandi, token Cloudflare, atau kunci privat di dokumen ini maupun di repository.
- Batasi akses port administrasi lokal (8006, 9443, 3000, 9090, 22) hanya dari jaringan laboratorium yang dipercaya. Karena hostname Proxmox dipublikasikan tanpa Cloudflare Access, gunakan kata sandi administrator yang kuat dan jangan memakai ulang kata sandi VM.
- Autentikasi SSH berbasis kunci lebih disarankan daripada kata sandi untuk akses administrasi.
- Perbarui kata sandi/default akun Portainer dan Grafana setelah instalasi pertama.
