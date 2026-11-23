import Reveal from '../ui/Reveal.jsx';
import { WaIcon, MailIcon, GlobeIcon } from '../ui/Icons.jsx';

// Bagian "Kontak": WhatsApp, email, website, dan asisten AI
export default function Contact() {
  return (
    <section id="kontak" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-rose-dark">Kontak</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Hubungi LPK BYE</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-ink/70">Tanyakan program, jadwal, biaya, dan persyaratan langsung kepada admin kami, atau mulai dengan asisten AI.</p>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Item delay={0} icon={<WaIcon className="h-6 w-6" />} label="WhatsApp" value="0838-2094-3475" href="https://wa.me/6283820943475" />
        <Item delay={80} icon={<MailIcon />} label="Email" value="official.lpkbye@gmail.com" href="mailto:official.lpkbye@gmail.com" />
        <Item delay={160} icon={<GlobeIcon />} label="Website" value="lpkbye.com" href="https://lpkbye.com/" />

        <Reveal delay={240}>
          <button
            onClick={() => window.dispatchEvent(new Event('buka-chat'))}
            className="group flex h-full w-full flex-col items-start rounded-xl border border-pink/30 bg-gradient-to-br from-rose-soft to-white p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink/20"
          >
            <img src="/img/maskot-ai.webp" alt="" width="384" height="384" loading="lazy" className="h-14 w-14 object-contain transition duration-300 group-hover:scale-110 group-hover:-rotate-6" />
            <span className="mt-3 block text-xs font-medium uppercase tracking-wider text-ink/50">Asisten AI</span>
            <span className="mt-1 block font-semibold leading-snug">Mulai chat sekarang</span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}

// Satu kartu kontak
function Item({ icon, label, value, href, delay }) {
  return (
    <Reveal delay={delay}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group block h-full rounded-xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-plum-light/40 hover:shadow-xl hover:shadow-plum/10"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-lilac text-plum-light transition duration-300 group-hover:bg-plum-light group-hover:text-white">
          {icon}
        </span>
        <span className="mt-4 block text-xs font-medium uppercase tracking-wider text-ink/50">{label}</span>
        <span className="mt-1 block break-words font-semibold leading-snug">{value}</span>
      </a>
    </Reveal>
  );
}
