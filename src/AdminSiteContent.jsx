import { useEffect, useState } from 'react';
import {
  ArrowUpRight, CircleHelp, ImagePlus, Images, LoaderCircle, Pencil, Plus, RotateCcw,
  Save, Trash2, Upload, X
} from 'lucide-react';
import { adminApi } from './api.js';
import { assetUrl } from './utils/assets.js';

const TABS = [
  { id: 'posters', label: 'Poster & banner', icon: ImagePlus },
  { id: 'gallery', label: 'Galeri', icon: Images },
  { id: 'faqs', label: 'FAQ', icon: CircleHelp },
  { id: 'logo', label: 'Logo', icon: Upload }
];

export default function AdminSiteContent() {
  const [activeTab, setActiveTab] = useState('posters');
  const [content, setContent] = useState({ logo_url: null, slides: [], gallery: [], faqs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [slideEditor, setSlideEditor] = useState(null);
  const [galleryEditor, setGalleryEditor] = useState(null);
  const [faqEditor, setFaqEditor] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [savingLogo, setSavingLogo] = useState(false);

  async function loadContent() {
    const result = await adminApi('/site-content');
    setContent(result.data);
  }

  useEffect(() => {
    loadContent()
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function saveLogo(event) {
    event.preventDefault();
    if (!logoFile) {
      setError('Pilih file logo terlebih dahulu.');
      return;
    }
    setSavingLogo(true);
    setError('');
    setNotice('');
    try {
      const body = new FormData();
      body.append('logo', logoFile);
      await adminApi('/site-content/logo', { method: 'PUT', body });
      setLogoFile(null);
      await loadContent();
      setNotice('Logo berhasil diperbarui dan akan tampil di halaman publik.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingLogo(false);
    }
  }

  async function resetLogo() {
    if (!confirm('Kembalikan logo ke identitas teks bawaan LPK BYE?')) return;
    setError('');
    setNotice('');
    try {
      await adminApi('/site-content/logo', { method: 'DELETE' });
      await loadContent();
      setNotice('Logo bawaan berhasil dipulihkan.');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteItem(type, item) {
    const isSlide = type === 'slide';
    const isGallery = type === 'gallery';
    const label = isSlide ? 'poster' : isGallery ? 'foto galeri' : 'FAQ';
    if (!confirm(`Hapus ${label} ini dari landing page?`)) return;
    setError('');
    setNotice('');
    try {
      const endpoint = isSlide ? 'landing-slides' : isGallery ? 'landing-gallery' : 'landing-faqs';
      await adminApi(`/${endpoint}/${item.id}`, { method: 'DELETE' });
      await loadContent();
      setNotice(`${label[0].toUpperCase()}${label.slice(1)} berhasil dihapus.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function reloadAfterSave(message) {
    await loadContent();
    setSlideEditor(null);
    setGalleryEditor(null);
    setFaqEditor(null);
    setError('');
    setNotice(message);
  }

  const currentTab = TABS.find((tab) => tab.id === activeTab);
  const CurrentIcon = currentTab.icon;

  return <div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-wine-600">Identitas & pemasaran</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-navy md:text-[38px]">Konten landing page</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Atur materi visual, pertanyaan pengunjung, dan identitas yang tampil di halaman publik.</p>
      </div>
      <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">Lihat landing page <ArrowUpRight size={16}/></a>
    </div>

    {error && <div role="alert" className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button aria-label="Tutup pesan" onClick={() => setError('')}><X size={17}/></button></div>}
    {notice && <div role="status" className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button aria-label="Tutup pesan" onClick={() => setNotice('')}><X size={17}/></button></div>}

    <nav aria-label="Pengaturan konten" className="mt-7 flex gap-2 overflow-x-auto border-b border-slate-200">
      {TABS.map(({ id, label, icon: Icon }) => <button
        key={id}
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
          activeTab === id ? 'border-wine-600 text-wine-700' : 'border-transparent text-slate-500 hover:text-navy'
        }`}
      >
        <Icon size={17}/>{label}
      </button>)}
    </nav>

    <div className="mt-6 flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-wine-50 text-wine-700"><CurrentIcon size={19}/></span>
      <div><h2 className="font-bold text-navy">{currentTab.label}</h2><p className="mt-0.5 text-xs text-slate-400">{loading ? 'Memuat konten...' : 'Perubahan tersimpan dan tampil di halaman publik.'}</p></div>
    </div>

    {loading ? <div className="card mt-5 flex items-center gap-3 p-8 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/> Memuat pengaturan konten...</div>
      : activeTab === 'posters' ? <section className="mt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-bold text-navy">{content.slides.length} materi visual</p><p className="mt-1 text-xs text-slate-500">Poster aktif tampil bergantian pada area utama landing page.</p></div>
          <button type="button" onClick={() => setSlideEditor({})} className="btn-primary"><Plus size={17}/>Tambah poster</button>
        </div>
        {content.slides.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {content.slides.map((slide) => <article key={slide.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/10] bg-slate-100">
              <img src={assetUrl(slide.image_url)} alt={slide.title || 'Poster LPK BYE'} className="h-full w-full object-cover"/>
              <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold ${slide.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-900/70 text-white'}`}>{slide.is_active ? 'Tampil' : 'Disembunyikan'}</span>
              <span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/65 px-2.5 py-1.5 text-[10px] font-semibold text-white">Urutan {slide.sort_order}</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-navy">{slide.title || 'Poster tanpa judul'}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{slide.caption || 'Tidak ada keterangan tambahan.'}</p>
              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setSlideEditor(slide)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-wine-700 hover:bg-wine-50"><Pencil size={14}/>Ubah</button>
                <button type="button" onClick={() => deleteItem('slide', slide)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14}/>Hapus</button>
              </div>
            </div>
          </article>)}
        </div> : <EmptyState title="Belum ada poster" text="Unggah banner promosi pertama untuk menghidupkan area utama landing page." action="Tambah poster" onAction={() => setSlideEditor({})}/>}
      </section> : activeTab === 'gallery' ? <section className="mt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-bold text-navy">{content.gallery.length} foto kegiatan</p><p className="mt-1 text-xs text-slate-500">Pilih foto terbaik untuk menampilkan suasana belajar dan kegiatan LPK BYE.</p></div>
          <button type="button" onClick={() => setGalleryEditor({})} className="btn-primary"><Plus size={17}/>Tambah foto</button>
        </div>
        {content.gallery.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {content.gallery.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-slate-100">
              <img src={assetUrl(item.image_url)} alt={item.title || 'Galeri kegiatan LPK BYE'} className="h-full w-full object-cover"/>
              <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold ${item.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-900/70 text-white'}`}>{item.is_active ? 'Tampil' : 'Disembunyikan'}</span>
              <span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/65 px-2.5 py-1.5 text-[10px] font-semibold text-white">Urutan {item.sort_order}</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-navy">{item.title || 'Foto tanpa judul'}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{item.caption || 'Tidak ada keterangan tambahan.'}</p>
              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setGalleryEditor(item)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-wine-700 hover:bg-wine-50"><Pencil size={14}/>Ubah</button>
                <button type="button" onClick={() => deleteItem('gallery', item)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 size={14}/>Hapus</button>
              </div>
            </div>
          </article>)}
        </div> : <EmptyState title="Galeri masih kosong" text="Tambahkan foto kegiatan, kelas, atau momen peserta untuk ditampilkan di landing page." action="Tambah foto" onAction={() => setGalleryEditor({})}/>}
      </section> : activeTab === 'faqs' ? <section className="mt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-bold text-navy">{content.faqs.length} pertanyaan</p><p className="mt-1 text-xs text-slate-500">Susun jawaban yang membantu calon peserta mengambil keputusan.</p></div>
          <button type="button" onClick={() => setFaqEditor({})} className="btn-primary"><Plus size={17}/>Tambah FAQ</button>
        </div>
        {content.faqs.length ? <div className="space-y-3">
          {content.faqs.map((faq) => <article key={faq.id} className="card flex flex-wrap items-start gap-4 p-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-wine-50 text-xs font-bold text-wine-700">{faq.sort_order}</span>
            <div className="min-w-[220px] flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-navy">{faq.question}</h3><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${faq.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{faq.is_active ? 'Tampil' : 'Disembunyikan'}</span></div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{faq.answer}</p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => setFaqEditor(faq)} aria-label="Ubah FAQ" className="grid h-9 w-9 place-items-center rounded-lg text-wine-700 hover:bg-wine-50"><Pencil size={16}/></button>
              <button type="button" onClick={() => deleteItem('faq', faq)} aria-label="Hapus FAQ" className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={16}/></button>
            </div>
          </article>)}
        </div> : <EmptyState title="Belum ada FAQ" text="Tambahkan jawaban untuk pertanyaan yang sering disampaikan calon peserta." action="Tambah FAQ" onAction={() => setFaqEditor({})}/>}
      </section> : <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="card flex min-h-64 flex-col items-center justify-center bg-cream p-8 text-center">
          {content.logo_url
            ? <img src={assetUrl(content.logo_url)} alt="Logo LPK BYE saat ini" className="max-h-28 max-w-full object-contain"/>
            : <DefaultMark/>}
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-slate-400">{content.logo_url ? 'Logo saat ini' : 'Identitas bawaan'}</p>
          <p className="mt-1 text-sm font-bold text-navy">LPK BYE · Bandung</p>
        </div>
        <div className="card p-6 md:p-8">
          <h3 className="text-lg font-bold text-navy">Perbarui logo</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Logo baru akan digunakan pada navbar dan footer halaman publik. Gunakan gambar transparan agar hasilnya tetap rapi di latar terang.</p>
          <LogoForm file={logoFile} onFileChange={setLogoFile} onSubmit={saveLogo} saving={savingLogo}/>
          {content.logo_url && <button type="button" onClick={resetLogo} className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-wine-700"><RotateCcw size={14}/>Pulihkan logo bawaan</button>}
        </div>
      </section>}

    {slideEditor && <SlideEditor slide={slideEditor.id ? slideEditor : null} onClose={() => setSlideEditor(null)} onSaved={() => reloadAfterSave(slideEditor.id ? 'Poster berhasil diperbarui.' : 'Poster berhasil ditambahkan.')}/>}
    {galleryEditor && <GalleryEditor item={galleryEditor.id ? galleryEditor : null} onClose={() => setGalleryEditor(null)} onSaved={() => reloadAfterSave(galleryEditor.id ? 'Foto galeri berhasil diperbarui.' : 'Foto galeri berhasil ditambahkan.')}/>}
    {faqEditor && <FaqEditor faq={faqEditor.id ? faqEditor : null} onClose={() => setFaqEditor(null)} onSaved={() => reloadAfterSave(faqEditor.id ? 'FAQ berhasil diperbarui.' : 'FAQ berhasil ditambahkan.')}/>}
  </div>;
}

function LogoForm({ file, onFileChange, onSubmit, saving }) {
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!file) {
      setPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return <form onSubmit={onSubmit} className="mt-6">
    <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-wine-500 hover:bg-wine-50/40">
      <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => onFileChange(event.target.files?.[0] || null)}/>
      {preview ? <img src={preview} alt="Pratinjau logo baru" className="max-h-20 max-w-full object-contain"/> : <Upload className="text-wine-600"/>}
      <span className="mt-3 text-sm font-semibold text-navy">{file?.name || 'Klik untuk memilih gambar logo'}</span>
      <span className="mt-1 text-xs text-slate-400">JPG, PNG, atau WEBP · maksimal 5 MB</span>
    </label>
    <button type="submit" disabled={!file || saving} className="btn-primary mt-4 w-full">{saving ? <LoaderCircle size={16} className="animate-spin"/> : <Save size={16}/>}Simpan logo</button>
  </form>;
}

function SlideEditor({ slide, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: slide?.title || '',
    caption: slide?.caption || '',
    link_url: slide?.link_url || '',
    sort_order: slide?.sort_order ?? 1,
    is_active: slide ? Boolean(slide.is_active) : true
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(slide?.image_url ? assetUrl(slide.image_url) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!image) {
      setPreview(slide?.image_url ? assetUrl(slide.image_url) : '');
      return undefined;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image, slide?.image_url]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('caption', form.caption.trim());
    body.append('link_url', form.link_url.trim());
    body.append('sort_order', String(Number(form.sort_order)));
    body.append('is_active', String(form.is_active));
    if (image) body.append('image', image);
    try {
      await adminApi(slide ? `/landing-slides/${slide.id}` : '/landing-slides', {
        method: slide ? 'PATCH' : 'POST',
        body
      });
      await onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return <Modal title={slide ? 'Ubah poster' : 'Tambah poster'} onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-semibold text-navy">Gambar poster {!slide && <span className="text-wine-600">*</span>}
        <input required={!slide} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-wine-50 file:px-3 file:py-2 file:font-semibold file:text-wine-700"/>
        <span className="mt-1 block text-xs font-normal text-slate-400">Rasio landscape 16:9 disarankan · JPG, PNG, WEBP · maks. 5 MB</span>
      </label>
      {preview && <img src={preview} alt="Pratinjau poster" className="max-h-48 w-full rounded-xl bg-slate-100 object-cover"/>}
      <label className="block text-sm font-semibold text-navy">Judul poster<input maxLength={180} className="input-field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Gelombang baru telah dibuka"/></label>
      <label className="block text-sm font-semibold text-navy">Keterangan<textarea maxLength={500} className="input-field min-h-20" value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="Kalimat singkat pendamping poster (opsional)"/></label>
      <label className="block text-sm font-semibold text-navy">Tautan tombol<input maxLength={500} className="input-field" value={form.link_url} onChange={(event) => setForm({ ...form, link_url: event.target.value })} placeholder="/pendaftaran atau https://..."/><span className="mt-1 block text-xs font-normal text-slate-400">Boleh dikosongkan. Tautan hanya menerima alamat internal atau HTTP(S).</span></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-navy">Urutan tampil<input required min="0" type="number" className="input-field" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })}/></label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-navy"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })}/>Tampilkan di landing page</label>
      </div>
      <ModalActions onClose={onClose} saving={saving} submitLabel={slide ? 'Simpan perubahan' : 'Tambah poster'}/>
    </form>
  </Modal>;
}

function GalleryEditor({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    caption: item?.caption || '',
    sort_order: item?.sort_order ?? 1,
    is_active: item ? Boolean(item.is_active) : true
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(item?.image_url ? assetUrl(item.image_url) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!image) {
      setPreview(item?.image_url ? assetUrl(item.image_url) : '');
      return undefined;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image, item?.image_url]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('caption', form.caption.trim());
    body.append('sort_order', String(Number(form.sort_order)));
    body.append('is_active', String(form.is_active));
    if (image) body.append('image', image);
    try {
      await adminApi(item ? `/landing-gallery/${item.id}` : '/landing-gallery', {
        method: item ? 'PATCH' : 'POST',
        body
      });
      await onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return <Modal title={item ? 'Ubah foto galeri' : 'Tambah foto galeri'} onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-semibold text-navy">Foto kegiatan {!item && <span className="text-wine-600">*</span>}
        <input required={!item} type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] || null)} className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-wine-50 file:px-3 file:py-2 file:font-semibold file:text-wine-700"/>
        <span className="mt-1 block text-xs font-normal text-slate-400">JPG, PNG, atau WEBP · maks. 5 MB</span>
      </label>
      {preview && <img src={preview} alt="Pratinjau foto galeri" className="max-h-64 w-full rounded-xl bg-slate-100 object-cover"/>}
      <label className="block text-sm font-semibold text-navy">Judul foto<input maxLength={180} className="input-field" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Suasana kelas Bahasa Jepang"/></label>
      <label className="block text-sm font-semibold text-navy">Keterangan<textarea maxLength={500} className="input-field min-h-20" value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="Keterangan singkat untuk foto (opsional)"/></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-navy">Urutan tampil<input required min="0" type="number" className="input-field" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })}/></label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-navy"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })}/>Tampilkan di galeri</label>
      </div>
      <ModalActions onClose={onClose} saving={saving} submitLabel={item ? 'Simpan perubahan' : 'Tambah foto'}/>
    </form>
  </Modal>;
}

function FaqEditor({ faq, onClose, onSaved }) {
  const [form, setForm] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    sort_order: faq?.sort_order ?? 1,
    is_active: faq ? Boolean(faq.is_active) : true
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi(faq ? `/landing-faqs/${faq.id}` : '/landing-faqs', {
        method: faq ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) })
      });
      await onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return <Modal title={faq ? 'Ubah FAQ' : 'Tambah FAQ'} onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-semibold text-navy">Pertanyaan<input required minLength={5} maxLength={255} className="input-field" value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })}/></label>
      <label className="block text-sm font-semibold text-navy">Jawaban<textarea required minLength={5} maxLength={5000} className="input-field min-h-32" value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })}/></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-navy">Urutan tampil<input required min="0" type="number" className="input-field" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: event.target.value })}/></label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-navy"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })}/>Tampilkan di landing page</label>
      </div>
      <ModalActions onClose={onClose} saving={saving} submitLabel={faq ? 'Simpan perubahan' : 'Tambah FAQ'}/>
    </form>
  </Modal>;
}

function Modal({ title, onClose, children }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
    <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
      <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-wine-600">Konten website</p><h2 className="mt-1 text-xl font-bold text-navy">{title}</h2></div><button type="button" aria-label="Tutup dialog" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"><X size={19}/></button></div>
      {children}
    </section>
  </div>;
}

function ModalActions({ onClose, saving, submitLabel }) {
  return <div className="flex gap-3 border-t border-slate-100 pt-4">
    <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
    <button disabled={saving} className="btn-primary flex-1">{saving && <LoaderCircle size={16} className="animate-spin"/>}{submitLabel}</button>
  </div>;
}

function EmptyState({ title, text, action, onAction }) {
  return <div className="card grid min-h-64 place-items-center px-6 py-10 text-center">
    <div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-wine-50 text-wine-700"><ImagePlus size={21}/></span><h3 className="mt-4 font-bold text-navy">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p><button type="button" onClick={onAction} className="btn-primary mt-5"><Plus size={16}/>{action}</button></div>
  </div>;
}

function DefaultMark() {
  return <div className="flex items-center gap-2 rounded-xl bg-white px-5 py-4 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-full bg-wine-600"><span className="h-3 w-5 rounded-t-full border-b border-white/80 bg-[#d8c7c1]"/></span><span className="font-display text-xl font-bold text-wine-700">LPK BYE</span></div>;
}
