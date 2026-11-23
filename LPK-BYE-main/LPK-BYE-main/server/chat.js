// Pengolah balasan webhook chat n8n (JSON, streaming NDJSON, atau teks polos)
const pick = (o) => {
  if (typeof o === 'string') return o;
  if (Array.isArray(o)) return pick(o[0]);
  if (o && typeof o === 'object') return pick(o.output ?? o.text ?? o.message ?? o.response ?? o.reply ?? o.data);
  return '';
};

export function extractReply(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return '';

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = undefined;
  }
  if (parsed !== undefined) {
    const direct = pick(parsed).trim();
    if (direct) return direct;
  }

  // Streaming: tiap baris {"type":"item","content":"..."}
  const items = [];
  for (const line of text.split('\n')) {
    try {
      const o = JSON.parse(line);
      if (o?.type === 'item' && typeof o.content === 'string') items.push(o.content);
    } catch {
      // baris bukan JSON
    }
  }
  if (items.length) return items.join('').trim();

  return parsed === undefined ? text : '';
}
