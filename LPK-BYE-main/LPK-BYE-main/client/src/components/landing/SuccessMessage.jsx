// Pesan sukses setelah pendaftaran, dengan tombol konfirmasi ke WhatsApp admin
export default function SuccessMessage({ name, phone, programName, orderId }) {
  const wa = `https://wa.me/6283820943475?text=${encodeURIComponent(
    `Halo LPK BYE, saya ${name} sudah mendaftar ${programName || 'pelatihan'} (No. pesanan ${orderId}). Mohon konfirmasinya.`
  )}`;

  return (
    <div role="status" className="py-4">
      <svg viewBox="0 0 52 52" className="h-16 w-16 animate-pop" aria-hidden="true">
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
      <h2 className="mt-5 font-display text-2xl font-semibold">Pendaftaran diterima</h2>
      <p className="mt-3 leading-relaxed text-ink/70">
        Terima kasih, {name}. Tim kami akan menghubungi Anda lewat WhatsApp di {phone} untuk konfirmasi dan detail pelatihan.
      </p>
      <p className="mt-3 text-sm text-ink/55">Ingin lebih cepat? Konfirmasi langsung ke admin lewat WhatsApp.</p>
      <a href={wa} target="_blank" rel="noreferrer" className="mt-4 block w-64 transition duration-300 hover:-translate-y-0.5 hover:brightness-110">
        <img src="/img/tombol-konfirmasi-wa.webp" alt="Konfirmasi ke WhatsApp" width="560" height="123" className="h-auto w-full drop-shadow-md" />
      </a>
    </div>
  );
}
