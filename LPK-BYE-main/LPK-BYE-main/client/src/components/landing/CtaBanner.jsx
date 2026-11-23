import Reveal from '../ui/Reveal.jsx';
import { WaIcon, ArrowRightIcon } from '../ui/Icons.jsx';

// Ajakan akhir: daftar (bila dibuka) dan konsultasi WhatsApp
export default function CtaBanner({ config }) {
  const open = (config?.registration?.status ?? 'open') === 'open';

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-plum-deep via-plum to-plum-light px-8 py-14 text-center text-white sm:px-16">
          <img src="/img/hero-bahasa-jepang.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/90 to-plum-light/80" />
          <div className="grid-bg absolute inset-0 -z-10" />
          <div className="absolute -left-16 -top-20 -z-10 h-64 w-64 rounded-full bg-pink/30 blur-3xl" />

          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Masa Depanmu Dimulai dari Skill yang Kamu Miliki!
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/80">
            Jangan menunda kesempatan untuk mengembangkan diri. Tingkatkan keterampilan Digital Marketing atau pelajari Bahasa Jepang
            bersama LPK BYE. Pilih program yang sesuai dengan impianmu dan mulai langkah pertamamu sekarang!
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {open && (
              <a
                href="#daftar"
                className="group/btn inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-plum transition duration-300 hover:-translate-y-0.5 hover:bg-rose-soft"
              >
                Daftar Sekarang
                <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </a>
            )}
            <a
              href="https://wa.me/6283820943475?text=Halo%20LPK%20BYE%2C%20saya%20ingin%20konsultasi%20program%20pelatihan."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-emerald-900/30 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              <WaIcon className="h-5 w-5" />
              Konsultasi Gratis via WhatsApp
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
