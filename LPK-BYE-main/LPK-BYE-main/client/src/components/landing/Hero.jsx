import { rupiah } from '../../api.js';
import RegistrationForm from './RegistrationForm.jsx';

// Hero: headline, subheadline, tombol, info pelatihan, biaya, dan form
export default function Hero({ config }) {
  const reg = config?.registration;
  const open = (reg?.status ?? 'open') === 'open';
  // Badge status pendaftaran: [warna titik, teks]
  const badge = {
    open: ['bg-emerald-400', 'Pendaftaran dibuka'],
    closed: ['bg-amber-400', 'Pendaftaran ditutup'],
    full: ['bg-red-400', 'Kuota penuh'],
  }[reg?.status ?? 'open'];

  // Info kuota per program
  const seats = reg?.programs ?? [];
  const limited = seats.some((p) => p.quota > 0);

  return (
    <section id="beranda" className="relative isolate overflow-hidden bg-gradient-to-br from-plum-deep via-plum to-plum-light pb-24 pt-32 text-white">
      {/* Latar: foto (ilustrasi), lapisan warna, pola */}
      <img src="/img/hero.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/85 to-plum/60" />
      <div className="grid-bg absolute inset-0 -z-10" />
      <div className="absolute -right-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-pink/25 blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/20 px-3.5 py-1 text-sm text-white/85">
            <span className={`h-2 w-2 rounded-full ${badge[0]}`} />
            {badge[1]}
          </div>

          <h1 className="mt-6 max-w-xl animate-fade-up font-display text-4xl font-semibold leading-[1.12] tracking-tight [animation-delay:100ms] sm:text-5xl">
            Tingkatkan Skill, Bangun Masa Depan, Raih Peluang Karier Bersama LPK BYE!
          </h1>
          <p className="mt-6 max-w-lg animate-fade-up text-lg leading-relaxed text-white/75 [animation-delay:200ms]">
            Belajar keterampilan Digital Marketing dan Bahasa Jepang bersama LPK BYE. Kembangkan kemampuan, tambah pengalaman, dan
            persiapkan diri untuk menghadapi peluang dunia kerja yang lebih luas.
          </p>

          {/* Tombol ajakan */}
          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:280ms]">
            {open && (
              <a href="#daftar" className="block w-52 transition duration-300 hover:-translate-y-0.5 hover:brightness-110">
                <img src="/img/tombol-daftar.webp" alt="Daftar Sekarang" width="520" height="163" className="h-auto w-full drop-shadow-lg" />
              </a>
            )}
            <a href="#program" className="inline-flex items-center rounded-xl border border-white/30 bg-white/5 px-6 py-3 font-semibold backdrop-blur transition duration-300 hover:bg-white/15">
              Pelajari Program
            </a>
          </div>

          {/* Info pelatihan */}
          <dl className="mt-10 grid max-w-xl gap-6 border-t border-white/15 pt-6 sm:grid-cols-3">
            <Fact delay={350} label="Program" value="Digital Marketing dan Bahasa Jepang" />
            <Fact delay={450} label="Sertifikasi" value="BNSP melalui kerja sama LSP" />
            <Fact
              delay={550}
              label="Kuota"
              value={
                limited
                  ? seats.map((p) => (
                      <span key={p.code} className="block">
                        {p.short}: {p.quota > 0 ? (p.full ? 'penuh' : `sisa ${p.remaining} dari ${p.quota}`) : 'terbuka'}
                      </span>
                    ))
                  : 'Kursi terbatas'
              }
            />
          </dl>

          <div className="mt-8 flex animate-fade-up items-baseline gap-3 [animation-delay:700ms]">
            <span className="text-sm text-white/60">Biaya pendaftaran</span>
            <span className="font-display text-3xl font-semibold text-rose-soft">{config ? rupiah(config.price) : '…'}</span>
          </div>
        </div>

        <RegistrationForm config={config} />
      </div>
    </section>
  );
}

// Satu butir info (label dan nilai)
function Fact({ label, value, delay }) {
  return (
    <div style={{ animationDelay: `${delay}ms` }} className="animate-fade-up">
      <dt className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium leading-snug">{value}</dd>
    </div>
  );
}
