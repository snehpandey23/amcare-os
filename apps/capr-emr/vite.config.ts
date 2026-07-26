import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.CAPR_EMR_WEB_PORT || '3019', 10),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.CAPR_EMR_API_PORT || '3020'}`,
        changeOrigin: true,
      },
    },
  },
});
