import useRegistration from '../../hooks/useRegistration.js';
import { rupiah } from '../../api.js';
import Field, { FIELD } from '../ui/Field.jsx';
import { Spinner, UserIcon, MailIcon, PhoneIcon, BookIcon, ChevronDownIcon, LockIcon, ArrowRightIcon, ClipboardIcon } from '../ui/Icons.jsx';
import SuccessMessage from './SuccessMessage.jsx';
import ClosedNotice from './ClosedNotice.jsx';
import QrPaymentModal from './QrPaymentModal.jsx';

// Kartu formulir pendaftaran (logika di hooks/useRegistration.js)
export default function RegistrationForm({ config }) {
  const { form, set, state, submit, qr, confirmQr, closeQr, orderId } = useRegistration(config);
  const status = config?.registration?.status ?? 'open';
  const programs = config?.registration?.programs ?? [];
  const programName = programs.find((p) => p.code === form.program)?.name;

  return (
    <div id="daftar" className="scroll-mt-28 animate-fade-up [animation-delay:250ms]">
      {/* Cincin warna berputar saat form difokuskan (gaya di index.css) */}
      <div className="glow-form relative">
        <div className="spin-glow" aria-hidden="true" />
        <div className="spin-ring relative z-10 shadow-2xl shadow-black/30">
          <div className="relative overflow-hidden rounded-[14px] bg-white p-7 text-ink sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-pink/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-plum-light/10 blur-2xl" />

            <div className="relative">
              {state.done ? (
                <SuccessMessage name={form.name} phone={form.phone} programName={programName} orderId={orderId} />
              ) : status !== 'open' ? (
                <ClosedNotice status={status} />
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink to-plum-light text-white shadow-md shadow-pink/30">
                      <ClipboardIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-semibold leading-tight">Formulir pendaftaran</h2>
                      <p className="text-sm text-ink/60">Isi data diri, lalu lanjutkan ke pembayaran.</p>
                    </div>
                  </div>

                  <Field className="mt-6" label="Nama lengkap" icon={<UserIcon className="h-5 w-5" />}>
                    <input className={FIELD} value={form.name} onChange={set('name')} autoComplete="name" maxLength={100} required />
                  </Field>
                  <Field label="Email" icon={<MailIcon className="h-5 w-5" />}>
                    <input type="email" className={FIELD} value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} required />
                  </Field>
                  <Field label="Nomor HP (WhatsApp aktif)" icon={<PhoneIcon className="h-5 w-5" />}>
                    <input type="tel" inputMode="tel" placeholder="081234567890" className={FIELD} value={form.phone} onChange={set('phone')} autoComplete="tel" required />
                  </Field>
                  <Field label="Program pelatihan" icon={<BookIcon className="h-5 w-5" />}>
                    <select className={`${FIELD} appearance-none pr-10`} value={form.program} onChange={set('program')} required>
                      <option value="">Pilih program</option>
                      {programs.map((p) => (
                        <option key={p.code} value={p.code} disabled={p.full}>
                          {p.name}{p.full ? ' (kuota penuh)' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
                  </Field>

                  {state.error && (
                    <p role="alert" className="mt-4 animate-fade-up rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-800 ring-1 ring-red-200">{state.error}</p>
                  )}

                  <button
                    disabled={state.loading || !config}
                    className="group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-dark via-rose to-rose px-4 py-3.5 font-semibold text-white shadow-lg shadow-rose/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose/40 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {state.loading && <Spinner />}
                    {state.loading ? (
                      'Memproses…'
                    ) : (
                      <>
                        Lanjut ke pembayaran {config ? rupiah(config.price) : ''}
                        <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink/45">
                    <LockIcon className="h-3.5 w-3.5" />
                    Simulasi pembayaran: scan QR dari HP, tanpa uang sungguhan.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {qr && (
        <QrPaymentModal
          orderId={qr.orderId}
          price={config?.price}
          payUrl={qr.payUrl}
          reachable={qr.reachable}
          paying={qr.paying}
          onConfirm={confirmQr}
          onClose={closeQr}
        />
      )}
    </div>
  );
}
