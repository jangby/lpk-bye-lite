import Reveal from '../ui/Reveal.jsx';

// Testimoni alumni. Bagian disembunyikan selama ITEMS kosong. Format: { name, program, text }
const ITEMS = [];

export default function Testimonials() {
  if (ITEMS.length === 0) return null;

  return (
    <section id="testimoni" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Testimoni Peserta</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Cerita Mereka, Inspirasi untuk Langkahmu!</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/70">
          Lihat pengalaman peserta yang telah mengikuti pelatihan di LPK BYE dan jadikan cerita mereka sebagai motivasi untuk mengembangkan kemampuanmu.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {ITEMS.map((t, i) => (
          <Reveal key={t.name} delay={i * 100}>
            <figure className="h-full rounded-2xl border border-line bg-white p-7">
              <blockquote className="leading-relaxed text-ink/80">“{t.text}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="block text-ink/55">{t.program}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
