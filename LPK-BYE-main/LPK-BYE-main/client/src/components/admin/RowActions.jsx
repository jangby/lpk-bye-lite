// Aksi per baris
import { useState } from 'react';

const BTN = 'rounded-lg px-3 py-1.5 text-xs font-medium transition duration-200';

export default function RowActions({ row, archived, onArchive, onRestore, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  if (!archived) {
    return (
      <button onClick={() => onArchive(row)} className={`${BTN} bg-white text-ink ring-1 ring-line hover:ring-plum/40`}>
        Arsipkan
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-700">Hapus permanen?</span>
        <button onClick={() => onDelete(row)} className={`${BTN} bg-red-600 text-white hover:bg-red-700`}>Ya, hapus</button>
        <button onClick={() => setConfirming(false)} className={`${BTN} text-ink/70 hover:text-ink`}>Batal</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onRestore(row)} className={`${BTN} bg-rose-soft text-rose-dark ring-1 ring-rose/20 hover:bg-rose hover:text-white`}>
        Pulihkan
      </button>
      <button onClick={() => setConfirming(true)} className={`${BTN} text-red-700 ring-1 ring-red-200 hover:bg-red-50`}>
        Hapus
      </button>
    </div>
  );
}
