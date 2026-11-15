# 🚀 Panduan Deployment Pro: Budget Minimal, Performa Maksimal

Panduan ini dirancang untuk mendistribusikan website undangan pernikahan (**Undangan Digital Farabi & Syifa**) ke internet dengan **anggaran sangat hemat (mulai dari Rp 15.000 – Rp 45.000)**, domain kustom profesional, notifikasi email pesan suara gratis, dan performa tanpa *cold start* (tidak lambat saat dibuka tamu di WhatsApp).

---

## 🧭 Ringkasan Strategi & Matriks Biaya

| Komponen | Pilihan Rekomendasi | Estimasi Biaya | Keterangan |
|---|---|---|---|
| **Domain Kustom** | `.my.id` (DomaiNesia / Niagahoster / IDCloudHost) | **Rp 15.000 – Rp 25.000 / tahun** | Domain resmi Indonesia, terpercaya, murah meriah |
| **Domain Alternatif** | `.com` (Cloudflare Registrar) | ~$9.77 (~Rp 155.000 / tahun) | Harga modal tanpa markup perpanjangan |
| **CDN & DNS & SSL** | **Cloudflare (Free Tier)** | **Rp 0 (Gratis Selamanya)** | SSL gratis, proteksi DDoS, caching foto di Jakarta/Surabaya |
| **Server Hosting (Opsi A)** | **Railway / Fly.io (PaaS)** | **Gratis Trial s/d ~$2 / bulan** | Praktis, cukup push Git, pasang volume persistent |
| **Server Hosting (Opsi B)** | **Oracle Cloud Always Free (VPS)** | **Rp 0 (Gratis Selamanya)** | Spesifikasi tinggi (Ampere ARM), disk awet selamanya |
| **Server Hosting (Opsi C)** | **Local Cloud VPS (IDCloudHost / DomaiNesia)** | **Rp 30.000 – Rp 50.000 / bulan** | Latensi < 15ms di Indonesia, full control, disk persistent |
| **Notifikasi Email Voice Note** | **Gmail SMTP via Nodemailer** | **Rp 0 (Gratis Selamanya)** | Kuota gratis 500 email/hari, lampiran audio otomatis |

> [!IMPORTANT]
> ### ⚠️ Perangkap "Free Tier" Biasa (Vercel / Netlify / Render Free)
> Aplikasi ini menggunakan **SQLite bawaan (`node:sqlite`)** dan menyimpan **file rekaman suara tamu (`data/voice_notes/`)** langsung ke disk.
> 1. **Vercel / Netlify**: Menggunakan sistem *Serverless Ephemeral*. Begitu fungsi selesai, file SQLite dan voice note akan **terhapus secara otomatis**.
> 2. **Render Free Tier**: Mengalami *Sleep/Spin-down* setelah 15 menit tidak aktif. Saat tamu membuka link dari WhatsApp, website akan memakan waktu **40–60 detik untuk membuka (Cold Start)**.
> 
> **Solusi Profesional:** Gunakan server yang memiliki **Persistent Volume / Disk Tetap** dan **Always Online** (Railway dengan Volume, Fly.io dengan Volume, atau VPS murah/Oracle Free).

---

## 🎙️ Fitur Pesan Suara & Notifikasi Email (Riset & Panduan)

### Apakah Mengirim Pesan Suara via Email Berbayar?
**Jawabannya: 100% GRATIS.**
* Menggunakan **Gmail SMTP (Nodemailer)** yang sudah terpasang di sistem.
* Google memberikan kuota pengiriman hingga **500 email per 24 jam** secara cuma-cuma untuk akun Gmail standar (`@gmail.com`).
* Untuk undangan pernikahan dengan 100–300 tamu, kuota ini lebih dari cukup.
* File rekaman audio (`.webm` / `.mp4`) langsung dilampirkan ke email, sehingga pengantin bisa memutar pesan suara langsung dari HP atau notifikasi email.

### Cara Mengaktifkan Notifikasi Gmail (Hanya 1 Menit):
1. Buka akun Google pengantin di: [Google App Passwords](https://myaccount.google.com/apppasswords).
   *(Pastikan 2-Step Verification akun Google Anda sudah aktif).*
2. Masukkan nama aplikasi: `Undangan Pernikahan`, lalu klik **Create / Buat**.
3. Google akan menampilkan **16 karakter kata sandi sandi aplikasi** (contoh: `abcd efgh ijkl mnop`).
4. Masukkan ke file `.env` atau Environment Variables server:
   ```env
   GMAIL_USER=farabi.syifa.wedding@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   NOTIFICATION_EMAIL=farabi.syifa.wedding@gmail.com
   ```

### Bagaimana Jika Tidak Ingin Mengatur Email?
* **Pengunduhan Manual**: Jika `GMAIL_USER` dan `GMAIL_APP_PASSWORD` dikosongkan, website **tetap berfungsi 100% normal**.
* Rekaman audio tamu tersimpan aman di server dengan penamaan otomatis yang rapi:
  ```text
  data/voice_notes/voicenote_farhan_Muhammad_Farhan_1794765928123.webm
  ```
* Pengantin dapat mendengarkan atau mendownload rekaman kapan saja melalui **Admin Panel** (`/admin/rsvps`) hanya dengan mengklik tombol download (⬇️). File yang didownload otomatis dinamai rapi: `Voicenote-Muhammad_Farhan-farhan.webm`.

---

## 🌐 LANGKAH 1: Membeli Domain Kustom & Naming Strategy

### 1. Rekomendasi Nama Domain
Pilih nama yang singkat, romantis, dan mudah diketik:
* `farabisyifa.my.id` *(Sangat disarankan: Rp 15rb/thn)*
* `farabisadewa.my.id`
* `farabi-syifa.com`
* `kisahkita.my.id`

### 2. Tempat Pembelian:
* **Domain `.my.id`**: Beli di [DomaiNesia](https://www.domainesia.com), [IDCloudHost](https://idcloudhost.com), atau [Niagahoster](https://www.niagahoster.co.id). Syarat aktivasi domain `.my.id` hanya butuh upload foto KTP via dashboard registrar.
* **Domain `.com`**: Beli langsung di [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) untuk mendapatkan harga modal tanpa markup dan gratis proteksi privasi WHOIS selamanya.

---

## 🛡️ LANGKAH 2: Konfigurasi Cloudflare (DNS, SSL, & Speed)

Setelah membeli domain, arahkan Nameserver domain Anda ke **Cloudflare Free Tier**:
1. Buat akun di [Cloudflare](https://dash.cloudflare.com/) (Gratis).
2. Tambahkan domain Anda (misal `farabisyifa.my.id`).
3. Ganti Nameserver di registrar domain Anda sesuai yang diberikan Cloudflare.
4. Buat DNS Record:
   * **Tipe A**: `farabisyifa.my.id` ➔ Arahkan ke IP Server Anda (Proxied 🟧).
   * **CNAME**: `www` ➔ `farabisyifa.my.id` (Proxied 🟧).
5. Pada menu **SSL/TLS**: Pilih mode **Full (Strict)** atau **Full**.
6. Pada menu **Speed / Optimization**: Aktifkan **Brotli**, **Early Hints**, dan **Auto Minify**.

---

## 🚀 LANGKAH 3: Pilihan Platform Hosting

### OPSI 1: Railway (Paling Praktis, Tanpa Kelola Server)
*Biaya: Gratis dengan $5 trial credit / ~$2–$4 per bulan saat acara.*

1. Buat akun di [Railway.app](https://railway.app/).
2. Buat **New Project** ➔ **Deploy from GitHub repo**.
3. Pilih repository proyek `undangan`.
4. **PENTING: Tambahkan Volume Persistent**:
   * Klik service Anda di dashboard Railway.
   * Masuk ke tab **Volumes** ➔ Klik **Add Volume**.
   * Set Mount Path: `/app/data`.
   * *Ini memastikan database SQLite (`undangan.db`) dan rekaman suara tamu (`voice_notes`) tidak hilang saat redeploy.*
5. Masuk ke tab **Variables**, tambahkan:
   ```env
   NODE_ENV=production
   PORT=3000
   ADMIN_PASSWORD=KatasandiAdminAman2026!
   SESSION_SECRET=kunci_rahasia_acak_panjang_wedding_2026
   DATA_DIR=/app/data
   GMAIL_USER=farabi.syifa.wedding@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   NOTIFICATION_EMAIL=farabi.syifa.wedding@gmail.com
   ```
6. Sambungkan domain kustom Anda di tab **Settings** ➔ **Custom Domains** (masukkan `farabisyifa.my.id`).

---

### OPSI 2: Cloud VPS Lokal Indonesia / Oracle Always Free (Paling Stabil)
*Biaya: Rp 0 (Oracle Free) atau Rp 30.000 – Rp 50.000 / bulan (IDCloudHost / DomaiNesia).*

1. Buat VPS dengan OS **Ubuntu 24.04 LTS**.
2. Update sistem dan install Docker:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y docker.io docker-compose git curl
   sudo systemctl enable --now docker
   ```
3. Clone repository proyek Anda:
   ```bash
   git clone <URL_REPO_ANDA> undangan
   cd undangan
   cp .env.example .env
   nano .env  # Atur ADMIN_PASSWORD, SESSION_SECRET, dan GMAIL
   ```
4. Jalankan aplikasi dengan Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
5. Pasang Caddy untuk otomatisasi SSL HTTPS gratis:
   ```bash
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   ```
6. Edit file `/etc/caddy/Caddyfile`:
   ```caddy
   farabisyifa.my.id {
       reverse_proxy localhost:3000
   }
   ```
7. Restart Caddy:
   ```bash
   sudo systemctl restart caddy
   ```

---

## 🔒 LANGKAH 4: Checklist Keamanan & Produksi

Sebelum menyebarkan link undangan ke tamu:

- [ ] **Ganti Password Admin**: Pastikan `ADMIN_PASSWORD` pada `.env` bukan default (`admin123`).
- [ ] **Ganti Session Secret**: Buat string acak panjang untuk `SESSION_SECRET` agar cookies aman.
- [ ] **Import Tamu Undangan**:
  * Upload file Excel / CSV tamu undangan melalui panel `/admin/import`.
  * Sistem mendukung format nama, nomor WhatsApp, kategori, pax, dan tipe event (`akad`, `syukuran`, atau `both`).
- [ ] **Cek Format Pesan Suara**:
  * Tamu dapat mengirim pesan suara hingga 60 detik.
  * Audio otomatis dinamai `voicenote_{slug}_{nama}_{timestamp}.webm`.
  * Notifikasi email langsung masuk ke inbox pengantin dengan lampiran audio siap putar.
- [ ] **Backup Database Rutin**:
  Database SQLite tersimpan di file `data/undangan.db`. Anda bisa mendownload backup database sewaktu-waktu:
  ```bash
  # Dari Docker:
  docker cp wedding-undangan:/app/data/undangan.db ./undangan_backup.db
  ```
- [ ] **Uji Coba Tampilan di WhatsApp**:
  Kirim link `https://farabisyifa.my.id/farhan` ke nomor pribadi untuk memastikan thumbnail cover, judul, dan nama tamu tampil elegan di bubble chat WhatsApp.

---

## 💡 Rekomendasi Tercepat (The 15-Minute Setup)

1. **Beli domain `.my.id` di DomaiNesia/IDCloudHost**: Rp 15.000.
2. **Sambungkan ke Cloudflare Free**: Rp 0.
3. **Deploy ke Railway dengan Persistent Volume (`/app/data`)**: Rp 0 (menggunakan trial credit).
4. **Pasang App Password Gmail**: Rp 0.
5. **Total Biaya**: **Hanya Rp 15.000**, website langsung online, aman, kencang, dan siap disebarkan ke semua tamu!
