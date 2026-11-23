# LPK BYE: Pendaftaran Pelatihan (tugas latihan)

Node.js (Express) · React (Vite) · Tailwind CSS · SQLite (lokal) / Postgres (online)

User mengisi nama, email, nomor HP, dan memilih program (Digital Marketing Bersertifikasi BNSP atau Pelatihan Bahasa dan Budaya Jepang), lalu membayar lewat **simulasi scan QR** (tanpa payment gateway dan tanpa uang sungguhan). Admin melihat data di `/admin` dan menghubungi lewat WhatsApp.

## Struktur

```
api/index.js            Entry Vercel (meneruskan /api ke server/app.js)
server/
  server.js             Entry lokal (npm run dev)
  app.js                Rute API
  repo.js               Query database, kuota, dan aturan arsip otomatis
  db.js                 SQLite (lokal) atau Postgres (bila DATABASE_URL ada)
  config.js             Pembacaan environment
  chat.js               Pengolah balasan webhook chat n8n
  programs.js           Daftar program pelatihan (sumber tunggal)
  time.js               Waktu WIB, jendela laporan 3 bulan, tanggal penghapusan
  reports.js            Catatan laporan bulanan, penghapusan otomatis, password laporan
  reportFile.js         Pembuat file laporan xlsx berpassword
client/public/           Logo SVG (LPK BYE tegak, mendatar, lambang, BNSP) dan img/ (foto, ikon, maskot, tombol dalam WebP)
client/src/
  pages/                Landing, Admin, PhonePay (/bayar/:orderId)
  components/           layout, landing, admin, payment, ui
  hooks/useRegistration.js
```

Teks halaman ada langsung di file komponennya (sumber: laporan riset target audiens dan copywriting LPK BYE). Urutan bagian ada di `pages/Landing.jsx`:

| Bagian | File di `components/landing/` |
|---|---|
| Beranda (headline, tombol, form) | `Hero.jsx`, `RegistrationForm.jsx` |
| Tentang Kami | `About.jsx` |
| Program Pelatihan | `Programs.jsx` |
| Kendala dan solusi | `ProblemSolution.jsx` |
| Manfaat | `Benefits.jsx` |
| Mengapa memilih LPK BYE | `WhyUs.jsx` |
| Cara mendaftar | `Steps.jsx` |
| Testimoni (tampil otomatis bila `ITEMS` diisi) | `Testimonials.jsx` |
| FAQ | `Faq.jsx` |
| Ajakan akhir (daftar dan WhatsApp) | `CtaBanner.jsx` |
| Kontak | `Contact.jsx` |

Tautan navbar ada di `components/layout/Navbar.jsx` (konstanta `LINKS`).

## Identitas, logo, dan warna
- **Kontak LPK BYE** (WhatsApp 0838-2094-3475, email official.lpkbye@gmail.com, website lpkbye.com) ada di `components/landing/Contact.jsx`. Nomor WhatsApp juga dipakai di `CtaBanner.jsx` dan `Faq.jsx` (cari `6283820943475`).
- **Logo** berupa file SVG di `client/public/`, dipasang lewat `components/ui/Logo.jsx`. Versi putih untuk latar gelap dibuat otomatis (`light`).
- **Warna** mengikuti logo (pink `#E8458A`, ungu `#664796`, abu `#BFBEBE`) dan diatur di `client/tailwind.config.js`.
- **Program** pada form: kode `digital-marketing` dan `bahasa-jepang` (daftar di `server/app.js`, label di `RegistrationForm.jsx` dan `RegistrationTable.jsx`).

## Menjalankan di komputer

`server/.env`:

```
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
ADMIN_USER=admin
ADMIN_PASS=isi-password
JWT_SECRET=isi-string-acak
PRICE=250000
```

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Landing: http://localhost:5173 · Admin: http://localhost:5173/admin

## Alur pembayaran simulasi
1. Peserta mengisi form lalu menekan tombol bayar. Muncul QR.
2. QR dipindai dengan kamera HP. Halaman konfirmasi `/bayar/:orderId` terbuka di HP.
3. Tekan **Bayar sekarang** di HP. Layar komputer berpindah ke pesan sukses, dan status di admin menjadi Lunas.
4. Tombol "Simulasi tanpa HP" di jendela QR menjadi cadangan.

Saat dijalankan lokal, HP dan komputer harus satu Wi-Fi (izinkan Node.js di Windows Firewall, jaringan Private). Setelah diterbitkan online, QR memakai alamat situs sehingga bisa dipindai dari mana saja.

Endpoint `/api/payment/...` sengaja terbuka tanpa login karena ini simulasi; jangan dipakai untuk pembayaran sungguhan.

## Buka/tutup pendaftaran dan batas peserta
Diatur dari `/admin`, panel di bawah kartu ringkasan:
- **Saklar status**: menutup atau membuka pendaftaran untuk semua program. Saat ditutup, landing page menampilkan "Pendaftaran ditutup" menggantikan form.
- **Batas peserta per program**: pilih satu program lewat dropdown, klik **Lanjutkan**, isi batasnya, lalu **Simpan batas** (atau **Hapus batas** untuk tanpa batas). Tiap program bisa punya batas berbeda. Daftar di bawahnya merangkum batas dan jumlah terisi semua program, dengan tombol **Atur** di tiap baris.
- Program yang penuh tidak bisa dipilih di form dan kartunya bertanda "Kuota penuh"; saat sisa sedikit muncul label "Kuota hampir penuh". Bila semua program penuh, form diganti pesan "Kuota peserta penuh".
- **Kursi terpakai** (per program) = peserta lunas + yang menunggu bayar dan masih dalam batas 24 jam. Peserta gagal melepas kursinya. Peserta lunas yang sudah diarsipkan tetap dihitung; hapus dari arsip untuk melepas kursinya.
- Pengaturan tersimpan di database (tabel `settings`). Nilai awal: terbuka dan tanpa batas.

## Menambah atau mengurangi program
Daftar program ada di satu tempat: `server/programs.js` (kode, nama lengkap, nama singkat). Form pendaftaran, dropdown kuota, info kuota di beranda, dan tabel admin membaca daftar itu otomatis.
- **Menambah program**: tambahkan satu objek di `server/programs.js`, lalu tambahkan kartu programnya di `client/src/components/landing/Programs.jsx` (isi materi dan foto ditulis manual). Program baru langsung muncul di form dan dropdown kuota.
- **Mengurangi program**: hapus objeknya dari `server/programs.js` dan kartunya dari `Programs.jsx`. Program itu tidak bisa didaftari lagi. Data pendaftar lamanya tetap ada di admin dan menampilkan kode program apa adanya.
- Batas peserta tersimpan per kode program, jadi mengubah nama program tidak mengubah batasnya, tetapi mengganti kode akan dianggap program baru.

## Chatbot AI
Widget chat melayang di landing page (`components/chat/`). Pesan dikirim ke `POST /api/chat` di server, lalu diteruskan ke webhook chat n8n.
- URL webhook ada di `server/config.js` (`chatWebhookUrl`) dan bisa diganti lewat variabel `CHAT_WEBHOOK_URL` (opsional).
- Format yang dikirim: `{ "action": "sendMessage", "sessionId": "...", "chatInput": "..." }`. Balasan dibaca dari `output` (juga mendukung `text`, array, dan streaming).
- Syarat di n8n: workflow **aktif**, node Chat Trigger memakai URL produksi, dan memori percakapan (jika dipakai) memakai `sessionId`.
- Uji dari terminal:
  ```bash
  curl -X POST "URL_WEBHOOK" -H "Content-Type: application/json" -d '{"action":"sendMessage","sessionId":"tes-12345678","chatInput":"halo"}'
  ```
- Dibatasi 40 pesan per 10 menit per alamat IP. Batas waktu tunggu 55 detik.

## Gambar
Semua gambar ada di `client/public/img/` (WebP, sudah dikecilkan). Foto kelas adalah ilustrasi (dibuat dengan AI), jadi diberi keterangan "ilustrasi" di situs.

## Laporan pendaftar bulanan
Panel **Laporan pendaftar bulanan** ada di `/admin` (di bawah panel kuota) dan hanya bisa diakses admin.
- **Isi:** semua pendaftar bulan itu, berstatus Lunas, Menunggu bayar, maupun Gagal. File berisi dua lembar: *Ringkasan* (total, pemasukan, rekap per program) dan *Pendaftar* (daftar lengkap).
- **Tetap tercatat:** laporan memakai catatan terpisah (`report_entries`), jadi tidak terpengaruh saat data di tabel admin diarsipkan atau dihapus. Data pendaftar yang sudah ada saat fitur ini dipasang ikut disalin, tetapi data yang sudah dihapus sebelumnya tidak bisa dipulihkan.
- **Hanya bisa dilihat lewat unduhan:** tidak ada tampilan isi laporan di layar, hanya tombol **Download .xlsx**.
- **Berpassword:** tiap laporan bulanan punya password sendiri. Klik **Atur/Ganti password** (bisa membuat password acak atau menerapkan satu password ke semua bulan). Password disimpan terenkripsi, tidak bisa ditampilkan lagi, dan file yang sudah diunduh tetap memakai password saat diunduh. Buka file dengan Excel, Numbers, atau LibreOffice.
- **Masa berlaku 3 bulan:** tersedia bulan berjalan dan dua bulan sebelumnya (menurut WIB). Laporan sebuah bulan dihapus permanen pada tanggal 1 bulan ke-3 sesudahnya pukul 00.00 WIB, contoh: laporan September dihapus 1 Desember, dan sejak itu tidak bisa diunduh lagi. Panel menampilkan tanggal hapus tiap laporan. Lama masa berlaku diatur di `REPORT_MONTHS` pada `server/time.js`.
- **Penghapusan otomatis:** dijalankan Vercel Cron setiap hari (`vercel.json`, sekitar 00.05 WIB) dan juga setiap ada pendaftaran baru atau admin membuka panel laporan. Unduhan laporan kedaluwarsa selalu ditolak walau penghapusannya belum berjalan.
- **Catatan:** password laporan dienkripsi memakai kunci dari `JWT_SECRET`. Jika `JWT_SECRET` diganti, password laporan yang tersimpan tidak bisa dibaca dan harus diatur ulang.

## Arsip di halaman admin
- Tab **Arsip** menampung data yang diarsipkan. Di sana data bisa **dipulihkan** atau **dihapus permanen**. Data aktif harus diarsipkan dulu sebelum dihapus.
- **Menunggu bayar menjadi Gagal** setelah 24 jam tanpa pembayaran (pesanan itu tidak bisa dibayar lagi).
- Arsip otomatis (sejak status terakhir berubah): Gagal 12 jam, Lunas 30 hari. Angkanya ada di `server/repo.js`.
- Pendaftar di arsip yang ternyata membayar kembali ke daftar aktif.

## Menerbitkan ke Vercel
1. Unggah folder ke GitHub (`.env` dan `data.db` tidak ikut, sudah ada di `.gitignore`).
2. Di Vercel: Add New Project, pilih repositori. **Application Preset: Other**, Root Directory `./`. Pengaturan build ada di `vercel.json`.
3. Hubungkan database Postgres (Neon) lewat Infrastructure > Storage. `DATABASE_URL` terisi otomatis.
4. Isi Environment Variables: `ADMIN_USER`, `ADMIN_PASS` (minimal 10 karakter), `JWT_SECRET` (minimal 32 karakter), `PRICE`. Variabel `MIDTRANS_*` tidak dipakai lagi dan boleh dihapus.
5. Deploy (Redeploy setelah variabel berubah), lalu cek `/api/health` dan `/admin`.

Setelah itu setiap `git push` ke branch `main` menerbitkan ulang otomatis. Data pendaftar di database Neon tidak terhapus saat deploy ulang.
