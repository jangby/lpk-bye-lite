# Panduan Lengkap Setup Lite

Panduan ini menjelaskan cara memperoleh setiap nilai untuk `.env` dan deployment Vercel:

- `DATA_STORE`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_TOKEN_SECRET`
- `FONNTE_TOKEN`
- `FONNTE_ADMIN_NUMBER`
- `FONNTE_WEBHOOK_SECRET`
- `VITE_N8N_CHAT_WEBHOOK_URL`
- `APP_URL`

Jangan kirim atau commit kredensial ke chat, GitHub, atau email yang tidak aman. Private key Google, token Fonnte, password admin, dan `ADMIN_TOKEN_SECRET` harus dianggap rahasia.

Untuk membuat Supabase menjadi penyimpanan utama dan mengimpor data Sheets yang sudah ada, ikuti [panduan migrasi Supabase](./SUPABASE_MIGRATION.md).

## 1. Buat Google Spreadsheet

1. Buka https://sheets.google.com.
2. Buat spreadsheet kosong.
3. Beri nama, misalnya `LPK BYE Lite`.
4. Buka spreadsheet tersebut dan salin ID-nya dari URL:

```text
https://docs.google.com/spreadsheets/d/CONTOH_SHEET_ID/edit
                                     ^^^^^^^^^^^^^^^
```

Bagian `CONTOH_SHEET_ID` adalah nilai `GOOGLE_SHEET_ID`.

Anda tidak perlu membuat tab `Batches` dan `Registrants` secara manual. Aplikasi otomatis membuat kedua tab dan header saat API lite pertama kali dipanggil.

Kedua tab akan menyimpan:

- `Batches`: gelombang, periode, kuota, biaya, dan konfigurasi field.
- `Registrants`: nama, WhatsApp, email, jawaban, kode registrasi, token portal, dan status.
- `Payments`: bukti, nominal, status, alasan penolakan, dan status notifikasi.
- `Content`: logo, poster, galeri, dan FAQ.

Batasi akses spreadsheet hanya untuk pemilik dan admin yang memang memerlukan data peserta.

## 2. Buat Google Cloud Project

1. Buka https://console.cloud.google.com.
2. Di bagian atas halaman, buka pemilih project lalu pilih **New Project**.
3. Isi nama project, misalnya `LPK BYE Lite`.
4. Pilih project baru tersebut.

## 3. Aktifkan Google Sheets API

1. Buka menu **APIs & Services** → **Library**.
2. Cari `Google Sheets API`.
3. Pilih **Google Sheets API**.
4. Klik **Enable**.

## 4. Buat Service Account

1. Buka **APIs & Services** → **Credentials**.
2. Klik **Create Credentials** → **Service Account**.
3. Isi:

```text
Service account name: lpk-bye-lite-sheets
Service account ID: lpk-bye-lite-sheets
```

4. Klik **Create and Continue**.
5. Role project tidak wajib ditambahkan untuk penggunaan Sheets ini.
6. Klik **Done**.

Setelah kembali ke daftar credentials, buka **Service Accounts** lalu buka service account yang baru dibuat. Pada bagian **Details**, salin nilai:

```text
Email
```

Nilai tersebut menjadi `GOOGLE_SERVICE_ACCOUNT_EMAIL`, dan biasanya berbentuk:

```text
lpk-bye-lite-sheets@nama-project.iam.gserviceaccount.com
```

## 5. Buat JSON Key / Private Key

1. Pada halaman service account, buka tab **Keys**.
2. Klik **Add key** → **Create new key**.
3. Pilih **JSON**.
4. Klik **Create**.

Browser akan mengunduh file JSON, biasanya bernama seperti:

```text
nama-project-xxxx.json
```

Buka file tersebut menggunakan Notepad atau editor teks. Temukan:

```json
{
  "client_email": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

- Nilai `client_email` adalah `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
- Nilai `private_key` adalah `GOOGLE_PRIVATE_KEY`.

Jika private key diambil untuk `.env`, copy seluruh isi di antara tanda kutip, termasuk:

```text
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
```

Untuk deployment Vercel, Anda boleh menyimpan:

```text
-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

sesuai isi JSON. Aplikasi otomatis mengubah setiap teks `\n` menjadi baris baru sebenarnya. Jangan menambahkan spasi atau karakter `"` di luar private key.

Contoh format environment value:

```text
-----BEGIN PRIVATE KEY-----\nABCDEF...\n-----END PRIVATE KEY-----\n
```

File JSON hasil unduhan harus dianggap rahasia. Sebaiknya simpan di luar repository dan hapus dari folder Downloads setelah nilainya dicatat dengan aman.

## 6. Berikan Akses ke Spreadsheet

1. Buka spreadsheet Google Sheets.
2. Klik **Share**.
3. Masukkan `GOOGLE_SERVICE_ACCOUNT_EMAIL` tepat seperti nilai email service account.
4. Berikan role **Editor**.
5. Matikan opsi mengirim email bila tersedia.
6. Klik **Share** atau **Send**.

Tanpa langkah ini, aplikasi akan menerima error akses Spreadsheet atau `PERMISSION_DENIED`.

## Google Drive untuk file

Google Drive API harus aktif dari **Google Cloud Console → APIs & Services → Library → Google Drive API → Enable**.

### Cara yang disarankan untuk Drive pribadi: OAuth akun Anda

Service account Google tidak memiliki kuota Drive pribadi sendiri. Untuk menyimpan berkas di Drive pribadi Gmail, gunakan OAuth refresh token akun Drive Anda:

1. Pada Google Cloud project yang sama, buka **Google Auth Platform** lalu siapkan branding/audience. Jika aplikasi berstatus **Testing**, tambahkan akun Google Anda pada **Test users**.
2. Buka **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
3. Pilih **Web application**. Tambahkan authorized redirect URI:

```text
https://developers.google.com/oauthplayground
```

4. Simpan nilai client ID sebagai `GOOGLE_DRIVE_CLIENT_ID` dan client secret sebagai `GOOGLE_DRIVE_CLIENT_SECRET`.
5. Buka https://developers.google.com/oauthplayground, klik ikon pengaturan (roda gigi), centang **Use your own OAuth credentials**, lalu masukkan client ID dan client secret tersebut.
6. Pada Step 1, masukkan scope berikut, lalu klik **Authorize APIs** dan login dengan akun Google yang memiliki folder Drive:

```text
https://www.googleapis.com/auth/drive.file
```

7. Klik **Exchange authorization code for tokens**.
8. Salin **Refresh token** yang diberikan ke `GOOGLE_DRIVE_REFRESH_TOKEN`. Jangan salin access token; access token akan kedaluwarsa.
9. Buat folder Drive pada akun yang sama. Salin ID folder dari URL dan isi `GOOGLE_DRIVE_FOLDER_ID`.

Scope `drive.file` membatasi akses aplikasi ke file yang dibuat/dibuka oleh aplikasi; jangan ganti dengan scope Drive penuh kecuali memang diperlukan.

Google OAuth dapat meminta verifikasi aplikasi saat digunakan oleh pengguna di luar daftar test user. Untuk aplikasi milik sendiri, Anda dapat memakai akun yang dimasukkan sebagai test user.

### Alternatif: Google Workspace Shared Drive

Jika organisasi memiliki Google Workspace Shared Drive, Anda dapat menyimpan file di sana menggunakan service account:

1. Buat folder pada Shared Drive.
2. Tambahkan email service account sebagai anggota dengan hak akses yang dapat menambahkan file.
3. Isi `GOOGLE_DRIVE_FOLDER_ID` dengan ID folder.
4. Kosongkan tiga variable OAuth (`GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`) agar kode memakai service account.

Drive pribadi Gmail tidak memiliki Shared Drive. Pada konfigurasi ini, upload aset publik (poster, galeri, logo) dibuat dapat dilihat siapa pun agar bisa ditampilkan di landing page. Berkas identitas dan bukti pembayaran tetap privat; bagikan folder Drive hanya kepada akun admin/pemilik yang berwenang.

## 7. Buat Kredensial Admin

Pilih email dan password yang tidak dipakai untuk layanan lain.

```text
ADMIN_EMAIL=admin@domainanda.com
ADMIN_PASSWORD=PasswordKuatMinimal12Karakter
```

Password digunakan untuk login admin lite. Password disarankan minimal 12–20 karakter dan memuat huruf besar, huruf kecil, angka, serta simbol.

Untuk membuat secret HMAC acak yang kuat, jalankan PowerShell:

```powershell
$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Salin hasil lengkap ke `ADMIN_TOKEN_SECRET`. Jangan gunakan password admin sebagai secret token.

Setiap kali `ADMIN_TOKEN_SECRET` atau `ADMIN_EMAIL` diubah di Vercel, token admin lama akan tidak valid dan login ulang diperlukan.

## 8. Dapatkan Token Fonnte

1. Login ke dashboard Fonnte milik Anda.
2. Buka menu perangkat atau API.
3. Pilih WhatsApp yang sudah terhubung.
4. Temukan dan salin **Device Token** atau **API Token**.

Salin ke environment:

```text
FONNTE_TOKEN=nilai_token_dari_dashboard_fonnte
```

Token ini biasanya bersifat rahasia dan harus diperlakukan seperti password.

Lite mengirim pesan menggunakan API Fonnte dengan parameter form-urlencoded dan header `Authorization` langsung berisi token (tanpa awalan `Bearer`), sesuai [dokumentasi API Fonnte](https://docs.fonnte.com/api-send-message/).

Jangan mengandalkan nomor WhatsApp QR Baileys dari project lama. Versi lite menggunakan API Fonnte, bukan sesi Baileys lokal.

## 9. Isi Nomor Admin Fonnte

Jika ingin menerima ringkasan pendaftar baru:

1. Gunakan nomor WhatsApp yang akan menerima ringkasan.
2. Gunakan format internasional **tanpa `+`**, tanda hubung, atau spasi.

Contoh:

```text
+62 812-3456-7890
```

menjadi:

```text
FONNTE_ADMIN_NUMBER=6281234567890
```

Nomor ini opsional. Jika tidak diperlukan, biarkan kosong atau hapus variable tersebut.

Pastikan nomor tujuan sudah terdaftar pada Fonnte dan dapat menerima pesan WhatsApp.

## 10. Aktifkan bot perintah Fonnte

Webhook Fonnte opsional. Fitur ini memungkinkan peserta mengirim perintah `STATUS`, `PORTAL`, atau `PEMBAYARAN` ke nomor Fonnte. Fonnte harus terhubung dan bisa menerima pesan.

1. Buat `FONNTE_WEBHOOK_SECRET` yang acak. Gunakan PowerShell:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

2. Tambahkan hasilnya sebagai Environment Variable `FONNTE_WEBHOOK_SECRET` di Vercel.
3. Redeploy project.
4. Di dashboard Fonnte, buka perangkat WhatsApp yang digunakan → **Edit**.
5. Isi Webhook URL:

```text
https://nama-project.vercel.app/api/fonnte-webhook?key=ISI_FONNTE_WEBHOOK_SECRET
```

Ganti domain dengan `APP_URL` dan isi key dengan nilai rahasia yang sama. Jangan bagikan URL webhook ini.

6. Aktifkan **Auto read** pada pengaturan perangkat, lalu simpan.
7. Uji dari nomor peserta yang terdaftar dengan mengirim `MENU`, lalu coba `STATUS <kode>`.

Perintah yang tersedia:

```text
MENU
STATUS <kode pendaftaran>
PEMBAYARAN <kode pendaftaran>
PORTAL <kode pendaftaran>
ADMIN RINGKASAN
```

Perintah peserta hanya membalas data jika pesan dikirim dari nomor WhatsApp yang sama dengan pendaftaran. `ADMIN RINGKASAN` dibatasi ke nomor pada `FONNTE_ADMIN_NUMBER`.

Fonnte menyebut konfigurasi webhook menggantikan fitur autoreply bawaan pada perangkat tersebut. Baca [Webhook URL Fonnte](https://docs.fonnte.com/webhook-url/) dan [Webhook Reply Message](https://docs.fonnte.com/webhook-reply-message/) sebelum mengaktifkannya. Bukti transfer dapat diunggah lewat portal peserta; webhook lite tidak mengunduh lampiran WhatsApp.

## 11. Isi `APP_URL`

Sebelum deployment pertama, Anda dapat mengosongkan `APP_URL` sementara. Kode lite akan memakai hostname request sebagai URL dasar.

Setelah deployment Vercel mendapatkan domain publik, isi:

```text
APP_URL=https://nama-project.vercel.app
```

Aturan:

- Gunakan `https://`.
- Jangan tambahkan `/` di akhir.
- Jangan gunakan `localhost`.
- Jika memakai domain sendiri, gunakan domain publik, contoh:

```text
APP_URL=https://pendaftaran.domainanda.com
```

Variabel ini dipakai untuk membuat tautan portal peserta yang dikirim melalui Fonnte.

## 12. Deploy ke Vercel

1. Push folder project ke GitHub, GitLab, atau Bitbucket.
2. Buka https://vercel.com dan login.
3. Klik **Add New** → **Project**.
4. Import repository yang berisi folder `lite`.
5. Pada konfigurasi project:

```text
Root Directory: lite
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Jika repository hanya berisi versi lite sebagai project terpisah, Root Directory dapat diisi `.`. Jika repository utama berisi folder `lite`, pilih `lite`.

## 13. Isi Environment Variables Vercel

Buka:

```text
Project → Settings → Environment Variables
```

Tambahkan semua variable berikut.

| Variable | Contoh | Wajib |
|---|---|---|
| `DATA_STORE` | `supabase` setelah cutover | Ya untuk Supabase |
| `SUPABASE_URL` | `https://project-ref.supabase.co` | Ya untuk Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key Supabase | Ya untuk Supabase; rahasia |
| `CRON_SECRET` | secret acak panjang | Ya untuk worker mirror |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `lpk-bye-lite-sheets@project.iam.gserviceaccount.com` | Ya |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | Ya |
| `GOOGLE_SHEET_ID` | `1AbCdEf...` | Ya |
| `GOOGLE_DRIVE_FOLDER_ID` | ID folder Drive | Ya untuk mengatur folder |
| `GOOGLE_DRIVE_CLIENT_ID` | OAuth client ID | Ya untuk Drive pribadi |
| `GOOGLE_DRIVE_CLIENT_SECRET` | OAuth client secret | Ya untuk Drive pribadi |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | refresh token OAuth | Ya untuk Drive pribadi |
| `ADMIN_EMAIL` | `admin@domainanda.com` | Ya |
| `ADMIN_PASSWORD` | password kuat | Ya |
| `ADMIN_TOKEN_SECRET` | hasil generator 48-byte | Ya |
| `FONNTE_TOKEN` | token dari dashboard Fonnte | Ya untuk WhatsApp |
| `FONNTE_ADMIN_NUMBER` | `6281234567890` | Opsional |
| `FONNTE_WEBHOOK_SECRET` | secret acak | Untuk bot perintah |
| `VITE_N8N_CHAT_WEBHOOK_URL` | URL webhook n8n | Opsional |
| `APP_URL` | `https://nama-project.vercel.app` | Disarankan |

Pilih environment:

- **Production**
- **Preview**
- **Development** bila ingin preview dan Vercel CLI

Kemudian klik **Save** atau **Add**.

Jika mengubah variable setelah deployment, jalankan **Redeploy**. Ubah environment tidak selalu langsung diterapkan ke deployment lama.

## 14. Contoh `.env` Lokal

Untuk pengujian lokal Vercel CLI, dari folder `lite/` buat file `.env.local`:

```dotenv
GOOGLE_SERVICE_ACCOUNT_EMAIL=lpk-bye-lite-sheets@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nISI_PRIVATE_KEY_DISINI\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1AbCdEfContohSheetId
GOOGLE_DRIVE_FOLDER_ID=ID_FOLDER_GOOGLE_DRIVE
GOOGLE_DRIVE_CLIENT_ID=oauth-client-id
GOOGLE_DRIVE_CLIENT_SECRET=oauth-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=refresh-token
ADMIN_EMAIL=admin@domainanda.com
ADMIN_PASSWORD=PasswordKuatMinimal12Karakter
ADMIN_TOKEN_SECRET=hasil_random_48_byte_dalam_base64
FONNTE_TOKEN=token_dari_dashboard_fonnte
FONNTE_ADMIN_NUMBER=6281234567890
FONNTE_WEBHOOK_SECRET=secret_acak_webhook
VITE_N8N_CHAT_WEBHOOK_URL=
APP_URL=https://nama-project.vercel.app
```

Catatan:

- `.env.local` tidak boleh dipush ke Git.
- File `.env.example` sengaja tidak berisi kredensial.
- Jalankan `npm run dev` dari folder `lite/`. Perintah ini menjalankan API lokal pada port `5001` dan Vite pada port `5173`, serta membaca file `.env`.

## 15. Jalankan Uji Pertama

Setelah deploy berhasil:

1. Buka alamat Vercel.
2. Buka halaman pendaftaran.
3. Pastikan API dapat membaca spreadsheet.
4. Buka `/admin/login`.
5. Login menggunakan `ADMIN_EMAIL` dan `ADMIN_PASSWORD`.
6. Buat satu gelombang aktif dengan tanggal yang masih berlaku.
7. Buat pendaftaran uji dengan nomor WhatsApp Anda.
8. Periksa tab `Registrants` di Google Sheets.
9. Periksa pesan Fonnte ke peserta.

Saat API pertama kali dipanggil, aplikasi membuat tab:

- `Batches`
- `Registrants`
- `Payments`
- `Content`

Jangan mengubah nama header baris pertama. Aplikasi akan berhenti dan menampilkan kesalahan jika header tab tidak sesuai dengan nama yang dikonfigurasi.

## 16. Periksa Permintaan Uji Admin

Buka halaman admin lalu buat gelombang dengan:

```text
Nama gelombang: Gelombang Uji 1
Program: PELATIHAN BAHASA JEPANG
Tanggal mulai: hari ini
Tanggal selesai: minimal satu hari setelah hari ini
Kuota: 0
Biaya: 100000
Aktifkan: ✓
```

Pada versi lite:

- `0` pada kuota berarti tidak terbatas.
- Biaya kosong akan membuat gelombang tidak dapat dipilih oleh peserta.
- Gelombang tidak aktif akan ditutup meskipun tanggalnya masih berlaku.
- Tanggal selesai tidak boleh sebelum tanggal mulai.

## 17. Troubleshooting

### Error: Konfigurasi server belum diisi: GOOGLE_SHEET_ID

Variable belum ditambahkan ke Vercel atau deployment lama belum di-redeploy.

Periksa:

1. Nama variable persis seperti daftar.
2. Environment Production sudah dipilih.
3. Deployment dijalankan ulang.

### Error: Google Sheets atau private key gagal

Periksa:

1. `GOOGLE_PRIVATE_KEY` menggunakan private key milik JSON key yang sedang aktif.
2. Private key lengkap, termasuk `BEGIN` dan `END`.
3. Karakter `\n` tidak berubah menjadi teks lain secara tidak sengaja.
4. Tidak ada spasi/enter di luar isi private key.
5. Service account memiliki akses **Editor** ke spreadsheet.

Jika membuat JSON key baru, key lama dapat dinonaktifkan, tetapi jangan hapus key lama sebelum memastikan key baru bekerja.

### Error: Google Sheets API has not been used

Google Sheets API belum diaktifkan pada project yang berisi service account.

Aktifkan kembali API pada project yang sama lalu tunggu beberapa menit.

### Error: The caller does not have permission

Spreadsheet belum dibagikan kepada `GOOGLE_SERVICE_ACCOUNT_EMAIL`.

Pastikan Anda membagikannya sebagai:

```text
Role: Editor
Email: email service account
```

### Login admin gagal

Periksa:

- `ADMIN_EMAIL` harus sama persis dan tidak memiliki spasi.
- `ADMIN_PASSWORD` harus minimal password yang Anda isi.
- `ADMIN_TOKEN_SECRET` sudah diisi.
- Redeploy setelah mengubah environment variables.

### Pesan Fonnte tidak terkirim

Periksa:

1. Perangkat Fonnte sudah terhubung.
2. `FONNTE_TOKEN` benar dan belum dicabut.
3. Nomor peserta diawali `62`, misalnya `6281234567890`.
4. Nomor peserta aktif dan memiliki WhatsApp.
5. Nomor admin formatnya internasional tanpa `+`.
6. Paket/cuti perangkat atau quota Fonnte masih tersedia.

Pesan gagal tidak menghapus pendaftaran dari Google Sheets. Admin dapat melihat status notifikasi pada sheet dan mencoba lagi sesuai status fitur yang tersedia.

### Tautan portal tidak benar

Periksa `APP_URL`, termasuk:

```text
https://domainanda.com
```

tanpa `/` di akhir. Setelah mengubahnya, redeploy dan lakukan pendaftaran uji baru.

### Halaman frontend muncul tetapi API gagal

Periksa:

- Root Directory Vercel adalah `lite`.
- Folder `lite/api` masuk ke repository.
- Folder `_lib` sudah dipindahkan ke `lite/lib` dan tidak berada di bawah api.
- Build berhasil dengan `npm run build`.
- Environment variables tersedia pada deployment Production.

## 18. Rotasi Rahasia

Saat terjadi kebocoran:

1. Ganti `ADMIN_PASSWORD`.
2. Ganti `ADMIN_TOKEN_SECRET`.
3. Cabut atau buat ulang token Fonnte.
4. Hapus atau disable JSON key Google yang bocor di Google Cloud.
5. Buat JSON key baru jika private key Google bocor.
6. Update environment variables di Vercel.
7. Bagikan spreadsheet kepada service account baru jika menggunakan key baru.
8. Jalankan redeploy.
9. Login ulang ke admin.

## Checklist Akhir

- [ ] Spreadsheet Google dibuat.
- [ ] Google Sheet API diaktifkan.
- [ ] Service account dibuat.
- [ ] JSON key dicatat aman.
- [ ] Service account menjadi Editor spreadsheet.
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` sudah diisi.
- [ ] `GOOGLE_PRIVATE_KEY` sudah diisi.
- [ ] `GOOGLE_SHEET_ID` sudah diisi.
- [ ] Email dan password admin sudah ditentukan.
- [ ] `ADMIN_TOKEN_SECRET` acak sudah dibuat.
- [ ] Fonnte terhubung dan token didapatkan.
- [ ] Nomor admin Fonnte sudah diformat ke `62...`.
- [ ] `APP_URL` sudah diisi setelah domain Vercel diketahui.
- [ ] Environment variables disimpan di Vercel.
- [ ] Project Vercel menggunakan root `lite`.
- [ ] Redeploy dijalankan.
- [ ] Pendaftaran uji berhasil.
- [ ] Sheet `Registrants` menerima data uji.
- [ ] Pesan Fonnte berhasil diterima.
