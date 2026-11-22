import 'dotenv/config';
import { sheets } from '../lib/sheets.js';
import { importSupabaseRecords } from '../lib/supabase.js';

function withoutRowNumber(records) {
  return records.map(({ _row, ...record }) => record);
}

async function importTable(table, records) {
  const rows = withoutRowNumber(records);
  for (let offset = 0; offset < rows.length; offset += 100) {
    await importSupabaseRecords(table, rows.slice(offset, offset + 100));
  }
  return rows.length;
}

try {
  const batches = await sheets.listBatches();
  const batchCount = await importTable('batches', batches);
  const registrants = await sheets.listRegistrants();
  const registrantCount = await importTable('registrants', registrants);
  const payments = await sheets.listPayments();
  const paymentCount = await importTable('payments', payments);
  const content = await sheets.listContent();
  const contentCount = await importTable('content', content);
  console.log(JSON.stringify({
    imported: {
      batches: batchCount,
      registrants: registrantCount,
      payments: paymentCount,
      content: contentCount
    }
  }));
} catch (error) {
  console.error('Migrasi Sheets ke Supabase gagal:', error.message);
  process.exitCode = 1;
}
