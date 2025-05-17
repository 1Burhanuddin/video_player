import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      'Content-Security-Policy': "default-src 'self' https://*.vercel.app; connect-src 'self' https://*.vercel.app; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com; frame-src 'self' https://www.youtube.com; style-src 'self' 'unsafe-inline';"
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
