import Reveal from '../ui/Reveal.jsx';
import { ChevronDownIcon } from '../ui/Icons.jsx';

// Bagian FAQ: pertanyaan yang sering diajukan
export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-24">
      <div className="mx-auto max-w-3xl px-5">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Pertanyaan yang Sering Diajukan</h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            <Item q="Apa itu LPK BYE?">
              LPK BYE (Bandung Youth Entrepreneur) adalah Lembaga Pelatihan Kerja yang menyediakan program pelatihan Digital Marketing serta Bahasa dan Budaya Jepang.
            </Item>
            <Item q="Siapa saja yang boleh mengikuti pelatihan?">
              Program pelatihan ditujukan bagi masyarakat yang ingin meningkatkan keterampilan, mulai dari pelajar, mahasiswa, fresh graduate, pencari kerja, karyawan, hingga pelaku usaha. Persyaratan setiap program dapat berbeda.
            </Item>
            <Item q="Apakah pemula boleh mengikuti pelatihan?">
              Tentu. Tersedia pembelajaran yang dapat disesuaikan dengan tingkat kemampuan peserta. Silakan konsultasikan program yang sesuai kepada admin.
            </Item>
            <Item q="Apa saja program pelatihan yang tersedia?">
              LPK BYE menyediakan pelatihan Digital Marketing, termasuk kelas intensif, reguler, dan program sertifikasi BNSP. Tersedia juga pelatihan Bahasa Jepang.
            </Item>
            <Item q="Berapa lama durasi pelatihannya?">
              Durasi pelatihan Digital Marketing tersedia dalam program intensif selama 3 bulan dan reguler selama 1–3 hari. Untuk program Bahasa Jepang, jadwal dan durasi dapat ditanyakan kepada admin.
            </Item>
            <Item q="Apakah peserta mendapatkan sertifikat?">
              Tersedia sertifikat sesuai program yang diikuti. Khusus program sertifikasi BNSP, sertifikat kompetensi diberikan kepada peserta yang dinyatakan kompeten sesuai ketentuan asesmen.
            </Item>
            <Item q="Apakah setelah mengikuti pelatihan bisa bekerja di Jepang?">
              Program Bahasa Jepang membantu peserta mempersiapkan kemampuan bahasa Jepang. Untuk yang ingin melanjutkan pendidikan maupun bekerja di Jepang.
            </Item>
            <Item q="Bagaimana cara mendaftar pelatihan?">
              Isi formulir pendaftaran di halaman ini, atau hubungi admin LPK BYE melalui{' '}
              <a href="https://wa.me/6283820943475" target="_blank" rel="noreferrer" className="font-semibold text-rose-dark underline underline-offset-2">WhatsApp</a>{' '}
              untuk mendapatkan informasi program, jadwal, biaya, persyaratan, dan proses pendaftaran.
            </Item>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Satu pertanyaan (buka/tutup dengan details)
function Item({ q, children }) {
  return (
    <details className="group bg-white open:bg-mist/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold transition hover:text-plum [&::-webkit-details-marker]:hidden">
        {q}
        <ChevronDownIcon className="h-5 w-5 shrink-0 text-plum-light transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <p className="px-6 pb-6 leading-relaxed text-ink/70">{children}</p>
    </details>
  );
}
