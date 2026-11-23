import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, Award, BadgeCheck, BookOpen, BriefcaseBusiness, CalendarDays,
  Check, ChevronDown, Globe2, GraduationCap, Mail, MapPin, Menu,
  MessageCircle, Pause, Play, ShieldCheck, Sparkles, Target, Users, X
} from 'lucide-react';
import { publicApi } from './api.js';
import AIChatWidget from './AIChatWidget.jsx';
import { assetUrl } from './utils/assets.js';

const programs = [
  {
    id: 'digital-marketing',
    number: 'Program 01',
    title: 'Pelatihan Digital Marketing',
    question: 'Ingin lebih percaya diri memasarkan produk secara digital?',
    description: 'Pelajari strategi pemasaran digital yang aplikatif untuk membangun karier, mengembangkan usaha, atau meningkatkan kompetensi.',
    listTitle: 'Yang akan dipelajari',
    items: ['Strategi dan perencanaan pemasaran digital', 'Pembuatan konten dan pengelolaan media sosial', 'Persiapan sertifikasi kompetensi BNSP melalui LSP'],
    audience: 'Mahasiswa, fresh graduate, pencari kerja, karyawan, freelancer, content creator, dan pelaku UMKM.',
    image: '/img/digital-marketing-2.webp',
    icon: '/img/ikon-digital-marketing.webp',
    match: /digital|marketing/
  },
  {
    id: 'bahasa-jepang',
    number: 'Program 02',
    title: 'Pelatihan Bahasa Jepang',
    question: 'Punya rencana belajar atau berkarier di Jepang?',
    description: 'Bangun kemampuan bahasa Jepang dari dasar, sekaligus memahami percakapan dan budaya yang mendukung tujuanmu.',
    listTitle: 'Yang akan dipelajari',
    items: ['Bahasa Jepang tingkat dasar hingga menengah', 'Percakapan sehari-hari dan situasi formal', 'Budaya, etika kerja, dan persiapan wawancara'],
    audience: 'Pemula, pelajar, fresh graduate, pencari kerja, dan calon tenaga kerja.',
    image: '/img/bahasa-jepang-1.webp',
    icon: '/img/ikon-bahasa-jepang.webp',
    match: /jepang|japanese/
  }
];

const defaultFaqs = [
  { question: 'Apa itu LPK BYE?', answer: 'LPK BYE (Bandung Youth Entrepreneur) adalah lembaga pelatihan kerja yang menghadirkan program Digital Marketing dan Bahasa Jepang.' },
  { question: 'Siapa yang bisa mengikuti pelatihan?', answer: 'Program terbuka bagi siapa pun yang ingin mengembangkan keterampilan. Persyaratan dapat berbeda untuk setiap gelombang.' },
  { question: 'Program pelatihan apa saja yang tersedia?', answer: 'LPK BYE menyelenggarakan pelatihan Digital Marketing dan Bahasa Jepang. Program dan jadwal yang sedang dibuka dapat dilihat pada bagian gelombang aktif.' },
  { question: 'Bagaimana cara mendaftar?', answer: 'Pilih program yang tersedia, isi formulir pendaftaran, lalu pantau status pendaftaran melalui portal peserta.' },
  { question: 'Bagaimana pembayaran pelatihan dilakukan?', answer: 'Setelah pendaftaran diverifikasi, peserta dapat melihat instruksi pembayaran dan mengirim bukti melalui portal peserta.' },
  { question: 'Bagaimana cara menghubungi admin?', answer: 'Hubungi tim LPK BYE melalui WhatsApp di 0838-2094-3475 untuk bertanya mengenai program, jadwal, dan persyaratan.' }
];

const navigation = [
  ['Tentang Kami', 'tentang'],
  ['Program', 'program'],
  ['Manfaat', 'manfaat'],
  ['Galeri', 'galeri'],
  ['FAQ', 'faq'],
  ['Kontak', 'kontak']
];

const benefits = [
  { icon: BriefcaseBusiness, title: 'Materi relevan', text: 'Belajar keterampilan yang bisa diterapkan pada kebutuhan kerja dan usaha.' },
  { icon: Users, title: 'Dibimbing pengajar', text: 'Dapatkan arahan dan pendampingan selama proses pembelajaran.' },
  { icon: Target, title: 'Belajar terarah', text: 'Pilih jalur program yang sesuai dengan minat dan tujuanmu.' },
  { icon: Sparkles, title: 'Fokus praktik', text: 'Bangun pengalaman melalui latihan dan penerapan materi.' },
  { icon: Award, title: 'Peluang sertifikasi', text: 'Program Digital Marketing menyediakan persiapan sertifikasi BNSP melalui LSP.' },
  { icon: Globe2, title: 'Persiapan karier', text: 'Program Bahasa Jepang mengenalkan bahasa, budaya, dan etika kerja.' }
];

const challenges = [
  ['Belum memiliki keterampilan digital', 'Mulai belajar Digital Marketing dari materi dasar dan praktik.'],
  ['Bingung membuat strategi pemasaran', 'Kenali perencanaan konten dan pemasaran digital.'],
  ['Ingin pengakuan kompetensi', 'Cari tahu program persiapan sertifikasi BNSP yang tersedia.'],
  ['Belum bisa berbahasa Jepang', 'Bangun kemampuan bahasa Jepang secara bertahap.'],
  ['Belum mengenal budaya kerja Jepang', 'Pelajari komunikasi dan etika kerja sebagai bekal.']
];

const fallbackGallery = [
  { image_url: '/img/digital-marketing-1.webp', title: 'Kegiatan Digital Marketing' },
  { image_url: '/img/kelas-4.webp', title: 'Belajar bersama' },
  { image_url: '/img/bahasa-jepang-1.webp', title: 'Belajar Bahasa Jepang' },
  { image_url: '/img/kelas-5.webp', title: 'Suasana pelatihan' }
];

export default function Landing() {
  const [batches, setBatches] = useState([]);
  const [batchState, setBatchState] = useState('loading');
  const [content, setContent] = useState({ logo_url: null, slides: [], gallery: [], faqs: [] });
  const [contentState, setContentState] = useState('loading');
  const [slideIndex, setSlideIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    publicApi('/batch-active')
      .then(({ data }) => {
        setBatches(data.batches || []);
        setBatchState('ready');
      })
      .catch(() => setBatchState('error'));
    publicApi('/site-content')
      .then(({ data }) => {
        setContent({
          logo_url: data.logo_url || null,
          slides: data.slides || [],
          gallery: data.gallery || [],
          faqs: data.faqs || []
        });
        setContentState('ready');
      })
      .catch(() => setContentState('error'));
  }, []);

  useEffect(() => {
    if (!autoPlay || content.slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setSlideIndex((index) => (index + 1) % content.slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [autoPlay, content.slides.length]);

  const availableBatches = batches.filter((batch) => batch.training_fee != null && !batch.is_full);
  const activeSlide = content.slides.length ? content.slides[slideIndex % content.slides.length] : null;
  const gallery = content.gallery.length ? content.gallery : fallbackGallery;
  const faqs = content.faqs.length ? content.faqs : defaultFaqs;
  const campaignImage = activeSlide ? assetUrl(activeSlide.image_url) : '/img/hero.webp';

  return (
    <div className="min-h-screen overflow-x-hidden bg-mist text-ink">
      <Navbar imageUrl={content.logo_url}/>
      <main>
        <section id="beranda" className="relative isolate overflow-hidden bg-gradient-to-br from-plum-deep via-plum to-plum-light pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
          <img
            src={campaignImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/85 to-plum/65"/>
          <div className="grid-bg absolute inset-0 -z-10"/>
          <div className="absolute -right-36 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-pink/25 blur-3xl"/>

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur">
                <span className={`h-2 w-2 rounded-full ${availableBatches.length ? 'bg-emerald-300' : 'bg-amber-300'}`}/>
                {batchState === 'loading' ? 'Memuat program' : availableBatches.length ? 'Pendaftaran sedang dibuka' : 'Program belajar & sertifikasi'}
              </p>
              <p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-rose-soft sm:text-sm">
                {activeSlide?.title || 'LPK BYE · Bandung Youth Entrepreneur'}
              </p>
              <h1 className="mt-4 max-w-2xl font-editorial text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
                Tingkatkan Skill,<br/>Bangun Masa Depan.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                Belajar Digital Marketing dan Bahasa Jepang bersama LPK BYE. Kembangkan kemampuan, tambah pengalaman, dan siapkan diri menghadapi peluang yang lebih luas.
              </p>
              {activeSlide?.caption && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">{activeSlide.caption}</p>}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {availableBatches.length > 0
                  ? <Link to="/pendaftaran" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-dark to-rose px-6 py-3.5 font-semibold text-white shadow-lg shadow-rose/25 transition hover:-translate-y-0.5 hover:shadow-xl">
                    Daftar Sekarang <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
                  </Link>
                  : <a href="https://wa.me/6283820943475" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-dark to-rose px-6 py-3.5 font-semibold text-white shadow-lg shadow-rose/25 transition hover:-translate-y-0.5">
                    Tanya Program <MessageCircle className="h-5 w-5"/>
                  </a>}
                <a href="#program" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/15">
                  Pelajari Program <ArrowDown className="h-4 w-4"/>
                </a>
              </div>

              <dl className="mt-9 grid max-w-xl gap-5 border-t border-white/15 pt-5 sm:grid-cols-3">
                <Fact icon={BookOpen} label="Program" value="Digital Marketing & Bahasa Jepang"/>
                <Fact icon={BadgeCheck} label="Kompetensi" value="Pelatihan terarah dan praktis"/>
                <Fact icon={Users} label="Gelombang" value={batchState === 'loading' ? 'Sedang dimuat' : availableBatches.length ? `${availableBatches.length} tersedia` : 'Segera hadir'}/>
              </dl>
            </div>

            <Reveal>
              <div className="spin-ring mx-auto w-full max-w-[500px] rounded-3xl shadow-2xl shadow-black/25">
                <div className="relative overflow-hidden rounded-[22px] bg-white p-6 text-ink sm:p-8">
                  <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-pink/10 blur-2xl"/>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-pink to-plum-light text-white shadow-lg shadow-pink/20"><GraduationCap className="h-6 w-6"/></span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[.15em] text-rose-dark">Langkah pertamamu</p>
                        <h2 className="mt-0.5 font-editorial text-2xl font-semibold">Temukan programmu</h2>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-ink/65">
                      Isi data dengan mudah. Tim kami akan mendampingi proses pendaftaran hingga informasi program diterima.
                    </p>
                    <div className="mt-5 space-y-3">
                      {batchState === 'loading' ? <div className="rounded-xl bg-mist px-4 py-4 text-sm text-ink/55">Memuat gelombang pelatihan...</div>
                        : batches.length ? batches.slice(0, 2).map((batch) => <BatchPreview key={batch.id} batch={batch}/>)
                          : <div className="rounded-xl border border-line bg-mist px-4 py-4">
                            <p className="font-semibold">Gelombang baru segera hadir</p>
                            <p className="mt-1 text-sm leading-relaxed text-ink/60">Hubungi admin untuk mendapatkan informasi program terbaru.</p>
                          </div>}
                    </div>
                    <Link to="/pendaftaran" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-dark via-rose to-rose px-5 py-3.5 font-semibold text-white shadow-lg shadow-rose/20 transition hover:-translate-y-0.5">
                      Lihat Pendaftaran <ArrowRight className="h-5 w-5"/>
                    </Link>
                    <p className="mt-3 text-center text-xs text-ink/45">Pendaftaran dan pembayaran mengikuti verifikasi admin.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {content.slides.length > 1 && <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between border-t border-white/15 px-5 pt-4 text-xs text-white/70">
            <span className="truncate">{activeSlide?.title || 'Sorotan program LPK BYE'}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{String(slideIndex + 1).padStart(2, '0')} / {String(content.slides.length).padStart(2, '0')}</span>
              <button type="button" onClick={() => setSlideIndex((index) => (index - 1 + content.slides.length) % content.slides.length)} aria-label="Slide sebelumnya" className="grid h-8 w-8 place-items-center rounded-full border border-white/25 hover:bg-white/10"><ArrowRight className="h-4 w-4 rotate-180"/></button>
              <button type="button" onClick={() => setSlideIndex((index) => (index + 1) % content.slides.length)} aria-label="Slide berikutnya" className="grid h-8 w-8 place-items-center rounded-full border border-white/25 hover:bg-white/10"><ArrowRight className="h-4 w-4"/></button>
              <button type="button" onClick={() => setAutoPlay((playing) => !playing)} aria-label={autoPlay ? 'Jeda slide' : 'Putar slide'} className="grid h-8 w-8 place-items-center rounded-full border border-white/25 hover:bg-white/10">{autoPlay ? <Pause className="h-3.5 w-3.5"/> : <Play className="h-3.5 w-3.5"/>}</button>
            </div>
          </div>}
        </section>

        <section id="tentang" className="scroll-mt-24 bg-white py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal>
              <div className="relative mx-auto max-w-md pb-10">
                <img src="/img/bahasa-jepang-2.webp" alt="Suasana pelatihan Bahasa Jepang" loading="lazy" className="aspect-[4/5] w-[82%] rounded-3xl object-cover shadow-xl shadow-plum/20"/>
                <img src="/img/digital-marketing-3.webp" alt="Peserta mengikuti pelatihan" loading="lazy" className="absolute bottom-0 right-0 aspect-square w-[58%] rounded-3xl border-4 border-white object-cover shadow-xl shadow-plum/20"/>
                <div className="absolute left-3 top-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                  <Logo imageUrl={content.logo_url} className="h-12 w-auto"/>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <SectionHeading eyebrow="Tentang Kami" title="Kenali LPK BYE Lebih Dekat!"/>
              <p className="mt-5 max-w-xl leading-relaxed text-ink/70">
                LPK BYE (Bandung Youth Entrepreneur) merupakan lembaga pelatihan kerja yang berfokus pada pengembangan keterampilan berbasis kompetensi di bidang Digital Marketing serta pendidikan Bahasa Jepang.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-ink/70">
                Kami mendampingi generasi muda dan masyarakat melalui program pembelajaran yang relevan dengan kebutuhan dunia kerja dan perkembangan industri.
              </p>
              <p className="mt-5 max-w-xl font-editorial text-xl font-semibold leading-snug text-plum">
                Saatnya belajar, berkembang, dan mempersiapkan masa depan bersama LPK BYE!
              </p>
              <div className="mt-7 inline-flex items-center gap-4 rounded-xl border border-line bg-white px-5 py-3">
                <img src="/logo-bnsp.svg" alt="Logo BNSP" className="h-10 w-auto"/>
                <span className="max-w-[14rem] text-sm leading-snug text-ink/60">Program sertifikasi kompetensi melalui kerja sama dengan LSP</span>
              </div>
            </Reveal>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-7 px-5 sm:mt-20 md:grid-cols-4">
            {[
              ['/img/ikon-digital-marketing.webp', 'Digital Marketing'],
              ['/img/ikon-bahasa-jepang.webp', 'Bahasa Jepang'],
              ['/img/ikon-wirausaha-muda.webp', 'Wirausaha Muda'],
              ['/img/ikon-karir-mitra.webp', 'Karier dan Mitra']
            ].map(([icon, label], index) => <Reveal key={label} delay={index * 80}>
              <div className="group text-center">
                <img src={icon} alt="" loading="lazy" className="mx-auto h-24 w-24 object-contain drop-shadow-lg transition duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 sm:h-32 sm:w-32"/>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-plum sm:text-sm">{label}</p>
              </div>
            </Reveal>)}
          </div>
        </section>

        <section id="program" className="scroll-mt-20 bg-mist py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <SectionHeading eyebrow="Program Pelatihan Kami" title="Pilih Program yang Sesuai dengan Tujuanmu!"/>
              <p className="mt-4 max-w-2xl leading-relaxed text-ink/65">Kembangkan keterampilan, temukan minat, dan siapkan diri untuk kesempatan berikutnya bersama LPK BYE.</p>
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {programs.map((program, index) => <ProgramCard
                key={program.id}
                program={program}
                batches={batches.filter((batch) => program.match.test(`${batch.program_type} ${batch.batch_name}`))}
                canRegister={availableBatches.length > 0}
                delay={index * 100}
              />)}
            </div>
            {batchState === 'error' && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Informasi gelombang belum dapat dimuat. Silakan coba beberapa saat lagi atau hubungi admin.</p>}
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <SectionHeading eyebrow="Solusi" title="Kendala yang Sering Dialami, Ada Solusinya"/>
              <p className="mt-4 max-w-xl leading-relaxed text-ink/65">Kami memahami tantangan calon peserta dan menyiapkan program pembelajaran yang dapat menjadi langkah awal.</p>
            </Reveal>
            <div className="mt-9 space-y-3">
              {challenges.map(([problem, solution], index) => <Reveal key={problem} delay={index * 50}>
                <div className="grid items-center gap-3 rounded-xl border border-line bg-mist/60 p-4 transition hover:border-plum-light/40 hover:bg-white hover:shadow-lg hover:shadow-plum/10 md:grid-cols-[1fr_auto_1fr] md:gap-6 md:px-6">
                  <p className="font-medium text-ink/80">{problem}</p>
                  <ArrowRight className="hidden h-5 w-5 text-pink md:block"/>
                  <p className="flex items-start gap-3 font-semibold text-plum"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lilac text-plum-light"><Check className="h-4 w-4"/></span>{solution}</p>
                </div>
              </Reveal>)}
            </div>
          </div>
        </section>

        <section id="manfaat" className="scroll-mt-20 bg-white pb-16 sm:pb-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <SectionHeading eyebrow="Manfaat" title="Kenapa Belajar Bersama LPK BYE?"/>
              <p className="mt-4 max-w-xl leading-relaxed text-ink/65">Dapatkan pembelajaran yang lebih terarah dengan dukungan tim LPK BYE.</p>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 60}>
                <article className="group h-full rounded-2xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-plum-light/40 hover:shadow-xl hover:shadow-plum/10 sm:p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink to-plum-light text-white shadow-md shadow-pink/25 transition group-hover:scale-105 group-hover:rotate-3"><Icon className="h-6 w-6"/></span>
                  <h3 className="mt-5 text-lg font-semibold leading-snug">{title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/65">{text}</p>
                </article>
              </Reveal>)}
            </div>
          </div>
        </section>

        <section id="galeri" className="scroll-mt-20 bg-mist py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <SectionHeading eyebrow="Galeri" title="Suasana Belajar di LPK BYE"/>
              <p className="mt-4 max-w-xl leading-relaxed text-ink/65">Lihat materi visual dan kegiatan yang dibagikan oleh tim LPK BYE.</p>
            </Reveal>
            {contentState === 'error' && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Galeri memakai gambar pilihan LPK BYE karena konten terbaru belum dapat dimuat.</p>}
            <div className="mt-8 grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:gap-4 md:auto-rows-[13rem] md:grid-cols-4">
              {gallery.slice(0, 4).map((item, index) => {
                const spans = ['col-span-2 row-span-2', 'col-span-1 row-span-1', 'col-span-1 row-span-2', 'col-span-1 row-span-1'];
                return <Reveal key={item.id || item.image_url || index} delay={index * 70} className={spans[index]}>
                  <div className="group relative h-full overflow-hidden rounded-2xl shadow-lg shadow-plum/10">
                    <img src={assetUrl(item.image_url)} alt={item.title || 'Suasana pelatihan LPK BYE'} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-plum-deep/75 via-transparent to-transparent opacity-80 transition group-hover:opacity-100"/>
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="font-semibold">{item.title || 'Kegiatan LPK BYE'}</p>
                      {item.caption && <p className="mt-1 line-clamp-2 text-xs text-white/75">{item.caption}</p>}
                    </div>
                  </div>
                </Reveal>;
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-plum-deep via-plum to-plum-light px-6 py-10 text-white sm:px-12 sm:py-14">
              <img src="/img/digital-marketing-3.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover"/>
              <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/90 to-plum-light/80"/>
              <div className="grid-bg absolute inset-0 -z-10"/>
              <div className="absolute -bottom-24 -right-16 -z-10 h-72 w-72 rounded-full bg-pink/30 blur-3xl"/>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-rose-soft sm:text-sm">Mengapa Memilih LPK BYE?</p>
              <h2 className="mt-3 max-w-2xl font-editorial text-3xl font-semibold leading-tight sm:text-4xl">Bukan Sekadar Belajar, Tetapi Juga Mempersiapkan Masa Depan.</h2>
              <p className="mt-5 max-w-2xl leading-relaxed text-white/80">Pilih jalur pembelajaran Digital Marketing atau Bahasa Jepang dan bertumbuh bersama pendampingan tim LPK BYE.</p>
              <p className="mt-5 font-editorial text-xl font-semibold text-rose-soft">Mulai langkah kecilmu hari ini.</p>
              <Link to="/pendaftaran" className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-plum transition hover:-translate-y-0.5 hover:bg-rose-soft">
                Lihat Program <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1"/>
              </Link>
            </div>
          </Reveal>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <SectionHeading eyebrow="Alur" title="Cara Mendaftar"/>
              <p className="mt-4 max-w-xl leading-relaxed text-ink/65">Proses pendaftaran dibuat praktis dan dapat dipantau melalui portal peserta.</p>
            </Reveal>
            <ol className="relative mt-10 grid gap-8 md:grid-cols-3">
              <div className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block"/>
              {[
                ['Pilih program', 'Lihat gelombang aktif dan lengkapi data diri pada formulir.'],
                ['Tunggu verifikasi', 'Admin akan memeriksa pendaftaran dan mengirimkan informasi selanjutnya.'],
                ['Pantau portal peserta', 'Setelah diverifikasi, lihat instruksi dan kirim bukti pembayaran melalui portal.']
              ].map(([title, text], index) => <Reveal key={title} delay={index * 90}>
                <li>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-plum text-lg font-semibold text-white ring-8 ring-mist">{index + 1}</span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-ink/65">{text}</p>
                </li>
              </Reveal>)}
            </ol>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <Reveal>
              <SectionHeading eyebrow="FAQ" title="Pertanyaan yang Sering Diajukan"/>
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {faqs.map((faq, index) => <details key={faq.id || faq.question || index} className="group bg-white open:bg-mist/60">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-semibold transition hover:text-plum sm:px-6 [&::-webkit-details-marker]:hidden">
                    {faq.question || faq.title}
                    <ChevronDown className="h-5 w-5 shrink-0 text-plum-light transition-transform duration-300 group-open:rotate-180"/>
                  </summary>
                  <p className="whitespace-pre-line px-5 pb-5 leading-relaxed text-ink/70 sm:px-6 sm:pb-6">{faq.answer || faq.caption}</p>
                </details>)}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-plum-deep via-plum to-plum-light px-6 py-12 text-center text-white sm:px-14 sm:py-16">
              <img src="/img/hero-bahasa-jepang.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover"/>
              <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/90 to-plum-light/80"/>
              <div className="grid-bg absolute inset-0 -z-10"/>
              <div className="absolute -left-16 -top-20 -z-10 h-64 w-64 rounded-full bg-pink/30 blur-3xl"/>
              <h2 className="mx-auto max-w-2xl font-editorial text-3xl font-semibold leading-tight sm:text-4xl">Masa Depanmu Dimulai dari Skill yang Kamu Miliki!</h2>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/80">Kembangkan keterampilan Digital Marketing atau pelajari Bahasa Jepang bersama LPK BYE. Pilih program dan mulai langkah pertamamu.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/pendaftaran" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-dark to-rose px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5">
                  Daftar Sekarang <ArrowRight className="h-5 w-5"/>
                </Link>
                <a href="https://wa.me/6283820943475?text=Halo%20LPK%20BYE%2C%20saya%20ingin%20konsultasi%20program%20pelatihan." target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                  <MessageCircle className="h-5 w-5"/> Konsultasi via WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="kontak" className="scroll-mt-20 bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <SectionHeading eyebrow="Kontak" title="Hubungi LPK BYE"/>
              <p className="mt-4 max-w-xl leading-relaxed text-ink/65">Tanyakan program, jadwal, dan persyaratan langsung kepada tim kami.</p>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ContactCard icon={MessageCircle} label="WhatsApp" value="0838-2094-3475" href="https://wa.me/6283820943475"/>
              <ContactCard icon={Mail} label="Email" value="official.lpkbye@gmail.com" href="mailto:official.lpkbye@gmail.com"/>
              <ContactCard icon={Globe2} label="Website" value="lpkbye.com" href="https://lpkbye.com/"/>
              <ContactCard icon={MapPin} label="Lokasi" value="Bandung, Jawa Barat" href="https://maps.google.com/?q=Bandung+Jawa+Barat"/>
            </div>
          </div>
        </section>
      </main>
      <Footer imageUrl={content.logo_url}/>
      <AIChatWidget/>
    </div>
  );
}

function Navbar({ imageUrl }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('beranda');

  useEffect(() => {
    const sections = ['beranda', ...navigation.map(([, id]) => id)]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!('IntersectionObserver' in window) || !sections.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function navigateToSection(id) {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return <header className="fixed inset-x-0 top-0 z-40 border-b border-line/80 bg-white/90 backdrop-blur-xl">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
      <button type="button" onClick={() => navigateToSection('beranda')} aria-label="LPK BYE, kembali ke beranda" className="rounded">
        <Logo imageUrl={imageUrl} className="h-9 w-auto sm:h-10"/>
      </button>
      <nav aria-label="Menu utama" className="hidden items-center gap-1 md:flex">
        {navigation.map(([label, id]) => <button
          key={id}
          type="button"
          onClick={() => navigateToSection(id)}
          aria-current={active === id ? 'location' : undefined}
          className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active === id ? 'text-rose-dark' : 'text-ink/70 hover:text-plum'}`}
        >
          {label}
          <span className={`absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-pink to-plum-light transition-opacity ${active === id ? 'opacity-100' : 'opacity-0'}`}/>
        </button>)}
      </nav>
      <div className="hidden md:block">
        <Link to="/pendaftaran" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-dark to-rose px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-rose/20 transition hover:-translate-y-0.5">
          Daftar <ArrowRight className="h-4 w-4"/>
        </Link>
      </div>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Tutup menu' : 'Buka menu'} className="rounded-lg p-2 text-ink transition hover:bg-lilac md:hidden">
        {open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
      </button>
    </div>
    {open && <nav aria-label="Menu utama" className="border-t border-line bg-white px-5 pb-4 pt-2 shadow-lg md:hidden">
      {navigation.map(([label, id]) => <button
        key={id}
        type="button"
        onClick={() => navigateToSection(id)}
        className={`block w-full rounded-lg px-3 py-3 text-left font-medium transition ${active === id ? 'bg-lilac text-rose-dark' : 'text-ink/80 hover:bg-lilac'}`}
      >{label}</button>)}
      <Link to="/pendaftaran" onClick={() => setOpen(false)} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-dark to-rose px-4 py-3 font-semibold text-white">
        Daftar Sekarang <ArrowRight className="h-4 w-4"/>
      </Link>
    </nav>}
  </header>;
}

function ProgramCard({ program, batches, canRegister, delay }) {
  return <Reveal delay={delay}>
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10">
      <div className="relative h-48 overflow-hidden sm:h-56">
        <img src={program.image} alt={`Ilustrasi ${program.title}`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
        <div className="absolute inset-0 bg-gradient-to-t from-plum-deep/65 via-transparent to-transparent"/>
        <span className="absolute right-4 top-4 rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-xs font-semibold text-plum shadow">
          {batches.length ? `${batches.length} gelombang` : 'Program pelatihan'}
        </span>
      </div>
      <div className="relative flex flex-1 flex-col p-6 pt-11 sm:p-8 sm:pt-12">
        <img src={program.icon} alt="" loading="lazy" className="absolute -top-10 left-6 h-20 w-20 rounded-full bg-white object-contain p-1 shadow-lg ring-4 ring-white sm:left-8"/>
        <p className="text-xs font-semibold uppercase tracking-widest text-plum-light">{program.number}</p>
        <h3 className="mt-2 font-editorial text-2xl font-semibold leading-snug">{program.title}</h3>
        <p className="mt-3 font-medium text-plum">{program.question}</p>
        <p className="mt-2 leading-relaxed text-ink/70">{program.description}</p>
        <h4 className="mt-5 text-xs font-semibold uppercase tracking-wider text-ink/50">{program.listTitle}</h4>
        <ul className="mt-3 space-y-3">
          {program.items.map((item) => <li key={item} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lilac text-plum-light"><Check className="h-4 w-4"/></span>
            <span className="leading-snug">{item}</span>
          </li>)}
        </ul>
        <div className="mt-5 rounded-xl bg-mist px-4 py-3 text-sm leading-relaxed text-ink/70">
          <span className="font-semibold text-ink">Cocok untuk: </span>{program.audience}
        </div>
        <div className="mt-5 space-y-2">
          {batches.slice(0, 2).map((batch) => <div key={batch.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-xs">
            <span className="font-semibold text-ink">{batch.batch_name}</span>
            <span className="text-ink/60">{batch.training_fee == null ? 'Biaya menyusul' : formatCurrency(batch.training_fee)}{batch.is_full ? ' · Penuh' : ''}</span>
          </div>)}
        </div>
        <Link to="/pendaftaran" className={`group/btn mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 ${canRegister ? 'bg-gradient-to-r from-plum to-plum-light shadow-plum/20' : 'bg-plum/75 shadow-plum/10'}`}>
          {canRegister ? 'Daftar Pelatihan' : 'Lihat Informasi Pendaftaran'}
          <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1"/>
        </Link>
      </div>
    </article>
  </Reveal>;
}

function BatchPreview({ batch }) {
  return <div className="rounded-xl border border-line bg-white px-4 py-3.5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold uppercase tracking-wider text-rose-dark">{batch.program_type}</p>
        <p className="mt-1 truncate font-semibold">{batch.batch_name}</p>
      </div>
      {batch.is_full
        ? <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">Penuh</span>
        : <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">Dibuka</span>}
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs text-ink/60">
      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-plum-light"/>{formatDate(batch.start_date)}</span>
      <span className="font-bold text-plum">{batch.training_fee == null ? 'Biaya menyusul' : formatCurrency(batch.training_fee)}</span>
    </div>
  </div>;
}

function Fact({ icon: Icon, label, value }) {
  return <div>
    <dt className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/55 sm:text-xs"><Icon className="h-3.5 w-3.5 text-rose-soft"/>{label}</dt>
    <dd className="mt-1.5 text-xs font-medium leading-snug sm:text-sm">{value}</dd>
  </div>;
}

function ContactCard({ icon: Icon, label, value, href }) {
  return <Reveal>
    <a href={href} target="_blank" rel="noreferrer" className="group block h-full rounded-xl border border-line bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-plum-light/40 hover:shadow-xl hover:shadow-plum/10">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-lilac text-plum-light transition group-hover:bg-plum-light group-hover:text-white"><Icon className="h-5 w-5"/></span>
      <span className="mt-4 block text-[10px] font-medium uppercase tracking-wider text-ink/50">{label}</span>
      <span className="mt-1 block break-words text-sm font-semibold leading-snug">{value}</span>
    </a>
  </Reveal>;
}

function SectionHeading({ eyebrow, title }) {
  return <>
    <p className="text-xs font-bold uppercase tracking-[.17em] text-rose-dark sm:text-sm">{eyebrow}</p>
    <h2 className="mt-3 max-w-3xl font-editorial text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
  </>;
}

function Footer({ imageUrl }) {
  return <footer className="bg-plum-deep text-white/65">
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-end md:justify-between md:py-12">
      <div>
        <Logo imageUrl={imageUrl} light className="h-9 w-auto"/>
        <p className="mt-4 max-w-sm text-sm leading-relaxed">LPK BYE (Bandung Youth Entrepreneur). Belajar hari ini, siap menghadapi peluang esok hari!</p>
      </div>
      <nav aria-label="Tautan halaman" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {navigation.map(([label, id]) => <a key={id} href={`#${id}`} className="transition hover:text-white">{label}</a>)}
        <Link to="/pendaftaran" className="transition hover:text-white">Pendaftaran</Link>
      </nav>
    </div>
    <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} LPK BYE. Hak cipta dilindungi.</div>
  </footer>;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  return value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Jadwal menyusul';
}

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={{ '--d': `${delay}ms` }} className={`reveal ${shown ? 'in' : ''} ${className}`}>{children}</div>;
}

export function Logo({ light = false, imageUrl = null, className = 'h-9 w-auto' }) {
  const source = imageUrl ? assetUrl(imageUrl) : '/logo-horizontal.svg';
  return <img src={source} alt="LPK BYE" className={`${className} ${light ? 'brightness-0 invert' : ''}`}/>;
}
