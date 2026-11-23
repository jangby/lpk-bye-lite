// Kolom isian dengan ikon di kiri (form pendaftaran dan login admin)
export const FIELD =
  'w-full rounded-xl border border-line bg-mist/60 py-3 pl-11 pr-4 text-base outline-none transition focus:border-rose focus:bg-white focus:ring-4 focus:ring-rose/15 focus-visible:outline-none';

export default function Field({ label, icon, className = 'mt-4', children }) {
  return (
    <label className={`group/field block text-sm font-medium ${className}`}>
      {label}
      <span className="relative mt-1.5 block">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 transition-colors group-focus-within/field:text-rose">
          {icon}
        </span>
        {children}
      </span>
    </label>
  );
}
