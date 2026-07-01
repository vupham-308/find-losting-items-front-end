import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api → backend thật, giúp cookie SameSite=Lax hoạt động (same-origin)
      '/api': {
        target: 'https://sba301-lost-and-found-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        // Viết lại Domain của Set-Cookie về host hiện tại (localhost) để browser chấp nhận cookie.
        cookieDomainRewrite: '',
      },
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
