import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' so the production build works from any static host / subpath
export default defineConfig({
  plugins: [react()],
  base: './',
})
