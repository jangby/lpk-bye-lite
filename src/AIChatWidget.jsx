import { useEffect, useRef, useState } from 'react';
import { Phone, X } from 'lucide-react';

const WEBHOOK_URL = (import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || '').trim();
const QUESTIONS = [
  'Program apa saja yang tersedia?',
  'Bagaimana cara mendaftar?',
  'Apa itu sertifikasi BNSP?',
  'Berapa biaya dan jadwalnya?'
];
const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const formatMessageTime = (time) => new Date(time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

function extractReply(payload) {
  if (typeof payload === 'string') return payload.trim();
  for (const item of Array.isArray(payload) ? payload : [payload]) {
    if (!item || typeof item !== 'object') continue;
    for (const key of ['output', 'text', 'response', 'reply', 'answer', 'message']) {
      if (typeof item[key] === 'string' && item[key].trim()) return item[key].trim();
    }
    if (item.data) {
      const nested = extractReply(item.data);
      if (nested) return nested;
    }
  }
  return '';
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessionId] = useState(newId);
  const [messages, setMessages] = useState([{
    id: 'welcome',
    role: 'assistant',
    text: 'Halo! Saya asisten virtual LPK BYE. Ada yang ingin kamu ketahui tentang program Digital Marketing atau Bahasa dan Budaya Jepang?',
    time: Date.now()
  }]);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const canSend = Boolean(WEBHOOK_URL) && text.trim().length > 0 && !busy;

  useEffect(() => {
    if (sessionStorage.getItem('lpkbye_chat_tip')) return undefined;
    const timer = window.setTimeout(() => setTip(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    setTip(false);
    sessionStorage.setItem('lpkbye_chat_tip', '1');
    inputRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy, open]);

  async function send(raw) {
    const value = raw.trim();
    if (!value || busy) return;
    if (!WEBHOOK_URL) {
      setMessages((items) => [...items, {
        id: newId(),
        role: 'error',
        text: 'Chat AI belum dikonfigurasi. Silakan hubungi admin melalui WhatsApp.',
        error: true,
        time: Date.now()
      }]);
      return;
    }
    setText('');
    setMessages((items) => [...items, { id: newId(), role: 'user', text: value, time: Date.now() }]);
    setBusy(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendMessage', chatInput: value, sessionId })
      });
      if (!response.ok) throw new Error('Asisten AI sedang tidak dapat dihubungi.');
      const rawReply = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const reply = contentType.includes('json') ? extractReply(JSON.parse(rawReply)) : rawReply.trim();
      if (!reply) throw new Error('Asisten belum memberikan balasan. Silakan coba lagi.');
      setMessages((items) => [...items, { id: newId(), role: 'assistant', text: reply, time: Date.now() }]);
    } catch (error) {
      setMessages((items) => [...items, {
        id: newId(),
        role: 'error',
        text: error.message || 'Koneksi ke asisten terputus.',
        error: true,
        time: Date.now()
      }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function submit(event) {
    event.preventDefault();
    if (canSend) send(text);
  }

  return <>
    {open && <div
      role="dialog"
      aria-label="Chat dengan asisten LPK BYE"
      className="fixed inset-x-2 bottom-2 top-14 z-50 flex animate-chat-pop flex-col overflow-hidden rounded-3xl bg-white shadow-2xl shadow-plum/30 ring-1 ring-black/5 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[620px] sm:max-h-[calc(100vh-7rem)] sm:w-[390px]"
    >
      <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <img src="/img/ai-mascot.webp" alt="" width="44" height="44" className="h-11 w-11 rounded-2xl bg-lilac object-contain p-1"/>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold leading-tight">Asisten LPK BYE</div>
          <div className="flex items-center gap-1.5 text-xs text-ink/55">
            <span className={`h-2 w-2 rounded-full ${WEBHOOK_URL ? 'bg-emerald-500' : 'bg-rose'}`}/>
            {WEBHOOK_URL ? 'Online, dijawab oleh AI' : 'Asisten sedang disiapkan'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup chat"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition hover:bg-plum"
        >
          <X className="h-4 w-4"/>
        </button>
      </header>

      <div role="log" aria-live="polite" className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-lilac/50 via-white to-rose-soft/40 px-4 py-5">
        {messages.map((message) => (
          <div key={message.id} className={message.role === 'user' ? 'ml-auto max-w-[85%]' : 'max-w-[85%]'}>
            <div className={message.role === 'user'
              ? 'rounded-2xl rounded-tr-md bg-gradient-to-br from-plum to-plum-light px-4 py-3 text-[15px] leading-relaxed text-white shadow-md shadow-plum/20'
              : 'rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-[15px] leading-relaxed shadow-sm'}
            >
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              {message.error && (
                <a
                  href="https://wa.me/6283820943475"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Phone size={15}/> Hubungi admin
                </a>
              )}
            </div>
            <div className={`mt-1 flex items-center gap-1 text-xs text-ink/45 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {formatMessageTime(message.time)}
              {message.role === 'user' && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-plum-light" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Terkirim">
                  <path d="M2 13l4 4L14 8M10 15l2 2 9-10"/>
                </svg>
              )}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2">
            {QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                disabled={busy}
                onClick={() => send(question)}
                className="rounded-full border border-plum-light/30 bg-white px-3.5 py-1.5 text-sm text-plum-light transition hover:bg-lilac disabled:cursor-not-allowed disabled:opacity-60"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {!WEBHOOK_URL && messages.length === 1 && (
          <a href="https://wa.me/6283820943475" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <Phone size={15}/> Hubungi admin melalui WhatsApp
          </a>
        )}

        {busy && (
          <div className="max-w-[85%]" aria-label="Asisten sedang mengetik">
            <div className="inline-flex gap-1.5 rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 shadow-sm">
              {[0, 150, 300].map((delay) => (
                <span key={delay} style={{ animationDelay: `${delay}ms` }} className="h-2 w-2 animate-bounce rounded-full bg-plum-light/70"/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      <form onSubmit={submit} className="border-t border-line bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={1000}
            placeholder={WEBHOOK_URL ? 'Ketik pesan kamu di sini...' : 'Chat belum tersedia'}
            aria-label="Pesan"
            disabled={busy || !WEBHOOK_URL}
            className="min-w-0 flex-1 rounded-full border border-line bg-mist/60 px-4 py-3 outline-none transition focus:border-rose focus:bg-white focus:ring-4 focus:ring-rose/15 focus-visible:outline-none disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Kirim pesan"
            className="group/send relative h-12 w-12 shrink-0 rounded-full transition active:scale-95 disabled:cursor-not-allowed"
          >
            <img src={canSend ? '/img/kirim-ungu.webp' : '/img/kirim-nonaktif.webp'} alt="" width="48" height="48" className="h-full w-full"/>
            {canSend && <img src="/img/kirim-pink.webp" alt="" width="48" height="48" className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-200 group-hover/send:opacity-100"/>}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink/40">Dijawab oleh AI. Untuk info resmi, hubungi admin.</p>
      </form>
    </div>}

    {tip && !open && (
      <div className="fixed bottom-24 right-5 z-40 flex max-w-[15rem] animate-fade-up items-start gap-2 rounded-2xl rounded-br-md border border-line bg-white py-3 pl-4 pr-2 text-sm shadow-xl shadow-plum/15">
        <button type="button" onClick={() => setOpen(true)} className="text-left leading-snug">Ada pertanyaan? Tanya asisten LPK BYE di sini.</button>
        <button
          type="button"
          onClick={() => { setTip(false); sessionStorage.setItem('lpkbye_chat_tip', '1'); }}
          aria-label="Tutup"
          className="rounded-full p-1 text-ink/40 transition hover:bg-lilac hover:text-ink"
        >
          <X className="h-4 w-4"/>
        </button>
      </div>
    )}

    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      aria-label={open ? 'Tutup chat' : 'Buka chat dengan asisten'}
      aria-expanded={open}
      className={`group fixed bottom-5 right-5 z-50 flex h-16 w-16 isolate items-center justify-center rounded-full bg-white shadow-xl shadow-plum/25 ring-2 ring-pink/60 transition duration-300 hover:-translate-y-1 hover:ring-pink ${open ? 'max-sm:hidden' : ''}`}
    >
      {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-pink/30"/>}
      {open ? (
        <X className="h-7 w-7 text-plum"/>
      ) : (
        <img src="/img/ai-mascot.webp" alt="" width="52" height="52" className="h-[52px] w-[52px] object-contain transition-transform duration-300 group-hover:scale-110"/>
      )}
    </button>
  </>;
}
