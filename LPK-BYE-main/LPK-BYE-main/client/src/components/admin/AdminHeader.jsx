import Logo from '../ui/Logo.jsx';

// Header admin
export default function AdminHeader({ onRefresh, onLogout }) {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-plum-deep via-plum to-plum-light pb-28 pt-8 text-white">
      {/* Latar: foto (ilustrasi), lapisan warna, pola */}
      <img src="/img/kelas-5.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/92 to-plum-light/85" />
      <div className="grid-bg absolute inset-0 -z-10" />
      <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-pink/25 blur-3xl" />
      <div className="absolute -bottom-28 left-1/4 -z-10 h-64 w-64 rounded-full bg-plum-light/50 blur-3xl" />

      <div className="mx-auto max-w-6xl px-5">
        <header className="flex animate-fade-up flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo light className="h-8" />
            <div className="border-l border-white/25 pl-4">
              <h1 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">Data pendaftar</h1>
              <p className="text-sm text-white/65">Kelola pendaftaran pelatihan LPK BYE</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <button onClick={onRefresh} className="rounded-xl border border-white/25 bg-white/5 px-4 py-2 backdrop-blur transition hover:bg-white/15">Muat ulang</button>
            <button onClick={onLogout} className="rounded-xl border border-white/25 bg-white/5 px-4 py-2 backdrop-blur transition hover:bg-white/15">Keluar</button>
          </div>
        </header>
      </div>
    </div>
  );
}
