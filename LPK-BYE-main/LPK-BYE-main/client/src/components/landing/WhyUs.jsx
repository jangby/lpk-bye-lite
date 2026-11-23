import Reveal from '../ui/Reveal.jsx';
import { ArrowRightIcon } from '../ui/Icons.jsx';

// Bagian "Mengapa memilih LPK BYE"
export default function WhyUs({ config }) {
  const open = (config?.registration?.status ?? 'open') === 'open';

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-plum-deep via-plum to-plum-light px-8 py-14 text-white sm:px-14">
          <img src="/img/digital-marketing-3.webp" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/90 to-plum-light/80" />
          <div className="grid-bg absolute inset-0 -z-10" />
          <div className="absolute -bottom-24 -right-16 -z-10 h-72 w-72 rounded-full bg-pink/30 blur-3xl" />

          <p className="text-sm font-semibold uppercase tracking-widest text-rose-soft/80">Mengapa Memilih LPK BYE?</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Bukan Sekadar Belajar, Tetapi Juga Mempersiapkan Masa Depan!
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80">
            LPK BYE berkomitmen membantu peserta mengembangkan keterampilan dan mempersiapkan diri menghadapi peluang yang lebih luas.
          </p>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/80">
            Dengan program pelatihan Digital Marketing dan Bahasa Jepang, kamu dapat memilih jalur pembelajaran sesuai minat dan tujuan kariermu.
          </p>
          <p className="mt-6 font-display text-xl font-semibold text-rose-soft">Mulai langkah kecilmu hari ini untuk masa depan yang lebih baik!</p>

          {open && (
            <a
              href="#daftar"
              className="group/btn mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-plum transition duration-300 hover:-translate-y-0.5 hover:bg-rose-soft"
            >
              Mulai Sekarang
              <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </a>
          )}
        </div>
      </Reveal>
    </section>
  );
}
