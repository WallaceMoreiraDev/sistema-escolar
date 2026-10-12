import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import path from "node:path"
import fs from "node:fs"

/**
 * Plugin para gerar o 404.html duplicando o index.html na build.
 * No GitHub Pages, rotas diretas ou refresh (F5) em subrotas buscam 404.html.
 * Com isso, o GitHub Pages serve a aplicação React em qualquer sub-rota sem dar 404.
 */
function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist')
      const indexHtml = path.resolve(distDir, 'index.html')
      const notFoundHtml = path.resolve(distDir, '404.html')
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml)
      }
    }
  }
}

export default defineConfig({
  base: '/sistema-escolar/',
  plugins: [react(), spaFallbackPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      "zod": path.resolve(import.meta.dirname, "./node_modules/zod"),
    },
  },
})
