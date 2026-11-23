// Tanggal database: UTC tanpa "Z"
export const parseDbDate = (s) => new Date(String(s).replace(' ', 'T') + 'Z');

// 12 -> "12 jam", 720 -> "30 hari"
export const formatHours = (h) => (h < 48 ? `${h} jam` : `${Math.round(h / 24)} hari`);

// Sisa waktu: menunggu bayar menjadi gagal, status lain masuk arsip
export function timeLeftText(row, rules) {
  if (!row.status_changed_at) return '';
  const pending = row.status === 'pending';
  const hours = pending ? rules.pendingExpire : rules[row.status] ?? rules.default;
  const ms = parseDbDate(row.status_changed_at).getTime() + hours * 3600 * 1000 - Date.now();
  const label = pending ? 'jadi gagal' : 'arsip otomatis';
  if (ms <= 0) return pending ? 'segera jadi gagal' : 'segera diarsipkan';
  const h = Math.floor(ms / 3600000);
  if (h >= 48) return `${label} ${Math.floor(h / 24)} hari lagi`;
  if (h >= 1) return `${label} ${h} jam lagi`;
  return `${label} ${Math.max(1, Math.ceil(ms / 60000))} menit lagi`;
}
