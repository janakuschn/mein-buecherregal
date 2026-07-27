// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Ermittelt den kurzen Git-Commit-Hash zum Zeitpunkt des Builds. Läuft im
// GitHub-Actions-Build genauso wie lokal - dadurch lässt sich in der App
// (siehe VersionBadge.jsx) ablesen, welcher Stand tatsächlich live ist.
function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

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
  define: {
    __APP_VERSION__: JSON.stringify(getCommitHash()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})