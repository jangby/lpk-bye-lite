// Pesan di kartu form saat pendaftaran tidak bisa dilakukan
export default function ClosedNotice({ status }) {
  return (
    <div role="status" className="py-4">
      <img src="/img/pengumuman.webp" alt="" width="200" height="169" className="h-20 w-auto" />

      {status === 'full' ? (
        <>
          <h2 className="mt-5 font-display text-2xl font-semibold">Kuota peserta penuh</h2>
          <p className="mt-3 leading-relaxed text-ink/70">Seluruh kursi sudah terisi. Silakan kembali lagi untuk gelombang berikutnya.</p>
        </>
      ) : (
        <>
          <h2 className="mt-5 font-display text-2xl font-semibold">Pendaftaran ditutup</h2>
          <p className="mt-3 leading-relaxed text-ink/70">Pendaftaran untuk sementara ditutup. Silakan kembali lagi nanti.</p>
        </>
      )}
    </div>
  );
}
