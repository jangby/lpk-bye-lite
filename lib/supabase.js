const TABLES = new Set(['batches', 'registrants', 'payments', 'content']);

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diatur saat DATA_STORE=supabase.');
  }
  return { url, serviceRoleKey };
}

export async function supabaseRequest(path, options = {}) {
  const { url, serviceRoleKey } = config();
  let response;
  try {
    response = await fetch(`${url}/rest/v1/${path.replace(/^\/+/, '')}`, {
      ...options,
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  } catch {
    throw new Error('Supabase tidak dapat dijangkau. Periksa koneksi dan URL project.');
  }

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  if (!response.ok) {
    throw new Error(body?.message || body?.error_description || body?.details || `Supabase mengembalikan HTTP ${response.status}.`);
  }
  return body;
}

export function supabaseRpc(name, args = {}) {
  return supabaseRequest(`rpc/${encodeURIComponent(name)}`, {
    method: 'POST',
    body: JSON.stringify(args)
  });
}

export async function importSupabaseRecords(table, records) {
  if (!TABLES.has(table)) throw new Error('Tabel migrasi Supabase tidak dikenal.');
  if (!records.length) return 0;
  return supabaseRpc('import_sheet_records', { p_table: table, p_records: records });
}
