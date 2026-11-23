import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from './Icons.jsx';

// Dropdown pilihan dengan label di garis kolom; options: [{ value, label }]
export default function Select({ label, value, onChange, options, placeholder = 'Pilih' }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const root = useRef(null);
  const selected = options.find((o) => o.value === value);

  // Menutup saat klik di luar
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const openMenu = () => {
    setHi(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (i) => {
    onChange(options[i].value);
    setOpen(false);
  };

  function onKey(e) {
    if (e.key === 'Escape') return setOpen(false);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return openMenu();
      return setHi((h) => (h + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    }
    if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault();
      choose(hi);
    }
    return undefined;
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKey}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border-2 bg-white px-4 pb-2.5 pt-4 text-left outline-none transition focus-visible:outline-none ${open ? 'border-rose' : 'border-plum-light/50 hover:border-plum-light'}`}
      >
        <span className={selected ? 'font-medium' : 'text-ink/40'}>{selected ? selected.label : placeholder}</span>
        <ChevronDownIcon className={`h-5 w-5 shrink-0 text-ink/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <span className="pointer-events-none absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-rose-dark">
        <span aria-hidden="true">* </span>
        {label}
      </span>

      {open && (
        <ul role="listbox" className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-xl shadow-plum/15">
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setHi(i)}
              onClick={() => choose(i)}
              className={`mx-1.5 cursor-pointer rounded-lg border-2 px-3.5 py-3 text-sm transition-colors ${hi === i ? 'border-rose' : 'border-transparent'} ${o.value === value ? 'font-semibold text-plum' : ''}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
