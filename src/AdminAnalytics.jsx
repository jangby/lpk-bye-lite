import { useEffect, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, Clock3, Eye, Globe2,
  Monitor, RefreshCw, ShieldCheck, Smartphone, Tablet, TrendingUp, Users
} from 'lucide-react';
import { adminApi } from './api.js';

const numberFormat = new Intl.NumberFormat('id-ID');
const pageLabels = { '/': 'Beranda', '/pendaftaran': 'Pendaftaran', '/peserta': 'Portal peserta' };
const sourceLabels = { direct: 'Langsung / bookmark', internal: 'Navigasi internal', other: 'Lainnya' };
const ranges = [7, 30, 90];

function formatDate(value, options = { day: 'numeric', month: 'short' }) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', options) : '-';
}

function getChange(value, previous) {
  if (!previous) return value ? null : 0;
  return Math.round(((value - previous) / previous) * 100);
}

function MetricCard({ label, value, previous, Icon, detail }) {
  const change = getChange(value, previous);
  const increased = change !== null && change >= 0;
  return <article className="card p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-navy">{numberFormat.format(value || 0)}</p>
      </div>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-wine-50 text-wine-600"><Icon size={19}/></span>
    </div>
    <div className="mt-4 flex min-h-5 items-center justify-between gap-2">
      <span className="text-[11px] text-slate-400">{detail}</span>
      {change === null ? <span className="text-[10px] text-slate-400">Belum ada pembanding</span> : (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${increased ? 'text-emerald-700' : 'text-rose-700'}`}>
          {increased ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="mt-1 text-[10px] text-slate-400">dibanding periode sebelumnya</p>
  </article>;
}

function TrendChart({ daily }) {
  const width = 760;
  const height = 220;
  const left = 20;
  const right = 740;
  const top = 16;
  const bottom = 190;
  const maxValue = Math.max(1, ...daily.flatMap((day) => [day.page_views, day.visitors]));
  const points = (field) => daily.map((day, index) => {
    const x = daily.length > 1 ? left + (index / (daily.length - 1)) * (right - left) : (left + right) / 2;
    const y = bottom - (day[field] / maxValue) * (bottom - top);
    return `${x},${y}`;
  }).join(' ');
  const ticks = [...new Set([0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(fraction * (daily.length - 1))))];
  return <div>
    <div className="flex flex-wrap gap-4 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-wine-600"/>Pengunjung unik</span>
      <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-pink"/>Tampilan halaman</span>
    </div>
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-56 w-full overflow-visible" role="img" aria-label="Grafik pengunjung unik dan tampilan halaman per hari">
      {[0, 1, 2, 3].map((line) => {
        const y = top + (line / 3) * (bottom - top);
        return <line key={line} x1={left} x2={right} y1={y} y2={y} stroke="#eee8f3" strokeDasharray="4 5"/>;
      })}
      <polyline points={points('page_views')} fill="none" stroke="#E8458A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <polyline points={points('visitors')} fill="none" stroke="#664796" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
    <div className="flex justify-between px-1 text-[10px] text-slate-400">
      {ticks.map((index) => <span key={index}>{formatDate(daily[index]?.date)}</span>)}
    </div>
  </div>;
}

function RankedBars({ items, valueKey, nameFor, emptyText }) {
  if (!items.length) return <p className="py-7 text-center text-xs text-slate-400">{emptyText}</p>;
  const maxValue = Math.max(1, ...items.map((item) => item[valueKey]));
  return <div className="mt-5 space-y-4">
    {items.map((item) => (
      <div key={item.path || item.source}>
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="min-w-0 truncate font-medium text-slate-600">{nameFor(item)}</span>
          <span className="shrink-0 font-semibold text-navy">{numberFormat.format(item[valueKey])}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-wine-600 to-pink" style={{ width: `${Math.max(2, (item[valueKey] / maxValue) * 100)}%` }}/>
        </div>
      </div>
    ))}
  </div>;
}

function DeviceBreakdown({ devices }) {
  if (!devices.length) return <p className="py-7 text-center text-xs text-slate-400">Belum ada data perangkat.</p>;
  const maxValue = Math.max(1, ...devices.map((item) => item.page_views));
  const deviceInfo = {
    mobile: ['Ponsel', Smartphone],
    tablet: ['Tablet', Tablet],
    desktop: ['Desktop', Monitor],
    unknown: ['Lainnya', Monitor]
  };
  return <div className="mt-4 space-y-4">
    {devices.map((item) => {
      const [label, Icon] = deviceInfo[item.device] || deviceInfo.unknown;
      return <div key={item.device}>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-2 font-medium text-slate-600"><Icon size={15} className="text-wine-600"/>{label}</span>
          <span className="font-semibold text-navy">{numberFormat.format(item.page_views)} <span className="font-normal text-slate-400">kunjungan</span></span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-wine-600" style={{ width: `${Math.max(2, (item.page_views / maxValue) * 100)}%` }}/>
        </div>
        <p className="mt-1 text-right text-[10px] text-slate-400">{numberFormat.format(item.visitors)} pengunjung unik</p>
      </div>;
    })}
  </div>;
}

function HourlyActivity({ hours }) {
  const maxValue = Math.max(1, ...hours.map((item) => item.page_views));
  return <div className="mt-5">
    <div className="grid h-28 grid-cols-[repeat(24,minmax(0,1fr))] items-end gap-1">
      {hours.map((item) => (
        <div key={item.hour} className="flex h-full items-end" title={`${String(item.hour).padStart(2, '0')}:00 WIB · ${numberFormat.format(item.page_views)} tampilan`}>
          <div className="w-full rounded-t-sm bg-gradient-to-t from-wine-600 to-pink/70" style={{ height: `${item.page_views ? Math.max(6, (item.page_views / maxValue) * 100) : 2}%` }}/>
        </div>
      ))}
    </div>
    <div className="mt-2 flex justify-between text-[10px] text-slate-400"><span>00.00</span><span>06.00</span><span>12.00</span><span>18.00</span><span>24.00 WIB</span></div>
  </div>;
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    adminApi(`/analytics?days=${days}`)
      .then(({ data: result }) => { if (active) setData(result); })
      .catch((cause) => { if (active) setError(cause.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [days, refresh]);

  const period = data?.period;
  const summary = data?.summary;
  const previous = data?.previous;
  const peakHour = data?.insights?.busiest_hour;
  const peakDay = data?.insights?.busiest_day;

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow">ANALITIK WEBSITE</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy md:text-[38px]">Pengunjung &amp; perilaku</h1>
        <p className="mt-2 text-sm text-slate-500">Pahami trafik, halaman populer, sumber kunjungan, dan pendaftaran.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {ranges.map((range) => (
            <button key={range} type="button" onClick={() => setDays(range)} aria-pressed={days === range}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${days === range ? 'bg-wine-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              {range} hari
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setRefresh((value) => value + 1)} aria-label="Muat ulang analitik" title="Muat ulang"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-wine-100 hover:text-wine-600">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>
    </div>

    {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    {loading && !data && <div className="card p-8 text-sm text-slate-500">Memuat analitik website...</div>}

    {data && <>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <CalendarDays size={15} className="text-wine-600"/>
        <span>{formatDate(period.from, { day: 'numeric', month: 'long', year: 'numeric' })} – {formatDate(period.to, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        {loading && <span className="text-wine-600">Memperbarui...</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pengunjung unik" value={summary.unique_visitors} previous={previous.unique_visitors} Icon={Users} detail="ID anonim per browser"/>
        <MetricCard label="Tampilan halaman" value={summary.page_views} previous={previous.page_views} Icon={Eye} detail="Semua halaman publik"/>
        <MetricCard label="Sesi kunjungan" value={summary.sessions} previous={previous.sessions} Icon={Globe2} detail={`${summary.pages_per_session} halaman per sesi`}/>
        <MetricCard label="Pendaftar baru" value={summary.registrations} previous={previous.registrations} Icon={BarChart3} detail={`${summary.registration_rate}% dari pengunjung unik`}/>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,1fr)]">
        <section className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-bold text-navy">Tren kunjungan</h2><p className="mt-1 text-xs text-slate-400">Pengunjung unik dan tampilan halaman harian</p></div>
            <TrendingUp size={19} className="text-wine-600"/>
          </div>
          {summary.page_views ? <TrendChart daily={data.daily}/> : <p className="py-16 text-center text-sm text-slate-400">Belum ada kunjungan pada periode ini.</p>}
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-bold text-navy">Halaman populer</h2><p className="mt-1 text-xs text-slate-400">Berdasarkan jumlah tampilan halaman</p></div>
            <Eye size={18} className="text-wine-600"/>
          </div>
          <RankedBars items={data.top_pages} valueKey="page_views" nameFor={(item) => pageLabels[item.path] || item.path} emptyText="Belum ada halaman yang dikunjungi."/>
          {data.top_pages.length > 0 && <p className="mt-4 text-[10px] text-slate-400">Jumlah pengunjung unik per halaman dihitung terpisah dari tampilan.</p>}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <section className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-bold text-navy">Sumber kunjungan</h2><p className="mt-1 text-xs text-slate-400">Domain perujuk dan kunjungan langsung</p></div>
            <Globe2 size={18} className="text-wine-600"/>
          </div>
          <RankedBars items={data.top_sources} valueKey="page_views" nameFor={(item) => sourceLabels[item.source] || item.source} emptyText="Belum ada data sumber kunjungan."/>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-bold text-navy">Perangkat pengunjung</h2><p className="mt-1 text-xs text-slate-400">Kategori perangkat tanpa menyimpan user-agent</p></div>
            <Monitor size={18} className="text-wine-600"/>
          </div>
          <DeviceBreakdown devices={data.devices}/>
        </section>

        <section className="card p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="font-bold text-navy">Waktu kunjungan</h2><p className="mt-1 text-xs text-slate-400">Distribusi tampilan berdasarkan jam (WIB)</p></div>
            <Clock3 size={18} className="text-wine-600"/>
          </div>
          {summary.page_views ? <HourlyActivity hours={data.hours}/> : <p className="py-10 text-center text-xs text-slate-400">Belum ada data waktu kunjungan.</p>}
          <div className="mt-5 rounded-xl bg-wine-50 p-3 text-xs leading-5 text-slate-600">
            <p><strong className="text-navy">Jam ramai:</strong> {peakHour.page_views ? `${String(peakHour.hour).padStart(2, '0')}.00–${String((peakHour.hour + 1) % 24).padStart(2, '0')}.00 WIB` : 'Belum ada data'}</p>
            <p><strong className="text-navy">Hari ramai:</strong> {peakDay?.page_views ? `${formatDate(peakDay.date, { day: 'numeric', month: 'long' })} · ${numberFormat.format(peakDay.page_views)} tampilan` : 'Belum ada data'}</p>
          </div>
        </section>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] leading-5 text-slate-500">
        <span aria-hidden="true" className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-600"><ShieldCheck size={14}/></span>
        <p>Analitik menggunakan ID acak yang di-hash, mencatat kategori perangkat, domain perujuk, dan jenis halaman saja. Alamat IP, data formulir, query URL, serta user-agent lengkap tidak disimpan.</p>
      </div>
    </>}
  </div>;
}
