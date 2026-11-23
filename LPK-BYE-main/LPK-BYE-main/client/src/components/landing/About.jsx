import Reveal from '../ui/Reveal.jsx';
import Logo from '../ui/Logo.jsx';

// Bagian "Tentang Kami": kolase foto, profil LPK BYE, logo BNSP, dan empat pilar
export default function About() {
  return (
    <section id="tentang" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          {/* Kolase foto (ilustrasi) */}
          <div className="relative mx-auto max-w-md pb-10">
            <img
              src="/img/bahasa-jepang-2.webp"
              alt="Ilustrasi suasana kelas pelatihan"
              width="1200"
              height="670"
              loading="lazy"
              className="aspect-[4/5] w-[82%] rounded-3xl object-cover shadow-xl shadow-plum/20"
            />
            <img
              src="/img/digital-marketing-3.webp"
              alt="Ilustrasi peserta belajar di kelas"
              width="1200"
              height="670"
              loading="lazy"
              className="absolute bottom-0 right-0 aspect-square w-[58%] rounded-3xl border-4 border-white object-cover shadow-xl shadow-plum/20"
            />
            <div className="absolute left-3 top-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <Logo variant="stacked" className="h-16" />
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Tentang Kami</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Kenali LPK BYE Lebih Dekat!</h2>
          <p className="mt-5 max-w-xl leading-relaxed text-ink/75">
            LPK BYE (Bandung Youth Entrepreneur) merupakan Lembaga Pelatihan Kerja yang berfokus pada pengembangan keterampilan
            berbasis kompetensi di bidang Digital Marketing serta pendidikan bahasa Jepang.
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-ink/75">
            Kami hadir untuk membantu generasi muda dan masyarakat meningkatkan kemampuan melalui program pembelajaran yang relevan
            dengan kebutuhan dunia kerja dan perkembangan industri.
          </p>
          <p className="mt-5 max-w-xl font-display text-xl font-semibold leading-snug text-plum">
            Saatnya belajar, berkembang, dan mempersiapkan masa depan bersama LPK BYE!
          </p>

          <div className="mt-8 inline-flex items-center gap-4 rounded-xl border border-line bg-white px-5 py-3">
            <img src="/logo-bnsp.svg" alt="Logo BNSP" className="h-10 w-auto" />
            <span className="max-w-[14rem] text-sm leading-snug text-ink/60">Program sertifikasi kompetensi BNSP melalui kerja sama dengan LSP</span>
          </div>
        </Reveal>
      </div>

      {/* Empat pilar */}
      <div className="mx-auto mt-20 grid max-w-6xl grid-cols-2 gap-8 px-5 md:grid-cols-4">
        <Pillar delay={0} icon="/img/ikon-digital-marketing.webp" label="Digital Marketing" />
        <Pillar delay={100} icon="/img/ikon-bahasa-jepang.webp" label="Bahasa Jepang" />
        <Pillar delay={200} icon="/img/ikon-wirausaha-muda.webp" label="Wirausaha Muda" />
        <Pillar delay={300} icon="/img/ikon-karir-mitra.webp" label="Karir dan Mitra" />
      </div>
    </section>
  );
}

// Satu pilar: ikon dan nama
function Pillar({ icon, label, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="group text-center">
        <img src={icon} alt="" width="360" height="360" loading="lazy" className="mx-auto h-32 w-32 object-contain drop-shadow-lg transition duration-500 group-hover:-translate-y-1.5 group-hover:scale-105" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-plum">{label}</p>
      </div>
    </Reveal>
  );
}
