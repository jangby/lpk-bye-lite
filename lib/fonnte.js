export async function sendFonnte(target, message, inboxid) {
  if (!process.env.FONNTE_TOKEN) throw new Error('FONNTE_TOKEN belum dikonfigurasi.');
  const body = new URLSearchParams({ target: String(target), message: String(message) });
  if (inboxid) body.set('inboxid', String(inboxid));
  const response = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { Authorization: process.env.FONNTE_TOKEN },
    body
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status === false) {
    throw new Error(result.reason || result.message || `Fonnte mengembalikan ${response.status}`);
  }
  return result;
}
