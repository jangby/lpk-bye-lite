import Reveal from '../ui/Reveal.jsx';
import { BriefcaseIcon, UsersIcon, TargetIcon, TrendIcon, AwardIcon, GlobeIcon } from '../ui/Icons.jsx';

// Bagian "Manfaat mengikuti pelatihan": enam kartu manfaat
export default function Benefits() {
  return (
    <section id="manfaat" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Manfaat</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Kenapa Harus Belajar Bersama LPK BYE?</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/70">Ada banyak alasan untuk mulai meningkatkan keterampilan bersama kami.</p>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Item delay={0} icon={<BriefcaseIcon />} title="Materi Sesuai Kebutuhan Industri" text="Pelajari keterampilan yang relevan dengan perkembangan dunia kerja dan kebutuhan industri." />
        <Item delay={80} icon={<UsersIcon />} title="Dibimbing Pengajar Berpengalaman" text="Dapatkan bimbingan belajar dari tenaga pengajar yang berpengalaman di bidangnya." />
        <Item delay={160} icon={<TargetIcon />} title="Pembelajaran Terarah" text="Belajar melalui program yang disusun sesuai bidang dan tingkat kemampuan peserta." />
        <Item delay={240} icon={<TrendIcon />} title="Pengembangan Kompetensi" text="Tingkatkan kemampuan diri sebagai bekal untuk menghadapi tantangan dunia kerja." />
        <Item delay={320} icon={<AwardIcon />} title="Peluang Sertifikasi" text="Tersedia program sertifikasi kompetensi BNSP untuk bidang Digital Marketing melalui kerja sama dengan LSP." />
        <Item delay={400} icon={<GlobeIcon />} title="Persiapan Peluang Karier Jepang" text="Khusus program Bahasa Jepang, peserta dibekali kemampuan bahasa, budaya, etika kerja, dan persiapan wawancara." />
      </div>
    </section>
  );
}

// Satu kartu manfaat
function Item({ icon, title, text, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="group h-full rounded-2xl border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-plum-light/40 hover:shadow-xl hover:shadow-plum/10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink to-plum-light text-white shadow-md shadow-pink/25 transition duration-300 group-hover:scale-105 group-hover:rotate-3">
          {icon}
        </span>
        <h3 className="mt-5 text-lg font-semibold leading-snug">{title}</h3>
        <p className="mt-2 leading-relaxed text-ink/70">{text}</p>
      </div>
    </Reveal>
  );
}
