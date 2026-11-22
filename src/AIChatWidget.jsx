import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Phone, Send, Sparkles, X } from 'lucide-react';

const WEBHOOK_URL = (import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || '').trim();
const newId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

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
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [sessionId] = useState(newId);
  const [messages, setMessages] = useState([{ id: 'welcome', role: 'assistant', text: 'Halo! Saya asisten virtual LPK BYE. Ada yang ingin kamu ketahui tentang program atau pendaftaran?' }]);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages, busy, open]);

  async function send(raw) {
    const text = raw.trim();
    if (!text || busy) return;
    if (!WEBHOOK_URL) {
      setMessages((items) => [...items, { id: newId(), role: 'error', text: 'Chat AI belum dikonfigurasi. Silakan hubungi admin melalui WhatsApp.' }]);
      return;
    }
    setInput('');
    setMessages((items) => [...items, { id: newId(), role: 'user', text }]);
    setBusy(true);
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendMessage', chatInput: text, sessionId })
      });
      if (!response.ok) throw new Error('Asisten AI sedang tidak dapat dihubungi.');
      const rawReply = await response.text();
      const contentType = response.headers.get('content-type') || '';
      const reply = contentType.includes('json') ? extractReply(JSON.parse(rawReply)) : rawReply.trim();
      if (!reply) throw new Error('Asisten belum memberikan balasan. Silakan coba lagi.');
      setMessages((items) => [...items, { id: newId(), role: 'assistant', text: reply }]);
    } catch (error) {
      setMessages((items) => [...items, { id: newId(), role: 'error', text: error.message || 'Koneksi ke asisten terputus.' }]);
    } finally { setBusy(false); inputRef.current?.focus(); }
  }

  return <div className="ai-chat">
    {open && <section className="ai-panel" aria-label="Asisten virtual LPK BYE">
      <header><span><Bot size={19}/></span><div><b>Asisten LPK BYE</b><small>{WEBHOOK_URL ? 'Siap membantu · AI' : 'Asisten sedang disiapkan'}</small></div><button onClick={() => setOpen(false)} aria-label="Tutup chat"><X size={18}/></button></header>
      <div className="ai-messages" ref={listRef} aria-live="polite"><div className="ai-chip"><Sparkles size={12}/> LPK BYE · Bandung</div>{messages.map((item) => <div key={item.id} className={`ai-message ${item.role}`}>{item.text}</div>)}{busy && <div className="ai-message assistant">Sedang menyiapkan jawaban…</div>}
        {!WEBHOOK_URL && <a className="ai-contact" href="https://wa.me/6283820943475"><Phone size={14}/> Hubungi admin melalui WhatsApp</a>}
      </div>
      <form className="ai-form" onSubmit={(event) => { event.preventDefault(); send(input); }}><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000} disabled={busy || !WEBHOOK_URL} placeholder={WEBHOOK_URL ? 'Tulis pertanyaan...' : 'Chat belum tersedia'}/><button aria-label="Kirim" disabled={busy || !WEBHOOK_URL || !input.trim()}><Send size={16}/></button></form>
      <small className="ai-footnote">Jangan kirim data pribadi atau rahasia.</small>
    </section>}
    <button className="ai-launch" onClick={() => setOpen((value) => !value)}><MessageCircle size={19}/>{open ? 'Tutup chat' : 'Tanya asisten AI'}</button>
  </div>;
}
