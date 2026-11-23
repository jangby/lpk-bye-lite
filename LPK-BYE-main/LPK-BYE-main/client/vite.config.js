import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host: true = bisa dibuka dari HP (scan QR)
export default defineConfig({
  plugins: [react()],
  server: { host: true, proxy: { '/api': 'http://localhost:4000' } },
});
