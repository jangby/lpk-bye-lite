# Migrasi Lite ke Supabase

Setelah migrasi, Supabase menjadi sumber data utama. Google Sheets hanya mirror satu arah untuk laporan. Google Drive tetap menyimpan foto dan dokumen.

## 1. Buat tabel dan antrean mirror

1. Buat project Supabase.
2. Buka **SQL Editor** pada project tersebut.
3. Jalankan isi file [migrasi SQL](./supabase/migrations/20261122000000_primary_store_and_sheet_outbox.sql).
4. Jalankan [migrasi tabel analitik](./supabase/migrations/20261123000000_site_analytics.sql) agar pencatatan pengunjung dan dashboard analitik admin aktif. Migrasi ini tidak memerlukan impor data awal.

Schema mencakup tabel bisnis, relasi registrasi/pembayaran, serta trigger yang menambahkan perubahan ke `sheet_sync_outbox` dalam transaksi yang sama.

## 2. Atur kredensial lokal

Tambahkan nilai berikut ke `.env` lokal, jangan commit file tersebut:

```dotenv
DATA_STORE=sheets
SUPABASE_URL=https://PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY
CRON_SECRET=SECRET_ACAK_PANJANG
```

Ambil URL dan service-role key dari pengaturan API project Supabase. Key ini hanya dipakai server; jangan pernah menaruhnya di `VITE_*` atau kode browser. Biarkan `DATA_STORE=sheets` selama proses impor.

## 3. Salin data Sheets yang sudah ada

Dari folder `lite/`, jalankan:

```powershell
npm run migrate:sheets
```

Script menyalin `Batches`, `Registrants`, `Payments`, dan `Content` ke Supabase berdasarkan ID. Script bersifat upsert dan tidak menghapus data Supabase. Jalankan saat cutover awal; jika dijalankan ulang, data dengan ID sama di Supabase akan ditimpa dengan versi Sheets. Impor memakai RPC khusus yang melewati outbox mirror, karena Google Sheets sudah menjadi sumber data saat langkah impor.

Import mempertahankan relasi foreign key: setiap `batch_id` pada registrant harus ada di `Batches`, dan setiap `registrant_id` pada pembayaran harus ada di `Registrants`. Jika ada baris yatim, perbaiki data Sheets sebelum mengulang impor.

Periksa jumlah data di SQL Editor:

```sql
select 'batches' as table_name, count(*) from public.batches
union all select 'registrants', count(*) from public.registrants
union all select 'payments', count(*) from public.payments
union all select 'content', count(*) from public.content;
```

Impor awal tidak menambah baris ke antrean mirror. Setelah cutover, perubahan aplikasi normal akan otomatis masuk ke outbox dan dicoba hingga berhasil.

## 4. Aktifkan Supabase sebagai sumber utama

Setelah jumlah dan sampel data cocok:

1. Ubah `.env` lokal menjadi `DATA_STORE=supabase`.
2. Tambahkan `DATA_STORE=supabase`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `CRON_SECRET` pada **Vercel → Project Settings → Environment Variables** untuk Production. Aktifkan di Preview hanya jika Preview memakai project Supabase terpisah.
3. Pastikan Google Sheets API, service account, dan akses spreadsheet tetap aktif untuk mirror.
4. Restart API lokal atau redeploy Vercel.

Semua pembacaan dan penulisan aplikasi kini menggunakan Supabase. Perubahan manual langsung di Google Sheets tidak disalin kembali.

## 5. Jadwalkan sinkronisasi Supabase ke Sheets

Endpoint worker adalah `/api/sync-sheets`. Worker mengambil maksimal 2 antrean per pemanggilan untuk menjaga eksekusi tetap singkat, menulis baris berdasarkan ID, dan menjadwalkan ulang kegagalan dengan backoff.

Untuk sinkronisasi otomatis tanpa bergantung pada paket Vercel:

1. Di Supabase Dashboard, buka **Vault** dan simpan dua secret:
   - nama `sheet_sync_url`, nilai URL deployment lengkap, misalnya `https://nama-project.vercel.app/api/sync-sheets`
   - nama `sheet_sync_secret`, nilai yang sama persis dengan `CRON_SECRET` di Vercel
2. Buka SQL Editor dan jalankan [konfigurasi jadwal Supabase Cron](./supabase/schedule-sheet-sync.sql) satu kali.
3. Periksa eksekusi jadwal di **Integrations → Cron**. Worker berjalan setiap menit; Google Sheets dapat tertinggal sebentar, tetapi kegagalannya akan dicoba ulang.

Untuk pengujian lokal, jalankan `npm run dev` dengan `DATA_STORE=supabase`, lalu panggil `http://127.0.0.1:5001/api/sync-sheets`. Endpoint lokal mengizinkan pemanggilan tanpa `CRON_SECRET` jika secret belum diset; deployment production selalu memerlukan secret.

## Catatan cutover

- Jangan mengaktifkan `DATA_STORE=supabase` sebelum schema diterapkan dan impor berhasil.
- Jangan hapus spreadsheet atau akses service account; keduanya masih dipakai worker.
- Jika antrean gagal, cek `last_error` pada `public.sheet_sync_outbox`. Worker otomatis mencoba lagi.
- File Drive tidak dipindahkan oleh migrasi; hanya URL dan metadata yang disimpan di database.
