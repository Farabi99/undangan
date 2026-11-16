# 🌐 Panduan Beli Domain `.xyz` (QRIS / Transfer Bank) & Setup Cloudflare + Railway

Panduan praktis langkah demi langkah untuk membeli domain `.xyz` secara lokal di Indonesia tanpa kartu kredit (bisa bayar pakai **QRIS**, **GoPay**, **ShopeePay**, atau **Virtual Account BCA/Mandiri/BNI**), lalu menghubungkannya ke **Cloudflare** dan **Railway**.

---

## 🛒 Bagian 1: Tempat & Cara Beli Domain `.xyz` di Indonesia (Pakai QRIS)

### Registrar Rekomendasi:

#### 1. DomaiNesia (Sangat Direkomendasikan ⭐⭐⭐⭐⭐)
* **Website**: [domainesia.com/domain](https://www.domainesia.com/domain/)
* **Harga**: ~Rp 35.000 – Rp 45.000 / tahun (+ PPN 11%).
* **Metode Pembayaran**: **QRIS** (BCA Mobile, Livin, GoPay, OVO, Dana), Virtual Account (BCA, Mandiri, BNI, BRI, Permata).
* **Aktivasi**: Otomatis 1 menit setelah scan QRIS.
* **Tanpa Syarat KTP**: Domain `.xyz` tidak membutuhkan KTP (langsung aktif).

#### 2. Niagahoster (Alternatif)
* **Website**: [niagahoster.co.id/domain-murah](https://www.niagahoster.co.id/domain-murah)
* **Harga**: ~Rp 30.000 – Rp 45.000 / tahun.
* **Metode Pembayaran**: QRIS, Virtual Account, Indomaret/Alfamart.

---

### Langkah Pembelian di DomaiNesia (Hanya 3 Menit):

1. **Cari Domain**:
   - Buka [domainesia.com/domain](https://www.domainesia.com/domain/).
   - Ketik nama domain yang diinginkan, misalnya: `farabisyifa.xyz` atau `farabi-syifa.xyz`.
   - Klik **Cari**.

2. **Masukkan ke Keranjang**:
   - Jika tersedia (*Available*), klik tombol **Beli / Tambah ke Cart**.

3. > [!IMPORTANT]
   > **Tolak / Uncheck Semua Add-on Tambahan (Hemat Biaya!)**:
   > - Jangan centang *Web Hosting* (website Anda sudah dihosting gratis di Railway).
   > - Jangan centang *Sertifikat SSL Berbayar* (Cloudflare & Railway sudah menyediakan SSL HTTPS gratis selamanya).
   > - Jangan centang *Email Bisnis Berbayar* (notifikasi pesan suara sudah pakai Gmail gratis via Nodemailer).
   > - *Hanya bayar domain `.xyz` saja!*

4. **Checkout & Pembayaran**:
   - Klik **Lanjutkan / Checkout**.
   - Buat akun baru atau login.
   - Pada metode pembayaran: pilih **QRIS** atau **Virtual Account (BCA / Mandiri / BNI)**.
   - Scan kode QRIS dari aplikasi m-banking atau e-wallet Anda.
   - Selesai! Domain Anda aktif seketika.

---

## 🛡️ Bagian 2: Menghubungkan Domain ke Cloudflare (Gratis SSL & Caching Cepat)

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com/) lalu login (atau buat akun baru gratis jika belum punya).
2. Klik tombol **Add a domain** &rarr; masukkan domain Anda: `farabisyifa.xyz`.
3. Pilih paket: **Free ($0)** &rarr; klik **Continue**.
4. Cloudflare akan melakukan scan DNS otomatis, klik **Continue**.
5. Cloudflare akan memberikan **2 Nameservers**, contoh:
   ```text
   aria.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
6. **Ubah Nameserver di Dashboard DomaiNesia**:
   - Masuk ke dashboard DomaiNesia &rarr; menu **Domains / Domain Saya** &rarr; klik domain Anda.
   - Buka menu **Nameservers** &rarr; pilih opsi **Custom Nameservers**.
   - Masukkan 2 nameserver dari Cloudflare tadi di baris 1 dan 2.
   - Klik **Simpan / Update Nameserver**.
   - *(Proses propagasi biasanya hanya 2–10 menit).*

---

## 🚂 Bagian 3: Menghubungkan Domain ke Railway

1. Buka dashboard proyek Anda di **Railway** (`undangan`).
2. Klik service **`undangan`** &rarr; buka tab **`Settings`** (di sebelah tab Console/Metrics).
3. Scroll ke bawah ke bagian **Networking** (atau **Public Networking**).
4. Klik tombol **`Custom Domain`**.
5. Masukkan nama domain Anda:
   ```text
   farabisyifa.xyz
   ```
6. Railway akan menampilkan instruksi CNAME, contoh:
   * **Type**: `CNAME`
   * **Host / Name**: `@` (atau `farabisyifa.xyz`)
   * **Target / Value**: `undangan-production-xxxx.up.railway.app` *(salin kode target ini)*

---

## 🔗 Bagian 4: Masukkan CNAME di Cloudflare

1. Kembali ke dashboard **Cloudflare** &rarr; pilih domain `farabisyifa.xyz` &rarr; buka menu **DNS** &rarr; **Records**.
2. Klik **Add record**:
   - **Type**: `CNAME`
   - **Name**: `@`
   - **Target**: *(tempel kode target dari Railway tadi, misal: `undangan-production-xxxx.up.railway.app`)*
   - **Proxy status**: **Proxied (Orange Cloud 🟧)**
   - **TTL**: `Auto`
3. Klik **Save**.
4. *(Opsional: Tambahkan juga CNAME untuk `www`)*:
   - **Type**: `CNAME`
   - **Name**: `www`
   - **Target**: `@` (atau target Railway tadi)
   - **Proxy status**: **Proxied (Orange Cloud 🟧)**
   - Klik **Save**.

---

## 🔒 Bagian 5: Pengaturan Wajib SSL di Cloudflare (PENTING!)

Agar tidak terjadi error pengalihan tak berujung (*ERR_TOO_MANY_REDIRECTS*):

1. Di dashboard Cloudflare, buka menu **SSL/TLS** di sebelah kiri.
2. Pada bagian **Overview**, ubah mode enkripsi menjadi:
   👉 **`Full`** atau **`Full (Strict)`**
   *(Jangan biarkan di mode "Flexible").*

---

## ✅ Selesai!

Dalam hitungan beberapa menit, website undangan pernikahan Anda sudah live di:
🌐 **`https://farabisyifa.xyz`**

* Cepat dibuka di seluruh Indonesia melalui jaringan CDN Cloudflare (server Jakarta).
* Memiliki gembok hijau HTTPS resmi.
* Terhubung langsung dengan server Railway dan database persistent Anda!
