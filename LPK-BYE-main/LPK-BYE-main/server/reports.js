// Laporan pendaftar bulanan: catatan terpisah dari tabel pendaftar, jendela 3 bulan, dan password laporan
import crypto from 'node:crypto';
import { cfg } from './config.js';
import { getDb } from './db.js';
import { stamp, monthOfStamp, reportWindow, deleteOn } from './time.js';

const PW_PREFIX = 'report_pw_';

// Tabel report_entries dan pengisian dari data pendaftar yang sudah ada
export async function ensureReportSchema(db, nameOf) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS report_entries (
      order_id TEXT PRIMARY KEY,
      month TEXT NOT NULL,
      registered_at TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      program_name TEXT,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      status_changed_at TEXT NOT NULL,
      paid_at TEXT
    )`);
  await db.exec('CREATE INDEX IF NOT EXISTS idx_report_entries_month ON report_entries (month)');

  const missing = await db.all(
    'SELECT r.* FROM registrations r LEFT JOIN report_entries e ON e.order_id = r.order_id WHERE e.order_id IS NULL'
  );
  for (const r of missing) {
    const changed = r.status_changed_at || r.created_at;
    await db.run(
      'INSERT INTO report_entries (order_id, month, registered_at, name, email, phone, program_name, amount, status, status_changed_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [r.order_id, monthOfStamp(r.created_at), r.created_at, r.name, r.email, r.phone, nameOf(r.program), r.amount, r.status, changed, r.status === 'paid' ? changed : null]
    );
  }
  await purgeExpired();
}

// Pencatatan saat pendaftaran dibuat
export async function addEntry(r) {
  const db = await getDb();
  await db.run(
    'INSERT INTO report_entries (order_id, month, registered_at, name, email, phone, program_name, amount, status, status_changed_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [r.orderId, monthOfStamp(r.registeredAt), r.registeredAt, r.name, r.email, r.phone, r.programName, r.amount, 'pending', r.registeredAt, null]
  );
}

export async function removeEntry(orderId) {
  const db = await getDb();
  await db.run('DELETE FROM report_entries WHERE order_id = ?', [orderId]);
}

// Pencatatan saat status berubah (arsip dan hapus di panel admin tidak memengaruhi catatan ini)
export async function markStatus(orderId, status) {
  const db = await getDb();
  const now = stamp();
  const paid = status === 'paid';
  await db.run(
    `UPDATE report_entries SET status = ?, status_changed_at = ?${paid ? ', paid_at = ?' : ''} WHERE order_id = ? AND status != ?`,
    paid ? [status, now, now, orderId, status] : [status, now, orderId, status]
  );
}

export async function expireEntries(before) {
  const db = await getDb();
  await db.run(`UPDATE report_entries SET status = 'failed', status_changed_at = ? WHERE status = 'pending' AND status_changed_at <= ?`, [stamp(), before]);
}

// Penghapusan permanen laporan di luar jendela 3 bulan (beserta password-nya)
export async function purgeExpired(now = new Date()) {
  const db = await getDb();
  const cutoff = reportWindow(now).at(-1);
  await db.run('DELETE FROM report_entries WHERE month < ?', [cutoff]);
  await db.run("DELETE FROM settings WHERE name LIKE 'report_pw_%' AND name < ?", [`${PW_PREFIX}${cutoff}`]);
  return cutoff;
}

// Ringkasan tiap bulan yang tersedia
export async function monthsInfo(now = new Date()) {
  const db = await getDb();
  const months = reportWindow(now);
  const marks = months.map(() => '?').join(', ');
  const rows = await db.all(`SELECT month, status, COUNT(*) AS n FROM report_entries WHERE month IN (${marks}) GROUP BY month, status`, months);
  const pw = await db.all(`SELECT name FROM settings WHERE name IN (${marks})`, months.map((m) => `${PW_PREFIX}${m}`));
  const hasPw = new Set(pw.map((r) => r.name.slice(PW_PREFIX.length)));

  return months.map((month) => {
    const out = { month, total: 0, paid: 0, pending: 0, failed: 0, hasPassword: hasPw.has(month), deleteOn: deleteOn(month) };
    for (const r of rows) {
      if (r.month !== month) continue;
      out[r.status] = (out[r.status] || 0) + Number(r.n);
      out.total += Number(r.n);
    }
    return out;
  });
}

export async function entriesOfMonth(month) {
  const db = await getDb();
  return db.all('SELECT * FROM report_entries WHERE month = ? ORDER BY registered_at ASC, order_id ASC', [month]);
}

// Password laporan: disimpan terenkripsi (AES-256-GCM, kunci dari JWT_SECRET)
const key = () => crypto.createHash('sha256').update(`report-password:${cfg.jwtSecret}`).digest();

export function seal(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), enc.toString('base64')].join(':');
}

export function unseal(value) {
  try {
    const [, iv, tag, enc] = String(value).split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(enc, 'base64')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

export async function setPassword(months, password) {
  const db = await getDb();
  const sql = 'INSERT INTO settings (name, value) VALUES (?, ?) ON CONFLICT (name) DO UPDATE SET value = excluded.value';
  for (const m of months) await db.run(sql, [`${PW_PREFIX}${m}`, seal(password)]);
}

export async function getPassword(month) {
  const db = await getDb();
  const row = await db.get('SELECT value FROM settings WHERE name = ?', [`${PW_PREFIX}${month}`]);
  return row ? unseal(row.value) : null;
}
