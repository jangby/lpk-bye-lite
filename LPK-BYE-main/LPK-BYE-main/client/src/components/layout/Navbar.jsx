import { useEffect, useState } from 'react';
import Logo from '../ui/Logo.jsx';
import { MenuIcon, CloseIcon } from '../ui/Icons.jsx';

// Navbar: logo dan tautan bagian [teks, id bagian]
const LINKS = [
  ['Beranda', 'beranda'],
  ['Tentang Kami', 'tentang'],
  ['Program', 'program'],
  ['Manfaat', 'manfaat'],
  ['FAQ', 'faq'],
  ['Kontak', 'kontak'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('beranda');

  // Menandai bagian yang sedang tampil di layar
  useEffect(() => {
    const els = LINKS.map(([, id]) => document.getElementById(id)).filter(Boolean);
    if (!('IntersectionObserver' in window) || els.length === 0) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a href="#beranda" aria-label="LPK BYE">
          <Logo className="h-9" />
        </a>

        <nav aria-label="Menu utama" className="hidden items-center gap-1 md:flex">
          {LINKS.map(([text, id]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? 'true' : undefined}
              className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${active === id ? 'text-rose-dark' : 'text-ink/70 hover:text-plum'}`}
            >
              {text}
              <span className={`absolute inset-x-3.5 bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-pink to-plum-light transition-opacity duration-300 ${active === id ? 'opacity-100' : 'opacity-0'}`} />
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          className="rounded-lg p-2 text-ink transition hover:bg-lilac md:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav aria-label="Menu utama" className="animate-fade-up border-t border-line bg-white px-5 pb-4 pt-2 md:hidden">
          {LINKS.map(([text, id]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-3 font-medium transition ${active === id ? 'bg-lilac text-rose-dark' : 'text-ink/80 hover:bg-lilac'}`}
            >
              {text}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
