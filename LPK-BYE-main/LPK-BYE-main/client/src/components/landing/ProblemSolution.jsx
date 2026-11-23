import Reveal from '../ui/Reveal.jsx';
import { CheckIcon, ArrowRightIcon } from '../ui/Icons.jsx';

// Bagian "Kendala dan solusi": permasalahan calon peserta dan jawabannya
export default function ProblemSolution() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Solusi</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Kendala yang Sering Dialami, Ada Solusinya</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-ink/70">
            Kami memahami tantangan calon peserta, dan menyiapkan program pelatihan yang menjawabnya.
          </p>
        </Reveal>

        <div className="mt-10 space-y-3">
          <Row delay={0} problem="Tidak memiliki keterampilan digital" solution="Pelatihan Digital Marketing berbasis kompetensi" />
          <Row delay={60} problem="Kesulitan membuat strategi pemasaran" solution="Pembelajaran materi pemasaran digital" />
          <Row delay={120} problem="Membutuhkan pengakuan kompetensi" solution="Program sertifikasi BNSP melalui kerja sama LSP" />
          <Row delay={180} problem="Belum bisa bahasa Jepang" solution="Pembelajaran bahasa Jepang dari N5 hingga N3" />
          <Row delay={240} problem="Takut menghadapi ujian bahasa" solution="Persiapan JLPT dan NAT-Test" />
          <Row delay={300} problem="Belum memahami budaya kerja Jepang" solution="Pembelajaran budaya dan etika kerja Jepang" />
          <Row delay={360} problem="Ingin mempersiapkan karier di Jepang" solution="Pembelajaran percakapan dan simulasi wawancara kerja" />
        </div>
      </div>
    </section>
  );
}

// Satu baris: permasalahan menuju solusi
function Row({ problem, solution, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="grid items-center gap-3 rounded-xl border border-line bg-mist/60 p-4 transition duration-300 hover:border-plum-light/40 hover:bg-white hover:shadow-lg hover:shadow-plum/10 md:grid-cols-[1fr_auto_1fr] md:gap-6 md:px-6">
        <p className="font-medium text-ink/80">{problem}</p>
        <ArrowRightIcon className="hidden h-5 w-5 text-pink md:block" />
        <p className="flex items-start gap-3 font-semibold text-plum">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lilac text-plum-light [&_svg]:h-4 [&_svg]:w-4">
            <CheckIcon />
          </span>
          {solution}
        </p>
      </div>
    </Reveal>
  );
}
