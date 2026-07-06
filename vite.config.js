import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the production build works from any static host / subpath
export default defineConfig({
  plugins: [react()],
  base: './',
  // honor an assigned dev port (e.g. from preview tooling); falls back to vite's default
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
})
