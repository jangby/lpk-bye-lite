import { rupiah } from '../../api.js';
import { UsersIcon, CheckIcon, WaIcon, WalletIcon } from '../ui/Icons.jsx';

// Kartu ringkasan (angka dari pages/Admin.jsx)
export default function StatCards({ stats }) {
  const cards = [
    { label: 'Total pendaftar', value: stats.total, icon: <UsersIcon className="h-6 w-6" /> },
    { label: 'Sudah bayar', value: stats.paid, icon: <CheckIcon /> },
    { label: 'Belum dihubungi', value: stats.todo, icon: <WaIcon className="h-6 w-6" />, hot: stats.todo > 0 },
    { label: 'Pemasukan', value: rupiah(stats.revenue), icon: <WalletIcon className="h-6 w-6" /> },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <div
          key={c.label}
          style={{ animationDelay: `${i * 80}ms` }}
          className={`relative animate-fade-up overflow-hidden rounded-2xl p-5 shadow-lg shadow-plum/10 ring-1 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/15 ${c.hot ? 'bg-gradient-to-br from-rose-soft to-white ring-pink/40' : 'bg-white ring-line'}`}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink to-plum-light" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-ink/60">{c.label}</div>
              <div className="mt-1 font-display text-2xl font-semibold">{c.value}</div>
            </div>
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${c.hot ? 'bg-gradient-to-br from-rose to-pink shadow-pink/30' : 'bg-gradient-to-br from-plum-light to-plum shadow-plum/25'}`}
            >
              {c.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
