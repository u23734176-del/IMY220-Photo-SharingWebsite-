import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Backend URL: localhost for plain `npm run dev`, overridden inside Docker
////helpr frontend developme server knows where to find your backedn point

// eslint-disable-next-line no-undef
const target = process.env.VITE_API_TARGET || 'http://localhost:3001'

// //helps port bridigin 

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target, changeOrigin: true, secure: false },
      '/uploads': { target, changeOrigin: true, secure: false },
    },
  },
})