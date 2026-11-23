import Reveal from '../ui/Reveal.jsx';
import { CheckIcon, ArrowRightIcon } from '../ui/Icons.jsx';

// Bagian "Program Pelatihan Kami": dua kartu program
export default function Programs({ config }) {
  const status = config?.registration?.status ?? 'open';
  const progs = config?.registration?.programs;
  const info = (code) => progs?.find((p) => p.code === code);

  return (
    <section id="program" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Program Pelatihan Kami</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Pilih Program yang Sesuai dengan Tujuanmu!</h2>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal delay={0}>
          <Card
            number="Program 1"
            image="/img/digital-marketing-2.webp"
            icon="/img/ikon-digital-marketing.webp"
            seat={<Seat info={info('digital-marketing')} />}
            title="Pelatihan Digital Marketing"
            question="Ingin memiliki kemampuan memasarkan produk secara digital?"
            text="Melalui program Digital Marketing, kamu dapat mempelajari keterampilan pemasaran digital untuk mendukung karier maupun mengembangkan bisnis."
            listTitle="Program yang tersedia"
            items={[
              'Pelatihan Intensif selama 3 bulan',
              'Pelatihan Reguler selama 1–3 hari',
              'Program Sertifikasi Kompetensi BNSP melalui kerja sama dengan LSP',
            ]}
            audience="Mahasiswa, fresh graduate, pencari kerja, karyawan, freelancer, content creator, dan pelaku UMKM."
            badge={
              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-line bg-white px-3 py-2">
                  <img src="/logo-bnsp.svg" alt="Logo BNSP" className="h-8 w-auto" />
                </span>
                <span className="text-sm text-ink/60">Sertifikasi BNSP melalui kerja sama LSP</span>
              </div>
            }
            action={<PickButton code="digital-marketing" label="Daftar Pelatihan Digital Marketing" info={info('digital-marketing')} status={status} />}
          />
        </Reveal>

        <Reveal delay={120}>
          <Card
            number="Program 2"
            image="/img/bahasa-jepang-1.webp"
            icon="/img/ikon-bahasa-jepang.webp"
            seat={<Seat info={info('bahasa-jepang')} />}
            title="Pelatihan Bahasa Jepang"
            question="Punya impian bekerja atau mengembangkan karier di Jepang?"
            text="Persiapkan dirimu melalui pelatihan Bahasa Jepang. Mulai belajar dari tingkat dasar hingga menengah serta pahami komunikasi dan budaya kerja Jepang."
            listTitle="Materi yang dipelajari"
            items={[
              'Bahasa Jepang tingkat dasar hingga menengah (N5–N3)',
              'Persiapan ujian JLPT dan NAT-Test',
              'Latihan percakapan sehari-hari dan formal',
              'Pengenalan budaya dan etika kerja Jepang',
              'Simulasi wawancara kerja menggunakan bahasa Jepang',
            ]}
            audience="Pemula, pelajar, fresh graduate, pencari kerja, dan calon tenaga kerja yang ingin mempersiapkan peluang karier di Jepang."
            action={<PickButton code="bahasa-jepang" label="Daftar Pelatihan Bahasa Jepang" info={info('bahasa-jepang')} status={status} />}
          />
        </Reveal>
      </div>
    </section>
  );
}

// Kartu program
function Card({ number, image, icon, seat, title, question, text, listTitle, items, audience, badge, action }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10">
      {/* Foto program (ilustrasi) dan label kuota */}
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt="Ilustrasi suasana kelas pelatihan" width="1200" height="670" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-plum-deep/60 via-transparent to-transparent" />
        <div className="absolute right-4 top-4">{seat}</div>
      </div>
      <div className="relative flex flex-1 flex-col p-8 pt-12">
      <img src={icon} alt="" width="360" height="360" loading="lazy" className="absolute -top-10 left-8 h-20 w-20 rounded-full bg-white object-contain p-0.5 shadow-lg ring-4 ring-white" />
      <p className="text-xs font-semibold uppercase tracking-widest text-plum-light">{number}</p>
      <h3 className="mt-3 font-display text-2xl font-semibold leading-snug">{title}</h3>
      <p className="mt-3 font-medium text-plum">{question}</p>
      <p className="mt-2 leading-relaxed text-ink/70">{text}</p>

      <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink/50">{listTitle}</h4>
      <ul className="mt-3 space-y-3">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lilac text-plum-light [&_svg]:h-4 [&_svg]:w-4">
              <CheckIcon />
            </span>
            <span className="leading-snug">{t}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl bg-mist px-4 py-3 text-sm leading-relaxed text-ink/75">
        <span className="font-semibold text-ink">Cocok untuk: </span>
        {audience}
      </div>

      <div className="mt-auto space-y-5 pt-8">
        {badge}
        {action}
      </div>
      </div>
    </article>
  );
}

// Tombol pilih program: mengisi pilihan program di form lalu menuju form
function PickButton({ code, label, info, status }) {
  const blocked = status === 'closed' ? 'Pendaftaran ditutup' : status === 'full' || info?.full ? 'Kuota penuh' : null;
  if (blocked) {
    return <span className="inline-flex w-full items-center justify-center rounded-xl bg-mist px-5 py-3 font-semibold text-ink/45">{blocked}</span>;
  }
  return (
    <a
      href="#daftar"
      onClick={() => window.dispatchEvent(new CustomEvent('pilih-program', { detail: code }))}
      className="group/btn flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-plum to-plum-light px-5 py-3 font-semibold text-white shadow-md shadow-plum/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {label}
      <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
    </a>
  );
}

// Label sisa kursi di atas foto (tampil bila program punya batas peserta)
function Seat({ info }) {
  if (!info || !(info.quota > 0)) return null;
  if (info.full) return <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-red-700 shadow">Kuota penuh</span>;
  const low = info.remaining <= Math.max(3, Math.ceil(info.quota * 0.2));
  return (
    <div className="flex flex-col items-end gap-1.5">
      {low && <img src="/img/kuota-hampir-penuh.webp" alt="Kuota hampir penuh" width="420" height="87" className="h-9 w-auto drop-shadow" />}
      <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-plum shadow">Sisa {info.remaining} kursi</span>
    </div>
  );
}
