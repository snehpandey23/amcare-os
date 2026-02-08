import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: parseInt(process.env.OET_LMS_PORT || '3005'),
    proxy: {
      '/api': {
        target: process.env.OET_LMS_SUBMISSIONS_ORIGIN || 'http://localhost:3006',
        changeOrigin: true,
      },
      '/chat-ws': {
        target: process.env.OET_LMS_CHAT_ORIGIN || 'http://localhost:3007',
        ws: true,
      },
    },
  },
})
