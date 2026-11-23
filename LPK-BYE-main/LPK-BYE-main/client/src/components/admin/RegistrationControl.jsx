import { useEffect, useState } from 'react';
import Select from '../ui/Select.jsx';

// Panel kontrol: buka/tutup pendaftaran dan batas peserta per program (daftar program dari server)
const INPUT =
  'w-32 rounded-xl border border-line bg-white px-4 py-2.5 outline-none transition focus:border-rose focus:ring-4 focus:ring-rose/15 focus-visible:outline-none';

export default function RegistrationControl({ settings, onChange }) {
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState('');
  const [chosen, setChosen] = useState('');

  const programs = settings.programs;
  const options = programs.map((p) => ({ value: p.code, label: p.name }));
  const current = programs.find((p) => p.code === chosen);

  async function run(patch) {
    setBusy(true);
    try {
      await onChange(patch);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl bg-white p-6 pl-8 shadow-lg shadow-plum/10 ring-1 ring-line">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-pink to-plum-light" />

      {/* Buka/tutup */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-ink/50">Status pendaftaran</h2>
      <div className="mt-3 flex items-center gap-4">
        <button
          role="switch"
          aria-checked={settings.open}
          aria-label="Buka atau tutup pendaftaran"
          disabled={busy}
          onClick={() => run({ open: !settings.open })}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-all duration-300 disabled:opacity-60 ${settings.open ? 'bg-emerald-600 shadow-[0_0_16px_rgba(5,150,105,.45)]' : 'bg-ink/25'}`}
        >
          <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all duration-300 ${settings.open ? 'left-7' : 'left-1'}`} />
        </button>
        <div>
          <div className="font-display text-xl font-semibold">
            {settings.status === 'full' ? 'Dibuka, semua program penuh' : settings.open ? 'Dibuka' : 'Ditutup'}
          </div>
          <div className="text-sm text-ink/60">
            {settings.status === 'closed' && 'Pengunjung melihat pesan pendaftaran ditutup.'}
            {settings.status === 'full' && 'Pengunjung melihat pesan kuota penuh.'}
            {settings.status === 'open' && 'Pengunjung bisa mendaftar ke program yang masih ada kursi.'}
          </div>
        </div>
      </div>

      {/* Pilih program lalu atur batasnya */}
      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-ink/50">Batas jumlah peserta per program</h2>
      <p className="mt-1 text-sm text-ink/60">Pilih satu program, lalu atur batas pesertanya. Tiap program bisa punya batas berbeda.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="min-w-[16rem] flex-1">
          <Select label="Pilih program" value={pick} onChange={setPick} options={options} placeholder="Pilih program" />
        </div>
        <button
          disabled={!pick}
          onClick={() => setChosen(pick)}
          className="rounded-lg bg-gradient-to-r from-plum to-plum-light px-7 py-3.5 font-semibold text-white shadow-md shadow-plum/25 transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-mist disabled:bg-none disabled:text-ink/30 disabled:shadow-none"
        >
          Lanjutkan
        </button>
      </div>

      {current && <Editor key={current.code} program={current} busy={busy} onSave={(n) => run({ quotas: { [current.code]: n } })} onClose={() => setChosen('')} />}

      {/* Ringkasan semua program */}
      <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
        {programs.map((p) => (
          <li key={p.code} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="font-medium leading-snug">{p.name}</div>
              <div className="text-sm text-ink/60">
                {p.quota > 0 ? `Batas ${p.quota}, terisi ${p.taken}` : `Tanpa batas, terisi ${p.taken}`}
                {p.full && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200">Penuh</span>}
              </div>
            </div>
            <button
              onClick={() => {
                setPick(p.code);
                setChosen(p.code);
              }}
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-plum-light ring-1 ring-plum-light/30 transition hover:bg-lilac"
            >
              Atur
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink/45">Peserta lunas yang sudah diarsipkan tetap dihitung; hapus dari arsip untuk melepas kursinya.</p>
    </section>
  );
}

// Pengaturan batas untuk satu program
function Editor({ program, busy, onSave, onClose }) {
  const saved = program.quota > 0 ? String(program.quota) : '';
  const [n, setN] = useState(saved);
  useEffect(() => setN(saved), [saved]);

  const valid = /^[1-9]\d*$/.test(n) && Number(n) <= 100000;
  const pct = program.quota > 0 ? Math.min(100, Math.round((program.taken / program.quota) * 100)) : 0;

  return (
    <div className="mt-5 animate-fade-up rounded-xl border border-line bg-mist/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug">{program.name}</h3>
        <button onClick={onClose} className="text-sm text-ink/50 transition hover:text-ink">Tutup</button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium" htmlFor="batas-peserta">Batas peserta</label>
        <input
          id="batas-peserta"
          type="number"
          min="1"
          max="100000"
          inputMode="numeric"
          value={n}
          placeholder="Jumlah"
          onChange={(e) => setN(e.target.value)}
          className={INPUT}
        />
        <button
          disabled={!valid || n === saved || busy}
          onClick={() => onSave(Number(n))}
          className="rounded-xl bg-gradient-to-r from-plum to-plum-light px-6 py-2.5 font-semibold text-white shadow-md shadow-plum/25 transition duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Simpan batas
        </button>
        {program.quota > 0 && (
          <button
            disabled={busy}
            onClick={() => onSave(0)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink/70 ring-1 ring-line transition hover:bg-white disabled:opacity-40"
          >
            Hapus batas
          </button>
        )}
      </div>

      <div className="mt-4 text-sm">
        {program.quota > 0 ? (
          <>
            <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-line">
              <div className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-pink to-plum-light'}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-ink/70">Terisi {program.taken} dari {program.quota} ({program.paid} lunas, {program.pending} menunggu bayar)</p>
            {program.taken > program.quota && <p className="mt-1 text-amber-700">Batas lebih kecil dari jumlah peserta saat ini, jadi pendaftaran program ini tertutup.</p>}
          </>
        ) : (
          <p className="text-ink/70">Terisi {program.taken} ({program.paid} lunas, {program.pending} menunggu bayar), tanpa batas.</p>
        )}
      </div>
    </div>
  );
}
