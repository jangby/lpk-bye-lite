import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import Logo from '../ui/Logo.jsx';
import Field, { FIELD } from '../ui/Field.jsx';
import { UserIcon, LockIcon, ArrowRightIcon } from '../ui/Icons.jsx';

// Form login admin
export default function AdminLogin({ onLogin }) {
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { token } = await api('/admin/login', { method: 'POST', body: f });
      localStorage.setItem('admin_token', token);
      onLogin(token);
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-plum-deep via-plum to-plum-light px-5">
      {/* Latar: foto (ilustrasi), lapisan warna, pola */}
      <img src="/img/digital-marketing-2.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-plum-deep/95 via-plum/90 to-plum-light/80" />
      <div className="grid-bg absolute inset-0 -z-10" />
      <div className="absolute -left-24 top-10 -z-10 h-80 w-80 rounded-full bg-pink/25 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 -z-10 h-96 w-96 rounded-full bg-plum-light/50 blur-3xl" />

      <div className="w-full max-w-sm animate-fade-up">
        {/* Cincin warna berputar saat mengisi form (gaya di index.css) */}
        <div className="glow-form relative">
          <div className="spin-glow" aria-hidden="true" />
          <div className="spin-ring relative z-10 shadow-2xl shadow-black/40">
            <form onSubmit={submit} className="relative overflow-hidden rounded-[14px] bg-white p-8 text-ink">
              <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-pink/10 blur-2xl" />
              <div className="relative">
                <Logo className="h-10" />
                <h1 className="mt-5 font-display text-2xl font-semibold">Masuk admin</h1>
                <p className="mt-1 text-sm text-ink/60">Kelola pendaftaran pelatihan LPK BYE.</p>

                <Field className="mt-6" label="Username" icon={<UserIcon className="h-5 w-5" />}>
                  <input className={FIELD} value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoComplete="username" />
                </Field>
                <Field label="Password" icon={<LockIcon className="h-5 w-5" />}>
                  <input type="password" className={FIELD} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" />
                </Field>

                {err && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">{err}</p>}

                <button className="group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-plum via-plum-light to-plum-light px-4 py-3 font-semibold text-white shadow-lg shadow-plum/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-plum/40 active:translate-y-0">
                  Masuk
                  <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </form>
          </div>
        </div>
        <Link to="/" className="mt-6 block text-center text-sm text-white/65 transition hover:text-white">Kembali ke halaman pendaftaran</Link>
      </div>
    </div>
  );
}
