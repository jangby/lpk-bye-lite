import { createSign } from 'node:crypto';

const BATCH_HEADERS = [
  'id', 'batch_name', 'program_type', 'description', 'start_date', 'end_date',
  'quota', 'training_fee', 'payment_instructions', 'is_active', 'fields_json'
];
const REGISTRANT_HEADERS = [
  'id', 'batch_id', 'batch_name', 'program_type', 'full_name', 'whatsapp',
  'email', 'registration_code', 'portal_token', 'status', 'answers_json',
  'notes', 'feedback', 'created_at', 'notification_status'
];
const PAYMENT_HEADERS = [
  'id', 'registrant_id', 'registration_code', 'full_name', 'whatsapp',
  'amount_declared', 'amount_approved', 'receipt_url', 'receipt_name',
  'status', 'rejection_reason', 'created_at', 'reviewed_at', 'notification_status'
];
const CONTENT_HEADERS = [
  'id', 'type', 'title', 'caption', 'image_url', 'link_url',
  'sort_order', 'is_active', 'extra'
];
let tokenCache;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Konfigurasi server belum diisi: ${name}`);
  return value;
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

async function accessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;
  const email = requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = requiredEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(privateKey, 'base64url')}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(`Autentikasi Google Sheets gagal: ${body.error_description || body.error || response.status}`);
  }
  tokenCache = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return tokenCache.value;
}

async function googleRequest(path, options = {}) {
  const spreadsheetId = requiredEnv('GOOGLE_SHEET_ID');
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.error?.message || `Google Sheets mengembalikan ${response.status}`;
    throw new Error(message);
  }
  return body;
}

function quoteTab(name) {
  return `'${name.replace(/'/g, "''")}'`;
}

async function ensureTab(name, headers) {
  const metadata = await googleRequest('?fields=sheets.properties(sheetId,title)');
  const sheet = metadata.sheets?.find((item) => item.properties.title === name);
  if (!sheet) {
    await googleRequest(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: name } } }] })
    });
  }
  const range = `${quoteTab(name)}!A1:${String.fromCharCode(64 + headers.length)}1`;
  const current = await googleRequest(`/values/${encodeURIComponent(range)}`);
  if (!current.values?.length) {
    await googleRequest(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values: [headers] })
    });
  } else if (current.values[0].join('\u001f') !== headers.join('\u001f')) {
    throw new Error(`Header sheet "${name}" tidak sesuai. Periksa panduan setup.`);
  }
}

async function readRows(name, headers) {
  await ensureTab(name, headers);
  const result = await googleRequest(`/values/${encodeURIComponent(`${quoteTab(name)}!A:${String.fromCharCode(64 + headers.length)}`)}`);
  return (result.values || []).slice(1).map((cells, index) => {
    const row = Object.fromEntries(headers.map((header, column) => [header, cells[column] ?? '']));
    row._row = index + 2;
    return row;
  }).filter((row) => row.id);
}

async function appendRow(name, headers, record) {
  await ensureTab(name, headers);
  const range = `${quoteTab(name)}!A:${String.fromCharCode(64 + headers.length)}`;
  const result = await googleRequest(`/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: JSON.stringify({ values: [headers.map((header) => String(record[header] ?? ''))] })
  });
  const rowNumber = result.updates?.updatedRange?.match(/!A(\d+)/)?.[1];
  return rowNumber ? Number(rowNumber) : null;
}

async function updateRow(name, headers, rowNumber, record) {
  const range = `${quoteTab(name)}!A${rowNumber}:${String.fromCharCode(64 + headers.length)}${rowNumber}`;
  await googleRequest(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [headers.map((header) => String(record[header] ?? ''))] })
  });
}

export const sheets = {
  async listBatches() { return readRows('Batches', BATCH_HEADERS); },
  async addBatch(record) { return appendRow('Batches', BATCH_HEADERS, record); },
  async saveBatch(record) { return updateRow('Batches', BATCH_HEADERS, record._row, record); },
  async listRegistrants() { return readRows('Registrants', REGISTRANT_HEADERS); },
  async addRegistrant(record) { return appendRow('Registrants', REGISTRANT_HEADERS, record); },
  async saveRegistrant(record) { return updateRow('Registrants', REGISTRANT_HEADERS, record._row, record); },
  async listPayments() { return readRows('Payments', PAYMENT_HEADERS); },
  async addPayment(record) { return appendRow('Payments', PAYMENT_HEADERS, record); },
  async savePayment(record) { return updateRow('Payments', PAYMENT_HEADERS, record._row, record); },
  async listContent() { return readRows('Content', CONTENT_HEADERS); },
  async addContent(record) { return appendRow('Content', CONTENT_HEADERS, record); },
  async saveContent(record) { return updateRow('Content', CONTENT_HEADERS, record._row, record); }
};

const MIRROR_TABLES = {
  batches: { name: 'Batches', headers: BATCH_HEADERS },
  registrants: { name: 'Registrants', headers: REGISTRANT_HEADERS },
  payments: { name: 'Payments', headers: PAYMENT_HEADERS },
  content: { name: 'Content', headers: CONTENT_HEADERS }
};

export async function syncMirrorRecord(entity, operation, record) {
  const table = MIRROR_TABLES[entity];
  if (!table || !record?.id) throw new Error('Data sinkronisasi Google Sheets tidak valid.');
  const rows = await readRows(table.name, table.headers);
  const current = rows.find((row) => row.id === String(record.id));

  if (operation === 'DELETE') {
    if (!current) return;
    const metadata = await googleRequest('?fields=sheets.properties(sheetId,title)');
    const sheet = metadata.sheets?.find((item) => item.properties.title === table.name);
    if (!sheet) throw new Error(`Sheet "${table.name}" tidak ditemukan.`);
    await googleRequest(':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({ requests: [{
        deleteDimension: {
          range: { sheetId: sheet.properties.sheetId, dimension: 'ROWS', startIndex: current._row - 1, endIndex: current._row }
        }
      }] })
    });
    return;
  }

  if (current) {
    await updateRow(table.name, table.headers, current._row, record);
  } else {
    await appendRow(table.name, table.headers, record);
  }
}

export function parseJson(value, fallback) {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}
