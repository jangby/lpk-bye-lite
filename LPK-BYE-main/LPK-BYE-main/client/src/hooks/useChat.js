import { useEffect, useState } from 'react';
import { api } from '../api.js';

// Percakapan chat asisten AI (disimpan di sessionStorage agar tidak hilang saat halaman dimuat ulang)
const KEY = 'lpkbye_chat';

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

function read() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export default function useChat(greeting) {
  const [state, setState] = useState(
    () => read() || { sessionId: newId(), messages: [{ id: 'sapaan', role: 'bot', text: greeting, time: Date.now() }] }
  );
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // penyimpanan tidak tersedia
    }
  }, [state]);

  const add = (role, text, extra = {}) =>
    setState((s) => ({ ...s, messages: [...s.messages, { id: `${Date.now()}-${s.messages.length}`, role, text, time: Date.now(), ...extra }] }));

  async function send(text) {
    const message = text.trim();
    if (!message || typing) return;
    add('user', message);
    setTyping(true);
    try {
      const { reply } = await api('/chat', { method: 'POST', body: { sessionId: state.sessionId, message } });
      add('bot', reply);
    } catch (err) {
      add('bot', err.message || 'Maaf, asisten sedang tidak tersedia.', { error: true });
    } finally {
      setTyping(false);
    }
  }

  return { messages: state.messages, typing, send };
}
