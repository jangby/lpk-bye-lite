import { rupiah } from '../../api.js';
import Logo from '../ui/Logo.jsx';
import { Spinner } from '../ui/Icons.jsx';

// Kartu konfirmasi bayar di HP (simulasi)
export default function PayConfirmCard({ order, orderId, paying, error, onPay }) {
  const paid = order.status === 'paid';
  const expired = order.status === 'failed';

  return (
    <div className="w-full max-w-sm animate-fade-up overflow-hidden rounded-2xl bg-white text-ink shadow-2xl shadow-black/30">
      <div className="bg-plum px-6 py-5 text-white">
        <div className="text-xs uppercase tracking-wider text-white/55">Konfirmasi pembayaran</div>
        <Logo light className="mt-2 h-7" />
      </div>

      <div className="p-6">
        {expired ? (
          <div role="status" className="py-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold">Pesanan kedaluwarsa</h1>
            <p className="mt-2 text-sm text-ink/65">Batas pembayaran 24 jam sudah lewat. Silakan daftar ulang dari halaman pendaftaran.</p>
          </div>
        ) : paid ? (
          <div role="status" className="py-2 text-center">
            <svg viewBox="0 0 52 52" className="mx-auto h-16 w-16 animate-pop" aria-hidden="true">
              <circle cx="26" cy="26" r="24" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2.5" />
              <path
                d="M14 27l8 8 16-17"
                fill="none"
                stroke="#15803D"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw"
                style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
              />
            </svg>
            <h1 className="mt-4 font-display text-2xl font-semibold">Pembayaran berhasil</h1>
            <p className="mt-2 text-sm text-ink/65">Anda bisa menutup halaman ini dan kembali ke layar komputer.</p>
          </div>
        ) : (
          <>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-ink/55">Atas nama</dt><dd className="font-medium">{order.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-ink/55">No. pesanan</dt><dd className="break-all text-right text-xs">{orderId}</dd></div>
            </dl>
            <div className="mt-5 border-t border-line pt-5 text-center">
              <div className="text-sm text-ink/55">Total pembayaran</div>
              <div className="mt-1 font-display text-3xl font-semibold">{rupiah(order.amount)}</div>
            </div>

            {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}

            <button
              onClick={onPay}
              disabled={paying}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-rose px-4 py-3.5 font-semibold text-white shadow-md shadow-rose/25 transition duration-200 hover:bg-rose-dark disabled:opacity-60"
            >
              {paying && <Spinner />}
              {paying ? 'Memproses…' : 'Bayar sekarang'}
            </button>
            <p className="mt-3 text-center text-xs text-ink/40">Mode simulasi, tidak ada uang sungguhan yang berpindah.</p>
          </>
        )}
      </div>
    </div>
  );
}
