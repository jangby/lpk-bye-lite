import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import PayConfirmCard from '../components/payment/PayConfirmCard.jsx';

// Halaman /bayar/:orderId (tujuan QR, dibuka dari HP)
export default function PhonePay() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api(`/payment/${orderId}`).then(setOrder).catch((e) => setError(e.message));
  }, [orderId]);

  async function pay() {
    setPaying(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 900));
      await api(`/payment/${orderId}/pay`, { method: 'POST' });
      setOrder((o) => ({ ...o, status: 'paid' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-plum-deep via-plum to-plum-light px-5 py-10">
      <img src="/img/digital-marketing-3.webp" alt="" aria-hidden="true" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-plum-deep/95 via-plum/90 to-plum-light/80" />
      {order ? (
        <PayConfirmCard order={order} orderId={orderId} paying={paying} error={error} onPay={pay} />
      ) : (
        <p role={error ? 'alert' : 'status'} className="text-center text-white/80">
          {error || 'Memuat pesanan…'}
        </p>
      )}
    </div>
  );
}
