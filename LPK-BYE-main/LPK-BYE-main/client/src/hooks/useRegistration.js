import { useEffect, useState } from 'react';
import { api } from '../api.js';

// Alamat QR (IP jaringan lokal bila di localhost)
function buildPayUrl(config, orderId) {
  const here = window.location;
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(here.hostname);
  const base = isLocal && config?.lanOrigin ? config.lanOrigin : here.origin;
  return { url: `${base}/bayar/${orderId}`, reachable: !isLocal || Boolean(config?.lanOrigin) };
}

// Logika form pendaftaran dan pembayaran simulasi
export default function useRegistration(config) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', program: '' });
  const [state, setState] = useState({ loading: false, error: '', done: false });
  // Data jendela QR: { orderId, payUrl, reachable, paying }
  const [qr, setQr] = useState(null);
  // Nomor pesanan terakhir (untuk konfirmasi WhatsApp)
  const [orderId, setOrderId] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Pilihan program dari tombol di kartu program (Programs.jsx)
  useEffect(() => {
    const onPick = (e) => setForm((f) => ({ ...f, program: e.detail }));
    window.addEventListener('pilih-program', onPick);
    return () => window.removeEventListener('pilih-program', onPick);
  }, []);

  // Cek status tiap 2 detik selama QR terbuka
  useEffect(() => {
    if (!qr || qr.paying) return undefined;
    const timer = setInterval(async () => {
      try {
        const order = await api(`/payment/${qr.orderId}`);
        if (order.status === 'paid') {
          setQr(null);
          setState({ loading: false, error: '', done: true });
        } else if (order.status === 'failed') {
          setQr(null);
          setState({ loading: false, error: 'Batas pembayaran 24 jam sudah lewat. Silakan daftar ulang.', done: false });
        }
      } catch {
        // diulang pada putaran berikutnya
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [qr]);

  async function submit(e) {
    e.preventDefault();
    setState({ loading: true, error: '', done: false });
    try {
      const reg = await api('/register', { method: 'POST', body: form });
      const { url, reachable } = buildPayUrl(config, reg.orderId);
      setOrderId(reg.orderId);
      setState({ loading: false, error: '', done: false });
      setQr({ orderId: reg.orderId, payUrl: url, reachable, paying: false });
    } catch (err) {
      setState({ loading: false, error: err.message, done: false });
    }
  }

  // Cadangan: simulasi tanpa HP
  async function confirmQr() {
    setQr((q) => ({ ...q, paying: true }));
    try {
      await new Promise((r) => setTimeout(r, 1200));
      await api(`/payment/${qr.orderId}/pay`, { method: 'POST' });
      setQr(null);
      setState({ loading: false, error: '', done: true });
    } catch (err) {
      setQr(null);
      setState({ loading: false, error: err.message, done: false });
    }
  }

  function closeQr() {
    setQr(null);
    setState({ loading: false, error: 'Pembayaran dibatalkan. Data Anda sudah tersimpan, klik bayar lagi untuk melanjutkan.', done: false });
  }

  return { form, set, state, submit, qr, confirmQr, closeQr, orderId };
}
