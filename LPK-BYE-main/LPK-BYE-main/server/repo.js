// Query tabel registrations (SQL sama untuk SQLite dan Postgres)
import { dialect, getDb } from './db.js';
import { PROGRAMS, programCodes } from './programs.js';
import { stamp, hoursAgo } from './time.js';
import { ensureReportSchema, addEntry, markStatus, expireEntries, purgeExpired } from './reports.js';

export { PROGRAMS, programCodes };

// Aturan waktu otomatis (jam, dihitung sejak status terakhir berubah)
export const PENDING_EXPIRE_HOURS = 24; // menunggu bayar menjadi gagal
export const ARCHIVE_RULES = { failed: 12, paid: 24 * 30 }; // masuk arsip
export const ARCHIVE_DEFAULT = 24; // status lain
const STATUSES_WITH_RULE = ['pending', ...Object.keys(ARCHIVE_RULES)];

export { stamp };

let ready;
export function ensureSchema() {
  ready ??= (async () => {
    const db = await getDb();
    const id = dialect === 'postgres' ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    await db.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id ${id},
        order_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        contacted INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        status_changed_at TEXT,
        archived_at TEXT,
        program TEXT
      )`);
    await db.exec('CREATE TABLE IF NOT EXISTS settings (name TEXT PRIMARY KEY, value TEXT NOT NULL)');
    if (dialect === 'postgres') await db.exec('ALTER TABLE registrations ADD COLUMN IF NOT EXISTS program TEXT');
    if (dialect === 'sqlite') await migrateLegacy(db);
    await ensureReportSchema(db, (code) => PROGRAMS.find((p) => p.code === code)?.name ?? code ?? '-');
  })().catch((err) => {
    ready = undefined;
    throw err;
  });
  return ready;
}

// Penyesuaian data.db lama (sebelum kolom arsip dan program ada)
async function migrateLegacy(db) {
  const cols = (await db.all('PRAGMA table_info(registrations)')).map((c) => c.name);
  if (!cols.includes('status_changed_at')) {
    await db.exec('ALTER TABLE registrations ADD COLUMN status_changed_at TEXT');
    await db.exec('UPDATE registrations SET status_changed_at = created_at');
  }
  if (!cols.includes('archived_at')) await db.exec('ALTER TABLE registrations ADD COLUMN archived_at TEXT');
  if (!cols.includes('program')) await db.exec('ALTER TABLE registrations ADD COLUMN program TEXT');
}

// Kursi terpakai: lunas + menunggu bayar yang masih berlaku
const SEAT_FILTER = `(status = 'paid' OR (status = 'pending' AND archived_at IS NULL AND status_changed_at > ?))`;
const pendingSince = () => hoursAgo(PENDING_EXPIRE_HOURS);

// Mengembalikan false bila kuota program penuh (data yang baru dibuat dibatalkan)
export async function createRegistration(r, quota = 0) {
  const db = await getDb();
  const now = stamp();
  await db.run(
    'INSERT INTO registrations (order_id, name, email, phone, program, amount, created_at, status_changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [r.orderId, r.name, r.email, r.phone, r.program, r.amount, now, now]
  );
  if (quota > 0) {
    // Urutan pendaftar di program itu menentukan siapa yang dapat kursi, aman untuk pendaftar bersamaan
    const row = await db.get(
      `SELECT COUNT(*) AS n FROM registrations WHERE program = ? AND id <= (SELECT id FROM registrations WHERE order_id = ?) AND ${SEAT_FILTER}`,
      [r.program, r.orderId, pendingSince()]
    );
    if (Number(row.n) > quota) {
      await db.run('DELETE FROM registrations WHERE order_id = ?', [r.orderId]);
      return false;
    }
  }
  // Catatan laporan bulanan (terpisah dari tabel pendaftar)
  await addEntry({
    orderId: r.orderId, name: r.name, email: r.email, phone: r.phone, amount: r.amount, registeredAt: now,
    programName: PROGRAMS.find((p) => p.code === r.program)?.name ?? r.program,
  });
  await purgeExpired();
  return true;
}

// Pengaturan pendaftaran: buka/tutup dan batas peserta per program (0 = tanpa batas)
export async function getSettings() {
  const db = await getDb();
  const map = {};
  for (const r of await db.all('SELECT name, value FROM settings')) map[r.name] = r.value;
  const quotas = {};
  for (const code of programCodes()) quotas[code] = Number(map[`quota_${code}`]) || 0;
  return { open: (map.registration_open ?? '1') === '1', quotas };
}

export async function saveSettings({ open, quotas }) {
  const db = await getDb();
  const sql = 'INSERT INTO settings (name, value) VALUES (?, ?) ON CONFLICT (name) DO UPDATE SET value = excluded.value';
  if (open !== undefined) await db.run(sql, ['registration_open', open ? '1' : '0']);
  for (const [code, n] of Object.entries(quotas || {})) await db.run(sql, [`quota_${code}`, String(n)]);
}

// Hitungan kursi per program: { kode: { paid, pending, taken } }
export async function countSeats() {
  const db = await getDb();
  const rows = await db.all(
    `SELECT program, status, COUNT(*) AS n FROM registrations WHERE program IS NOT NULL AND ${SEAT_FILTER} GROUP BY program, status`,
    [pendingSince()]
  );
  const out = {};
  for (const code of programCodes()) out[code] = { paid: 0, pending: 0, taken: 0 };
  for (const r of rows) {
    if (!out[r.program]) continue;
    out[r.program][r.status] = Number(r.n);
    out[r.program].taken += Number(r.n);
  }
  return out;
}

// Status lunas mengeluarkan data dari arsip
export async function setStatus(orderId, status) {
  const db = await getDb();
  const unarchive = status === 'paid' ? ', archived_at = NULL' : '';
  await db.run(
    `UPDATE registrations SET status = ?, status_changed_at = ?${unarchive} WHERE order_id = ? AND status != ?`,
    [status, stamp(), orderId, status]
  );
  await markStatus(orderId, status);
}

// Menunggu bayar lewat batas waktu dianggap gagal (tanpa menulis ke database)
export async function getOrder(orderId) {
  const db = await getDb();
  const row = await db.get('SELECT name, amount, status, status_changed_at FROM registrations WHERE order_id = ?', [orderId]);
  if (!row) return null;
  const expired = row.status === 'pending' && row.status_changed_at <= pendingSince();
  return { name: row.name, amount: row.amount, status: expired ? 'failed' : row.status };
}

// Menunggu bayar yang melewati batas waktu menjadi gagal
export async function expirePending() {
  const db = await getDb();
  await db.run(
    `UPDATE registrations SET status = 'failed', status_changed_at = ? WHERE status = 'pending' AND status_changed_at <= ?`,
    [stamp(), pendingSince()]
  );
  await expireEntries(pendingSince());
}

export async function autoArchive() {
  const db = await getDb();
  await expirePending();
  const now = stamp();
  for (const [status, hours] of Object.entries(ARCHIVE_RULES)) {
    await db.run(
      'UPDATE registrations SET archived_at = ? WHERE archived_at IS NULL AND status = ? AND status_changed_at <= ?',
      [now, status, hoursAgo(hours)]
    );
  }
  await db.run(
    `UPDATE registrations SET archived_at = ? WHERE archived_at IS NULL AND status NOT IN (${STATUSES_WITH_RULE.map(() => '?').join(', ')}) AND status_changed_at <= ?`,
    [now, ...STATUSES_WITH_RULE, hoursAgo(ARCHIVE_DEFAULT)]
  );
}

// Daftar lengkap; pembaruan status dan arsip otomatis dijalankan setiap kali daftar dibuka
export async function listAll() {
  await autoArchive();
  const db = await getDb();
  return db.all('SELECT * FROM registrations ORDER BY id DESC');
}

export async function markContacted(id) {
  const db = await getDb();
  await db.run('UPDATE registrations SET contacted = 1 WHERE id = ?', [id]);
}

export async function archive(id) {
  const db = await getDb();
  await db.run('UPDATE registrations SET archived_at = ? WHERE id = ? AND archived_at IS NULL', [stamp(), id]);
}

// Pemulihan memulai ulang hitungan waktu otomatis
export async function restore(id) {
  const db = await getDb();
  await db.run('UPDATE registrations SET archived_at = NULL, status_changed_at = ? WHERE id = ?', [stamp(), id]);
}

// Hanya data di arsip yang bisa dihapus
export async function remove(id) {
  const db = await getDb();
  return (await db.run('DELETE FROM registrations WHERE id = ? AND archived_at IS NOT NULL', [id])).changes;
}
