// Pembuat file laporan bulanan (xlsx berpassword, dibuka dengan password di Excel/Numbers/LibreOffice)
import { wibText } from './time.js';

const STATUS = { paid: 'Lunas', pending: 'Menunggu bayar', failed: 'Gagal' };
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const monthLabel = (month) => `${BULAN[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`;

const HEADER = { bold: true, fontColor: 'FFFFFF', fill: '3D2569' };

export async function buildReport({ month, entries, password, now = new Date() }) {
  const { default: XlsxPopulate } = await import('xlsx-populate');
  const wb = await XlsxPopulate.fromBlankAsync();

  // Ringkasan
  const count = (s) => entries.filter((e) => e.status === s).length;
  const revenue = entries.filter((e) => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
  const summary = wb.sheet(0).name('Ringkasan');
  summary.range('A1:B8').value([
    ['Laporan Pendaftar LPK BYE', ''],
    ['Periode', monthLabel(month)],
    ['Dibuat (WIB)', wibText(now.toISOString().slice(0, 19).replace('T', ' '))],
    ['Total pendaftar', entries.length],
    ['Lunas', count('paid')],
    ['Menunggu bayar', count('pending')],
    ['Gagal', count('failed')],
    ['Total pemasukan (lunas, Rp)', revenue],
  ]);
  summary.cell('A1').style({ bold: true, fontSize: 14 });
  summary.range('A2:A8').style('bold', true);
  summary.cell('B8').style('numberFormat', '#,##0');
  summary.column('A').width(32);
  summary.column('B').width(28);

  // Rekap per program
  const programs = [...new Set(entries.map((e) => e.program_name || '-'))];
  const recapTop = 10;
  summary.range(`A${recapTop}:F${recapTop}`).value([['Program', 'Total', 'Lunas', 'Menunggu bayar', 'Gagal', 'Pemasukan (Rp)']]);
  summary.range(`A${recapTop}:F${recapTop}`).style(HEADER);
  const recap = programs.map((p) => {
    const rows = entries.filter((e) => (e.program_name || '-') === p);
    return [
      p,
      rows.length,
      rows.filter((e) => e.status === 'paid').length,
      rows.filter((e) => e.status === 'pending').length,
      rows.filter((e) => e.status === 'failed').length,
      rows.filter((e) => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0),
    ];
  });
  if (recap.length) {
    summary.range(`A${recapTop + 1}:F${recapTop + recap.length}`).value(recap);
    summary.range(`F${recapTop + 1}:F${recapTop + recap.length}`).style('numberFormat', '#,##0');
  }
  ['C', 'D', 'E', 'F'].forEach((c) => summary.column(c).width(18));

  // Daftar pendaftar
  const sheet = wb.addSheet('Pendaftar');
  const head = ['No', 'Tanggal daftar (WIB)', 'Nama', 'Email', 'No HP', 'Program', 'Biaya (Rp)', 'Status', 'Tanggal bayar (WIB)', 'No. pesanan'];
  sheet.range('A1:J1').value([head]);
  sheet.range('A1:J1').style(HEADER);
  if (entries.length) {
    sheet.range(`A2:J${entries.length + 1}`).value(
      entries.map((e, i) => [
        i + 1,
        wibText(e.registered_at),
        e.name,
        e.email,
        `+${e.phone}`,
        e.program_name || '-',
        Number(e.amount),
        STATUS[e.status] || e.status,
        wibText(e.paid_at),
        e.order_id,
      ])
    );
    sheet.range(`G2:G${entries.length + 1}`).style('numberFormat', '#,##0');
  }
  [6, 20, 26, 30, 18, 38, 14, 16, 20, 30].forEach((w, i) => sheet.column(String.fromCharCode(65 + i)).width(w));

  return wb.outputAsync({ password });
}
