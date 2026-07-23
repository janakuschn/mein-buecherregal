// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mein-buecherregal/', // GitHub Pages base path
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})