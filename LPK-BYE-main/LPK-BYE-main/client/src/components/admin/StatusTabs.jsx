// Tab filter (daftar di TABS)
export const TABS = [
  { key: 'paid', label: 'Lunas' },
  { key: 'pending', label: 'Menunggu bayar' },
  { key: 'failed', label: 'Gagal' },
  { key: '', label: 'Semua' },
  { key: 'archive', label: 'Arsip', right: true },
];

export default function StatusTabs({ value, onChange, counts }) {
  return (
    <nav className="mt-8 flex flex-wrap gap-2" aria-label="Filter status">
      {TABS.map((t) => {
        const on = value === t.key;
        return (
          <button
            key={t.label}
            onClick={() => onChange(t.key)}
            aria-pressed={on}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition duration-200 ${t.right ? 'sm:ml-auto' : ''} ${on ? 'bg-gradient-to-r from-plum to-plum-light text-white shadow-lg shadow-plum/25' : 'bg-white text-ink ring-1 ring-line hover:-translate-y-0.5 hover:ring-plum-light/40'}`}
          >
            {t.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${on ? 'bg-white/20 text-white' : 'bg-lilac text-plum-light'}`}>{counts[t.key]}</span>
          </button>
        );
      })}
    </nav>
  );
}
