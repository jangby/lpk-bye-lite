import { createHmac, timingSafeEqual } from 'node:crypto';

function secret() {
  if (!process.env.ADMIN_TOKEN_SECRET) throw new Error('Konfigurasi server belum diisi: ADMIN_TOKEN_SECRET');
  return process.env.ADMIN_TOKEN_SECRET;
}

function sign(value) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createAdminToken(email) {
  const payload = Buffer.from(JSON.stringify({ email, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function authorized(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.expires > Date.now()
      && typeof process.env.ADMIN_EMAIL === 'string'
      && data.email === process.env.ADMIN_EMAIL.trim().toLowerCase();
  } catch {
    return false;
  }
}
