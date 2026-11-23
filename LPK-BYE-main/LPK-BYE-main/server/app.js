// API pendaftaran pelatihan: pendaftaran, pembayaran simulasi, data admin
import crypto from 'node:crypto';
import os from 'node:os';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { cfg } from './config.js';
import * as repo from './repo.js';
import { extractReply } from './chat.js';
import * as reports from './reports.js';
import { buildReport } from './reportFile.js';
import { isMonth, reportWindow, REPORT_MONTHS } from './time.js';

const app = express();
if (cfg.isProd) app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: cfg.clientOrigin }));
app.use(express.json({ limit: '50kb' }));

// Skema database disiapkan sebelum request pertama
app.use(async (_req, _res, next) => {
  try {
    await repo.ensureSchema();
    next();
  } catch (err) {
    next(err);
  }
});

// ---------- Fungsi pendukung ----------
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const limiter = (minutes, max, error) =>
  rateLimit({ windowMs: minutes * 60 * 1000, limit: max, standardHeaders: true, legacyHeaders: false, message: { error } });
const loginLimit = limiter(15, 10, 'Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.');
const registerLimit = limiter(10, 10, 'Terlalu banyak pendaftaran dari alamat ini. Coba lagi nanti.');
const payLimit = limiter(10, 30, 'Terlalu banyak permintaan pembayaran. Coba lagi nanti.');
const chatLimit = limiter(10, 40, 'Terlalu banyak pesan. Coba lagi beberapa menit lagi.');
const reportLimit = limiter(10, 20, 'Terlalu banyak permintaan laporan. Coba lagi beberapa menit lagi.');
const cronLimit = limiter(10, 20, 'Terlalu banyak permintaan.');

function normalizePhone(input) {
  let d = String(input || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return /^62\d{8,13}$/.test(d) ? d : null;
}

const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const parseId = (v) => {
  const n = Number.parseInt(v, 10);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

// Status pendaftaran: open, closed, atau full (semua program penuh); kuota dihitung per program
async function registrationState() {
  const [settings, seats] = await Promise.all([repo.getSettings(), repo.countSeats()]);
  const programs = repo.PROGRAMS.map(({ code, name, short }) => {
    const quota = settings.quotas[code] || 0;
    const seat = seats[code];
    return {
      code,
      name,
      short,
      quota,
      ...seat,
      remaining: quota > 0 ? Math.max(0, quota - seat.taken) : null,
      full: quota > 0 && seat.taken >= quota,
    };
  });
  const allFull = programs.length > 0 && programs.every((p) => p.full);
  const status = !settings.open ? 'closed' : allFull ? 'full' : 'open';
  return { status, open: settings.open, programs };
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    jwt.verify(token, cfg.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Sesi admin tidak valid. Silakan login ulang.' });
  }
}

// IP komputer di jaringan lokal (alamat QR simulasi untuk HP)
function lanAddress() {
  const skip = /vethernet|virtualbox|vmware|wsl|docker|hyper-v|loopback|tailscale|zerotier/i;
  const found = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    if (skip.test(name)) continue;
    for (const i of list || []) {
      if (i.family === 'IPv4' && !i.internal) found.push(i.address);
    }
  }
  const rank = (ip) => (ip.startsWith('192.168.') ? 0 : ip.startsWith('10.') ? 1 : /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ? 2 : 3);
  return found.sort((x, y) => rank(x) - rank(y))[0] || null;
}

const clientPort = (() => {
  try {
    return new URL(cfg.clientOrigin).port || '5173';
  } catch {
    return '5173';
  }
})();

// ---------- Endpoint publik ----------
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/config', wrap(async (_req, res) => {
  const ip = cfg.isProd ? null : lanAddress();
  const state = await registrationState();
  res.json({
    registration: {
      status: state.status,
      programs: state.programs.map(({ code, name, short, quota, remaining, full }) => ({ code, name, short, quota, remaining, full })),
    },
    price: cfg.price,
    lanOrigin: ip ? `http://${ip}:${clientPort}` : null,
  });
}));

app.post('/api/register', registerLimit, wrap(async (req, res) => {
  const state = await registrationState();
  if (state.status === 'closed') return res.status(403).json({ error: 'Pendaftaran sedang ditutup.' });
  if (state.status === 'full') return res.status(409).json({ error: 'Kuota peserta sudah penuh.' });

  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const phone = normalizePhone(req.body?.phone);
  const program = String(req.body?.program || '');

  if (name.length < 2 || name.length > 100) return res.status(400).json({ error: 'Nama harus 2 sampai 100 karakter.' });
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Format email belum benar.' });
  if (!phone) return res.status(400).json({ error: 'Nomor HP belum benar. Contoh: 081234567890' });
  const chosen = state.programs.find((p) => p.code === program);
  if (!chosen) return res.status(400).json({ error: 'Pilih program pelatihan.' });
  if (chosen.full) return res.status(409).json({ error: 'Kuota program ini sudah penuh.' });

  const orderId = `PLT-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const seated = await repo.createRegistration({ orderId, name, email, phone, program, amount: cfg.price }, chosen.quota);
  if (!seated) return res.status(409).json({ error: 'Kuota program ini sudah penuh.' });

  res.json({ orderId });
}));

// ---------- Chatbot AI (diteruskan ke webhook chat n8n) ----------
app.post('/api/chat', chatLimit, wrap(async (req, res) => {
  const message = String(req.body?.message ?? '').trim();
  const sessionId = String(req.body?.sessionId ?? '');
  if (!message || message.length > 1000) return res.status(400).json({ error: 'Pesan harus 1 sampai 1000 karakter.' });
  if (!/^[\w-]{8,64}$/.test(sessionId)) return res.status(400).json({ error: 'Sesi chat tidak valid.' });

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 55 * 1000);
  try {
    const upstream = await fetch(cfg.chatWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sendMessage', sessionId, chatInput: message }),
      signal: abort.signal,
    });
    const body = await upstream.text();
    if (!upstream.ok) throw new Error(`n8n membalas ${upstream.status}`);
    const reply = extractReply(body);
    if (!reply) throw new Error('balasan kosong');
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(502).json({ error: 'Asisten sedang tidak tersedia. Silakan hubungi admin lewat WhatsApp.' });
  } finally {
    clearTimeout(timer);
  }
}));

// ---------- Pembayaran simulasi (tanpa payment gateway) ----------
app.get('/api/payment/:orderId', wrap(async (req, res) => {
  const order = await repo.getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
  res.json(order);
}));

app.post('/api/payment/:orderId/pay', payLimit, wrap(async (req, res) => {
  const order = await repo.getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
  if (order.status === 'failed') return res.status(409).json({ error: 'Batas pembayaran 24 jam sudah lewat. Silakan daftar ulang.' });
  await repo.setStatus(req.params.orderId, 'paid');
  res.json({ ok: true });
}));

// ---------- Endpoint admin ----------
app.post('/api/admin/login', loginLimit, (req, res) => {
  if (!cfg.adminReady) return res.status(503).json({ error: 'Admin belum dikonfigurasi dengan aman di server.' });
  const { username, password } = req.body || {};
  if (safeEqual(username, cfg.adminUser) && safeEqual(password, cfg.adminPass)) {
    return res.json({ token: jwt.sign({ role: 'admin' }, cfg.jwtSecret, { expiresIn: '8h' }) });
  }
  res.status(401).json({ error: 'Username atau password salah.' });
});

app.get('/api/admin/registrations', requireAdmin, wrap(async (_req, res) => {
  const rows = await repo.listAll();
  res.json({ rows, rules: { ...repo.ARCHIVE_RULES, default: repo.ARCHIVE_DEFAULT, pendingExpire: repo.PENDING_EXPIRE_HOURS }, settings: await registrationState() });
}));

// Buka/tutup pendaftaran dan batas peserta per program
app.patch('/api/admin/settings', requireAdmin, wrap(async (req, res) => {
  const { open, quotas } = req.body || {};
  const next = {};
  if (open !== undefined) {
    if (typeof open !== 'boolean') return res.status(400).json({ error: 'Nilai buka/tutup tidak valid.' });
    next.open = open;
  }
  if (quotas !== undefined) {
    if (typeof quotas !== 'object' || quotas === null || Array.isArray(quotas)) {
      return res.status(400).json({ error: 'Data batas peserta tidak valid.' });
    }
    for (const [code, n] of Object.entries(quotas)) {
      if (!repo.programCodes().includes(code)) return res.status(400).json({ error: 'Program tidak dikenal.' });
      if (!Number.isInteger(n) || n < 0 || n > 100000) {
        return res.status(400).json({ error: 'Batas peserta harus bilangan bulat 0 sampai 100000 (0 = tanpa batas).' });
      }
    }
    next.quotas = quotas;
  }
  await repo.saveSettings(next);
  res.json(await registrationState());
}));

// ---------- Laporan pendaftar bulanan (hanya admin, 3 bulan terakhir) ----------
app.get('/api/admin/reports', requireAdmin, wrap(async (_req, res) => {
  await reports.purgeExpired();
  res.json({ keepMonths: REPORT_MONTHS, months: await reports.monthsInfo() });
}));

// Ganti password laporan satu bulan (atau semua bulan yang tersedia)
app.put('/api/admin/reports/:month/password', requireAdmin, reportLimit, wrap(async (req, res) => {
  const { month } = req.params;
  const password = String(req.body?.password ?? '');
  if (!isMonth(month) || !reportWindow().includes(month)) return res.status(404).json({ error: 'Laporan bulan ini tidak tersedia.' });
  if (password.length < 6 || password.length > 64) return res.status(400).json({ error: 'Password harus 6 sampai 64 karakter.' });
  const applied = req.body?.applyAll === true ? reportWindow() : [month];
  await reports.setPassword(applied, password);
  res.json({ ok: true, applied });
}));

// Unduh laporan (xlsx berpassword)
app.get('/api/admin/reports/:month/download', requireAdmin, reportLimit, wrap(async (req, res) => {
  const { month } = req.params;
  if (!isMonth(month)) return res.status(400).json({ error: 'Bulan tidak valid.' });
  await reports.purgeExpired();
  if (!reportWindow().includes(month)) return res.status(410).json({ error: 'Laporan bulan ini sudah tidak tersedia.' });
  const password = await reports.getPassword(month);
  if (!password) return res.status(409).json({ error: 'Atur password laporan bulan ini dulu.' });

  await repo.expirePending();
  const entries = await reports.entriesOfMonth(month);
  const file = await buildReport({ month, entries, password });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="laporan-pendaftar-${month}.xlsx"`);
  res.setHeader('Cache-Control', 'no-store');
  res.send(file);
}));

// Penghapusan laporan kedaluwarsa (dipanggil Vercel Cron tiap hari; aman karena hanya menghapus yang sudah kedaluwarsa)
app.get('/api/cron/purge-reports', cronLimit, wrap(async (_req, res) => {
  const keepFrom = await reports.purgeExpired();
  res.json({ ok: true, keepFrom });
}));

// Tindakan per data: contacted, archive, restore
for (const [action, fn] of [['contacted', repo.markContacted], ['archive', repo.archive], ['restore', repo.restore]]) {
  app.patch(`/api/admin/registrations/:id/${action}`, requireAdmin, wrap(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID tidak valid.' });
    await fn(id);
    res.json({ ok: true });
  }));
}

app.delete('/api/admin/registrations/:id', requireAdmin, wrap(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID tidak valid.' });
  if (!(await repo.remove(id))) return res.status(409).json({ error: 'Data harus diarsipkan dulu sebelum dihapus.' });
  res.json({ ok: true });
}));

// ---------- Penanganan error ----------
app.use((err, _req, res, _next) => {
  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Terjadi kesalahan di server.' : 'Permintaan tidak valid.' });
});

export default app;
