// Teks balasan asisten: mendukung **tebal**, daftar, judul, dan tautan http(s)
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noreferrer" className="break-all font-semibold text-rose-dark underline underline-offset-2">
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function RichText({ text }) {
  const blocks = [];
  let list = null;
  const flush = () => {
    if (list) blocks.push(list);
    list = null;
  };

  text.split('\n').forEach((line) => {
    const item = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (item) {
      const ordered = /^\s*\d/.test(line);
      if (!list || list.ordered !== ordered) {
        flush();
        list = { ordered, items: [] };
      }
      list.items.push(item[1]);
      return;
    }
    flush();
    if (line.trim()) blocks.push({ text: line.replace(/^#{1,6}\s+/, ''), heading: /^#{1,6}\s+/.test(line) });
  });
  flush();

  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.items ? (
          b.ordered ? (
            <ol key={i} className="list-decimal space-y-1 pl-5">{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>
          ) : (
            <ul key={i} className="list-disc space-y-1 pl-5">{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>
          )
        ) : (
          <p key={i} className={b.heading ? 'font-semibold' : ''}>{inline(b.text)}</p>
        )
      )}
    </div>
  );
}
