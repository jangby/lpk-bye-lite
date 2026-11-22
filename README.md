# LPK BYE Lite

Versi mandiri berbasis React + Vite untuk deploy sebagai satu project di Vercel. Endpoint serverless Vercel (`api/`) menjadi backend, Supabase menjadi penyimpanan utama, Google Sheets menjadi mirror satu arah, Google Drive menyimpan berkas, dan Fonnte mengirim notifikasi WhatsApp. Landing page, pendaftaran, dan portal peserta menggunakan komposisi tampilan yang sama dengan web utama. Project utama di folder `frontend/` dan `backend/` tidak digunakan atau diubah oleh versi ini.

## Fitur versi lite

- Landing page, poster, galeri, FAQ, dan daftar gelombang pelatihan.
- Form pendaftaran dengan field dinamis dan unggah dokumen ke Google Drive.
- Portal peserta dengan tautan privat untuk melihat status.
- Admin: login, membuat gelombang, melihat data pendaftar, dan mengubah status.
- Notifikasi pendaftaran dan perubahan status melalui Fonnte.
- Webhook bot Fonnte untuk cek `STATUS`, `PORTAL`, dan `PEMBAYARAN` peserta.
- Widget AI n8n opsional melalui `VITE_N8N_CHAT_WEBHOOK_URL`.
- Berkas formulir dan bukti pembayaran dapat disimpan ke Google Drive.
- Form Builder, konten landing, galeri, FAQ, dan review pembayaran manual tersedia di dashboard admin.
- Tabel `batches`, `registrants`, `payments`, dan `content` menyimpan data utama di Supabase.
- Perubahan Supabase masuk ke antrean mirror dan dikirim ulang ke Google Sheets bila sinkronisasi gagal.

Lite menyediakan alur administrasi utama dengan beberapa perbedaan teknis dari project utama:

- Bukti pembayaran ditinjau manual; OCR otomatis tidak tersedia.
- Lampiran bukti diunggah peserta lewat portal (bukan dikirim melalui chat WhatsApp).
- Fonnte mengirim notifikasi dan menerima perintah webhook sederhana; tidak memakai sesi WhatsApp Baileys persisten.
- Google Sheets adalah salinan/laporan; perubahan manual di Sheets tidak disinkronkan kembali ke Supabase.

Untuk migrasi dan aktivasi Supabase, ikuti [SUPABASE_MIGRATION.md](./SUPABASE_MIGRATION.md). Untuk nilai Google dan Fonnte, ikuti panduan [SETUP_GOOGLE_SHEETS_FONNTE_VERCEL.md](./SETUP_GOOGLE_SHEETS_FONNTE_VERCEL.md).

## Google Sheets

1. Buat project Google Cloud dan aktifkan **Google Sheets API**.
2. Buat service account dan salin email serta private key. Bagikan spreadsheet ke email service account sebagai **Editor**.
3. Buat spreadsheet kosong; salin ID dari URL, yaitu bagian antara `/d/` dan `/edit`.
4. Sheet/tab `Batches`, `Registrants`, `Payments`, dan `Content` dibuat otomatis. Jangan mengubah urutan/nama kolom header.
5. Setelah migrasi, Sheets adalah mirror; Supabase tetap sumber data utama. Batasi akses spreadsheet karena berisi data peserta.

Untuk unggah foto dan berkas, aktifkan juga **Google Drive API** pada project Cloud yang sama. Service account cocok untuk Google Workspace Shared Drive; untuk folder Drive pribadi Gmail, gunakan kredensial OAuth refresh token karena service account tidak memiliki kuota Drive pribadi.

## Fonnte

Siapkan token API Fonnte. Isi `FONNTE_TOKEN` dan, bila ingin menerima ringkasan pendaftar baru, isi `FONNTE_ADMIN_NUMBER` menggunakan nomor WhatsApp internasional, misalnya `62812...`. Pesan pendaftaran dikirim ke peserta; perubahan status dikirim setelah admin menyimpan perubahan.

## Environment variables

Salin `.env.example` sebagai acuan lalu isi pada **Vercel Project → Settings → Environment Variables**:

- `DATA_STORE=supabase` setelah schema Supabase diterapkan dan data Sheets dimigrasikan
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side saja; jangan gunakan prefix `VITE_`)
- `CRON_SECRET` (secret acak untuk worker sinkronisasi)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (private key PEM; gunakan newline asli atau `\n`)
- `GOOGLE_SHEET_ID`
- `GOOGLE_DRIVE_FOLDER_ID` (folder tujuan file)
- `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN` (disarankan untuk Drive pribadi)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (gunakan password kuat dan unik)
- `ADMIN_TOKEN_SECRET` (secret acak panjang, berbeda dari password)
- `FONNTE_TOKEN`
- `FONNTE_ADMIN_NUMBER` (opsional)
- `FONNTE_WEBHOOK_SECRET` (untuk bot perintah masuk)
- `VITE_N8N_CHAT_WEBHOOK_URL` (opsional; URL webhook publik)
- `APP_URL` (URL deployment publik, misalnya `https://nama-project.vercel.app`)

Jangan menyimpan nilai rahasia di source code, file `.env` yang di-commit, atau variabel `VITE_*`.

## Menjalankan dan deploy

Deploy folder `lite/` sebagai root project Vercel. Vercel mendeteksi Vite; build command `npm run build`, output directory `dist`, dan Node.js functions berada di `api/`.

Untuk production build lokal:

```powershell
cd C:\laragon\www\lpk-bye\lite
npm install
npm run build
```

Untuk menjalankan frontend beserta API lite secara lokal:

```powershell
cd C:\laragon\www\lpk-bye\lite
npm run dev
```

Perintah tersebut menjalankan API lokal pada port `5001` dan Vite pada port `5173`. Pastikan `.env` sudah diisi. API lokal membaca `.env` melalui `dotenv`; deployment Vercel tetap menggunakan Environment Variables Vercel.

## Catatan operasional

Saat `DATA_STORE=supabase`, halaman membaca dan menulis ke Supabase. Google Sheets menerima mirror melalui antrean setiap menit; jika Google gagal, perubahan tetap tersimpan di Supabase dan antrean akan mencoba lagi. Jangan mengubah data langsung di Sheets karena perubahan itu tidak kembali ke Supabase.

Unggahan dibatasi 2,5 MB per berkas dan 3,5 MB per request karena batas ukuran request Vercel Functions. Berkas identitas dan bukti pembayaran bersifat privat di Drive; poster/logo/galeri dibuat dapat dilihat publik agar muncul di landing. Admin harus memiliki akses Drive ke folder untuk membuka dokumen.
