// Entry lokal (npm run dev / npm start). Di Vercel dipakai api/index.js
import app from './app.js';
import { cfg } from './config.js';

app.listen(cfg.port, () => {
  console.log(`API aktif di http://localhost:${cfg.port}`);
});
