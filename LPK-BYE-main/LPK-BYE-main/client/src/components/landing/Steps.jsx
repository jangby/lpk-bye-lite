import Reveal from '../ui/Reveal.jsx';

// Bagian "Cara mendaftar"
export default function Steps() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Alur</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Cara mendaftar</h2>
      </Reveal>

      <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block" />
        <Step n={1} delay={0} title="Isi data diri" text="Nama, email, nomor WhatsApp aktif, dan pilihan program." />
        <Step n={2} delay={130} title="Selesaikan pembayaran" text="Scan QR dengan HP lalu tekan Bayar (simulasi)." />
        <Step n={3} delay={260} title="Kami hubungi Anda" text="Tim kami mengirim detail pelatihan lewat WhatsApp." />
      </ol>
    </section>
  );
}

// Satu langkah
function Step({ n, title, text, delay }) {
  return (
    <li>
      <Reveal delay={delay}>
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-plum text-lg font-semibold text-white ring-8 ring-mist">{n}</div>
        <h3 className="mt-5 text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-xs leading-relaxed text-ink/70">{text}</p>
      </Reveal>
    </li>
  );
}
