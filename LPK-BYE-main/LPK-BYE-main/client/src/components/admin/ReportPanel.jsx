import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { api, download } from '../../api.js';
import { DownloadIcon, KeyIcon, SheetIcon, CloseIcon } from '../ui/Icons.jsx';

// Panel "Laporan pendaftar bulanan": unduh spreadsheet berpassword (3 bulan terakhir)
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const label = (month) => `${BULAN[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`;
const dateLabel = (d) => `${Number(d.slice(8))} ${BULAN[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;

export default function ReportPanel({ token, onUnauthorized }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');
  const [dialog, setDialog] = useState(null);

  const fail = useCallback(
    (e) => {
      if (e.status === 401) onUnauthorized();
      else setError(e.message);
    },
    [onUnauthorized]
  );

  const load = useCallback(async () => {
    try {
      setData(await api('/admin/reports', { token }));
    } catch (e) {
      fail(e);
    }
  }, [token, fail]);

  useEffect(() => {
    load();
  }, [load]);

  async function getFile(month) {
    setBusy(month);
    setError('');
    setNotice('');
    try {
      await download(`/admin/reports/${month}/download`, token);
      setNotice(`Laporan ${label(month)} terunduh. Buka file dengan password laporan bulan ini.`);
    } catch (e) {
      fail(e);
      await load();
    } finally {
      setBusy('');
    }
  }

  async function savePassword(month, password, applyAll, thenDownload) {
    await api(`/admin/reports/${month}/password`, { method: 'PUT', body: { password, applyAll }, token });
    setDialog(null);
    await load();
    setNotice(`Password laporan ${applyAll ? 'semua bulan' : label(month)} disimpan. Catat password ini, tidak bisa ditampilkan lagi.`);
    if (thenDownload) await getFile(month);
  }

  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl bg-white p-6 pl-8 shadow-lg shadow-plum/10 ring-1 ring-line">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-plum-light to-pink" />

      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-plum-light to-plum text-white shadow-md shadow-plum/25">
          <SheetIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight">Laporan pendaftar bulanan</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink/65">
            Laporan hanya bisa dilihat dengan mengunduh file spreadsheet. Hanya {data?.keepMonths ?? 3} bulan terakhir yang tersedia; laporan bulan lama dihapus
            permanen otomatis dan tidak bisa diunduh lagi.
          </p>
        </div>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 ring-1 ring-emerald-200">{notice}</p>}

      <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
        {!data && <li className="px-5 py-6 text-sm text-ink/55">Memuat laporan…</li>}
        {data?.months.map((m, i) => (
          <li key={m.month} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-semibold">{label(m.month)}</span>
                {i === 0 && <span className="rounded-full bg-lilac px-2 py-0.5 text-xs font-semibold text-plum-light">Bulan ini</span>}
              </div>
              <div className="mt-1 text-sm text-ink/70">
                Total {m.total}, lunas {m.paid}, menunggu bayar {m.pending}, gagal {m.failed}
              </div>
              <div className="mt-1 text-xs text-ink/50">Dihapus permanen otomatis pada {dateLabel(m.deleteOn)}</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${m.hasPassword ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-amber-200'}`}>
                {m.hasPassword ? 'Password diatur' : 'Password belum diatur'}
              </span>
              <button
                onClick={() => setDialog({ month: m.month, thenDownload: false })}
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-plum ring-1 ring-plum-light/30 transition hover:bg-lilac"
              >
                <KeyIcon className="h-4 w-4" />
                {m.hasPassword ? 'Ganti password' : 'Atur password'}
              </button>
              <button
                disabled={m.total === 0 || Boolean(busy)}
                onClick={() => (m.hasPassword ? getFile(m.month) : setDialog({ month: m.month, thenDownload: true }))}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-plum to-plum-light px-4 py-2 text-sm font-semibold text-white shadow-md shadow-plum/25 transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-mist disabled:bg-none disabled:text-ink/30 disabled:shadow-none"
              >
                <DownloadIcon className="h-4 w-4" />
                {busy === m.month ? 'Menyiapkan…' : 'Download .xlsx'}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {dialog && <PasswordDialog month={dialog.month} thenDownload={dialog.thenDownload} onSave={savePassword} onClose={() => setDialog(null)} />}
    </section>
  );
}

// Jendela atur atau ganti password laporan
function PasswordDialog({ month, thenDownload, onSave, onClose }) {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [applyAll, setApplyAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Password acak 14 karakter tanpa huruf yang mudah tertukar
  function generate() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = crypto.getRandomValues(new Uint32Array(14));
    setPw(Array.from(bytes, (b) => chars[b % chars.length]).join(''));
    setShow(true);
    setCopied(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(pw);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (pw.length < 6) return setErr('Password minimal 6 karakter.');
    setSaving(true);
    setErr('');
    try {
      await onSave(month, pw, applyAll, thenDownload);
    } catch (e2) {
      setErr(e2.message);
      setSaving(false);
    }
    return undefined;
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Password laporan" className="fixed inset-0 z-50 flex animate-fade-up items-center justify-center overflow-y-auto bg-plum-deep/70 p-5 backdrop-blur-sm">
      <form onSubmit={submit} className="my-auto w-full max-w-md animate-pop rounded-2xl bg-white p-7 text-ink shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">Password laporan {label(month)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">
              Dipakai untuk membuka file laporan setiap kali diunduh. File yang sudah pernah diunduh tetap memakai password lamanya. Password tidak bisa
              ditampilkan lagi setelah disimpan, jadi catat di tempat aman.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-full p-1.5 text-ink/50 transition hover:bg-lilac hover:text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 block text-sm font-medium" htmlFor="pw-laporan">Password baru</label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="pw-laporan"
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            minLength={6}
            maxLength={64}
            autoComplete="new-password"
            className="min-w-0 flex-1 rounded-xl border border-line bg-white px-4 py-2.5 outline-none transition focus:border-rose focus:ring-4 focus:ring-rose/15 focus-visible:outline-none"
          />
          <button type="button" onClick={() => setShow(!show)} className="rounded-xl px-3 text-sm font-medium text-plum ring-1 ring-line transition hover:bg-lilac">
            {show ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <button type="button" onClick={generate} className="font-medium text-rose-dark underline underline-offset-2">Buat password acak</button>
          {pw && show && (
            <button type="button" onClick={copy} className="font-medium text-plum-light underline underline-offset-2">
              {copied ? 'Tersalin' : 'Salin'}
            </button>
          )}
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)} className="mt-0.5 h-4 w-4 accent-plum-light" />
          Terapkan password yang sama ke semua laporan yang tersedia
        </label>

        {err && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">{err}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 font-medium text-ink/70 ring-1 ring-line transition hover:bg-mist">Batal</button>
          <button
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-plum to-plum-light px-6 py-2.5 font-semibold text-white shadow-md shadow-plum/25 transition duration-200 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? 'Menyimpan…' : thenDownload ? 'Simpan dan unduh' : 'Simpan password'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
