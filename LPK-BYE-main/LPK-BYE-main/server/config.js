// Pembacaan konfigurasi dari environment
import 'dotenv/config';

const e = process.env;
const isProd = e.NODE_ENV === 'production' || Boolean(e.VERCEL);
const hasAdmin = Boolean(e.ADMIN_USER && e.ADMIN_PASS && e.JWT_SECRET);

export const cfg = {
  port: Number(e.PORT) || 4000,
  clientOrigin: e.CLIENT_ORIGIN || 'http://localhost:5173',
  databaseUrl: e.DATABASE_URL || e.POSTGRES_URL || '',
  // Webhook chat n8n untuk chatbot AI (bisa diganti lewat CHAT_WEBHOOK_URL)
  chatWebhookUrl: e.CHAT_WEBHOOK_URL || 'https://n8n-w5uzppbcynzg.eu2.sumopod.my.id/webhook/4a9aecfa-4740-4982-8cbc-d622f0fbab78/chat',
  price: Number(e.PRICE) || 250000,
  adminUser: e.ADMIN_USER,
  adminPass: e.ADMIN_PASS,
  jwtSecret: e.JWT_SECRET,
  isProd,
  // Di produksi, admin aktif hanya dengan kredensial yang cukup kuat
  adminReady: hasAdmin && (!isProd || (e.JWT_SECRET.length >= 32 && e.ADMIN_PASS.length >= 10)),
};

if (!hasAdmin) console.error('ADMIN_USER, ADMIN_PASS, dan JWT_SECRET belum diisi.');
