import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Mọi request /api sẽ được chuyển tiếp tới backend, tránh lỗi CORS khi dev
      '/api': {
        // Dùng 127.0.0.1 (IPv4) thay vì localhost để tránh Node phân giải sang ::1 (IPv6)
        // gây ECONNREFUSED khi backend chỉ lắng nghe trên IPv4.
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
    },
  },
})
