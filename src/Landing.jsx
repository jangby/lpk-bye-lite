import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Check, ChevronDown, HeartHandshake, Images,
  Menu, MessageCircle, Pause, Play, ShieldCheck, Users, X
} from 'lucide-react';
import { publicApi } from './api.js';
import AIChatWidget from './AIChatWidget.jsx';
import { assetUrl } from './utils/assets.js';

const programs = [
  { icon: 'DM', title: 'Sertifikasi BNSP Digital Marketing', text: 'Kembangkan kompetensi pemasaran digital dengan persiapan sertifikasi BNSP.', items: 'Strategi digital, konten, dan sertifikasi kompetensi' },
  { icon: 'あ', title: 'Pelatihan Bahasa Jepang', text: 'Bangun fondasi bahasa Jepang untuk kehidupan dan kebutuhan kerja.', items: 'Hiragana, Katakana, percakapan, dan kosakata' },
  { icon: BriefcaseBusiness, title: 'Pendampingan Administrasi', text: 'Bersama tim kami, persiapan berkas menjadi lebih terarah.', items: 'Berikutnya: konsultasi berkas & program' }
];

const defaultFaqs = [
  { id: 'default-1', question: 'Siapa saja yang dapat mengikuti kelas?', answer: 'Kelas terbuka untuk lulusan SMP/SMA/SMK, fresh graduate, maupun calon pekerja yang memenuhi persyaratan gelombang.' },
  { id: 'default-2', question: 'Apakah ada persyaratan usia?', answer: 'Persyaratan dapat berbeda berdasarkan program. Informasi lengkap akan dikonfirmasi tim administrasi.' },
  { id: 'default-3', question: 'Bagaimana cara mengetahui status pendaftaran?', answer: 'Gunakan kode registrasi saat menghubungi admin melalui WhatsApp untuk mengecek status proses Anda.' },
  { id: 'default-4', question: 'Dokumen apa yang perlu disiapkan?', answer: 'Umumnya identitas diri, data pendidikan, foto, dan dokumen pendukung sesuai informasi pada formulir.' },
  { id: 'default-5', question: 'Apakah LPK menjamin penempatan kerja?', answer: 'LPK memberikan pembelajaran dan pendampingan. Keputusan penempatan mengikuti ketentuan mitra dan hasil seleksi peserta.' },
  { id: 'default-6', question: 'Berapa lama pembelajaran kelas?', answer: 'Durasi mengikuti ketentuan setiap gelombang yang tertera pada kartu informasi pendaftaran.' }
];

export default function Landing() {
  const [batches, setBatches] = useState([]);
  const [batchState, setBatchState] = useState('loading');
  const [slides, setSlides] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [siteContentState, setSiteContentState] = useState('loading');
  const [logoUrl, setLogoUrl] = useState(null);
  const [faqItems, setFaqItems] = useState(defaultFaqs);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    publicApi('/batch-active')
      .then(({ data }) => { setBatches(data.batches || []); setBatchState('ready'); })
      .catch(() => setBatchState('empty'));
    publicApi('/site-content')
      .then(({ data }) => {
        setSlides(data.slides || []);
        setGallery(data.gallery || []);
        setLogoUrl(data.logo_url || null);
        setFaqItems(data.faqs?.length ? data.faqs : defaultFaqs);
        setSiteContentState('ready');
      })
      .catch(() => setSiteContentState('error'));
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setSlideIndex((index) => (index + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  const activeSlide = slides.length ? slides[slideIndex % slides.length] : null;
  const nextSlide = slides.length > 1 ? slides[(slideIndex + 1) % slides.length] : null;
  const backdropSlides = [activeSlide, nextSlide].filter(Boolean);
  const campaignLink = activeSlide?.link_url || '/pendaftaran';
  const campaignLinkIsExternal = /^https?:\/\//i.test(campaignLink);
  const dateText = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const navigationItems = [
    ['Beranda', 'top'],
    ['Tentang', 'tentang'],
    ['Program', 'program'],
    ['Galeri', 'gallery'],
    ['Keunggulan', 'keunggulan'],
    ['Testimoni', 'testimoni'],
    ['Kontak', 'kontak']
  ];
  const moveSlide = (direction) => setSlideIndex((index) => (index + direction + slides.length) % slides.length);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenu(false);
  };

  return (
    <div className="overflow-hidden bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between sm:h-[72px]">
          <Logo imageUrl={logoUrl}/>
          <nav className="hidden items-center gap-7 lg:flex">
            {navigationItems.map(([label, id]) =>
              <button key={id} onClick={() => scrollTo(id)} className="text-sm font-semibold text-slate-600 hover:text-wine-600">{label}</button>
            )}
          </nav>
          <Link to="/pendaftaran" className="btn-primary hidden py-2.5 lg:inline-flex">Daftar Sekarang <ArrowRight size={16}/></Link>
          <button aria-label="Menu" className="p-2 lg:hidden" onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
        </div>
        {menu && <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
          {navigationItems.filter(([label]) => label !== 'Testimoni').map(([label, id]) =>
            <button key={id} onClick={() => scrollTo(id)} className="block w-full border-b border-slate-100 py-3 text-left font-semibold">{label}</button>
          )}
          <Link to="/pendaftaran" className="btn-primary mt-4 w-full">Daftar Sekarang</Link>
        </div>}
      </header>

      <main id="top">
        <section className="relative isolate min-h-[460px] overflow-hidden bg-navy text-white sm:min-h-[640px] md:min-h-[760px]">
          <div className="absolute inset-0" aria-hidden="true">
            {slides.length ? backdropSlides.map((slide, index) => <img
              key={slide.id}
              src={assetUrl(slide.image_url)}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === 0 ? 'opacity-100' : 'opacity-0'}`}
            />) : <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=90"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,19,36,.94)_0%,rgba(13,29,51,.84)_46%,rgba(14,30,51,.28)_100%)]"/>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,19,36,.82)_0%,transparent_42%,rgba(8,19,36,.18)_100%)]"/>
            <div className="absolute inset-0 opacity-[.14] [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:72px_72px]"/>
          </div>
          <div className="container-page relative flex min-h-[460px] flex-col justify-between py-4 sm:min-h-[640px] sm:py-12 md:min-h-[760px] md:py-16">
            <div className="flex items-center gap-2.5 text-[9px] font-semibold uppercase tracking-[.2em] text-white/65 sm:gap-3 sm:text-[10px] sm:tracking-[.22em]">
              <span className="h-px w-8 bg-wine-500"/> LPK BYE <span className="text-white/35">/</span> Bandung, Indonesia
            </div>
            <div className="grid items-end gap-6 pb-5 pt-5 sm:gap-12 sm:pb-9 sm:pt-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)] lg:pb-20">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-[9px] font-semibold text-white/90 backdrop-blur sm:mb-7 sm:gap-2.5 sm:px-4 sm:py-2 sm:text-[11px]">
                  <span className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${batchState === 'ready' && batches.length ? 'bg-emerald-300' : 'bg-amber-300'}`}/>
                  {batchState === 'loading' ? 'Mengecek jadwal program' : batchState === 'ready' && batches.length ? `${batches.length} gelombang sedang dibuka` : 'Program belajar & sertifikasi'}
                </div>
                <p className="mb-2 max-w-full truncate text-[9px] font-bold uppercase tracking-[.15em] text-[#edb6a5] sm:mb-4 sm:text-xs sm:tracking-[.22em]">
                  {activeSlide?.title || 'Belajar dengan arah. Bertumbuh dengan percaya diri.'}
                </p>
                <h1 className="max-w-3xl font-display text-[30px] font-semibold leading-[1.08] tracking-[-.045em] sm:text-6xl md:text-[76px]">
                  Kompetensi hari ini.<br/><span className="font-medium italic text-[#e7b6a3]">Peluang esok hari.</span>
                </h1>
                <p className="mt-3 max-w-xl text-xs leading-5 text-white/75 sm:mt-6 sm:text-sm sm:leading-7 md:text-base md:leading-8">
                  Ruang belajar untuk membangun keterampilan nyata—dari Digital Marketing bersertifikasi hingga Bahasa Jepang yang membuka wawasan baru.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                  {campaignLinkIsExternal
                    ? <a href={campaignLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#f1d6c6] px-3.5 py-2.5 text-[11px] font-bold text-[#3d1c28] transition hover:bg-white sm:gap-3 sm:px-6 sm:py-3.5 sm:text-sm">Jelajahi gelombang <ArrowRight size={15}/></a>
                    : <Link to={campaignLink} className="inline-flex items-center gap-2 rounded-full bg-[#f1d6c6] px-3.5 py-2.5 text-[11px] font-bold text-[#3d1c28] transition hover:bg-white sm:gap-3 sm:px-6 sm:py-3.5 sm:text-sm">Jelajahi gelombang <ArrowRight size={15}/></Link>}
                  <button onClick={() => scrollTo('program')} className="inline-flex items-center gap-2 rounded-full border border-white/35 px-3.5 py-2.5 text-[11px] font-semibold text-white transition hover:bg-white/10 sm:px-5 sm:py-3.5 sm:text-sm">Kenali program</button>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-white/20 pt-3 text-[9px] text-white/65 sm:mt-12 sm:gap-x-7 sm:gap-y-3 sm:pt-5 sm:text-[11px]">
                  <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#e7b6a3]"/> Pembelajaran terarah</span>
                  <span className="flex items-center gap-2"><Users size={15} className="text-[#e7b6a3]"/> Pendampingan personal</span>
                  <span className="flex items-center gap-2"><MessageCircle size={15} className="text-[#e7b6a3]"/> Komunikasi langsung</span>
                </div>
              </div>
              <div className="hidden max-w-sm justify-self-end pb-2 lg:block">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/55">Sorotan kampanye</p>
                <div className="mt-4 border-l border-white/35 pl-5">
                  <p className="line-clamp-4 font-display text-2xl font-semibold leading-snug">{activeSlide?.caption || 'Keterampilan bertumbuh saat belajar terasa dekat dan relevan.'}</p>
                  <p className="mt-4 text-xs text-white/60">{activeSlide?.title || 'Program pembelajaran LPK BYE'} <span className="px-1.5 text-[#e7b6a3]">·</span> Bandung</p>
                </div>
              </div>
            </div>
            {slides.length > 0 && <div className="flex items-center justify-between gap-2 border-t border-white/20 pt-2.5 sm:pt-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <span className="shrink-0 font-mono text-[10px] text-white sm:text-xs"><span className="text-[#e7b6a3]">{String(slideIndex + 1).padStart(2, '0')}</span><span className="px-1.5 text-white/40">/</span>{String(slides.length).padStart(2, '0')}</span>
                <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                  {slides.map((slide, index) => <button key={slide.id} type="button" aria-label={`Tampilkan poster ${index + 1}`} onClick={() => setSlideIndex(index)} className={`h-1 rounded-full transition-all ${index === slideIndex ? 'w-10 bg-[#e7b6a3]' : 'w-4 bg-white/40 hover:bg-white/70'}`}/>)}
                </div>
                <span className="hidden max-w-[220px] truncate text-xs text-white/65 sm:inline">{activeSlide?.title || 'Poster LPK BYE'}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <button type="button" onClick={() => moveSlide(-1)} aria-label="Poster sebelumnya" className="grid h-7 w-7 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10 sm:h-9 sm:w-9"><ArrowLeft size={13}/></button>
                <button type="button" onClick={() => moveSlide(1)} aria-label="Poster berikutnya" className="grid h-7 w-7 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10 sm:h-9 sm:w-9"><ArrowRight size={13}/></button>
                {slides.length > 1 && <button type="button" onClick={() => setIsAutoPlaying((playing) => !playing)} aria-label={isAutoPlaying ? 'Jeda pergantian poster' : 'Putar poster otomatis'} className="grid h-7 w-7 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/10 sm:h-9 sm:w-9">{isAutoPlaying ? <Pause size={12}/> : <Play size={12}/>}</button>}
              </div>
            </div>}
          </div>
        </section>

        {batchState !== 'empty' && <section className="container-page relative z-10 -mt-2 sm:-mt-5">
          {batches.length > 1 && <p className="mb-2 text-[10px] font-medium text-slate-400 md:hidden">Geser untuk melihat gelombang lainnya</p>}
          <div className="mobile-card-track -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0">
            {batchState === 'loading' && <div className="min-w-[82%] snap-start rounded-2xl border border-slate-100 bg-white p-6 shadow-card sm:min-w-[55%] md:min-w-0"><p className="text-sm text-slate-500">Memuat informasi gelombang...</p></div>}
            {batches.map((batch) => <article key={batch.id} className="min-w-[82%] snap-start rounded-xl border border-slate-100 bg-white p-3.5 shadow-card sm:min-w-[55%] sm:rounded-2xl sm:p-6 md:min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-wine-600 sm:text-[10px]">{batch.program_type}</p>
              <h2 className="mt-1.5 text-sm font-bold text-navy sm:mt-2 sm:text-lg">{batch.batch_name}</h2>
              <p className="mt-1.5 text-[11px] text-slate-500 sm:mt-2 sm:text-xs">{dateText(batch.start_date)} — {dateText(batch.end_date)}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:mt-4 sm:gap-3 sm:pt-4">
                <p className="text-[11px] text-slate-600 sm:text-xs">{batch.training_fee == null ? 'Biaya belum ditetapkan' : new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(batch.training_fee))}</p>
                <p className="text-[10px] text-slate-500 sm:text-xs">{batch.quota ? `${Math.max(0,batch.quota-batch.registrant_count)} kuota tersisa` : 'Kuota tidak terbatas'}</p>
              </div>
            </article>)}
          </div>
        </section>}

        {activeSlide && <section className="container-page py-6 sm:py-16 md:py-12">
          <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-[#fbfaf7] shadow-card md:grid md:grid-cols-[.85fr_1.15fr] md:rounded-[26px]">
            <div className="grid h-[170px] place-items-center bg-[#efe9e2] p-2.5 sm:h-[360px] sm:p-4 md:h-[400px]">
              <img src={assetUrl(activeSlide.image_url)} alt={activeSlide.title || 'Poster program LPK BYE'} className="h-full w-full object-contain"/>
            </div>
            <div className="flex flex-col justify-center p-4 sm:p-9 md:p-12">
              <p className="eyebrow">Informasi program</p>
              <h2 className="mt-2 font-display text-xl font-semibold leading-tight text-navy sm:mt-3 sm:text-3xl">{activeSlide.title || 'Tumbuh bersama LPK BYE'}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500 sm:mt-4 sm:text-base sm:leading-7">{activeSlide.caption || 'Temukan informasi terbaru dan kesempatan belajar bersama LPK BYE.'}</p>
              <Link to="/pendaftaran" className="btn-primary mt-4 w-fit px-4 py-2.5 text-xs sm:mt-7 sm:px-5 sm:py-3 sm:text-sm">Lihat program <ArrowRight size={15}/></Link>
              {slides.length > 1 && <div className="mt-4 flex gap-2 sm:mt-5" aria-label="Pilih poster">
                {slides.map((slide, index) => <button key={slide.id} type="button" onClick={() => setSlideIndex(index)} aria-label={`Pilih poster ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === slideIndex ? 'w-8 bg-wine-600' : 'w-3 bg-slate-300'}`}/>)}
              </div>}
            </div>
          </div>
        </section>}

        <section id="tentang" className="container-page grid gap-4 py-8 sm:gap-10 sm:py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="relative">
            <img className="h-[170px] w-full rounded-xl object-cover sm:h-[340px] sm:rounded-2xl md:h-[420px]" src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=85" alt="Suasana belajar peserta"/>
            <div className="absolute bottom-3 left-3 rounded-xl bg-white px-3 py-2.5 shadow-xl sm:bottom-5 sm:left-5 sm:px-5 sm:py-4">
              <p className="text-lg font-bold text-wine-600 sm:text-2xl">Terarah</p><p className="text-[10px] text-slate-500 sm:text-xs">Menuju tujuan karier Anda</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Tentang LPK BYE</p>
            <h2 className="section-title mt-2 text-[24px] sm:mt-3 sm:text-3xl md:text-[42px]">Dibimbing Profesional,<br/>Siap Kerja di Jepang</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:mt-5 sm:text-base sm:leading-7">LPK BYE menyediakan pelatihan yang terarah dan pendampingan untuk membantu peserta mengembangkan kompetensi Digital Marketing maupun Bahasa Jepang.</p>
            {[['Pembaruan kurikulum', 'Materi mengikuti kebutuhan pembelajaran'], ['Pendampingan berkelanjutan', 'Dibantu tim administrasi sepanjang proses'], ['Fokus praktik', 'Sesi percakapan dan simulasi wawancara']].map(([title, text]) =>
              <div key={title} className="mt-4 flex gap-2.5 sm:mt-5 sm:gap-3"><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-600 sm:h-5 sm:w-5"><Check size={12}/></span><div><p className="text-[13px] font-bold text-navy sm:text-base">{title}</p><p className="mt-1 text-xs text-slate-500 sm:text-sm">{text}</p></div></div>
            )}
          </div>
        </section>

        <section id="program" className="bg-[#fbfaf7] py-8 sm:py-20">
          <div className="container-page">
            <div className="max-w-2xl"><p className="eyebrow">Program pilihan</p><h2 className="section-title mt-2 text-[26px] sm:mt-3 sm:text-3xl md:text-[42px]">Bekal yang tepat untuk langkahmu.</h2><p className="mt-3 text-sm text-slate-500 sm:mt-4 sm:text-base">Pilih jalur pembelajaran sesuai tujuan masa depan Anda.</p></div>
            <div>
              <p className="mb-2 mt-4 text-[10px] font-medium text-slate-400 md:hidden">Geser untuk menjelajahi program</p>
              <div className="mobile-card-track -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 sm:mt-4 sm:gap-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
              {programs.map((program) => {
                const Icon = typeof program.icon === 'string' ? null : program.icon;
                return <article key={program.title} className="card min-w-[82%] snap-start p-4 transition hover:-translate-y-1 sm:min-w-[46%] sm:p-7 md:min-w-0">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-wine-50 text-sm font-bold text-wine-600 sm:h-12 sm:w-12 sm:rounded-xl sm:text-base">{Icon ? <Icon size={18}/> : program.icon}</div>
                  <h3 className="mt-4 text-base font-bold text-navy sm:mt-7 sm:text-xl">{program.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500 sm:mt-3 sm:text-sm sm:leading-6">{program.text}</p>
                  <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-600 sm:mt-5 sm:pt-5 sm:text-xs">{program.items}</p>
                  <Link to="/pendaftaran" className="mt-4 flex items-center gap-2 text-xs font-bold text-wine-600 sm:mt-6 sm:text-sm">Lihat program <ArrowRight size={15}/></Link>
                </article>;
              })}
              </div>
            </div>
          </div>
        </section>

        <section id="gallery" className="container-page py-8 sm:py-20">
          <div>
            <p className="eyebrow">Galeri kegiatan</p>
            <h2 className="section-title mt-2 text-[24px] sm:mt-3 sm:text-3xl md:text-[42px]">Momen belajar bersama.</h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:mt-3 sm:text-sm sm:leading-6">Suasana kelas, kegiatan, dan perjalanan peserta LPK BYE.</p>
          </div>
          {gallery.length > 1 && <p className="mb-2 mt-4 text-[10px] font-medium text-slate-400 md:hidden">Geser untuk melihat foto lainnya</p>}
          {gallery.length > 0 ? <div className="mobile-card-track -mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mt-5 sm:gap-5 md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
            {gallery.map((item, index) => <figure key={item.id} className={`group relative min-w-[80%] snap-start overflow-hidden rounded-xl bg-slate-100 aspect-[4/3] sm:min-w-[52%] sm:rounded-2xl md:min-w-0 ${index === 0 ? 'md:col-span-2 md:row-span-2 md:aspect-auto' : 'md:aspect-[4/3]'}`}>
              <img src={assetUrl(item.image_url)} alt={item.title || 'Galeri kegiatan LPK BYE'} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/>
              {(item.title || item.caption) && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent p-3 pt-10 text-white sm:p-5 sm:pt-14">
                {item.title && <p className="text-xs font-bold sm:text-base">{item.title}</p>}
                {item.caption && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/75 sm:text-xs sm:leading-5">{item.caption}</p>}
              </figcaption>}
            </figure>)}
          </div> : <div role="status" aria-live="polite" className="mt-4 flex items-start gap-3 rounded-xl border border-slate-100 bg-[#fbfaf7] p-4 sm:mt-6 sm:gap-4 sm:rounded-2xl sm:p-6">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-wine-600 shadow-sm sm:h-11 sm:w-11 sm:rounded-xl"><Images size={18}/></span>
            <div>
              <p className="text-sm font-bold text-navy sm:text-base">
                {siteContentState === 'error' ? 'Galeri belum dapat dimuat' : siteContentState === 'loading' ? 'Memuat galeri kegiatan' : 'Galeri kegiatan segera hadir'}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                {siteContentState === 'error'
                  ? 'Dokumentasi kegiatan belum dapat ditampilkan. Silakan coba kembali beberapa saat lagi.'
                  : 'Foto kelas, kegiatan, dan perjalanan peserta LPK BYE akan ditampilkan di sini.'}
              </p>
            </div>
          </div>}
        </section>

        <section id="keunggulan" className="container-page py-8 sm:py-20">
          <p className="eyebrow">Mengapa memilih LPK BYE</p><h2 className="section-title mt-2 text-[24px] sm:mt-3 sm:text-3xl md:text-[42px]">Belajar dan tingkatkan<br/>kompetensi bersama.</h2>
          <div className="mt-6 grid gap-x-12 gap-y-5 sm:mt-10 sm:gap-y-8 md:grid-cols-2">
            {[
              [ShieldCheck,'Kurikulum terstruktur','Materi disusun bertahap dari dasar hingga siap praktik.'],
              [HeartHandshake,'Mentor berpengalaman','Didampingi pengajar yang memahami kebutuhan pembelajar.'],
              [Users,'Kelas interaktif','Percakapan kelompok, praktik, dan sesi diskusi aktif.'],
              [BriefcaseBusiness,'Pendampingan berkelanjutan','Konsultasi proses administrasi sampai peserta siap mengikuti tahapan berikutnya.']
            ].map((            [Icon,title,text]) => <div key={title} className="flex gap-3 sm:gap-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-wine-50 text-wine-600 sm:h-10 sm:w-10"><Icon size={17}/></div><div><h3 className="text-sm font-bold text-navy sm:text-base">{title}</h3><p className="mt-1.5 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">{text}</p></div></div>)}
          </div>
        </section>

        <section className="container-page py-8 sm:py-16 md:py-20" id="pendaftaran">
          <div className="text-center"><p className="eyebrow">Alur sederhana</p><h2 className="section-title mt-2 text-[24px] sm:mt-3 sm:text-3xl md:text-[42px]">Perjalananmu dimulai di sini.</h2></div>
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 sm:mt-12 sm:grid-cols-4 sm:gap-8">
            {[
              ['01','Isi formulir','Lengkapi data diri dan informasi pendukung.'],
              ['02','Kirim berkas','Unggah dokumen sesuai kebutuhan form.'],
              ['03','Verifikasi admin','Tim memeriksa kelengkapan berkas Anda.'],
              ['04','Konfirmasi WhatsApp','Selesaikan konfirmasi melalui WhatsApp.']
            ].map(([n,title,text]) => <div key={n} className="relative"><span className="text-3xl font-bold text-wine-100 sm:text-4xl">{n}</span><h3 className="mt-1.5 text-sm font-bold text-navy sm:mt-2 sm:text-base">{title}</h3><p className="mt-1.5 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">{text}</p></div>)}
          </div>
        </section>

        <section id="testimoni" className="bg-cream py-8 sm:py-20">
          <div className="container-page">
            <p className="eyebrow">Testimoni peserta</p><h2 className="section-title mt-2 text-[24px] sm:mt-3 sm:text-3xl md:text-[42px]">Belajar dengan lebih percaya diri.</h2>
            <p className="mb-2 mt-4 text-[10px] font-medium text-slate-400 md:hidden">Geser untuk membaca testimoni lainnya</p>
            <div className="mobile-card-track -mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 sm:mt-4 sm:gap-5 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
              {[
                ['“Pelajaran terstruktur dan suasana kelas membuat saya tidak takut mencoba berbicara.”','Peserta Bahasa Jepang','Ayu N.'],
                ['“Sesi wawancara sangat membantu saya memahami cara menjawab lebih percaya diri.”','Kelas Persiapan Kerja','Raka P.'],
                ['“Adminnya ramah dan selalu membantu memperjelas setiap tahap administrasi.”','Peserta Gelombang','Dinda S.']
              ].map(([quote,label,name]) => <article key={name} className="min-w-[82%] snap-start rounded-xl bg-white p-4 shadow-card sm:min-w-[46%] sm:rounded-2xl sm:p-7 md:min-w-0"><div className="text-sm text-wine-600 sm:text-base">★★★★★</div><p className="mt-3 text-[13px] leading-5 text-navy sm:mt-5 sm:text-sm sm:leading-7">{quote}</p><p className="mt-4 text-sm font-bold text-navy sm:mt-6">{name}</p><p className="mt-1 text-[11px] text-slate-400 sm:text-xs">{label}</p></article>)}
            </div>
          </div>
        </section>

        {faqItems.length > 0 && <section className="container-page py-8 sm:py-20" id="faq">
          <div className="grid gap-6 md:grid-cols-[.7fr_1.3fr] md:gap-10">
            <div><p className="eyebrow">FAQ</p><h2 className="section-title mt-2 text-[24px] sm:mt-3 sm:text-3xl md:text-[42px]">Ada yang ingin kamu ketahui?</h2><Link to="/pendaftaran" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-wine-600 sm:mt-6 sm:text-sm">Ajukan pertanyaan <ArrowRight size={16}/></Link></div>
            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {faqItems.map((faq,i) => <div key={faq.id}><button className="flex w-full items-center justify-between gap-5 py-4 text-left text-sm font-bold text-navy sm:py-5 sm:text-base" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{faq.question}<ChevronDown size={18} className={`shrink-0 transition ${openFaq === i ? 'rotate-180' : ''}`}/></button>{openFaq === i && <p className="whitespace-pre-line pb-4 pr-8 text-xs leading-6 text-slate-500 sm:pb-5 sm:text-sm sm:leading-7">{faq.answer}</p>}</div>)}
            </div>
          </div>
        </section>}

        <section className="bg-wine-700" id="kontak">
          <div className="container-page flex flex-col items-start justify-between gap-4 py-8 sm:gap-6 sm:py-12 md:flex-row md:items-center">
            <div className="text-white"><h2 className="font-display text-2xl font-semibold sm:text-3xl">Siap membuka babak baru?</h2><p className="mt-2 text-xs text-white/70 sm:text-sm">Daftar sekarang melalui formulir resmi LPK BYE.</p></div>
            <Link to="/pendaftaran" className="rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-wine-700 sm:px-6 sm:py-3 sm:text-sm">Daftar Sekarang <ArrowRight className="ml-2 inline" size={15}/></Link>
          </div>
        </section>
      </main>
      <Footer logoUrl={logoUrl}/>
      <AIChatWidget/>
    </div>
  );
}

export function Logo({ light = false, imageUrl = null }) {
  return <div className="flex items-center gap-2">
    {imageUrl
      ? <img src={assetUrl(imageUrl)} alt="Logo LPK BYE" className="h-10 max-w-36 object-contain"/>
      : <><span className="grid h-8 w-8 place-items-center rounded-full bg-wine-600"><span className="h-2.5 w-4 rounded-t-full border-b border-white/80 bg-[#d8c7c1]"/></span><div className={`font-display text-lg font-bold leading-none ${light ? 'text-white' : 'text-wine-700'}`}><div>LPK BYE</div><div className={`mt-1 text-[7px] font-semibold tracking-[.18em] ${light ? 'text-white/60' : 'text-slate-400'}`}>BANDUNG</div></div></>}
  </div>;
}

function Footer({ logoUrl }) {
  return <footer className="bg-[#faf9f6]"><div className="container-page grid gap-6 py-8 sm:gap-8 sm:py-12 md:grid-cols-[1.4fr_1fr_1fr]"><div><Logo imageUrl={logoUrl}/><p className="mt-4 max-w-sm text-[11px] leading-5 text-slate-500 sm:mt-5 sm:text-xs sm:leading-6">Pelatihan kompetensi Digital Marketing dan Bahasa Jepang yang diselenggarakan LPK BYE di Bandung.</p></div><div><p className="text-xs font-bold text-navy">Navigasi</p><div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 sm:mt-4 sm:gap-3 sm:text-xs"><span>Beranda</span><span>Program</span><span>Tentang</span><span>Kontak</span></div></div><div><p className="text-xs font-bold text-navy">Hubungi kami</p><p className="mt-3 text-[11px] text-slate-500 sm:mt-4 sm:text-xs">WhatsApp: 0838-2094-3475</p><p className="mt-2 text-[11px] text-slate-500 sm:text-xs">Bandung, Jawa Barat</p></div></div><div className="border-t border-slate-100 py-4 text-center text-[10px] text-slate-400 sm:py-5 sm:text-[11px]">© 2026 LPK BYE · Bandung</div></footer>;
}
