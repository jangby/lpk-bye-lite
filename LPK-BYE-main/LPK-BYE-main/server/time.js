// Waktu: format UTC di database dan perhitungan bulan menurut WIB (UTC+7)
export const REPORT_MONTHS = 3; // lama laporan tersedia (bulan, termasuk bulan berjalan)

export const stamp = (d = new Date()) => d.toISOString().slice(0, 19).replace('T', ' ');
export const hoursAgo = (h) => stamp(new Date(Date.now() - h * 3600 * 1000));

const WIB_MS = 7 * 3600 * 1000;
const pad = (n) => String(n).padStart(2, '0');

export const parseStamp = (s) => new Date(String(s).replace(' ', 'T') + 'Z');
export const isMonth = (s) => /^\d{4}-(0[1-9]|1[0-2])$/.test(String(s));

// Bulan "YYYY-MM" menurut WIB
export function wibMonth(date) {
  const d = new Date(date.getTime() + WIB_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}
export const monthOfStamp = (s) => wibMonth(parseStamp(s));

// Teks waktu WIB "YYYY-MM-DD HH:MM" dari waktu database
export function wibText(s) {
  if (!s) return '';
  const d = new Date(parseStamp(s).getTime() + WIB_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// Bulan laporan yang masih tersedia (terbaru dulu): bulan berjalan dan dua bulan sebelumnya
export function reportWindow(now = new Date()) {
  const d = new Date(now.getTime() + WIB_MS);
  let y = d.getUTCFullYear();
  let m = d.getUTCMonth();
  const out = [];
  for (let i = 0; i < REPORT_MONTHS; i += 1) {
    out.push(`${y}-${pad(m + 1)}`);
    m -= 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
  }
  return out;
}

// Tanggal laporan sebuah bulan dihapus permanen: tanggal 1 bulan ke-3 sesudahnya
export function deleteOn(month) {
  let [y, m] = month.split('-').map(Number);
  m += REPORT_MONTHS;
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${pad(m)}-01`;
}
