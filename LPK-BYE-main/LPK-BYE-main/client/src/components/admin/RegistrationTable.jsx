// Tabel pendaftar
import { rupiah } from '../../api.js';
import { parseDbDate, timeLeftText } from '../../utils/archive.js';
import { WaIcon } from '../ui/Icons.jsx';
import RowActions from './RowActions.jsx';

const BADGE = {
  paid: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-800 ring-amber-200',
  failed: 'bg-red-50 text-red-800 ring-red-200',
};
const LABEL = { paid: 'Lunas', pending: 'Menunggu', failed: 'Gagal' };

// Nama program dari daftar server (kode lama atau yang sudah dihapus tampil apa adanya)
const LEGACY = { 'kerja-jepang': 'Program Kerja ke Jepang' };
const nameOf = (programs, code) => programs.find((p) => p.code === code)?.name ?? LEGACY[code] ?? code;
const shortOf = (programs, code) => programs.find((p) => p.code === code)?.short ?? LEGACY[code] ?? code;

// Pesan awal WhatsApp
const waLink = (r, programs) =>
  `https://wa.me/${r.phone}?text=${encodeURIComponent(
    `Halo ${r.name}, kami dari LPK BYE. Terima kasih sudah mendaftar ${r.program ? nameOf(programs, r.program) : 'pelatihan'}. Berikut informasi untuk Anda:`
  )}`;

// Avatar inisial berwarna
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
const TONES = ['bg-plum', 'bg-rose', 'bg-plum-light', 'bg-rose-dark'];
const tone = (name) => TONES[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % TONES.length];

export default function RegistrationTable({ rows, archived, rules, programs = [], onContacted, onArchive, onRestore, onDelete }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-lg shadow-plum/10 ring-1 ring-line">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead className="border-b border-line bg-gradient-to-r from-lilac to-mist text-xs uppercase tracking-wider text-ink/60">
          <tr>
            <th className="px-5 py-4 font-semibold">Nama</th>
            <th className="px-5 py-4 font-semibold">Email</th>
            <th className="px-5 py-4 font-semibold">No HP</th>
            <th className="px-5 py-4 font-semibold">Program</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 font-semibold">Daftar</th>
            <th className="px-5 py-4 font-semibold">Kontak</th>
            <th className="px-5 py-4 font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan="8" className="px-5 py-16 text-center text-ink/55">
                {archived ? 'Arsip masih kosong.' : 'Belum ada pendaftar di kategori ini.'}
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr
              key={r.id}
              style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
              className="animate-fade-up border-b border-line/70 transition-colors last:border-0 hover:bg-lilac/50"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${tone(r.name)}`}>
                    {initials(r.name)}
                  </span>
                  <span className="font-medium">{r.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-ink/80">{r.email}</td>
              <td className="px-5 py-4 text-ink/80">+{r.phone}</td>
              <td className="px-5 py-4">
                {r.program ? (
                  <span className="whitespace-nowrap rounded-lg bg-lilac px-2.5 py-1 text-xs font-medium text-plum-light">{shortOf(programs, r.program)}</span>
                ) : (
                  <span className="text-ink/40">-</span>
                )}
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${BADGE[r.status]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {LABEL[r.status]}
                </span>
                <span className="ml-2 text-xs text-ink/50">{rupiah(r.amount)}</span>
                <div className="mt-1 text-xs text-ink/45">
                  {archived
                    ? `diarsipkan ${parseDbDate(r.archived_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}`
                    : timeLeftText(r, rules)}
                </div>
              </td>
              <td className="px-5 py-4 text-ink/70">
                {parseDbDate(r.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </td>
              <td className="px-5 py-4">
                <a
                  href={waLink(r, programs)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onContacted(r)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-medium text-white shadow-md shadow-emerald-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  <WaIcon /> WhatsApp
                </a>
                {r.contacted ? <span className="ml-2 text-xs text-ink/50">sudah dihubungi</span> : null}
              </td>
              <td className="px-5 py-4">
                <RowActions row={r} archived={archived} onArchive={onArchive} onRestore={onRestore} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
