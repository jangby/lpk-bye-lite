import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, FileText,
  ShieldCheck, UploadCloud
} from 'lucide-react';
import { publicApi, submitPayment } from './api.js';
import { Logo } from './Landing.jsx';

const statusLabels = {
  pending: 'Menunggu verifikasi',
  verified: 'Terverifikasi',
  accepted: 'Diterima',
  rejected: 'Ditolak'
};
const paymentLabels = { pending: 'Menunggu verifikasi', approved: 'Terverifikasi', rejected: 'Ditolak' };
const paymentStyles = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700'
};

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  return value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-';
}

export default function ParticipantPortal() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentBusy, setPaymentBusy] = useState(false);

  async function loadPortal() {
    const { data: result } = await publicApi(`/portal/${encodeURIComponent(token)}`);
    setData(result);
  }

  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    setLoading(true);
    setAmount('');
    setReceipt(null);
    setPaymentError('');

    publicApi(`/portal/${encodeURIComponent(token)}`)
      .then(({ data: result }) => {
        if (!result?.participant || typeof result.participant.full_name !== 'string'
          || !result.training || !result.payment || !Array.isArray(result.payment.transactions)) {
          throw new Error('Data portal tidak lengkap. Silakan coba lagi atau hubungi admin LPK BYE.');
        }
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [token]);

  const paymentEnabled = Number(data?.payment.training_fee) > 0
    && ['verified', 'accepted'].includes(data?.participant.status);

  async function selectReceipt(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      setPaymentError('Ukuran bukti maksimal 2,5 MB.');
      event.target.value = '';
      setReceipt(null);
      return;
    }
    setPaymentError('');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Bukti pembayaran gagal dibaca.'));
        reader.readAsDataURL(file);
      });
      setReceipt({ name: file.name, mimeType: file.type || 'application/octet-stream', base64 });
    } catch (readError) {
      setPaymentError(readError.message);
    }
  }

  async function handlePayment(event) {
    event.preventDefault();
    if (!data || !receipt) return;
    setPaymentBusy(true);
    setPaymentError('');
    try {
      await submitPayment({
        registration_code: data.participant.registration_code,
        portal_token: token,
        amount: Number(amount),
        receipt
      });
      setAmount('');
      setReceipt(null);
      await loadPortal();
    } catch (submitError) {
      setPaymentError(submitError.message);
    } finally {
      setPaymentBusy(false);
    }
  }

  return <div className="min-h-screen bg-[#f7f8fa]">
    <header className="border-b border-slate-100 bg-white">
      <div className="container-page flex h-[68px] items-center justify-between">
        <Logo/>
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-wine-600 sm:text-sm"><ArrowLeft size={16}/> Beranda</Link>
      </div>
    </header>

    <main className="container-page max-w-5xl py-6 sm:py-10">
      {loading ? <div className="card p-8 text-center text-sm text-slate-500">Memuat informasi peserta...</div>
        : error ? <div className="card mx-auto max-w-xl p-8 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-600"><ShieldCheck/></div><h1 className="mt-4 text-xl font-bold text-navy">Portal tidak tersedia</h1><p className="mt-2 text-sm leading-6 text-slate-500">{error}</p><p className="mt-4 text-xs text-slate-400">Pastikan Anda menggunakan tautan pribadi terbaru dari LPK BYE.</p><Link to="/" className="btn-primary mt-6">Kembali ke beranda</Link></div>
          : <PortalContent
            data={data}
            paymentEnabled={paymentEnabled}
            amount={amount}
            receipt={receipt}
            paymentError={paymentError}
            paymentBusy={paymentBusy}
            onAmountChange={setAmount}
            onReceiptChange={selectReceipt}
            onSubmitPayment={handlePayment}
          />}
    </main>

    <footer className="container-page pb-8 text-center text-xs text-slate-400">© 2026 LPK BYE · Informasi ini hanya untuk peserta terkait.</footer>
  </div>;
}

function PortalContent({ data, paymentEnabled, amount, receipt, paymentError, paymentBusy, onAmountChange, onReceiptChange, onSubmitPayment }) {
  const { participant, training, payment } = data;
  const paidPercent = payment.training_fee > 0
    ? Math.min(100, Math.round(payment.paid_total / payment.training_fee * 100))
    : 0;
  const initials = participant.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return <>
    <section className="overflow-hidden rounded-2xl bg-navy text-white shadow-card">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-8">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-lg font-bold">{initials}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/55">Portal peserta LPK BYE</p>
          <h1 className="mt-1 break-words font-display text-2xl font-semibold sm:text-3xl">{participant.full_name}</h1>
          <p className="mt-2 font-mono text-xs text-white/70">{participant.registration_code}</p>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
          participant.status === 'accepted' ? 'bg-emerald-100 text-emerald-800'
            : participant.status === 'rejected' ? 'bg-red-100 text-red-800'
              : participant.status === 'verified' ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
        }`}>{participant.status === 'pending' ? <Clock3 size={15}/> : <CheckCircle2 size={15}/>} {statusLabels[participant.status] || participant.status}</span>
      </div>
    </section>

    {participant.feedback && <section className={`mt-5 rounded-xl border p-4 sm:p-5 ${participant.status === 'rejected' ? 'border-red-100 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
      <p className="text-xs font-bold text-navy">Pesan dari admin</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{participant.feedback}</p>
    </section>}

    <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <section className="card p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-wine-50 text-wine-600"><CalendarDays size={19}/></span><div><h2 className="font-bold text-navy">Informasi pelatihan</h2><p className="mt-1 text-xs text-slate-400">Rincian program dan periode peserta</p></div></div>
        <h3 className="mt-6 text-lg font-bold text-navy">{training.batch_name}</h3>
        <p className="mt-1 text-sm text-wine-600">{training.program_type}</p>
        {training.description && <p className="mt-4 text-sm leading-6 text-slate-500">{training.description}</p>}
        <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <Info label="Mulai pelatihan" value={formatDate(training.start_date)}/>
          <Info label="Akhir periode" value={formatDate(training.end_date)}/>
          <Info label="Tanggal pendaftaran" value={formatDate(participant.registered_at)}/>
          <Info label="Status pendaftaran" value={statusLabels[participant.status] || participant.status}/>
        </dl>
      </section>

      <section className="card p-5 sm:p-7">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CircleDollarSign size={19}/></span><div><h2 className="font-bold text-navy">Ringkasan pembayaran</h2><p className="mt-1 text-xs text-slate-400">Pembayaran cicilan dan sisa biaya</p></div></div>
        <p className="mt-6 text-xs text-slate-400">Total biaya pelatihan</p><p className="mt-1 text-2xl font-bold text-navy">{formatCurrency(payment.training_fee)}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${paidPercent}%` }}/></div>
        <div className="mt-3 grid grid-cols-2 gap-3"><Info label="Terverifikasi" value={formatCurrency(payment.paid_total)}/><Info label="Sisa pembayaran" value={formatCurrency(payment.balance_due)}/></div>
        {paymentEnabled && payment.instructions && <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-navy">Instruksi pembayaran</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{payment.instructions}</p></div>}
        {!paymentEnabled && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">Instruksi dan pengiriman pembayaran tersedia setelah pendaftaran diverifikasi admin.</p>}
        {paymentEnabled && <form onSubmit={onSubmitPayment} className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-navy">Kirim bukti pembayaran</h3>
          {paymentError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{paymentError}</p>}
          <label className="grid gap-2 text-xs font-semibold text-slate-600">Nominal pembayaran
            <input required min="1" type="number" value={amount} onChange={(event) => onAmountChange(event.target.value)} className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm"/>
          </label>
          <label className="grid cursor-pointer gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-xs font-semibold text-slate-600">
            Bukti (JPG, PNG, atau PDF; maks. 2,5 MB)
            <input required type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" onChange={onReceiptChange} className="text-xs"/>
            {receipt && <span className="font-normal text-slate-500">Dipilih: {receipt.name}</span>}
          </label>
          <button type="submit" disabled={paymentBusy || !receipt} className="btn-primary w-full">
            <UploadCloud size={17}/>{paymentBusy ? 'Mengirim bukti…' : 'Kirim bukti pembayaran'}
          </button>
        </form>}
      </section>
    </div>

    <section className="card mt-5 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 p-5 sm:p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><FileText size={19}/></span><div><h2 className="font-bold text-navy">Riwayat pembayaran</h2><p className="mt-1 text-xs text-slate-400">Status transaksi diperbarui setelah ditinjau admin</p></div></div>
      {payment.transactions.length ? <div className="divide-y divide-slate-100">{payment.transactions.map((transaction) => {const transactionAmount=transaction.amount_approved || transaction.amount_declared;return <article key={transaction.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="text-sm font-bold text-navy">{transactionAmount == null ? 'Nominal belum tersedia' : formatCurrency(transactionAmount)}</p><p className="mt-1 text-xs text-slate-400">{formatDate(transaction.created_at)}</p>{transaction.status === 'rejected' && transaction.rejection_reason && <p className="mt-2 text-xs leading-5 text-red-600">{transaction.rejection_reason}</p>}</div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold ${paymentStyles[transaction.status] || 'bg-slate-100 text-slate-600'}`}>{paymentLabels[transaction.status] || transaction.status}</span>
      </article>})}</div> : <p className="p-6 text-sm text-slate-500">Belum ada pembayaran tercatat.</p>}
    </section>
    <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">Tautan portal ini bersifat pribadi. Jangan teruskan kepada orang lain.</p>
  </>;
}

function Info({ label, value }) {
  return <div className="min-w-0"><dt className="text-[11px] text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-navy">{value}</dd></div>;
}
