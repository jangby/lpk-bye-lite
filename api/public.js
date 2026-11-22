import { randomBytes } from 'node:crypto';
import { dataStore as sheets } from '../lib/store.js';
import { parseJson } from '../lib/sheets.js';
import { methodNotAllowed, send } from '../lib/http.js';
import { uploadToDrive } from '../lib/drive.js';
import { sendFonnte } from '../lib/fonnte.js';

const formatPhone = (value) => String(value || '').replace(/\D/g, '').replace(/^0/, '62');
const id = () => randomBytes(10).toString('hex');
const code = () => `BYE-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`;

export default async function handler(req, res) {
  try {
    if (req.method === 'POST' && Buffer.byteLength(JSON.stringify(req.body || {})) > 3.5 * 1024 * 1024) {
      return send(res, 413, { success: false, message: 'Total ukuran unggahan terlalu besar. Kurangi ukuran atau jumlah berkas.' });
    }
    if (req.method === 'GET') {
      if (req.query.action === 'content') {
        const content = await sheets.listContent();
        return send(res, 200, { success: true, data: {
          logo_url: content.find((item) => item.type === 'logo')?.image_url || null,
          slides: content.filter((item) => item.type === 'slide' && ['true', '1'].includes(String(item.is_active).toLowerCase())).sort((a, b) => Number(a.sort_order) - Number(b.sort_order)),
          gallery: content.filter((item) => item.type === 'gallery' && ['true', '1'].includes(String(item.is_active).toLowerCase())).sort((a, b) => Number(a.sort_order) - Number(b.sort_order)),
          faqs: content.filter((item) => item.type === 'faq' && ['true', '1'].includes(String(item.is_active).toLowerCase()))
            .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
            .map((item) => ({ ...item, question: item.title, answer: item.caption }))
        } });
      }
      if (req.query.token) {
        res.setHeader('Cache-Control', 'no-store');
        const registrants = await sheets.listRegistrants();
        const record = registrants.find((item) => item.portal_token === req.query.token);
        if (!record) return send(res, 404, { success: false, message: 'Tautan portal tidak valid.' });
        const [batches, allPayments] = await Promise.all([sheets.listBatches(), sheets.listPayments()]);
        const batch = batches.find((item) => item.id === record.batch_id);
        const payments = allPayments.filter((item) => item.registrant_id === record.id);
        const approved = payments.filter((item) => item.status === 'approved');
        const paidTotal = approved.reduce((sum, item) => sum + Number(item.amount_approved || 0), 0);
        const trainingFee = Number(batch?.training_fee || 0);
        return send(res, 200, { success: true, data: {
          participant: {
            full_name: record.full_name, registration_code: record.registration_code,
            status: record.status, feedback: record.feedback, registered_at: record.created_at
          },
          training: { batch_name: record.batch_name, program_type: record.program_type, description: batch?.description || '', start_date: batch?.start_date || '', end_date: batch?.end_date || '' },
          payment: {
            training_fee: trainingFee,
            paid_total: paidTotal,
            balance_due: Math.max(0, trainingFee - paidTotal),
            instructions: ['verified', 'accepted'].includes(record.status) ? batch?.payment_instructions || '' : '',
            transactions: payments.map((item) => ({
              id: item.id, amount_declared: item.amount_declared ? Number(item.amount_declared) : null,
              amount_approved: item.amount_approved ? Number(item.amount_approved) : null,
              receipt_url: item.receipt_url, status: item.status, rejection_reason: item.rejection_reason,
              created_at: item.created_at
            }))
          }
        } });
      }
      const [batches, registrants] = await Promise.all([sheets.listBatches(), sheets.listRegistrants()]);
      const today = new Date().toISOString().slice(0, 10);
      const active = batches.filter((batch) => ['true', '1'].includes(String(batch.is_active).toLowerCase()) && batch.end_date >= today)
        .map((batch) => {
          const count = registrants.filter((item) => item.batch_id === batch.id).length;
          return { ...batch, quota: Number(batch.quota || 0), training_fee: batch.training_fee === '' ? null : Number(batch.training_fee), is_active: true,
            fields: parseJson(batch.fields_json, []), registrant_count: count, is_full: Number(batch.quota || 0) > 0 && count >= Number(batch.quota) };
        });
      return send(res, 200, { success: true, data: { batches: active } });
    }

    if (req.method === 'POST') {
      if (req.query.action === 'payment') {
        const { registration_code, portal_token, amount, receipt } = req.body || {};
        if (!receipt?.base64 || !receipt?.mimeType || !receipt?.name) {
          return send(res, 422, { success: false, message: 'Foto atau PDF bukti pembayaran wajib dipilih.' });
        }
        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
          return send(res, 422, { success: false, message: 'Nominal pembayaran harus lebih dari 0.' });
        }
        const record = (await sheets.listRegistrants()).find((item) =>
          item.registration_code === String(registration_code || '').trim() && item.portal_token === String(portal_token || '').trim());
        if (!record) return send(res, 404, { success: false, message: 'Data peserta untuk pembayaran tidak ditemukan.' });
        if (!['verified', 'accepted'].includes(record.status)) {
          return send(res, 409, { success: false, message: 'Pengiriman bukti dibuka setelah pendaftaran diverifikasi.' });
        }
        const uploaded = await uploadToDrive({ base64: receipt.base64, mimeType: receipt.mimeType, fileName: `${record.registration_code}-${receipt.name}` });
        const payment = {
          id: id(), registrant_id: record.id, registration_code: record.registration_code,
          full_name: record.full_name, whatsapp: record.whatsapp, amount_declared: String(Number(amount)),
          amount_approved: '', receipt_url: uploaded.webViewLink, receipt_name: uploaded.name,
          status: 'pending', rejection_reason: '', created_at: new Date().toISOString(),
          reviewed_at: '', notification_status: 'pending'
        };
        await sheets.addPayment(payment);
        if (process.env.FONNTE_ADMIN_NUMBER && process.env.FONNTE_TOKEN) {
          try {
            await sendFonnte(formatPhone(process.env.FONNTE_ADMIN_NUMBER),
              `Bukti pembayaran baru: ${record.full_name} (${record.registration_code}), Rp${new Intl.NumberFormat('id-ID').format(Number(amount))}. Bukti: ${uploaded.webViewLink}`);
          } catch (error) {
            console.error('Fonnte payment proof notification failed:', error.message);
          }
        }
        return send(res, 201, { success: true, message: 'Bukti pembayaran berhasil dikirim dan menunggu verifikasi admin.', data: { receipt_url: uploaded.webViewLink } });
      }
      const { batch_id, full_name, whatsapp, email = '', answers = {} } = req.body || {};
      if (!batch_id || !String(full_name || '').trim() || String(full_name).trim().length < 3) {
        return send(res, 422, { success: false, message: 'Nama dan gelombang wajib diisi.' });
      }
      if (!/^[0-9+\-()\s]{8,20}$/.test(String(whatsapp || ''))) {
        return send(res, 422, { success: false, message: 'Nomor WhatsApp tidak valid.' });
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return send(res, 422, { success: false, message: 'Alamat email tidak valid.' });
      }
      if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
        return send(res, 422, { success: false, message: 'Data tambahan tidak valid.' });
      }
      const [batches, registrants] = await Promise.all([sheets.listBatches(), sheets.listRegistrants()]);
      const batch = batches.find((item) => item.id === String(batch_id));
      const today = new Date().toISOString().slice(0, 10);
      if (!batch || !['true', '1'].includes(String(batch.is_active).toLowerCase()) || batch.end_date < today) {
        return send(res, 409, { success: false, message: 'Gelombang tidak tersedia untuk pendaftaran.' });
      }
      if (batch.training_fee === '') {
        return send(res, 409, { success: false, message: 'Biaya gelombang ini belum ditetapkan.' });
      }
      const inBatch = registrants.filter((item) => item.batch_id === batch.id);
      if (Number(batch.quota) > 0 && inBatch.length >= Number(batch.quota)) {
        return send(res, 409, { success: false, message: 'Kuota gelombang sudah penuh.' });
      }
      const fields = parseJson(batch.fields_json, []);
      for (const field of fields) {
        const value = answers[field.field_name];
        const provided = field.field_type === 'file'
          ? value?.base64 && value?.name
          : String(value || '').trim();
        if (field.is_required && !provided) {
          return send(res, 422, { success: false, message: `${field.field_label} wajib diisi.` });
        }
      }
      const registrationCode = code();
      const normalizedAnswers = { ...answers };
      for (const field of fields) {
        if (field.field_type !== 'file') continue;
        const file = answers[field.field_name];
        if (!file?.base64) {
          delete normalizedAnswers[field.field_name];
          continue;
        }
        const uploaded = await uploadToDrive({ base64: file.base64, mimeType: file.mimeType, fileName: `${registrationCode}-${file.name}` });
        normalizedAnswers[field.field_name] = {
          name: uploaded.name,
          url: uploaded.webViewLink,
          mimeType: uploaded.mimeType
        };
      }
      const token = randomBytes(32).toString('base64url');
      const created = new Date().toISOString();
      const record = {
        id: id(), batch_id: batch.id, batch_name: batch.batch_name, program_type: batch.program_type,
        full_name: String(full_name).trim(), whatsapp: formatPhone(whatsapp), email: String(email).trim(),
        registration_code: registrationCode, portal_token: token, status: 'pending', answers_json: JSON.stringify(normalizedAnswers),
        notes: '', feedback: '', created_at: created, notification_status: 'pending'
      };
      record._row = await sheets.addRegistrant(record);
      const portalUrl = `${(process.env.APP_URL || `https://${req.headers.host}`).replace(/\/$/, '')}/peserta/${token}`;
      const message = `Halo ${record.full_name}, pendaftaran ${batch.program_type} - ${batch.batch_name} berhasil diterima.\nKode pendaftaran: ${registrationCode}\nStatus: Menunggu verifikasi.\nLihat status: ${portalUrl}`;
      let notificationStatus = 'not_configured';
      if (process.env.FONNTE_TOKEN) {
        try {
          await sendFonnte(record.whatsapp, message);
          notificationStatus = 'sent';
        } catch (error) {
          console.error('Fonnte participant notification failed:', error.message);
          notificationStatus = 'failed';
        }
        if (process.env.FONNTE_ADMIN_NUMBER) {
          try {
          await sendFonnte(formatPhone(process.env.FONNTE_ADMIN_NUMBER), `Pendaftar baru: ${record.full_name} (${registrationCode}), ${batch.batch_name}.`);
          } catch (error) {
            console.error('Fonnte admin notification failed:', error.message);
          }
        }
      }
      record.notification_status = notificationStatus;
      try {
        await sheets.saveRegistrant(record);
      } catch (error) {
        console.error('Saving registration notification status failed:', error);
      }
      return send(res, 201, { success: true, message: 'Pendaftaran berhasil.', data: {
        registration_code: registrationCode, program_type: batch.program_type, batch_name: batch.batch_name,
        portal_url: portalUrl, notification: { status: notificationStatus }
      } });
    }
    return methodNotAllowed(res);
  } catch (error) {
    console.error('Public API error:', error);
    return send(res, 500, { success: false, message: 'Permintaan gagal diproses. Periksa konfigurasi layanan.' });
  }
}
