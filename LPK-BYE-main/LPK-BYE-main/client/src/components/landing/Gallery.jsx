import Reveal from '../ui/Reveal.jsx';

// Bagian "Suasana Pelatihan": galeri foto (ilustrasi)
export default function Gallery() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Galeri</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Suasana Belajar di LPK BYE</h2>
      </Reveal>

      <div className="mt-10 grid auto-rows-[10rem] grid-cols-2 gap-4 md:auto-rows-[13rem] md:grid-cols-4">
        <Tile delay={0} src="/img/digital-marketing-1.webp" alt="Ilustrasi kelas Digital Marketing" className="col-span-2 row-span-2" />
        <Tile delay={80} src="/img/kelas-4.webp" alt="Ilustrasi peserta belajar bersama" className="col-span-1 row-span-1" />
        <Tile delay={160} src="/img/bahasa-jepang-1.webp" alt="Ilustrasi kelas Bahasa Jepang" className="col-span-1 row-span-2" />
        <Tile delay={240} src="/img/kelas-5.webp" alt="Ilustrasi sesi pelatihan kelompok" className="col-span-1 row-span-1" />
      </div>
      <p className="mt-3 text-xs text-ink/45">Foto-foto di atas adalah ilustrasi suasana pelatihan.</p>
    </section>
  );
}

// Satu foto galeri
function Tile({ src, alt, className, delay }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="group relative h-full overflow-hidden rounded-2xl shadow-lg shadow-plum/10">
        <img src={src} alt={alt} width="1200" height="670" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-plum-deep/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      </div>
    </Reveal>
  );
}
