// Keterangan di bawah tab
import { formatHours } from '../../utils/archive.js';

export default function ArchiveHint({ archiveView, rules }) {
  return (
    <p className="mt-4 text-sm text-ink/60">
      {archiveView
        ? 'Data di arsip bisa dipulihkan atau dihapus permanen.'
        : `Menunggu bayar jadi Gagal setelah ${formatHours(rules.pendingExpire)}. Arsip otomatis: Gagal ${formatHours(rules.failed)}, Lunas ${formatHours(rules.paid)}.`}
    </p>
  );
}
