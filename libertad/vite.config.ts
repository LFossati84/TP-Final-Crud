import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Hosting estático con BrowserRouter: GitHub Pages sirve 404.html ante rutas
 * desconocidas, así que lo generamos como copia de index.html.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback-404',
    apply: 'build',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      const index = resolve(dist, 'index.html')
      if (existsSync(index)) copyFileSync(index, resolve(dist, '404.html'))
    },
  }
}

// VITE_BASE permite publicar en un subdirectorio (ej. /TP-Final-Crud/ en GitHub Pages).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), spaFallback()],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
})
