import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is set by the GitHub Pages workflow:
//   "/"             when a custom domain (public/CNAME) is used
//   "/meltem-sari/" on samiboran.github.io/meltem-sari
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 3000
  }
})
