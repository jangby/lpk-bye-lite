import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, CircleDollarSign, ClipboardList, GraduationCap, ImagePlus, Menu, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { adminRequest, getBatches, getContent, getPortal, login, register, submitPayment } from './api';
import { getUploadSizeLimit, getUploadSizeMessage } from '../lib/upload.js';
import AIChatWidget from './AIChatWidget.jsx';
import AnalyticsTracker from './AnalyticsTracker.jsx';
import Landing from './Landing.jsx';
import RegistrationPage from './Registration.jsx';
import ParticipantPortal from './ParticipantPortal.jsx';
import AdminPage from './Admin.jsx';

const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
const date = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const statusNames = { pending: 'Menunggu verifikasi', verified: 'Terverifikasi', accepted: 'Diterima', rejected: 'Ditolak' };

export default function App() {
  return <>
    <AnalyticsTracker/>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pendaftaran" element={<RegistrationPage />} />
      <Route path="/peserta/:token" element={<ParticipantPortal />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>;
}

function Brand({ light = false, logoUrl = null }) {
  return <Link to="/" className={`brand ${light ? 'brand-light' : ''}`}>{logoUrl ? <img className="brand-logo" src={logoUrl} alt="Logo LPK BYE"/> : <span className="brand-icon"><GraduationCap size={22} /></span>}<span>LPK <b>BYE</b><small>Belajar dengan arah</small></span></Link>;
}

function Header({ logoUrl }) {
  const [menu, setMenu] = useState(false);
  return <header className="header"><div className="wrap header-inner"><Brand logoUrl={logoUrl}/>
    <button className="menu-toggle" onClick={() => setMenu(!menu)} aria-label="Buka menu"><Menu size={21}/></button>
    <nav className={menu ? 'nav nav-open' : 'nav'}><a href="/#program">Program</a><a href="/#tentang">Tentang</a><Link to="/admin">Admin</Link><Link className="button button-small" to="/pendaftaran">Daftar sekarang <ArrowRight size={15}/></Link></nav>
  </div></header>;
}

function Home() {
  const [batches, setBatches] = useState([]);
  const [content, setContent] = useState({ slides: [], gallery: [], faqs: [] });
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([getBatches(), getContent()])
      .then(([batchResult, contentResult]) => {
        setBatches(batchResult.data.batches || []);
        setContent(contentResult.data);
      })
      .catch((e) => setError(e.message));
  }, []);
  return <>
    <Header logoUrl={content.logo_url}/>
    <main>
      <section className="hero"><div className="wrap hero-grid">
        <div><p className="eyebrow"><span className="pulse"/> LPK BYE · BANDUNG</p><h1>Kompetensi hari ini.<br/><em>Peluang esok hari.</em></h1>
          <p className="hero-copy">Ruang belajar untuk membangun keterampilan nyata—dari Digital Marketing bersertifikasi hingga Bahasa Jepang.</p>
          <div className="hero-actions"><Link className="button" to="/pendaftaran">Mulai pendaftaran <ArrowRight size={17}/></Link><a className="button button-ghost" href="#program">Kenali program</a></div>
          <div className="hero-points"><span><ShieldCheck size={17}/> Pembelajaran terarah</span><span><Users size={17}/> Pendampingan personal</span></div>
        </div>
        <div className="hero-card"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-card-content"><span className="mini-label">LANGKAH PERTAMA</span><GraduationCap size={52} strokeWidth={1.2}/><p>Temukan program yang tepat untuk perjalananmu.</p><Link to="/pendaftaran">Lihat gelombang aktif <ArrowRight size={15}/></Link></div><div className="hero-sticker">Tumbuh<br/>bersama <b>BYE</b></div></div>
      </div></section>
      <section className="wrap section" id="program"><div className="section-heading"><div><p className="eyebrow">MULAI DARI SINI</p><h2>Program yang sedang dibuka</h2></div><Link className="text-link" to="/pendaftaran">Semua program <ArrowRight size={16}/></Link></div>
        {error && <p className="notice notice-error">{error}</p>}
        {!error && batches.length === 0 && <div className="empty-card"><GraduationCap size={28}/><h3>Gelombang baru segera hadir</h3><p>Silakan hubungi admin untuk informasi program dan jadwal berikutnya.</p><a href="https://wa.me/6283820943475" className="text-link">Hubungi admin <ArrowRight size={15}/></a></div>}
        <div className="batch-grid">{batches.map((batch) => <article className="batch-card" key={batch.id}><div className="batch-icon"><GraduationCap size={22}/></div><p className="eyebrow">{batch.program_type}</p><h3>{batch.batch_name}</h3><p className="muted">{batch.description || 'Program pelatihan LPK BYE dengan pendampingan langsung.'}</p><div className="batch-meta"><span>{date(batch.start_date)} – {date(batch.end_date)}</span><b>{batch.training_fee == null ? 'Biaya menyusul' : money(batch.training_fee)}</b></div><Link className="text-link" to="/pendaftaran">Daftar program ini <ArrowRight size={15}/></Link></article>)}</div>
      </section>
      {content.slides.length > 0 && <section className="wrap section"><p className="eyebrow">PROGRAM & KEGIATAN</p><div className="batch-grid" style={{ marginTop: 18 }}>{content.slides.map((slide) => <article className="batch-card" key={slide.id}>{slide.image_url && <img className="content-image" src={slide.image_url} alt={slide.title || 'Poster LPK BYE'} />}<h3>{slide.title}</h3>{slide.caption && <p className="muted">{slide.caption}</p>}{slide.link_url && <a className="text-link" href={slide.link_url}>{slide.link_url.startsWith('/') ? 'Lihat detail' : 'Kunjungi'} <ArrowRight size={15}/></a>}</article>)}</div></section>}
      {content.gallery.length > 0 && <section className="wrap section"><p className="eyebrow">GALERI KEGIATAN</p><div className="gallery-grid">{content.gallery.map((item) => <article key={item.id}>{item.image_url && <img src={item.image_url} alt={item.title || 'Galeri LPK BYE'}/>}<div><h3>{item.title}</h3>{item.caption && <p>{item.caption}</p>}</div></article>)}</div></section>}
      {content.faqs.length > 0 && <section className="wrap section"><p className="eyebrow">PERTANYAAN UMUM</p><div className="faq-list">{content.faqs.map((faq) => <details key={faq.id}><summary>{faq.question}<ChevronDown size={16}/></summary><p>{faq.answer}</p></details>)}</div></section>}
      <section className="about" id="tentang"><div className="wrap about-grid"><div><p className="eyebrow">TENTANG LPK BYE</p><h2>Belajar dengan arah.<br/><em>Bertumbuh dengan percaya diri.</em></h2></div><p>LPK BYE mendampingi peserta mengembangkan keterampilan melalui program yang terarah dan relevan. Mulai dari pendaftaran, tim kami siap membantu setiap langkahmu.</p></div></section>
      <section className="wrap cta"><div><p className="eyebrow">LANGKAH BERIKUTNYA</p><h2>Siap memulai perjalanan belajarmu?</h2></div><Link className="button" to="/pendaftaran">Daftar sekarang <ArrowRight size={17}/></Link></section>
    </main>
    <footer className="footer"><div className="wrap"><Brand logoUrl={content.logo_url}/><span>© {new Date().getFullYear()} LPK BYE · Bandung</span></div></footer>
    <AIChatWidget/>
  </>;
}

function Registration() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [base, setBase] = useState({ full_name: '', whatsapp: '', email: '' });
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  useEffect(() => { getBatches().then(({ data }) => { setBatches(data.batches || []); setBatchId(data.batches?.find((batch) => batch.training_fee != null)?.id || data.batches?.[0]?.id || ''); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, []);
  const selected = batches.find((batch) => batch.id === batchId);
  async function submit(event) {
    event.preventDefault(); setSending(true); setError('');
    try { setResult((await register({ ...base, batch_id: batchId, answers })).data); }
    catch (e) { setError(e.message); }
    finally { setSending(false); }
  }
  if (result) return <div className="success-page"><Brand/><div className="success-card"><span className="success-icon"><Check size={30}/></span><p className="eyebrow">PENDAFTARAN TERKIRIM</p><h1>Terima kasih, {base.full_name}.</h1><p>Data pendaftaranmu sudah diterima dan menunggu verifikasi admin.</p><div className="code-box"><small>KODE PENDAFTARAN</small><b>{result.registration_code}</b></div><Link className="button button-full" to={new URL(result.portal_url).pathname}>Buka portal peserta <ArrowRight size={17}/></Link><Link className="text-link centered" to="/">Kembali ke beranda</Link></div></div>;
  return <><Header/><main className="form-page wrap"><Link to="/" className="back-link">← Kembali ke beranda</Link><div className="form-layout"><aside className="form-aside"><p className="eyebrow">PENDAFTARAN LPK BYE</p><h1>Mulai langkah<br/><em>barumu.</em></h1><p>Isi data diri dan pilih program yang ingin kamu ikuti. Tim kami akan menghubungimu melalui WhatsApp.</p>{selected && <div className="selected-card"><span className="mini-label">PROGRAM PILIHAN</span><h3>{selected.batch_name}</h3><p>{selected.program_type}</p><div>{date(selected.start_date)} – {date(selected.end_date)}</div><b>{selected.training_fee == null ? 'Biaya menyusul' : money(selected.training_fee)}</b>{selected.payment_instructions && <p className="batch-instructions">{selected.payment_instructions}</p>}</div>}</aside>
    <form className="form-card" onSubmit={submit}><div><p className="eyebrow">FORMULIR</p><h2>Data pendaftaran</h2><p className="muted">Kolom bertanda * wajib diisi.</p></div>
      {error && <p className="notice notice-error">{error}</p>}
      {loading ? <p className="muted">Memuat daftar program...</p> : batches.length === 0 ? <div className="empty-card"><p>Belum ada gelombang pendaftaran aktif.</p><Link to="/" className="text-link">Kembali ke beranda</Link></div> : <>
        <label>Nama lengkap *<input required minLength="3" maxLength="150" value={base.full_name} onChange={(e) => setBase({ ...base, full_name: e.target.value })} placeholder="Nama sesuai identitas"/></label>
        <label>Nomor WhatsApp *<input required pattern="[0-9+\s()-]{8,20}" value={base.whatsapp} onChange={(e) => setBase({ ...base, whatsapp: e.target.value })} placeholder="Contoh: 081234567890"/><small>Gunakan nomor WhatsApp yang aktif.</small></label>
        <label>Email <span className="optional">(opsional)</span><input type="email" maxLength="150" value={base.email} onChange={(e) => setBase({ ...base, email: e.target.value })} placeholder="nama@email.com"/></label>
        <label>Pilih program *<select required value={batchId} onChange={(e) => setBatchId(e.target.value)}>{batches.map((batch) => <option value={batch.id} key={batch.id} disabled={batch.training_fee == null || batch.is_full}>{batch.program_type} · {batch.batch_name}{batch.is_full ? ' — kuota penuh' : batch.training_fee == null ? ' — biaya belum diatur' : ''}</option>)}</select></label>
        {selected?.training_fee == null && <p className="notice">Pendaftaran untuk program ini dibuka setelah biaya ditetapkan oleh admin.</p>}
        {selected?.is_full && <p className="notice">Kuota program ini sudah penuh.</p>}
        {(selected?.fields || []).map((field) => <DynamicField key={field.field_name} field={field} value={answers[field.field_name] || ''} onChange={(value) => setAnswers({ ...answers, [field.field_name]: value })}/>)}
        <p className="consent">Dengan mengirim formulir, kamu menyetujui penggunaan data untuk administrasi pendaftaran dan menerima informasi melalui WhatsApp.</p>
        <button className="button button-full" disabled={sending || selected?.training_fee == null || selected?.is_full}>{sending ? 'Mengirim pendaftaran…' : 'Kirim pendaftaran'} <ArrowRight size={17}/></button>
      </>}
    </form></div></main></>;
}

function DynamicField({ field, value, onChange }) {
  const attrs = { required: Boolean(field.is_required), value, onChange: (event) => onChange(event.target.value) };
  if (field.field_type === 'radio') {
    return <fieldset className="radio-field"><legend>{field.field_label}{field.is_required ? ' *' : ' (opsional)'}</legend>{(field.options || []).map((option) => <label key={option}><input required={Boolean(field.is_required)} type="radio" name={field.field_name} checked={value === option} value={option} onChange={(event) => onChange(event.target.value)}/>{option}</label>)}</fieldset>;
  }
  if (field.field_type === 'file') {
    return <label>{field.field_label}{field.is_required ? ' *' : ' (opsional)'}
      <input required={Boolean(field.is_required)} type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" onChange={async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > getUploadSizeLimit(file)) { onChange({ error: getUploadSizeMessage(file) }); return; }
        try {
          const base64 = await fileToBase64(file);
          onChange({ name: file.name, mimeType: file.type, base64 });
        } catch {
          onChange({ error: 'Berkas gagal dibaca. Coba pilih ulang.' });
        }
      }}/>
      {value?.error && <small className="notice notice-error">{value.error}</small>}
      {value?.name && !value.error && <small>Berkas dipilih: {value.name}</small>}
    </label>;
  }
  return <label>{field.field_label}{field.is_required ? ' *' : ' (opsional)'}
    {field.field_type === 'textarea' ? <textarea {...attrs} rows="3"/> : field.field_type === 'select' ? <select {...attrs}><option value="">Pilih…</option>{(field.options || []).map((option) => <option key={option}>{option}</option>)}</select> : <input {...attrs} type={['date', 'email', 'number'].includes(field.field_type) ? field.field_type : 'text'}/>}
  </label>;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Berkas gagal dibaca.'));
    reader.readAsDataURL(file);
  });
}

function Participant() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [sendingPayment, setSendingPayment] = useState(false);
  useEffect(() => { getPortal(token).then((result) => setData(result.data)).catch((e) => setError(e.message)); }, [token]);
  async function handlePayment(event) {
    event.preventDefault();
    setSendingPayment(true); setPaymentError('');
    try {
      await submitPayment({ registration_code: data.participant.registration_code, portal_token: token, amount: Number(amount), receipt });
      setAmount(''); setReceipt(null);
      const refreshed = await getPortal(token);
      setData(refreshed.data);
    } catch (e) { setPaymentError(e.message); }
    finally { setSendingPayment(false); }
  }
  async function selectReceipt(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > getUploadSizeLimit(file)) { setPaymentError(getUploadSizeMessage(file)); return; }
    setReceipt({ name: file.name, mimeType: file.type, base64: await fileToBase64(file) });
  }
  return <div className="portal-page"><Brand/><Link to="/" className="back-link">← Beranda</Link>{error ? <div className="empty-card"><h2>Tautan tidak tersedia</h2><p>{error}</p></div> : !data ? <p className="muted">Memuat portal peserta…</p> : <section className="portal-card"><p className="eyebrow">PORTAL PESERTA</p><h1>Halo, {data.participant.full_name}.</h1><p className="muted">Berikut informasi pendaftaranmu.</p><div className="portal-status"><span>Status pendaftaran</span><b className={`status status-${data.participant.status}`}>{statusNames[data.participant.status] || data.participant.status}</b></div><div className="portal-row"><span>Kode pendaftaran</span><b>{data.participant.registration_code}</b></div><div className="portal-row"><span>Program</span><b>{data.training.program_type}</b></div><div className="portal-row"><span>Gelombang</span><b>{data.training.batch_name}</b></div>{data.participant.feedback && <p className="notice">{data.participant.feedback}</p>}
    {data.payment && <><div className="payment-summary"><div><span>Biaya pelatihan</span><b>{money(data.payment.training_fee)}</b></div><div><span>Terverifikasi</span><b>{money(data.payment.paid_total)}</b></div><div><span>Sisa</span><b>{money(data.payment.balance_due)}</b></div></div>{data.payment.instructions && <p className="notice">{data.payment.instructions}</p>}<div className="payment-history">{data.payment.transactions.map((item) => <div key={item.id}><span>Bukti Rp{Number(item.amount_declared || 0).toLocaleString('id-ID')}{item.rejection_reason && <small className="payment-rejection">{item.rejection_reason}</small>}</span><b className={`status status-${item.status === 'approved' ? 'accepted' : item.status}`}>{item.status === 'approved' ? 'Diverifikasi' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</b></div>)}</div>
    {['verified', 'accepted'].includes(data.participant.status) && <form className="payment-form" onSubmit={handlePayment}><h3>Kirim bukti pembayaran</h3>{paymentError && <p className="notice notice-error">{paymentError}</p>}<label>Nominal<input required type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)}/></label><label>Bukti pembayaran<input required type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" onChange={selectReceipt}/></label><button className="button button-full" disabled={sendingPayment || !receipt}>{sendingPayment ? 'Mengirim…' : 'Kirim bukti'} <ArrowRight size={16}/></button></form>}
    </>}
    <a className="button button-full" href="https://wa.me/6283820943475"><MessageCircle size={17}/> Hubungi admin</a></section>}</div>;
}

function Admin() {
  const [token, setToken] = useState(localStorage.getItem('lpk_lite_admin_token'));
  const [view, setView] = useState('dashboard');
  const [registrants, setRegistrants] = useState([]);
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  useEffect(() => {
    if (!token) return;
    Promise.all([adminRequest('registrants'), adminRequest('batches')]).then(([r, b]) => { setRegistrants(r.data); setBatches(b.data); setError(''); }).catch((e) => { setError(e.message); if (e.message.includes('Sesi')) { localStorage.removeItem('lpk_lite_admin_token'); setToken(null); } });
  }, [token, refresh]);
  if (!token) return <AdminLogin onLogin={(value) => { localStorage.setItem('lpk_lite_admin_token', value); setToken(value); }}/>;
  function logout() { localStorage.removeItem('lpk_lite_admin_token'); setToken(null); }
  return <div className="admin-page"><aside className="admin-sidebar"><Brand/><p className="eyebrow">RUANG ADMINISTRASI</p><button className={view === 'dashboard' ? 'side-link active' : 'side-link'} onClick={() => setView('dashboard')}><ShieldCheck size={17}/> Dashboard</button><button className={view === 'registrants' ? 'side-link active' : 'side-link'} onClick={() => setView('registrants')}><Users size={17}/> Pendaftar</button><button className={view === 'batches' ? 'side-link active' : 'side-link'} onClick={() => setView('batches')}><GraduationCap size={17}/> Gelombang</button><button className={view === 'forms' ? 'side-link active' : 'side-link'} onClick={() => setView('forms')}><ClipboardList size={17}/> Form Builder</button><button className={view === 'payments' ? 'side-link active' : 'side-link'} onClick={() => setView('payments')}><CircleDollarSign size={17}/> Pembayaran</button><button className={view === 'content' ? 'side-link active' : 'side-link'} onClick={() => setView('content')}><ImagePlus size={17}/> Konten landing</button><button className="side-link side-logout" onClick={logout}>Keluar</button></aside>
    <main className="admin-main"><div className="admin-top"><div><p className="eyebrow">LPK BYE · ADMIN</p><h1>{view === 'dashboard' ? 'Dashboard' : view === 'registrants' ? 'Daftar pendaftar' : view === 'batches' ? 'Kelola gelombang' : view === 'forms' ? 'Form Builder' : view === 'payments' ? 'Pembayaran' : 'Konten landing'}</h1></div><button className="button button-small" onClick={() => setRefresh(refresh + 1)}>Muat ulang</button></div>
      {error && <p className="notice notice-error">{error}</p>}
      {view === 'dashboard' ? <DashboardSummary registrants={registrants} batches={batches} onNavigate={setView}/>
        : view === 'registrants' ? <><div className="filter-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, kode registrasi, WhatsApp"/><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">Semua status</option>{Object.entries(statusNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="admin-list">{registrants.filter((person) => (!statusFilter || person.status === statusFilter) && (!search || `${person.full_name} ${person.registration_code} ${person.whatsapp} ${person.program_type}`.toLowerCase().includes(search.toLowerCase()))).map((person) => <RegistrantCard key={person.id} person={person} onSaved={() => setRefresh(refresh + 1)}/>)}{!registrants.length && !error && <div className="empty-card">Belum ada pendaftar.</div>}</div></>
        : view === 'batches' ? <BatchManager batches={batches} onSaved={() => setRefresh(refresh + 1)}/>
        : view === 'forms' ? <FormBuilder batches={batches} onSaved={() => setRefresh(refresh + 1)}/>
        : view === 'payments' ? <PaymentsManager/>
        : <ContentManager/>}
    </main>
  </div>;
}

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault(); setLoading(true); setError('');
    try { onLogin((await login(form)).data.token); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  return <div className="login-page"><Brand/><form className="login-card" onSubmit={submit}><span className="batch-icon"><ShieldCheck size={22}/></span><p className="eyebrow">ADMIN LPK BYE</p><h1>Selamat datang.</h1><p className="muted">Masuk untuk mengelola pendaftaran.</p>{error && <p className="notice notice-error">{error}</p>}<label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label><label>Password<input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/></label><button className="button button-full" disabled={loading}>{loading ? 'Memeriksa…' : 'Masuk'} <ArrowRight size={17}/></button></form></div>;
}

function DashboardSummary({ registrants, batches, onNavigate }) {
  const pending = registrants.filter((item) => item.status === 'pending').length;
  const active = batches.filter((item) => item.is_active).length;
  const cards = [
    ['Gelombang', batches.length, GraduationCap, 'batches'],
    ['Gelombang aktif', active, ShieldCheck, 'batches'],
    ['Total pendaftar', registrants.length, Users, 'registrants'],
    ['Menunggu verifikasi', pending, ClipboardList, 'registrants']
  ];
  return <><p className="muted">Ringkasan pendaftaran dan operasional LPK BYE.</p><div className="dashboard-cards">{cards.map(([label, value, Icon, page]) => <button className="dashboard-card" key={label} onClick={() => onNavigate(page)}><span><Icon size={19}/></span><small>{label}</small><b>{value}</b></button>)}</div><div className="dashboard-shortcuts"><button className="button" onClick={() => onNavigate('batches')}>Kelola gelombang <ArrowRight size={16}/></button><button className="button" onClick={() => onNavigate('payments')}>Tinjau pembayaran <ArrowRight size={16}/></button><button className="button" onClick={() => onNavigate('content')}>Ubah konten landing <ArrowRight size={16}/></button></div><h2 className="admin-section-title">Pendaftar terbaru</h2><div className="admin-list">{registrants.slice(0, 5).map((person) => <div className="registrant-card dashboard-person" key={person.id}><div><b>{person.full_name}</b><small>{person.program_type} · {person.registration_code}</small></div><span className={`status status-${person.status}`}>{statusNames[person.status]}</span></div>)}{!registrants.length && <div className="empty-card">Belum ada pendaftar.</div>}</div></>;
}

function RegistrantCard({ person, onSaved }) {
  const [status, setStatus] = useState(person.status);
  const [feedback, setFeedback] = useState(person.feedback || '');
  const [notes, setNotes] = useState(person.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    setSaving(true); setError('');
    try { await adminRequest('status', { method: 'PATCH', body: JSON.stringify({ id: person.id, status, feedback, notes }) }); onSaved(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  return <article className="registrant-card"><div className="registrant-top"><div><h3>{person.full_name}</h3><p>{person.program_type} · {person.batch_name}</p></div><span className={`status status-${person.status}`}>{statusNames[person.status]}</span></div><div className="registrant-meta"><span>Kode <b>{person.registration_code}</b></span><span>WhatsApp <b>{person.whatsapp}</b></span><span>{date(person.created_at.slice(0, 10))}</span></div>{Object.keys(person.answers || {}).length > 0 && <details><summary>Data tambahan <ChevronDown size={15}/></summary><dl>{Object.entries(person.answers).map(([key, value]) => <div key={key}><dt>{key.replace(/_/g, ' ')}</dt><dd>{value?.url ? <a className="text-link" href={value.url} target="_blank" rel="noreferrer">Buka berkas: {value.name || 'Lihat di Drive'}</a> : String(value ?? '-')}</dd></div>)}</dl></details>}<div className="review-controls"><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(statusNames).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label>Pesan untuk peserta{status === 'rejected' && ' *'}<input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Opsional"/></label><label>Catatan internal<input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Khusus admin"/></label><button className="button button-small" disabled={saving} onClick={save}>{saving ? 'Menyimpan…' : 'Simpan & beri tahu'}</button></div>{error && <p className="notice notice-error">{error}</p>}</article>;
}

function BatchManager({ batches, onSaved }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const emptyForm = { batch_name: '', program_type: 'PELATIHAN BAHASA JEPANG', description: '', start_date: '', end_date: '', quota: '0', training_fee: '', is_active: true, fields: [
    { field_name: 'pendidikan_terakhir', field_label: 'Pendidikan terakhir', field_type: 'text', is_required: true },
    { field_name: 'motivasi', field_label: 'Motivasi mengikuti program', field_type: 'textarea', is_required: true }
  ] };
  const [form, setForm] = useState(emptyForm);
  function startEdit(batch) {
    setEditingId(batch.id);
    setForm({ batch_name: batch.batch_name, program_type: batch.program_type, description: batch.description || '',
      start_date: batch.start_date, end_date: batch.end_date, quota: String(batch.quota || 0),
      training_fee: batch.training_fee == null ? '' : String(batch.training_fee), is_active: batch.is_active,
      fields: batch.fields || [] });
    setError('');
    setOpen(true);
  }
  function closeForm() { setOpen(false); setEditingId(null); setForm(emptyForm); setError(''); }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setError('');
    try { await adminRequest('batch', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify({ ...form, id: editingId }) }); closeForm(); onSaved(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }
  async function closeRegistration(batch) {
    if (!window.confirm(`Tutup pendaftaran "${batch.batch_name}"? Data gelombang dan pendaftar tidak akan dihapus.`)) return;
    try {
      await adminRequest('batch', { method: 'DELETE', query: { id: batch.id } });
      onSaved();
    } catch (e) { setError(e.message); }
  }
  return <><div className="batch-admin-heading"><p className="muted">{batches.length} gelombang tersimpan di Google Sheets.</p><button className="button button-small" onClick={() => open ? closeForm() : setOpen(true)}>{open ? 'Tutup' : '+ Buat gelombang'}</button></div>
    {open && <form className="form-card batch-form" onSubmit={submit}><h2>{editingId ? 'Ubah gelombang' : 'Buat gelombang'}</h2>{error && <p className="notice notice-error">{error}</p>}<label>Nama gelombang<input required minLength="3" value={form.batch_name} onChange={(e) => setForm({ ...form, batch_name: e.target.value })}/></label><label>Program<select value={form.program_type} onChange={(e) => setForm({ ...form, program_type: e.target.value })}><option>PELATIHAN BAHASA JEPANG</option><option>SERTIFIKASI BNSP DIGITAL MARKETING</option></select></label><label>Deskripsi<textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><div className="two-fields"><label>Tanggal mulai<input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}/></label><label>Tanggal selesai<input required type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}/></label></div><div className="two-fields"><label>Kuota (0 = tanpa batas)<input type="number" min="0" value={form.quota} onChange={(e) => setForm({ ...form, quota: e.target.value })}/></label><label>Biaya (Rupiah)<input type="number" min="0" value={form.training_fee} onChange={(e) => setForm({ ...form, training_fee: e.target.value })}/></label></div><label className="check-label"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}/> Buka pendaftaran segera</label><button className="button button-full" disabled={saving}>{saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan gelombang'} <ArrowRight size={16}/></button></form>}
    <div className="admin-list">{batches.map((batch) => <article className="registrant-card" key={batch.id}><div className="registrant-top"><div><h3>{batch.batch_name}</h3><p>{batch.program_type}</p></div><span className={`status ${batch.is_active ? 'status-accepted' : 'status-pending'}`}>{batch.is_active ? 'Aktif' : 'Ditutup'}</span></div><div className="registrant-meta"><span>Periode <b>{date(batch.start_date)} – {date(batch.end_date)}</b></span><span>Biaya <b>{batch.training_fee == null ? 'Belum diatur' : money(batch.training_fee)}</b></span><span>{batch.registrant_count} pendaftar</span></div><div className="batch-actions"><button className="text-link" onClick={() => startEdit(batch)}>Ubah gelombang</button>{batch.is_active && <button className="text-link archive-link" onClick={() => closeRegistration(batch)}>Tutup pendaftaran</button>}</div></article>)}{!batches.length && <div className="empty-card">Belum ada gelombang. Buat gelombang pertama untuk membuka pendaftaran.</div>}</div>
  </>;
}

function FormBuilder({ batches, onSaved }) {
  const [batchId, setBatchId] = useState(batches[0]?.id || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const selected = batches.find((batch) => batch.id === batchId);
  const [fields, setFields] = useState(selected?.fields || []);
  const [editingField, setEditingField] = useState('');
  const [draft, setDraft] = useState({ field_name: '', field_label: '', field_type: 'text', options: '', is_required: false });

  useEffect(() => {
    const batch = batches.find((item) => item.id === batchId);
    setFields(batch?.fields || []);
  }, [batchId, batches]);

  async function saveFields(nextFields) {
    setSaving(true); setError('');
    try {
      await adminRequest('batch', { method: 'PATCH', body: JSON.stringify({
        id: selected.id, batch_name: selected.batch_name, program_type: selected.program_type,
        description: selected.description, start_date: selected.start_date, end_date: selected.end_date,
        quota: selected.quota, training_fee: selected.training_fee == null ? '' : selected.training_fee,
        payment_instructions: selected.payment_instructions, is_active: selected.is_active,
        fields: nextFields
      }) });
      setFields(nextFields); onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleAdd(event) {
    event.preventDefault();
    const name = draft.field_name.trim().toLowerCase();
    if (!/^[a-z][a-z0-9_]*$/.test(name) || !draft.field_label.trim()) {
      setError('Nama identifier harus huruf kecil/angka/underscore dan label wajib diisi.');
      return;
    }
    if (fields.some((field) => field.field_name === name && field.field_name !== editingField)) {
      setError('Nama identifier sudah digunakan pada gelombang ini.');
      return;
    }
    const options = ['select', 'radio'].includes(draft.field_type)
      ? draft.options.split(',').map((value) => value.trim()).filter(Boolean)
      : [];
    const newField = {
      field_name: name, field_label: draft.field_label.trim(), field_type: draft.field_type,
      options, is_required: draft.is_required
    };
    const nextFields = editingField
      ? fields.map((field) => field.field_name === editingField ? newField : field)
      : [...fields, newField];
    await saveFields(nextFields);
    setEditingField('');
    setDraft({ field_name: '', field_label: '', field_type: 'text', options: '', is_required: false });
  }

  function editField(field) {
    setEditingField(field.field_name);
    setDraft({ field_name: field.field_name, field_label: field.field_label, field_type: field.field_type,
      options: (field.options || []).join(', '), is_required: Boolean(field.is_required) });
  }

  async function moveField(index, direction) {
    const next = [...fields];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await saveFields(next);
  }

  return <><label className="form-card">Pilih gelombang<select value={batchId} onChange={(e) => setBatchId(e.target.value)}>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batch_name}</option>)}</select></label>
    {error && <p className="notice notice-error">{error}</p>}
    <div className="admin-list" style={{ marginTop: 18 }}>
      {fields.map((field, index) => <article className="registrant-card" key={`${field.field_name}-${index}`}><div className="registrant-top"><div><h3>{field.field_label}</h3><p>{field.field_name} · {field.field_type}{field.is_required ? ' · wajib' : ''}{field.options?.length ? ` · ${field.options.join(', ')}` : ''}</p></div><div className="batch-actions"><button className="text-link" disabled={index === 0 || saving} onClick={() => moveField(index, -1)}>Naik</button><button className="text-link" disabled={index === fields.length - 1 || saving} onClick={() => moveField(index, 1)}>Turun</button><button className="text-link" onClick={() => editField(field)}>Ubah</button><button className="text-link archive-link" onClick={() => saveFields(fields.filter((_, fieldIndex) => fieldIndex !== index))}>Hapus</button></div></div></article>)}
      {!fields.length && <div className="empty-card">Belum ada field tambahan pada gelombang ini.</div>}
    </div>
    {selected && <form className="form-card batch-form" style={{ marginTop: 18 }} onSubmit={handleAdd}><h2>{editingField ? 'Ubah field' : 'Tambah field'}</h2><label>Label field<input required value={draft.field_label} onChange={(e) => setDraft({ ...draft, field_label: e.target.value })}/></label><label>Nama identifier<input required pattern="[a-z][a-z0-9_]*" value={draft.field_name} onChange={(e) => setDraft({ ...draft, field_name: e.target.value.toLowerCase() })}/></label><label>Tipe<select value={draft.field_type} onChange={(e) => setDraft({ ...draft, field_type: e.target.value })}><option value="text">Text</option><option value="number">Number</option><option value="email">Email</option><option value="date">Tanggal</option><option value="textarea">Area teks</option><option value="select">Pilihan</option><option value="radio">Radio</option><option value="file">Berkas</option></select></label>{['select', 'radio'].includes(draft.field_type) && <label>Opsi, pisahkan koma<input required value={draft.options} onChange={(e) => setDraft({ ...draft, options: e.target.value })}/></label>}<label className="check-label"><input type="checkbox" checked={draft.is_required} onChange={(e) => setDraft({ ...draft, is_required: e.target.checked })}/> Field wajib diisi</label><div className="batch-actions"><button type="button" className="text-link" onClick={() => { setEditingField(''); setDraft({ field_name: '', field_label: '', field_type: 'text', options: '', is_required: false }); }}>Bersihkan</button><button className="button button-full" disabled={saving}>{saving ? 'Menyimpan…' : editingField ? 'Simpan perubahan' : 'Simpan field'} <ArrowRight size={16}/></button></div></form>}
  </>;
}

function PaymentsManager() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingId, setSavingId] = useState('');

  async function load() {
    setError('');
    try {
      const result = await adminRequest('payments', { query: { status: filter } });
      setPayments(result.data || []); setSummary(result.summary || {});
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [filter]);

  async function review(payment, status) {
    setSavingId(payment.id); setError(''); setNotice('');
    try {
      let amount = payment.amount_declared;
      let rejectionReason = '';
      if (status === 'approved') {
        const input = window.prompt('Nominal yang disetujui (Rupiah)', String(payment.amount_declared || ''));
        if (!input) return;
        amount = Number(input);
      } else {
        rejectionReason = window.prompt('Alasan penolakan') || '';
        if (!rejectionReason.trim()) { setError('Alasan penolakan wajib diisi.'); return; }
      }
      await adminRequest('payment', { method: 'PATCH', body: JSON.stringify({ id: payment.id, status, amount, rejection_reason: rejectionReason }) });
      setNotice('Keputusan pembayaran berhasil disimpan dan peserta diberi notifikasi bila Fonnte aktif.');
      await load();
    } catch (e) { setError(e.message); }
    finally { setSavingId(''); }
  }

  return <><div className="batch-admin-heading"><div className="registrant-meta"><span>Menunggu <b>{summary.pending_count || 0}</b></span><span>Nominal pending <b>{money(summary.pending_amount || 0)}</b></span><span>Total terverifikasi <b>{money(summary.total_received || 0)}</b></span></div><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="pending">Menunggu</option><option value="approved">Diverifikasi</option><option value="rejected">Ditolak</option><option value="">Semua</option></select></div>{error && <p className="notice notice-error">{error}</p>}{notice && <p className="notice">{notice}</p>}
    <div className="admin-list">{payments.map((payment) => <article className="registrant-card" key={payment.id}><div className="registrant-top"><div><h3>{payment.full_name}</h3><p>{payment.registration_code} · {payment.batch_name}</p></div><span className={`status status-${payment.status === 'approved' ? 'accepted' : payment.status === 'rejected' ? 'rejected' : 'pending'}`}>{payment.status === 'approved' ? 'Diverifikasi' : payment.status === 'rejected' ? 'Ditolak' : 'Menunggu'}</span></div><div className="registrant-meta"><span>Nominal <b>{money(payment.amount_declared)}</b></span><span>WhatsApp <b>{payment.whatsapp}</b></span><span>Diterima <b>{date(payment.created_at.slice(0, 10))}</b></span></div><div className="review-controls"><a className="text-link" href={payment.receipt_url} target="_blank" rel="noreferrer">Lihat bukti Drive</a>{payment.status === 'pending' && <><button className="button button-small" disabled={savingId === payment.id} onClick={() => review(payment, 'approved')}>Setujui</button><button className="text-link" disabled={savingId === payment.id} onClick={() => review(payment, 'rejected')}>Tolak</button></>}</div></article>)}</div>
  </>;
}

function ContentManager() {
  const [content, setContent] = useState({ logo_url: null, slides: [], gallery: [], faqs: [] });
  const [tab, setTab] = useState('slides');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState({ title: '', caption: '', link_url: '', sort_order: 0, is_active: true, image_file: null });

  async function load() {
    try { setContent((await adminRequest('content')).data); setError(''); }
    catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function filePayload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE_BYTES) { setError('Ukuran gambar maksimal 5 MB.'); return; }
    setDraft({ ...draft, image_file: { name: file.name, mimeType: file.type, base64: await fileToBase64(file) } });
  }

  async function save(event) {
    event.preventDefault(); setError(''); setNotice('');
    try {
      const type = tab === 'slides' ? 'slide' : tab === 'gallery' ? 'gallery' : tab === 'faqs' ? 'faq' : 'logo';
      if (type !== 'faq' && !draft.image_file && !draft.image_url) throw new Error('Pilih gambar terlebih dahulu.');
      await adminRequest('content', { method: editingId ? 'PATCH' : 'POST', body: JSON.stringify({ ...draft, id: editingId || undefined, type, question: draft.title, answer: draft.caption, extra: '' }) });
      setEditingId('');
      setDraft({ title: '', caption: '', link_url: '', sort_order: 0, is_active: true, image_file: null });
      setNotice('Konten berhasil disimpan.');
      await load();
    } catch (e) { setError(e.message); }
  }

  async function remove(item) {
    if (!window.confirm('Hapus konten ini?')) return;
    try { await adminRequest('content', { method: 'DELETE', query: { id: item.id } }); await load(); }
    catch (e) { setError(e.message); }
  }

  async function resetLogo() {
    const logo = content.logo_url;
    if (!logo) return;
    const item = (await adminRequest('content')).data;
    const logoItem = item.logo?.[0];
    if (!logoItem) return;
    if (!window.confirm('Hapus logo khusus dan gunakan logo teks bawaan?')) return;
    try { await adminRequest('content', { method: 'DELETE', query: { id: logoItem.id } }); await load(); }
    catch (e) { setError(e.message); }
  }

  function edit(item) {
    setEditingId(item.id);
    setDraft({ title: item.title || '', caption: item.caption || '', link_url: item.link_url || '',
      sort_order: Number(item.sort_order || 0), is_active: ['true', '1'].includes(String(item.is_active).toLowerCase()),
      image_url: item.image_url || '', image_file: null });
    setError('');
  }

  function resetEditor() {
    setEditingId('');
    setDraft({ title: '', caption: '', link_url: '', sort_order: 0, is_active: true, image_file: null });
  }

  const items = tab === 'slides' ? content.slides : tab === 'gallery' ? content.gallery : tab === 'faqs' ? content.faqs : [];
  return <><div className="batch-admin-heading"><div className="review-controls"><button className={tab === 'slides' ? 'button button-small' : 'text-link'} onClick={() => setTab('slides')}>Poster</button><button className={tab === 'gallery' ? 'button button-small' : 'text-link'} onClick={() => setTab('gallery')}>Galeri</button><button className={tab === 'faqs' ? 'button button-small' : 'text-link'} onClick={() => setTab('faqs')}>FAQ</button><button className={tab === 'logo' ? 'button button-small' : 'text-link'} onClick={() => setTab('logo')}>Logo</button></div></div>{error && <p className="notice notice-error">{error}</p>}{notice && <p className="notice">{notice}</p>}
    {tab !== 'logo' && <form className="form-card batch-form" onSubmit={save}><h2>{editingId ? 'Ubah' : 'Tambah'} {tab === 'slides' ? 'poster' : tab === 'gallery' ? 'foto galeri' : 'FAQ'}</h2>{tab === 'faqs' ? <><label>Pertanyaan<input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}/></label><label>Jawaban<textarea required rows="4" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })}/></label></> : <><label>{tab === 'slides' ? 'Judul poster' : 'Judul foto'}<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}/></label><label>Keterangan<textarea rows="3" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })}/></label>{tab === 'slides' && <label>Tautan (opsional)<input value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}/></label>}<label>Gambar<input required={!draft.image_url} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={filePayload}/>{draft.image_url && !draft.image_file && <small>Gambar saat ini akan dipakai jika tidak memilih gambar baru.</small>}</label></>}<label>Urutan<input type="number" min="0" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}/></label><label className="check-label"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}/> Tampilkan</label><div className="batch-actions"><button type="button" className="text-link" onClick={resetEditor}>Batalkan edit</button><button className="button button-full">Simpan konten <ArrowRight size={16}/></button></div></form>}
    {tab === 'logo' && <div className="empty-card">{content.logo_url ? <img className="content-image" src={content.logo_url} alt="Logo saat ini"/> : <p>Belum ada logo khusus.</p>}<form onSubmit={save}><label>Gambar logo<input required type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={filePayload}/></label><button className="button button-full" style={{ marginTop: 12 }}>Simpan logo</button></form>{content.logo_url && <button className="text-link" style={{ marginTop: 12 }} onClick={resetLogo}>Pulihkan logo teks</button>}</div>}
    {tab !== 'logo' && <div className="admin-list">{items.map((item) => <article className="registrant-card" key={item.id}>{item.image_url && <img className="content-image" src={item.image_url} alt={item.title || 'Konten LPK BYE'}/>}<div className="registrant-top"><div><h3>{tab === 'faqs' ? item.title : item.title || '(Tanpa judul)'}</h3><p>{item.caption}</p></div><span className={`status ${['true', '1'].includes(String(item.is_active).toLowerCase()) ? 'status-accepted' : 'status-pending'}`}>{['true', '1'].includes(String(item.is_active).toLowerCase()) ? 'Tampil' : 'Disembunyikan'}</span></div><div className="batch-actions"><button className="text-link" onClick={() => edit(item)}>Ubah</button><button className="text-link archive-link" onClick={() => remove(item)}>Hapus</button></div></article>)}</div>}
  </>;
}
