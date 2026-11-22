import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, CircleDollarSign, ClipboardList, Eye, EyeOff,
  FileText, ImagePlus, LayoutDashboard, Layers3, LogOut, Menu, Pencil, Plus, Search, ShieldCheck,
  MessageCircle, Trash2, UserRound, Users, X
} from 'lucide-react';
import { adminApi, loginAdmin } from './api.js';
import { Logo } from './Landing.jsx';
import AdminSiteContent from './AdminSiteContent.jsx';

const statusStyle = {
  pending: 'bg-amber-50 text-amber-700',
  verified: 'bg-blue-50 text-blue-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700'
};
const statusLabel = { pending: 'Menunggu Verifikasi', verified: 'Sudah Diverifikasi', accepted: 'Diterima', rejected: 'Ditolak' };
const PROGRAM_NAMES = ['SERTIFIKASI BNSP DIGITAL MARKETING', 'PELATIHAN BAHASA JEPANG'];

function batchFormValues(batch) {
  return {
    batch_name: batch?.batch_name || '',
    program_type: batch?.program_type || PROGRAM_NAMES[1],
    description: batch?.description || '',
    start_date: batch ? String(batch.start_date).slice(0, 10) : '',
    end_date: batch ? String(batch.end_date).slice(0, 10) : '',
    quota: batch ? Number(batch.quota) : 0,
    training_fee: batch?.training_fee == null ? '' : Number(batch.training_fee),
    payment_instructions: batch?.payment_instructions || '',
    is_active: batch ? Boolean(batch.is_active) : false
  };
}

export default function Admin() {
  const token = localStorage.getItem('lpk_admin_token');
  const location = useLocation();
  if (!token && location.pathname !== '/admin/login') return <Navigate to="/admin/login" replace/>;
  return <Routes><Route path="login" element={<AdminLogin/>}/><Route path="*" element={<AdminShell/>}/></Routes>;
}

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await loginAdmin(form.email, form.password);
      localStorage.setItem('lpk_admin_token', data.token);
      localStorage.setItem('lpk_admin', JSON.stringify(data.admin));
      navigate('/admin/dashboard');
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return <div className="grid min-h-screen bg-[#fbfaf7] lg:grid-cols-2">
    <div className="hidden bg-wine-700 px-12 py-10 text-white lg:flex lg:flex-col">
      <Logo light/><div className="my-auto max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/50">Ruang administrasi LPK BYE</p><h1 className="mt-6 font-display text-5xl font-semibold leading-tight">Di balik setiap langkah, ada pendampingan yang baik.</h1><p className="mt-6 max-w-md leading-7 text-white/70">Kelola gelombang, susun formulir, dan dampingi proses pendaftaran peserta dalam satu ruang kerja.</p><img className="mt-10 h-72 w-full rounded-2xl object-cover" src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=85" alt="Meja administrasi"/></div><p className="text-xs text-white/40">LPK BYE · Bahasa, budaya, masa depan.</p>
    </div>
    <div className="flex items-center justify-center px-5 py-10"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card md:p-12"><div className="mb-10 lg:hidden"><Logo/></div><div className="grid h-9 w-9 place-items-center rounded-lg bg-wine-50 text-wine-600"><ShieldCheck size={18}/></div>    <h1 className="mt-5 text-3xl font-bold text-navy">Selamat datang kembali.</h1><p className="mt-2 text-sm text-slate-500">Masuk untuk mengelola administrasi LPK BYE.</p>{error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<label className="mt-8 block text-sm font-bold text-navy">Email *<input required type="email" className="input-field" placeholder="Email administrator" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})}/></label><label className="mt-5 block text-sm font-bold text-navy">Password *<div className="relative"><input required minLength={8} type={show ? 'text' : 'password'} className="input-field pr-12" placeholder="Masukkan password" value={form.password} onChange={(e) => setForm({...form,password:e.target.value})}/><button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-5 text-slate-400">{show ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label><button disabled={loading} className="btn-primary mt-7 w-full">{loading ? 'Memproses...' : 'Masuk'} <ArrowRight size={17}/></button><p className="mt-6 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck size={15}/> Akses khusus administrator.</p></form></div>
  </div>;
}

function AdminShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const admin = JSON.parse(localStorage.getItem('lpk_admin') || '{"name":"Administrator LPK BYE","role":"super_admin"}');
  const links = [
    ['/admin/dashboard','Dashboard',LayoutDashboard],
    ['/admin/batches','Gelombang',Layers3],
    ['/admin/site-content','Konten landing',ImagePlus],
    ['/admin/form-builder','Form Builder',ClipboardList],
    ['/admin/registrants','Pendaftar',Users],
    ['/admin/payments','Pembayaran',CircleDollarSign]
  ];
  useEffect(() => setMobileSidebarOpen(false), [location.pathname]);
  function toggleSidebar() {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setDesktopSidebarOpen((open) => !open);
    } else {
      setMobileSidebarOpen(true);
    }
  }
  function logout() { localStorage.removeItem('lpk_admin_token'); localStorage.removeItem('lpk_admin'); navigate('/admin/login'); }
  return <div className="min-h-screen bg-[#f7f8fa]">
    {mobileSidebarOpen && <button type="button" aria-label="Tutup menu navigasi" onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"/>}
    <aside aria-label="Navigasi administrasi" className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[88vw] flex-col border-r border-slate-100 bg-white shadow-xl transition-transform duration-300 lg:w-[250px] lg:shadow-none ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${desktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}`}>
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
        <Logo/>
        <button type="button" aria-label="Tutup menu navigasi" onClick={() => setMobileSidebarOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy lg:hidden"><X size={19}/></button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        <p className="shrink-0 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Ruang administrasi</p>
        <nav aria-label="Menu utama" className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
          {links.map(([path,label,Icon]) => {
            const active = location.pathname.startsWith(path);
            return <Link key={path} onClick={() => setMobileSidebarOpen(false)} to={path} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-wine-50 text-wine-700' : 'text-slate-600 hover:bg-slate-50 hover:text-navy'}`}><Icon size={18} className={active ? 'text-wine-600' : 'text-slate-400'}/><span className="min-w-0 flex-1">{label}</span>{active && <span className="h-1.5 w-1.5 rounded-full bg-wine-600"/>}</Link>;
          })}
        </nav>
        <div className="mt-4 shrink-0 border-t border-slate-100 pt-4">
          <div className="flex items-start gap-3 rounded-xl bg-wine-50 p-3 text-xs leading-5 text-slate-500">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-wine-600"/>
            <p><strong className="text-navy">Kelola dengan tenang.</strong><br/>Semua data tersimpan aman.</p>
          </div>
          <button onClick={logout} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"><LogOut size={18}/>Keluar</button>
        </div>
      </div>
    </aside>
    <div className={`min-h-screen transition-[margin] duration-300 ${desktopSidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-0'}`}>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-8">
        <button type="button" aria-label="Tampilkan atau sembunyikan menu navigasi" title="Tampilkan atau sembunyikan menu navigasi" onClick={toggleSidebar} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-wine-700"><Menu size={21}/></button>
        <div className="min-w-0 flex-1 truncate px-3 text-xs text-slate-400 md:px-5">LPK BYE <ChevronRight className="inline" size={12}/> {links.find(([p]) => location.pathname.startsWith(p))?.[1] || 'Administrasi'}</div>
        <div className="flex shrink-0 items-center gap-3 text-right"><div><p className="max-w-36 truncate text-xs font-bold text-navy">{admin.name}</p><p className="text-[10px] capitalize text-slate-400">{admin.role?.replace('_',' ')}</p></div><div className="grid h-9 w-9 place-items-center rounded-full bg-wine-50 text-xs font-bold text-wine-700">AD</div></div>
      </header>
      <main className="p-5 md:p-8"><Routes><Route path="dashboard" element={<Dashboard/>}/><Route path="batches" element={<Batches/>}/><Route path="site-content" element={<AdminSiteContent/>}/><Route path="form-builder" element={<FormBuilder/>}/><Route path="registrants" element={<Registrants/>}/><Route path="registrants/:id" element={<RegistrantDetail/>}/><Route path="payments" element={<Payments/>}/><Route path="*" element={<Navigate to="/admin/dashboard" replace/>}/></Routes></main>
      <footer className="px-8 py-5 text-[11px] text-slate-400">© 2026 LPK BYE · Bandung <span className="float-right hidden md:inline">Sistem administrasi pendaftaran</span></footer>
    </div>
  </div>;
}

function Dashboard() {
  const [data,setData] = useState(null);
  const [registrants,setRegistrants] = useState([]);
  const [batches,setBatches] = useState([]);
  useEffect(() => {
    let active = true;
    const refreshSummary = () => adminApi('/dashboard')
      .then(({data}) => { if (active) setData(data); })
      .catch((error) => { if (active) console.error('Memperbarui ringkasan dashboard gagal:', error.message); });
    refreshSummary();
    const refreshTimer = window.setInterval(refreshSummary, 60_000);
    adminApi('/batches').then(async ({data}) => {
      if (!active) return;
      setBatches(data || []);
      const results = await Promise.all((data || []).map((batch) => adminApi(`/batches/${batch.id}/registrants`)));
      if (active) setRegistrants(results.flatMap((result) => result.data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }).catch((error) => { if (active) console.error('Memuat data dashboard gagal:', error.message); });
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  },[]);
  const cards = [['Total gelombang',data?.total_batches ?? 0,Layers3],['Gelombang aktif',data?.active_batches ?? 0,CalendarDays],['Total pendaftar',data?.total_registrants ?? 0,Users],['Menunggu verifikasi',data?.pending_registrants ?? 0,ClipboardList],['Pembayaran masuk',formatCurrency(data?.total_payments_received ?? 0),CircleDollarSign]];
  return <><PageTitle label="Selamat datang, administrator" title="Dashboard" text="Ringkasan gelombang dan pendaftaran LPK BYE."/>
    <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label,value,Icon],i)=><div className="card flex items-center justify-between p-6" key={label}><div><p className="text-xs text-slate-500">{label}</p><p className="mt-4 text-3xl font-semibold text-navy">{value}</p></div><Icon className={i%2 ? 'text-wine-500' : 'text-slate-500'}/></div>)}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_330px]"><section className="card p-6"><p className="font-bold text-navy">Gelombang aktif</p><p className="mt-1 text-xs text-slate-400">Setiap gelombang dikelola terpisah berdasarkan program.</p><div className="mt-5 space-y-4">{batches.filter(b=>b.is_active).map(b=><div key={b.id} className="rounded-lg bg-slate-50 p-4"><span className="float-right rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-wine-600">Aktif</span><p className="text-[10px] font-bold uppercase text-wine-600">{b.program_type}</p><h3 className="mt-1 font-bold text-navy">{b.batch_name}</h3><p className="mt-2 text-xs text-slate-500">{formatDate(b.start_date)} - {formatDate(b.end_date)}</p><p className="mt-2 text-[11px] text-slate-500">{b.registrant_count||0} pendaftar · {b.quota||'Tanpa batas'} kuota · {b.training_fee == null?'Biaya belum diatur':formatCurrency(b.training_fee)}</p></div>)}{!batches.some(b=>b.is_active)&&<p className="text-sm text-slate-400">Belum ada gelombang aktif.</p>}<div className="flex gap-3 pt-2"><Link to="/admin/batches" className="btn-secondary">Kelola Gelombang</Link><Link to="/admin/registrants" className="flex items-center gap-2 px-2 text-sm font-bold text-wine-600">Lihat Pendaftar <ArrowRight size={16}/></Link></div></div></section>
    <section className="rounded-2xl bg-navy p-6 text-white"><div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10"><ClipboardList/></div><h3 className="mt-6 text-xl font-bold">Ada data untuk ditinjau.</h3><p aria-live="polite" className="mt-3 text-sm leading-6 text-white/70">{data?.pending_registrants || 0} pendaftar dan {data?.pending_payments || 0} bukti pembayaran menunggu review. Ringkasan diperbarui otomatis tiap menit.</p>{Number(data?.pending_admin_notifications)>0&&<p role="alert" className="mt-3 rounded-lg bg-white/10 p-3 text-xs leading-5 text-amber-100">{data.pending_admin_notifications} notifikasi pendaftar ke WhatsApp admin belum terkirim. Periksa dan kirim ulang dari detail pendaftar.</p>}<Link to="/admin/registrants" className="mt-6 flex items-center justify-center rounded-lg bg-white py-3 text-sm font-bold text-navy">Tinjau Pendaftar <ArrowRight className="ml-2" size={16}/></Link><Link to="/admin/payments" className="mt-2 flex items-center justify-center rounded-lg border border-white/20 py-3 text-sm font-bold text-white">Tinjau Pembayaran <ArrowRight className="ml-2" size={16}/></Link></section></div>
    <section className="card mt-6 overflow-hidden"><div className="border-b p-6"><p className="font-bold text-navy">Pendaftar terbaru</p></div><Table headers={['Nama peserta','Program','Kode registrasi','Status','Tindakan']}>{registrants.slice(0,5).map(r=><tr key={r.id} className="border-t"><td className="p-5"><strong>{r.full_name}</strong><p className="mt-1 text-xs text-slate-400">{r.email}</p></td><td className="p-5 text-xs">{r.program_type}</td><td className="p-5 font-mono text-xs">{r.registration_code}</td><td className="p-5"><Status value={r.status}/></td><td className="p-5"><Link to={`/admin/registrants/${r.id}`} className="text-sm font-bold text-wine-600">Lihat detail →</Link></td></tr>)}</Table></section>
  </>;
}

function Batches() {
  const [batches,setBatches]=useState([]); const [open,setOpen]=useState(false); const [editing,setEditing]=useState(null);
  const load=()=>adminApi('/batches').then(({data})=>setBatches(data)).catch(()=>{});
  useEffect(()=>{load();},[]);
  const remove=async(id)=>{if(confirm('Hapus gelombang ini?')){await adminApi(`/batches/${id}`,{method:'DELETE'});load();}};
  return <><div className="flex items-start justify-between"><PageTitle label="Administrasi" title="Gelombang pelatihan" text="Setiap gelombang hanya untuk satu program dan dapat dibuka secara independen."/><button onClick={()=>setOpen(true)} className="btn-primary hidden sm:flex"><Plus size={17}/>Tambah Gelombang</button></div>
    <div className="mt-5 flex gap-5 text-xs text-slate-500"><span>• {batches.length} gelombang</span><span>• {batches.filter(b=>b.is_active).length} aktif</span></div>
    <section className="card mt-6 overflow-hidden"><div className="p-6 font-bold text-navy">Semua gelombang</div><Table headers={['Nama gelombang','Program · biaya · kuota','Periode','Pendaftar','Status','Aksi']}><>{batches.map(b=><tr key={b.id} className="border-t"><td className="p-5"><strong>{b.batch_name}</strong></td><td className="p-5"><p className="text-xs font-bold text-navy">{b.program_type}</p><p className="mt-1 text-[11px] text-slate-500">{b.training_fee == null?'Biaya belum diatur':formatCurrency(b.training_fee)} · {b.registrant_count||0}/{b.quota||'∞'} peserta</p></td><td className="p-5 text-xs">{formatDate(b.start_date)}<br/><span className="text-slate-400">s.d. {formatDate(b.end_date)}</span></td><td className="p-5">{b.registrant_count||0}</td><td className="p-5">{b.is_active?<Status value="verified">Aktif</Status>:<span className="text-xs text-slate-400">Tidak aktif</span>}</td><td className="p-5"><div className="flex flex-wrap gap-3 text-xs font-bold"><Link className="text-wine-600" to="/admin/form-builder">Form Builder</Link><button onClick={()=>setEditing(b)} className="flex items-center gap-1 text-wine-600"><Pencil size={13}/>Ubah</button><button onClick={()=>remove(b.id)} className="text-red-600">Hapus</button></div></td></tr>)}</></Table></section>
    {(open||editing) && <BatchModal batch={editing} onClose={()=>{setOpen(false);setEditing(null);}} onSaved={()=>{setOpen(false);setEditing(null);load();}}/>}
  </>;
}

function BatchModal({ batch, onClose, onSaved }) {
  const [form,setForm]=useState(()=>batchFormValues(batch));
  const [error,setError]=useState('');
  async function submit(e){
    e.preventDefault(); setError('');
    if(form.end_date < form.start_date){setError('Tanggal selesai tidak boleh sebelum tanggal mulai.');return;}
    try { await adminApi(batch?`/batches/${batch.id}`:'/batches',{method:batch?'PATCH':'POST',body:JSON.stringify({...form,quota:Number(form.quota),training_fee:form.training_fee===''?null:Number(form.training_fee),is_active:Boolean(form.is_active)})}); onSaved(); }
    catch(e){setError(e.message);}
  }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-5"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-white p-7 shadow-2xl"><div className="flex justify-between"><div>  <h2 className="text-xl font-bold text-navy">{batch?'Ubah Gelombang':'Buat Gelombang Baru'}</h2><p className="mt-1 text-xs text-slate-400">Atur periode, kuota, biaya, dan instruksi pembayaran.</p></div><button type="button" onClick={onClose}><X/></button></div>{error&&<p className="mt-4 text-sm text-red-600">{error}</p>}
    <label className="mt-6 block text-sm font-bold">Nama Gelombang<input required className="input-field" value={form.batch_name} onChange={e=>setForm({...form,batch_name:e.target.value})}/></label>
    <label className="mt-4 block text-sm font-bold">Program<select required className="input-field" value={form.program_type} onChange={e=>setForm({...form,program_type:e.target.value})}>{PROGRAM_NAMES.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
    <label className="mt-4 block text-sm font-bold">Deskripsi<textarea className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
    <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Tanggal mulai<input required type="date" className="input-field" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})}/></label><label className="text-sm font-bold">Tanggal selesai<input required type="date" className="input-field" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}/></label></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Kuota peserta<input required type="number" min="0" className="input-field" value={form.quota} onChange={e=>setForm({...form,quota:e.target.value})}/><span className="text-xs font-normal text-slate-400">0 berarti tanpa batas.</span></label><label className="text-sm font-bold">Biaya pelatihan (Rp)<input type="number" min="0" step="1000" className="input-field" value={form.training_fee} onChange={e=>setForm({...form,training_fee:e.target.value})}/><span className="text-xs font-normal text-slate-400">Biaya harus diatur sebelum pendaftaran dapat dikirim.</span></label></div>
    <label className="mt-4 block text-sm font-bold">Instruksi transfer<textarea className="input-field min-h-24" maxLength="5000" value={form.payment_instructions} onChange={e=>setForm({...form,payment_instructions:e.target.value})} placeholder="Contoh: Transfer ke BCA 123456789 a.n. LPK BYE"/></label>
    <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/> Buka pendaftaran sekarang</label>
    <div className="mt-7 flex gap-3"><button type="button" onClick={onClose} className="btn-secondary">Batal</button><button className="btn-primary flex-1">Simpan Gelombang</button></div>
  </form></div>;
}

function FormBuilder(){
  const [batches,setBatches]=useState([]); const [batchId,setBatchId]=useState(''); const [fields,setFields]=useState([]); const [open,setOpen]=useState(false);
  useEffect(()=>{adminApi('/batches').then(({data})=>{setBatches(data||[]);const id=data?.[0]?.id;if(id){setBatchId(String(id));loadBuilder(String(id));}})},[]);
  async function loadBuilder(id){
    try {
      const result=await adminApi(`/batches/${id}/fields`);
      setFields(result.data||[]);
    } catch {
      setFields([]);
    }
  }
  useEffect(()=>{if(batchId)loadBuilder(batchId)},[batchId]);
  async function remove(id){if(confirm('Hapus field ini?')){await adminApi(`/fields/${id}`,{method:'DELETE'});loadBuilder(batchId);}}
  return <><div className="flex items-start justify-between"><PageTitle label="Administrasi" title="Form Builder" text="Susun pertanyaan dan urutan formulir untuk setiap gelombang."/><button onClick={()=>setOpen(true)} className="btn-primary hidden sm:flex"><Plus size={17}/>Tambah Field</button></div>
    <section className="card mt-6 p-6"><label className="text-xs font-bold text-slate-500">Gelombang<select className="input-field" value={batchId} onChange={e=>setBatchId(e.target.value)}>{batches.map(b=><option key={b.id} value={b.id}>{b.batch_name}</option>)}</select></label></section>
    <section className="card mt-5 overflow-hidden"><div className="flex items-center justify-between border-b p-6"><p className="font-bold text-navy">Field formulir</p><button onClick={()=>setOpen(true)} className="text-sm font-bold text-wine-600 sm:hidden">+ Tambah Field</button></div>
      {fields.length?fields.map(field=><div key={field.id} className="flex items-center gap-4 border-t p-5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">{field.order_index}</span><div className="flex-1"><p className="text-sm font-bold text-navy">{field.field_label}</p><p className="mt-1 text-xs text-slate-400">{field.field_name} · {field.field_type}{field.is_required?' · Wajib':''}</p></div><button onClick={()=>remove(field.id)} className="p-2 text-red-500"><Trash2 size={17}/></button></div>):<p className="p-6 text-sm text-slate-400">Belum ada field pada gelombang ini.</p>}
    </section>
    {open&&<FieldModal batchId={batchId} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false);loadBuilder(batchId)}}/>}
  </>;
}

function FieldModal({batchId,onClose,onSaved}) {
  const [form,setForm]=useState({field_name:'',field_label:'',field_type:'text',options:'',is_required:false,order_index:1});
  const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setError('');try{const options=['select','radio'].includes(form.field_type)?form.options.split(',').map(v=>v.trim()).filter(Boolean):null;await adminApi(`/batches/${batchId}/fields`,{method:'POST',body:JSON.stringify({...form,options,is_required:Boolean(form.is_required),order_index:Number(form.order_index)})});onSaved();}catch(e){setError(e.message)}}
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/30 p-5"><form onSubmit={submit} className="w-full max-w-xl rounded-2xl bg-white p-7 shadow-2xl"><div className="flex justify-between"><h2 className="text-xl font-bold text-navy">Tambah Field</h2><button type="button" onClick={onClose}><X/></button></div>{error&&<p className="mt-4 text-sm text-red-600">{error}</p>}<label className="mt-6 block text-sm font-bold">Label Field<input required className="input-field" value={form.field_label} onChange={e=>setForm({...form,field_label:e.target.value})}/></label><label className="mt-4 block text-sm font-bold">Nama Identifier<input required pattern="[a-z][a-z0-9_]*" className="input-field" value={form.field_name} onChange={e=>setForm({...form,field_name:e.target.value.toLowerCase()})}/></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Tipe<select className="input-field" value={form.field_type} onChange={e=>setForm({...form,field_type:e.target.value})}>{['text','number','email','date','select','radio','textarea','file'].map(t=><option key={t}>{t}</option>)}</select></label><label className="text-sm font-bold">Urutan<input type="number" className="input-field" value={form.order_index} onChange={e=>setForm({...form,order_index:e.target.value})}/></label></div>{['select','radio'].includes(form.field_type)&&<label className="mt-4 block text-sm font-bold">Opsi (pisahkan koma)<input required className="input-field" value={form.options} onChange={e=>setForm({...form,options:e.target.value})}/></label>}<label className="mt-4 flex gap-2 text-sm"><input type="checkbox" checked={form.is_required} onChange={e=>setForm({...form,is_required:e.target.checked})}/> Field wajib diisi</label><div className="mt-7 flex gap-3"><button type="button" onClick={onClose} className="btn-secondary">Batal</button><button className="btn-primary flex-1">Simpan Field</button></div></form></div>;
}

function Registrants(){
  const [batches,setBatches]=useState([]); const [batchId,setBatchId]=useState(''); const [rows,setRows]=useState([]); const [search,setSearch]=useState(''); const [status,setStatus]=useState(''); const [programType,setProgramType]=useState('');
  useEffect(()=>{adminApi('/batches').then(({data})=>{setBatches(data||[]);if(data?.[0])setBatchId(String(data[0].id));});},[]);
  useEffect(()=>{if(batchId)adminApi(`/batches/${batchId}/registrants`).then(({data})=>setRows(data||[])).catch(()=>setRows([]));},[batchId]);
  const filtered=rows.filter(r=>(!search||`${r.full_name} ${r.registration_code} ${r.whatsapp} ${r.program_type}`.toLowerCase().includes(search.toLowerCase()))&&(!status||r.status===status)&&(!programType||r.program_type===programType));
  return <><PageTitle label="Administrasi" title="Pendaftar" text="Temukan data peserta dan tindaklanjut status setiap gelombang."/>
    <section className="card mt-6 p-6"><label className="text-xs font-bold text-slate-500">Gelombang<select className="input-field" value={batchId} onChange={e=>setBatchId(e.target.value)}>{batches.map(b=><option key={b.id} value={b.id}>{b.batch_name}</option>)}</select></label><div className="mt-5 grid gap-4 md:grid-cols-3"><label className="relative"><Search className="absolute left-4 top-5 text-slate-400" size={18}/><input className="input-field pl-11" placeholder="Cari nama, kode, kontak, atau program" value={search} onChange={e=>setSearch(e.target.value)}/></label><select className="input-field mt-0" value={programType} onChange={e=>setProgramType(e.target.value)}><option value="">Semua program</option>{PROGRAM_NAMES.map(name=><option key={name} value={name}>{name}</option>)}</select><select className="input-field mt-0" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Semua status</option>{Object.keys(statusLabel).map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}</select></div></section>
    <section className="card mt-6 overflow-hidden"><div className="border-b p-6"><p className="font-bold text-navy">Daftar pendaftar</p><p className="mt-1 text-xs text-slate-400">{filtered.length} pendaftar</p></div><Table headers={['Nama peserta','Program','Kode registrasi','Kontak','Status','Aksi']}><>{filtered.map(r=><tr key={r.id} className="border-t"><td className="p-5"><strong>{r.full_name}</strong></td><td className="p-5 text-xs">{r.program_type}</td><td className="p-5 font-mono text-xs">{r.registration_code}</td><td className="p-5 text-xs"><p>{r.whatsapp}</p><p className="mt-1 text-slate-400">{r.email}</p></td><td className="p-5"><Status value={r.status}/></td><td className="p-5"><Link className="text-sm font-bold text-wine-600" to={`/admin/registrants/${r.id}`}>Detail →</Link></td></tr>)}</></Table>{!filtered.length&&<p className="p-8 text-center text-sm text-slate-400">Belum ada pendaftar yang cocok.</p>}</section>
  </>;
}

function RegistrantDetail(){
  const {id}=useParams(); const [registrant,setRegistrant]=useState(null); const [status,setStatusValue]=useState('pending'); const [notes,setNotes]=useState(''); const [feedback,setFeedback]=useState(''); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  useEffect(()=>{load();},[id]);
  async function load(){const batches=await adminApi('/batches');for(const batch of batches.data||[]){const result=await adminApi(`/batches/${batch.id}/registrants`);const found=result.data?.find(r=>String(r.id)===String(id));if(found){setRegistrant(found);setStatusValue(found.status);setNotes(found.notes||'');setFeedback(found.participant_feedback||'');break;}}}
  async function save(){setSaving(true);setError('');try{const result=await adminApi(`/registrants/${id}/status`,{method:'PATCH',body:JSON.stringify({status,notes,feedback})});const notificationStatus=result.data?.notification_status;if(notificationStatus==='failed')setError('Status tersimpan, tetapi pesan WhatsApp gagal dikirim. Periksa konfigurasi Fonnte.');else if(notificationStatus==='not_configured')setError('Status tersimpan. Token Fonnte belum dikonfigurasi, sehingga notifikasi tidak dikirim.');await load();}catch(e){setError(e.message)}finally{setSaving(false)}}
  async function retryNotification(type){setError('');try{await adminApi(`/registrants/${id}/notify`,{method:'POST',body:JSON.stringify({type})});}catch(e){setError(e.message)}await load().catch(e=>setError(e.message))}
  if(!registrant)return <p className="text-sm text-slate-500">Memuat detail pendaftar...</p>;
  return <><Link to="/admin/registrants" className="mb-5 flex items-center gap-2 text-sm text-wine-600"><ArrowLeft size={16}/>Kembali ke daftar pendaftar</Link><PageTitle label="Administrasi" title="Detail pendaftar" text="Periksa data dan jawaban sebelum memperbarui status peserta."/><div className="card mt-6 flex items-center gap-4 p-6"><div className="grid h-12 w-12 place-items-center rounded-full bg-wine-50 font-bold text-wine-600">{registrant.full_name.split(' ').map(v=>v[0]).slice(0,2).join('')}</div><div><p className="font-bold text-navy">{registrant.full_name}</p><p className="mt-1 font-mono text-xs text-slate-400">{registrant.registration_code}</p></div><div className="ml-auto"><Status value={registrant.status}/></div></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="card p-6"><h3 className="font-bold text-navy">Data diri</h3><dl className="mt-5 grid gap-5 sm:grid-cols-2"><Info label="Nomor WhatsApp" value={registrant.whatsapp}/><Info label="Email" value={registrant.email||'-'}/><Info label="Program" value={registrant.program_type}/><Info label="Gelombang" value={registrant.batch_name}/><Info label="Tanggal daftar" value={formatDate(registrant.created_at)}/></dl><div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3"><Info label="Biaya pelatihan" value={formatCurrency(registrant.training_fee)}/><Info label="Sudah dibayar" value={formatCurrency(registrant.paid_total)}/><Info label="Sisa pembayaran" value={formatCurrency(registrant.balance_due)}/></div></section><section className="card p-6"><h3 className="font-bold text-navy">Verifikasi pendaftaran</h3><label className="mt-5 block text-xs font-bold text-slate-500">Status Pendaftaran<select className="input-field" value={status} onChange={e=>setStatusValue(e.target.value)}>{Object.keys(statusLabel).map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}</select></label><label className="mt-4 block text-xs font-bold text-slate-500">Pesan untuk peserta<textarea maxLength={2000} className="input-field min-h-24" value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Pesan ini akan dikirim melalui WhatsApp dan ditampilkan di portal."/></label><label className="mt-4 block text-xs font-bold text-slate-500">Catatan internal admin<textarea maxLength={5000} className="input-field min-h-24" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Hanya terlihat oleh admin."/></label>{error&&<p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">{error}</p>}<button disabled={saving} onClick={save} className="btn-primary mt-5 w-full">{saving?'Menyimpan...':'Simpan & Beri Tahu Peserta'} <Check size={17}/></button></section>
      <section className="card p-6 lg:col-span-2"><h3 className="font-bold text-navy">Notifikasi Fonnte</h3><p className="mt-1 text-xs leading-5 text-slate-500">Kirim ulang pesan sambutan atau pembaruan status ke WhatsApp peserta menggunakan Fonnte.</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={()=>retryNotification('welcome')} className="btn-secondary">Kirim ulang pesan sambutan</button><button onClick={()=>retryNotification('status')} className="btn-secondary">Kirim ulang status terkini</button></div></section>
      <section className="card p-6 lg:col-span-2"><h3 className="font-bold text-navy">Jawaban formulir</h3><div className="mt-5 grid gap-5 md:grid-cols-2">{registrant.answers?.map((answer,i)=>      <div key={i} className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-400">{answer.field_label}</p><p className="mt-2 text-sm font-bold text-navy">{/^https?:\/\//i.test(answer.answer_value||'')?<a href={answer.answer_value} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-wine-600"><FileText size={17}/>Lihat berkas</a>:answer.answer_value||'-'}</p></div>)}</div></section>
    </div></>;
}

function Payments(){
  const [payments,setPayments]=useState([]);
  const [summary,setSummary]=useState({});
  const [filter,setFilter]=useState('pending');
  const [bot,setBot]=useState(null);
  const [selected,setSelected]=useState(null);
  const [error,setError]=useState('');
  const load=()=>adminApi(`/payments${filter?`?status=${filter}`:''}`).then(({data,summary:totals})=>{setPayments(data||[]);setSummary(totals||{});}).catch(e=>setError(e.message));
  const loadBot=()=>adminApi('/fonnte/status').then(({data})=>setBot(data)).catch(e=>setError(e.message));
  useEffect(()=>{load();},[filter]);
  useEffect(()=>{loadBot();},[]);
  async function retryNotification(payment){
    try{await adminApi(`/payments/${payment.id}/notify`,{method:'POST'});load();}
    catch(e){setError(e.message);}
  }
  async function viewReceipt(payment){
    if(!payment.receipt_url){setError('Tautan bukti pembayaran tidak tersedia.');return;}
    window.open(payment.receipt_url,'_blank','noopener,noreferrer');
  }

  return <><PageTitle label="Administrasi" title="Pembayaran pelatihan" text="Kelola cicilan peserta, bukti transfer, dan verifikasi pembayaran."/>
    {error&&<p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <section className="card mt-6 p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-wine-50 text-wine-600"><MessageCircle/></div><div><h2 className="font-bold text-navy">Notifikasi WhatsApp via Fonnte</h2><p className={`mt-1 text-xs font-semibold ${bot?.configured?'text-emerald-700':'text-amber-700'}`}>{bot?.configured?'Token Fonnte tersedia':'Token Fonnte belum dikonfigurasi'}</p></div></div><p className="mt-4 max-w-xl text-xs leading-5 text-slate-500">Pengiriman notifikasi dan pengingat status menggunakan API Fonnte. Lite tidak memerlukan scan QR atau sesi Baileys.</p><div className="mt-4 flex flex-wrap gap-3 text-xs"><span className={`rounded-full px-3 py-1.5 ${bot?.admin_number_configured?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}>Nomor admin {bot?.admin_number_configured?'diatur':'opsional'}</span><span className={`rounded-full px-3 py-1.5 ${bot?.webhook_configured?'bg-emerald-50 text-emerald-700':'bg-slate-100 text-slate-500'}`}>Webhook bot {bot?.webhook_configured?'diatur':'belum diatur'}</span></div></section>
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><SummaryCard title="Menunggu verifikasi" value={summary.pending_count||0}/><SummaryCard title="Perkiraan nominal tertunda" value={formatCurrency(summary.pending_amount)}/><SummaryCard title="Pembayaran terverifikasi" value={formatCurrency(summary.total_received)}/></div>
    <section className="card mt-6 overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h2 className="font-bold text-navy">Transaksi cicilan</h2><p className="mt-1 text-xs text-slate-400">{payments.length} transaksi ditampilkan</p></div><select className="input-field mt-0 w-52" value={filter} onChange={e=>setFilter(e.target.value)}><option value="pending">Menunggu verifikasi</option><option value="approved">Disetujui</option><option value="rejected">Ditolak</option><option value="">Semua transaksi</option></select></div>
      <Table headers={['Peserta','Bukti pembayaran','Nominal transfer','Status','Tindakan']}>{payments.map(payment=><tr key={payment.id} className="border-t align-top"><td className="p-5"><strong>{payment.full_name}</strong><p className="mt-1 text-xs text-wine-600">{payment.program_type}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{payment.registration_code}</p><p className="mt-1 text-xs text-slate-500">{payment.whatsapp}</p><p className="mt-1 text-[10px] text-slate-400">Biaya {formatCurrency(payment.training_fee)} · Dibayar {formatCurrency(payment.paid_total)}</p></td><td className="p-5"><button onClick={()=>viewReceipt(payment)} className="font-bold text-wine-600">Lihat bukti ↗</button><p className="mt-2 text-[10px] text-slate-400">Bukti diperiksa secara manual.</p></td><td className="p-5 text-sm font-bold text-navy">{formatCurrency(payment.amount_approved||payment.amount_declared)}{payment.status==='approved'&&<p className="mt-1 text-[10px] font-normal text-slate-400">Disetujui admin</p>}{payment.status==='rejected'&&<p className="mt-1 max-w-40 text-[10px] font-normal text-red-600">{payment.rejection_reason}</p>}</td><td className="p-5"><PaymentStatus status={payment.status}/>{payment.notification_status==='failed'&&<p className="mt-2 text-[10px] text-red-600">Notifikasi gagal</p>}</td><td className="p-5">{payment.status==='pending'?<button onClick={()=>setSelected(payment)} className="rounded-lg bg-wine-50 px-3 py-2 text-xs font-bold text-wine-700">Tinjau</button>:payment.notification_status==='failed'?<button onClick={()=>retryNotification(payment)} className="text-xs font-bold text-wine-600">Kirim ulang pesan</button>:<span className="text-xs text-slate-400">Selesai</span>}</td></tr>)}</Table>
      {!payments.length&&<p className="p-10 text-center text-sm text-slate-400">Belum ada transaksi pada filter ini.</p>}
    </section>
    {selected&&<PaymentReviewModal payment={selected} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null);load();}}/>}
  </>;
}

function PaymentReviewModal({payment,onClose,onSaved}){
  const [decision,setDecision]=useState('approved');
  const [amount,setAmount]=useState(payment.amount_declared||'');
  const [reason,setReason]=useState('');
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  function viewReceipt(){if(payment.receipt_url)window.open(payment.receipt_url,'_blank','noopener,noreferrer');else setError('Tautan bukti pembayaran tidak tersedia.');}
  async function submit(event){
    event.preventDefault();setSaving(true);setError('');
    const body=decision==='approved'?{status:decision,amount:Number(amount)}:{status:decision,rejection_reason:reason};
    try{await adminApi(`/payments/${payment.id}/review`,{method:'PATCH',body:JSON.stringify(body)});onSaved();}
    catch(e){setError(e.message);}
    finally{setSaving(false);}
  }
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/40 p-5"><form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-navy">Tinjau pembayaran</h2><p className="mt-1 text-sm text-slate-500">{payment.full_name} · {payment.registration_code}</p></div><button type="button" onClick={onClose}><X/></button></div><div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm"><p>Nominal yang dilaporkan peserta: <strong>{formatCurrency(payment.amount_declared)}</strong></p><p className="mt-1 text-xs text-slate-500">Periksa nominal pada bukti pembayaran secara manual sebelum memberi keputusan.</p><button type="button" className="mt-3 font-bold text-wine-600" onClick={viewReceipt}>Buka bukti transfer ↗</button></div>{error&&<p className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={()=>setDecision('approved')} className={`rounded-lg border p-3 text-sm font-bold ${decision==='approved'?'border-emerald-500 bg-emerald-50 text-emerald-700':''}`}>Setujui</button><button type="button" onClick={()=>setDecision('rejected')} className={`rounded-lg border p-3 text-sm font-bold ${decision==='rejected'?'border-red-500 bg-red-50 text-red-700':''}`}>Tolak</button></div>{decision==='approved'?<label className="mt-4 block text-sm font-bold">Nominal yang disetujui (Rp)<input required type="number" min="1" step="1" className="input-field" value={amount} onChange={e=>setAmount(e.target.value)}/></label>:<label className="mt-4 block text-sm font-bold">Alasan penolakan<textarea required maxLength="2000" className="input-field min-h-24" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Contoh: nominal pada bukti tidak sesuai"/></label>}<div className="mt-6 flex gap-3"><button type="button" onClick={onClose} className="btn-secondary">Batal</button><button disabled={saving} className="btn-primary flex-1">{saving?'Menyimpan...':decision==='approved'?'Setujui Pembayaran':'Tolak Pembayaran'}</button></div></form></div>;
}

function SummaryCard({title,value}){return <div className="card p-5"><p className="text-xs text-slate-500">{title}</p><p className="mt-3 text-2xl font-bold text-navy">{value}</p></div>}
function PaymentStatus({status}){const classes={pending:'bg-amber-50 text-amber-700',approved:'bg-emerald-50 text-emerald-700',rejected:'bg-red-50 text-red-700'};const labels={pending:'Menunggu',approved:'Disetujui',rejected:'Ditolak'};return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${classes[status]||classes.pending}`}>{labels[status]||status}</span>}
function PageTitle({label,title,text}){return <div><p className="eyebrow">{label}</p><h1 className="mt-2 font-display text-3xl font-semibold text-navy md:text-[38px]">{title}</h1><p className="mt-2 text-sm text-slate-500">{text}</p></div>}
function Table({headers,children}){return <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left"><thead><tr className="text-[10px] uppercase tracking-wider text-slate-400">{headers.map(h=><th key={h} className="px-5 py-4 font-semibold">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}
function Status({value,children}){return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${statusStyle[value]||statusStyle.pending}`}>{children||statusLabel[value]||value}</span>}
function Info({label,value}){return <div><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-2 text-sm font-bold text-navy">{value}</dd></div>}
function formatDate(value){return value?new Date(`${String(value).slice(0,10)}T00:00:00`).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'-'}
function formatCurrency(value){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value||0))}
