import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@repo': repoRoot,
    },
  },
  server: { fs: { allow: [repoRoot] }, host: '127.0.0.1', port: 5173 },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1600 },
})
