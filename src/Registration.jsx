import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ExternalLink, FileText, Info, Menu, MessageCircle, UploadCloud } from 'lucide-react';
import { publicApi, registerParticipant } from './api.js';
import { Logo } from './Landing.jsx';

const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const formatCurrency = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));

export default function Registration() {
  const [data, setData] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [batchId, setBatchId] = useState('');
  const [base, setBase] = useState({ full_name: '', whatsapp: '', email: '' });
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    publicApi('/batch-active').then(({ data: result }) => {
      setData(result);
      const availableBatch = result.batches?.find((batch) => !batch.is_full && batch.training_fee != null);
      setBatchId(String(availableBatch?.id || result.batches?.[0]?.id || ''));
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
    publicApi('/site-content').then(({ data: result }) => setLogoUrl(result.logo_url || null)).catch(() => {});
  }, []);

  const selectedBatch = data?.batches?.find((batch) => String(batch.id) === batchId);
  const updateAnswer = (field, value) => setAnswers((current) => ({ ...current, [field.field_name]: value }));

  function dynamicField(field) {
    const common = 'input-field';
    const required = field.is_required ? true : undefined;
    if (field.field_type === 'textarea') return <textarea required={required} className={`${common} min-h-28`} placeholder={field.field_label} value={answers[field.field_name] || ''} onChange={(e) => updateAnswer(field, e.target.value)}/>;
    if (field.field_type === 'select') return <select required={required} className={common} value={answers[field.field_name] || ''} onChange={(e) => updateAnswer(field, e.target.value)}><option value="">Pilih {field.field_label.toLowerCase()}</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    if (field.field_type === 'radio') return <div className="mt-3 grid gap-2 sm:grid-cols-2">{field.options?.map((option) => <label key={option} className={`rounded-lg border p-3 text-sm ${answers[field.field_name] === option ? 'border-wine-500 bg-wine-50' : 'border-slate-200'}`}><input className="mr-2 accent-wine-600" required={Boolean(field.is_required) && !answers[field.field_name]} type="radio" name={field.field_name} value={option} checked={answers[field.field_name] === option} onChange={() => updateAnswer(field, option)}/>{option}</label>)}</div>;
    if (field.field_type === 'file') return <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center hover:border-wine-500">
      <input className="hidden" required={required && !files[field.field_name]} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && file.size > 2.5 * 1024 * 1024) {
          setError('Ukuran berkas maksimal 2,5 MB.');
          e.target.value = '';
          setFiles((current) => {
            const next = { ...current };
            delete next[field.field_name];
            return next;
          });
          return;
        }
        setError('');
        if (file) setFiles((current) => ({ ...current, [field.field_name]: file }));
      }}/>
      {files[field.field_name] ? <><FileText className="text-wine-600"/><span className="mt-2 max-w-[250px] truncate text-xs font-bold text-navy">{files[field.field_name].name}</span></> : <><UploadCloud className="text-slate-400"/><span className="mt-2 text-xs font-semibold text-wine-600">Pilih berkas atau tarik ke sini</span><span className="mt-1 text-[10px] text-slate-400">JPG, PNG, atau PDF maksimal 2,5 MB</span></>}
    </label>;
    return <input required={required} className={common} type={field.field_type === 'number' ? 'number' : field.field_type === 'email' ? 'email' : field.field_type === 'date' ? 'date' : 'text'} value={answers[field.field_name] || ''} onChange={(e) => updateAnswer(field, e.target.value)} placeholder={field.field_type === 'text' ? field.field_label : undefined}/>;
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true); setError('');
    const formData = new FormData();
    formData.append('batch_id', batchId);
    formData.append('full_name', base.full_name);
    formData.append('whatsapp', base.whatsapp);
    if (base.email) formData.append('email', base.email);
    formData.append('answers', JSON.stringify(answers));
    Object.entries(files).forEach(([name, file]) => formData.append(name, file));
    try {
      const result = await registerParticipant(formData);
      setSuccess({ ...result.data, payment: { training_fee: selectedBatch?.training_fee || 0 } });
    } catch (e) {
      setError(e.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally { setSubmitting(false); }
  }

  if (success) return <Success result={success} logoUrl={logoUrl}/>;

  return <div className="min-h-screen bg-white">
    <header className="border-b border-slate-100"><div className="container-page flex h-[72px] items-center justify-between"><Logo imageUrl={logoUrl}/><button className="lg:hidden"><Menu/></button></div></header>
    <div className="border-b border-slate-100 bg-white"><div className="container-page flex items-center gap-2 py-4 text-sm text-slate-500"><Link to="/" className="flex items-center gap-1 text-wine-600"><ArrowLeft size={16}/> Kembali ke beranda</Link></div></div>
    <main className="container-page py-10 md:py-14">
      <div className="grid gap-10 md:grid-cols-[360px_1fr]">
        <aside>
          <h1 className="font-display text-4xl font-semibold text-navy">{step === 1 ? 'Kenali dulu, yuk.' : 'Lengkapi datamu.'}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">Isi data diri agar admin dapat menghubungimu. Tanda <span className="text-wine-600">*</span> wajib diisi.</p>
          {selectedBatch && <div className="mt-8 rounded-2xl bg-navy p-7 text-white shadow-xl">
            <span className="rounded-full bg-wine-500 px-3 py-1 text-[10px] font-bold">GELOMBANG AKTIF</span>
            <h2 className="mt-5 text-xl font-bold leading-8">{selectedBatch.batch_name}</h2>
            <div className="mt-5 space-y-4 text-xs text-white/75"><p className="flex items-center gap-2"><CalendarDays size={16}/> {formatDate(selectedBatch.start_date)} - {formatDate(selectedBatch.end_date)}</p><p>{selectedBatch.program_type}</p></div>
            <div className="mt-6 border-t border-white/15 pt-5"><p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Biaya pelatihan</p><p className="mt-1 text-xl font-bold">{selectedBatch.training_fee != null ? formatCurrency(selectedBatch.training_fee) : 'Belum ditetapkan'}</p><p className="mt-2 text-xs leading-5 text-white/70">Pembayaran dapat dicicil. Setelah pendaftaran diverifikasi, bukti transfer dapat diunggah melalui portal peserta.</p></div>
          </div>}
          <div className="mt-5 rounded-xl border border-slate-100 p-5"><MessageCircle className="text-wine-600"/><p className="mt-3 font-bold text-navy">Butuh bantuan mengisi?</p><p className="mt-1 text-xs leading-5 text-slate-500">Tanyakan langsung pada admin melalui WhatsApp.</p><p className="mt-3 text-xs font-bold text-wine-600">0838-2094-3475</p></div>
        </aside>
        <form onSubmit={submit}>
          <div className="flex items-center gap-3 text-sm"><div className={`grid h-9 w-9 place-items-center rounded-full font-bold ${step >= 1 ? 'bg-wine-600 text-white' : 'bg-slate-100'}`}>{step > 1 ? <Check size={18}/> : '1'}</div><span className="font-bold text-navy">Data Diri</span><div className="h-px flex-1 bg-slate-200"/><div className={`grid h-9 w-9 place-items-center rounded-full font-bold ${step === 2 ? 'bg-wine-600 text-white' : 'bg-slate-100'}`}>2</div><span className={step === 2 ? 'font-bold text-navy' : 'text-slate-400'}>Data Tambahan</span></div>
          {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <section className="card mt-7 p-6 md:p-8">
            {loading ? <p className="text-sm text-slate-500">Memuat formulir...</p> : !data ? <p className="text-sm text-red-600">Pendaftaran belum tersedia.</p> : step === 1 ? <>
              <p className="eyebrow">01 / Data diri</p><h2 className="mt-2 text-2xl font-bold text-navy">Mulai pendaftaranmu</h2>
              <label className="mt-6 block text-sm font-bold text-navy">Nama Lengkap <span className="text-wine-600">*</span><input required className="input-field" value={base.full_name} onChange={(e) => setBase({...base, full_name: e.target.value})} placeholder="Nama lengkap sesuai identitas"/></label>
              <label className="mt-5 block text-sm font-bold text-navy">Nomor WhatsApp <span className="text-wine-600">*</span><input required pattern="[0-9+\s()-]{8,20}" className="input-field" value={base.whatsapp} onChange={(e) => setBase({...base,whatsapp:e.target.value})} placeholder="Contoh: 081234567890"/><span className="mt-2 block text-xs font-normal text-slate-400">Gunakan nomor aktif. Status pendaftaran dan tautan portal akan dikirim ke nomor ini.</span></label>
              <label className="mt-5 block text-sm font-bold text-navy">Email <span className="font-normal text-slate-400">(opsional)</span><input type="email" className="input-field" value={base.email} onChange={(e) => setBase({...base, email: e.target.value})} placeholder="nama@email.com"/></label>
              <label className="mt-5 block text-sm font-bold text-navy">Pilih Gelombang <span className="text-wine-600">*</span><select required className="input-field" value={batchId} onChange={(e) => setBatchId(e.target.value)}>{(data.batches || []).map((batch) => <option key={batch.id} value={batch.id} disabled={batch.is_full || batch.training_fee == null}>{batch.program_type} · {batch.batch_name}{batch.is_full ? ' — kuota penuh' : batch.training_fee != null ? ` — ${formatCurrency(batch.training_fee)}` : ' — biaya belum diatur'}</option>)}</select></label>
              {data.batches?.some((batch) => batch.training_fee == null) && <p className="mt-2 text-xs text-amber-700">Gelombang dengan biaya yang belum ditetapkan belum dapat dipilih.</p>}
              {selectedBatch && <p className="mt-2 text-xs text-slate-500">Sisa kuota: {selectedBatch.quota ? Math.max(0, selectedBatch.quota - selectedBatch.registrant_count) : 'tidak terbatas'} peserta.</p>}
              <button type="button" disabled={!base.full_name || !base.whatsapp || !selectedBatch || selectedBatch.is_full || selectedBatch.training_fee == null} onClick={() => setStep(2)} className="btn-primary mt-8 w-full">Lanjut ke Data Tambahan <ArrowRight size={17}/></button>
            </> : <>
              <p className="eyebrow">02 / Data tambahan</p><h2 className="mt-2 text-2xl font-bold text-navy">Data pendukung</h2><p className="mt-2 text-sm text-slate-500">Program: <strong>{selectedBatch?.program_type}</strong>. Biaya pelatihan {formatCurrency(selectedBatch?.training_fee)} dapat dibayarkan secara bertahap setelah pendaftaran.</p>
              {(selectedBatch?.fields || []).map((field) => <label key={field.id} className="mt-6 block text-sm font-bold text-navy">{field.field_label} {field.is_required ? <span className="text-wine-600">*</span> : <span className="font-normal text-slate-400">(opsional)</span>}{dynamicField(field)}</label>)}
              <div className="mt-7 flex gap-2 rounded-lg bg-slate-50 p-4 text-xs leading-5 text-slate-500"><Info size={16} className="shrink-0 text-wine-600"/> Dengan mengirim formulir, Anda menyetujui penggunaan data untuk administrasi dan menerima notifikasi WhatsApp ke nomor yang dicantumkan.</div>
              <div className="mt-6 flex gap-3"><button type="button" onClick={() => setStep(1)} className="btn-secondary">Kembali</button><button disabled={submitting} className="btn-primary flex-1">{submitting ? 'Mengirim...' : 'Kirim Pendaftaran'} {!submitting && <ArrowRight size={17}/>}</button></div>
            </>}
          </section>
        </form>
      </div>
    </main>
    <div className="border-t py-5 text-center text-[11px] text-slate-400">© 2026 LPK BYE · Bandung</div>
  </div>;
}

function Success({ result, logoUrl }) {
  const payment = result.payment || {};
  const paymentUrl = payment.bot_phone
    ? `https://wa.me/${payment.bot_phone}?text=${encodeURIComponent(`STATUS ${result.registration_code}`)}`
    : result.whatsapp_url || `https://wa.me/6283820943475?text=${encodeURIComponent(`Halo admin, saya baru mendaftar dengan kode ${result.registration_code}.`)}`;
  return <div className="flex min-h-screen flex-col items-center bg-white px-5 text-center"><header className="flex h-[72px] w-full items-center"><div className="container-page"><Logo imageUrl={logoUrl}/></div></header><main className="flex w-full max-w-xl flex-1 flex-col items-center justify-center pb-16"><div className="grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-wine-600"><Check size={36}/></div><h1 className="mt-8 font-display text-4xl font-semibold text-navy">Pendaftaran berhasil</h1><p className="mt-4 max-w-md text-slate-500">Terima kasih. Data kamu sudah terkirim dan menunggu verifikasi admin.</p><div className="mt-8"><p className="text-xs font-bold text-slate-500">PROGRAM PILIHAN</p><p className="mt-2 font-bold text-navy">{result.program_type}</p><p className="mt-4 text-xs font-bold text-slate-500">KODE REGISTRASI KAMU</p><p className="mt-3 text-2xl font-bold text-wine-700">{result.registration_code}</p></div>{result.notification?.status === 'failed' ? <p className="mt-5 w-full rounded-lg bg-amber-50 p-4 text-left text-sm leading-6 text-amber-800">{result.notification.message || 'Pemberitahuan WhatsApp belum terkirim. Silakan hubungi admin.'}</p> : <p className="mt-5 w-full rounded-lg bg-emerald-50 p-4 text-left text-sm leading-6 text-emerald-800">{result.notification?.message || 'Informasi pendaftaran akan dikirim ke WhatsApp kamu.'}</p>}{Number(payment.training_fee) > 0 && <section className="mt-5 w-full rounded-2xl border border-slate-200 p-6 text-left"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Biaya pelatihan</p><p className="mt-2 text-2xl font-bold text-navy">{formatCurrency(payment.training_fee)}</p><p className="mt-3 text-sm leading-6 text-slate-500">Tunggu verifikasi admin sebelum transfer. Bukti pembayaran dapat diunggah melalui portal peserta setelah status pendaftaran diverifikasi.</p></section>}{result.portal_url && <a href={result.portal_url} className="btn-primary mt-6 w-full max-w-md" target="_blank" rel="noreferrer">Buka Portal Peserta <ExternalLink size={16}/></a>}{result.portal_url && <p className="mt-2 text-xs text-slate-400">Simpan tautan ini secara pribadi untuk melihat status dan pembayaran.</p>}<a href={paymentUrl} target="_blank" rel="noreferrer" className="mt-5 flex w-full max-w-md items-center justify-center gap-2 rounded-lg bg-[#249c7b] py-4 font-bold text-white"><MessageCircle/>{payment.bot_phone ? 'Buka WhatsApp Bot' : 'Hubungi Admin via WhatsApp'}</a>{!payment.bot_phone && Number(payment.training_fee) > 0 && <p className="mt-3 text-xs text-amber-700">Bukti pembayaran dapat dikirim melalui portal peserta setelah verifikasi admin.</p>}<Link to="/" className="mt-6 font-bold text-wine-600">Kembali ke Beranda</Link></main></div>;
}
