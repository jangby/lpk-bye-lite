// Koneksi database: SQLite (lokal) atau Postgres (bila DATABASE_URL ada)
import { cfg } from './config.js';

export const dialect = cfg.databaseUrl ? 'postgres' : 'sqlite';

// Placeholder ? menjadi $1, $2, ... untuk Postgres
export const toPg = (sql) => {
  let n = 0;
  return sql.replace(/\?/g, () => `$${++n}`);
};

async function open() {
  if (dialect === 'postgres') {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({ connectionString: cfg.databaseUrl, max: 3 });
    return {
      all: async (sql, p = []) => (await pool.query(toPg(sql), p)).rows,
      get: async (sql, p = []) => (await pool.query(toPg(sql), p)).rows[0] ?? null,
      run: async (sql, p = []) => ({ changes: (await pool.query(toPg(sql), p)).rowCount }),
      exec: async (sql) => { await pool.query(sql); },
    };
  }
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync('data.db');
  return {
    all: async (sql, p = []) => db.prepare(sql).all(...p),
    get: async (sql, p = []) => db.prepare(sql).get(...p) ?? null,
    run: async (sql, p = []) => ({ changes: Number(db.prepare(sql).run(...p).changes) }),
    exec: async (sql) => { db.exec(sql); },
  };
}

let opened;
export function getDb() {
  opened ??= open();
  return opened;
}
