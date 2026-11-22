import { sheets } from './sheets.js';
import { supabaseRequest } from './supabase.js';

function cleanRecord(record) {
  const { _row, ...values } = record;
  return values;
}

async function list(table) {
  const pageSize = 1000;
  const records = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await supabaseRequest(`${table}?select=*&order=id.asc&limit=${pageSize}&offset=${offset}`);
    records.push(...page);
    if (page.length < pageSize) return records;
  }
}

async function insert(table, record) {
  const result = await supabaseRequest(`${table}?on_conflict=id`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(cleanRecord(record))
  });
  return result?.[0]?.id || record.id;
}

async function save(table, record) {
  if (!record?.id) throw new Error(`ID wajib diisi untuk memperbarui ${table}.`);
  const result = await supabaseRequest(`${table}?id=eq.${encodeURIComponent(String(record.id))}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(cleanRecord(record))
  });
  if (!result?.length) throw new Error(`Data ${table} tidak ditemukan di Supabase.`);
  return result[0];
}

const supabaseStore = {
  listBatches: () => list('batches'),
  addBatch: (record) => insert('batches', record),
  saveBatch: (record) => save('batches', record),
  listRegistrants: () => list('registrants'),
  addRegistrant: (record) => insert('registrants', record),
  saveRegistrant: (record) => save('registrants', record),
  listPayments: () => list('payments'),
  addPayment: (record) => insert('payments', record),
  savePayment: (record) => save('payments', record),
  listContent: () => list('content'),
  addContent: (record) => insert('content', record),
  saveContent: (record) => save('content', record)
};

const mode = process.env.DATA_STORE || 'sheets';
if (!['sheets', 'supabase'].includes(mode)) {
  throw new Error('DATA_STORE hanya boleh bernilai "sheets" atau "supabase".');
}

export const dataStoreMode = mode;
export const dataStore = mode === 'supabase' ? supabaseStore : sheets;
