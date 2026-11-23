import 'dotenv/config';
import express from 'express';
import analyticsHandler from './api/analytics.js';
import publicHandler from './api/public.js';
import adminHandler from './api/admin.js';
import fonnteWebhookHandler from './api/fonnte-webhook.js';
import syncSheetsHandler from './api/sync-sheets.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8mb' }));

function adapt(handler) {
  return (req, res) => {
    const url = new URL(req.originalUrl, 'http://127.0.0.1');
    req.query = Object.fromEntries(url.searchParams.entries());
    req.headers.host = req.headers.host || '127.0.0.1:5001';

    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };

    Promise.resolve(handler(req, res)).catch((error) => {
      console.error('Local API error:', error);
      if (!res.headersSent) {
        res.statusCode = 500;
      }
      if (!res.writableEnded) {
        res.json({ success: false, message: 'Permintaan gagal diproses.' });
      }
    });
  };
}

app.all('/api/public', adapt(publicHandler));
app.all('/api/admin', adapt(adminHandler));
app.all('/api/analytics', adapt(analyticsHandler));
app.all('/api/fonnte-webhook', adapt(fonnteWebhookHandler));
app.all('/api/sync-sheets', adapt(syncSheetsHandler));

const port = Number(process.env.LITE_API_PORT || 5001);
app.listen(port, '127.0.0.1', () => {
  console.log(`LPK BYE Lite API: http://127.0.0.1:${port}`);
});
