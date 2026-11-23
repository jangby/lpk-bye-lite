import Logo from '../ui/Logo.jsx';

// Footer: logo, tagline, tautan bagian, hak cipta
export default function Footer() {
  return (
    <footer className="bg-plum-deep text-white/65">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <Logo light className="h-10" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            LPK BYE (Bandung Youth Entrepreneur). Belajar hari ini, siap menghadapi peluang esok hari!
          </p>
        </div>
        <nav aria-label="Tautan bagian" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="#beranda" className="transition hover:text-white">Beranda</a>
          <a href="#tentang" className="transition hover:text-white">Tentang Kami</a>
          <a href="#program" className="transition hover:text-white">Program</a>
          <a href="#manfaat" className="transition hover:text-white">Manfaat</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
          <a href="#kontak" className="transition hover:text-white">Kontak</a>
        </nav>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">
        © {new Date().getFullYear()} LPK BYE. Hak cipta dilindungi.
      </div>
    </footer>
  );
}
