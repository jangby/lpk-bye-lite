import { useEffect, useRef, useState } from 'react';
import useChat from '../../hooks/useChat.js';
import { CloseIcon, WaIcon } from '../ui/Icons.jsx';
import RichText from './RichText.jsx';

// Chat asisten AI: tombol melayang dan jendela chat (backend: POST /api/chat)
const time = (ts) => new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [tip, setTip] = useState(false);
  const { messages, typing, send } = useChat(
    'Halo! Saya asisten virtual LPK BYE. Ada yang ingin kamu ketahui tentang program Digital Marketing atau Bahasa dan Budaya Jepang?'
  );
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const canSend = text.trim().length > 0 && !typing;

  // Dibuka dari tombol lain lewat event "buka-chat"
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener('buka-chat', onOpen);
    return () => window.removeEventListener('buka-chat', onOpen);
  }, []);

  // Gelembung ajakan muncul sekali per sesi
  useEffect(() => {
    if (sessionStorage.getItem('lpkbye_chat_tip')) return undefined;
    const t = setTimeout(() => setTip(true), 3500);
    return () => clearTimeout(t);
  }, []);

  // Menutup dengan Escape, fokus ke kolom pesan saat dibuka
  useEffect(() => {
    if (!open) return undefined;
    setTip(false);
    sessionStorage.setItem('lpkbye_chat_tip', '1');
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Gulir ke pesan terbaru
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, typing, open]);

  function submit(e) {
    e.preventDefault();
    if (!canSend) return;
    send(text);
    setText('');
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Chat dengan asisten LPK BYE"
          className="fixed inset-x-2 bottom-2 top-14 z-50 flex animate-pop flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-plum/30 ring-1 ring-black/5 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[620px] sm:max-h-[calc(100vh-7rem)] sm:w-[390px]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
            <img src="/img/maskot-ai.webp" alt="" width="44" height="44" className="h-11 w-11 rounded-2xl bg-lilac object-contain p-1" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold leading-tight">Asisten LPK BYE</div>
              <div className="flex items-center gap-1.5 text-xs text-ink/55">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online, dijawab oleh AI
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup chat"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition hover:bg-plum"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Pesan */}
          <div role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-lilac/50 via-white to-rose-soft/40 px-4 py-5">
            {messages.map((m) => (
              <div key={m.id} className={m.role === 'user' ? 'ml-auto max-w-[85%]' : 'max-w-[85%]'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'rounded-2xl rounded-tr-md bg-gradient-to-br from-plum to-plum-light px-4 py-3 text-[15px] leading-relaxed text-white shadow-md shadow-plum/20'
                      : 'rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-[15px] leading-relaxed shadow-sm'
                  }
                >
                  {m.role === 'user' ? <p className="whitespace-pre-wrap break-words">{m.text}</p> : <RichText text={m.text} />}
                  {m.error && (
                    <a
                      href="https://wa.me/6283820943475"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <WaIcon /> Hubungi admin
                    </a>
                  )}
                </div>
                <div className={`mt-1 flex items-center gap-1 text-xs text-ink/45 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {time(m.time)}
                  {m.role === 'user' && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-plum-light" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Terkirim">
                      <path d="M2 13l4 4L14 8M10 15l2 2 9-10" />
                    </svg>
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {['Program apa saja yang tersedia?', 'Bagaimana cara mendaftar?', 'Apa itu sertifikasi BNSP?', 'Berapa biaya dan jadwalnya?'].map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-plum-light/30 bg-white px-3.5 py-1.5 text-sm text-plum-light transition hover:bg-lilac"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {typing && (
              <div className="max-w-[85%]" aria-label="Asisten sedang mengetik">
                <div className="inline-flex gap-1.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 shadow-sm">
                  {[0, 150, 300].map((d) => (
                    <span key={d} style={{ animationDelay: `${d}ms` }} className="h-2 w-2 animate-bounce rounded-full bg-plum-light/70" />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Kolom pesan */}
          <form onSubmit={submit} className="border-t border-line bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={1000}
                placeholder="Ketik pesan kamu di sini..."
                aria-label="Pesan"
                className="min-w-0 flex-1 rounded-full border border-line bg-mist/60 px-4 py-3 outline-none transition focus:border-rose focus:bg-white focus:ring-4 focus:ring-rose/15 focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Kirim pesan"
                className="group/send relative h-12 w-12 shrink-0 rounded-full transition active:scale-95 disabled:cursor-not-allowed"
              >
                <img src={canSend ? '/img/kirim-ungu.webp' : '/img/kirim-nonaktif.webp'} alt="" width="48" height="48" className="h-full w-full" />
                {canSend && (
                  <img src="/img/kirim-pink.webp" alt="" width="48" height="48" className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200 group-hover/send:opacity-100" />
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-ink/40">Dijawab oleh AI. Untuk info resmi, hubungi admin.</p>
          </form>
        </div>
      )}

      {/* Gelembung ajakan */}
      {tip && !open && (
        <div className="fixed bottom-24 right-5 z-40 flex max-w-[15rem] animate-fade-up items-start gap-2 rounded-2xl rounded-br-md border border-line bg-white py-3 pl-4 pr-2 text-sm shadow-xl shadow-plum/15">
          <button onClick={() => setOpen(true)} className="text-left leading-snug">Ada pertanyaan? Tanya asisten LPK BYE di sini.</button>
          <button
            onClick={() => { setTip(false); sessionStorage.setItem('lpkbye_chat_tip', '1'); }}
            aria-label="Tutup"
            className="rounded-full p-1 text-ink/40 transition hover:bg-lilac hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tombol melayang */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Tutup chat' : 'Buka chat dengan asisten'}
        aria-expanded={open}
        className={`group fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-plum/25 ring-2 ring-pink/60 transition duration-300 hover:-translate-y-1 hover:ring-pink ${open ? 'max-sm:hidden' : ''}`}
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-pink/30" />}
        {open ? (
          <CloseIcon className="h-7 w-7 text-plum" />
        ) : (
          <img src="/img/maskot-ai.webp" alt="" width="52" height="52" className="h-[52px] w-[52px] object-contain transition-transform duration-300 group-hover:scale-110" />
        )}
      </button>
    </>
  );
}
