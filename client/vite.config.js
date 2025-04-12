import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This tells Vite not to use LightningCSS (which it does by default now)
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
    // 👇 Forces Vite to use classic PostCSS pipeline
    transformer: 'postcss',
  },
})
