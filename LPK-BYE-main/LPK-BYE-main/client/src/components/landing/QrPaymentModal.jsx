import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { rupiah } from '../../api.js';
import { Spinner } from '../ui/Icons.jsx';

// Jendela QR (simulasi), tujuan: /bayar/:orderId
export default function QrPaymentModal({ orderId, price, payUrl, reachable, paying, onConfirm, onClose }) {

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Portal ke <body>
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pembayaran QRIS"
      className="fixed inset-0 z-50 flex animate-fade-up items-center justify-center overflow-y-auto bg-plum-deep/70 p-5 backdrop-blur-sm"
    >
      <div className="my-auto w-full max-w-sm animate-pop rounded-2xl bg-white p-7 text-center text-ink shadow-2xl">
        <div className="text-sm font-medium text-ink/60">Bayar dengan QRIS</div>
        <div className="mt-1 font-display text-3xl font-semibold">{price ? rupiah(price) : ''}</div>

        <div className="mx-auto mt-5 w-fit rounded-xl border border-line bg-white p-3">
          <QRCodeSVG value={payUrl} size={200} level="M" fgColor="#3D2569" bgColor="#FFFFFF" />
        </div>

        <p className="mt-4 text-sm text-ink/65">
          Scan dengan kamera HP, lalu tekan <b>Bayar</b> di halaman yang terbuka.
        </p>
        <p className="mt-1 flex items-center justify-center gap-2 text-sm text-ink/50">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          Menunggu pembayaran, batas 24 jam sejak mendaftar
        </p>

        {!reachable && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
            Alamat jaringan komputer ini tidak terdeteksi, jadi QR belum bisa dibuka dari HP. Tombol simulasi di bawah tetap bisa dipakai.
          </p>
        )}

        <p className="mt-3 break-all text-xs text-ink/35">{payUrl}</p>

        <button
          onClick={onConfirm}
          disabled={paying}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition duration-200 hover:border-plum/40 disabled:opacity-60"
        >
          {paying && <Spinner />}
          {paying ? 'Memverifikasi…' : 'Simulasi tanpa HP: anggap sudah dibayar'}
        </button>
        <button onClick={onClose} disabled={paying} className="mt-3 text-sm text-ink/55 transition hover:text-ink">
          Batalkan
        </button>
        <p className="mt-4 text-xs text-ink/40">Mode simulasi, tidak ada uang sungguhan yang berpindah.</p>
      </div>
    </div>,
    document.body
  );
}
