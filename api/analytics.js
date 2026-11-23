import { createHash, randomBytes } from 'node:crypto';
import { dataStore } from '../lib/store.js';
import { methodNotAllowed, send } from '../lib/http.js';

const ID_PATTERN = /^[a-zA-Z0-9._-]{16,80}$/;
const PAGE_PATHS = new Set(['/', '/pendaftaran', '/peserta']);
const DEVICE_TYPES = new Set(['mobile', 'tablet', 'desktop']);
const hashId = (value) => createHash('sha256').update(value).digest('hex');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return methodNotAllowed(res);
  if (Buffer.byteLength(JSON.stringify(req.body || {})) > 2048) {
    return send(res, 413, { success: false, message: 'Data analitik terlalu besar.' });
  }

  const { visitor_id: visitorId, session_id: sessionId, path, referrer_host: referrerHost, device } = req.body || {};
  if (!ID_PATTERN.test(String(visitorId || '')) || !ID_PATTERN.test(String(sessionId || ''))) {
    return send(res, 422, { success: false, message: 'ID kunjungan tidak valid.' });
  }
  if (!PAGE_PATHS.has(path) || !DEVICE_TYPES.has(device)) {
    return send(res, 422, { success: false, message: 'Data kunjungan tidak valid.' });
  }

  const source = String(referrerHost || '').trim().toLowerCase();
  const normalizedSource = ['direct', 'internal'].includes(source)
    ? source
    : /^[a-z0-9.-]{1,253}$/.test(source) ? source : 'other';

  try {
    await dataStore.addAnalyticsEvent({
      id: randomBytes(12).toString('hex'),
      visitor_id: hashId(String(visitorId)),
      session_id: hashId(String(sessionId)),
      path,
      referrer_host: normalizedSource,
      device,
      created_at: new Date().toISOString()
    });
    return send(res, 202, { success: true });
  } catch (error) {
    console.error('Menyimpan analitik kunjungan gagal:', error.message);
    return send(res, 500, { success: false, message: 'Data analitik belum dapat disimpan.' });
  }
}
