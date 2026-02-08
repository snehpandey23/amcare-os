import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.AI_SCRUM_MASTER_WEB_PORT || '3007'),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.AI_SCRUM_MASTER_PORT || '3010'}`,
        changeOrigin: true,
      },
    },
  },
})
