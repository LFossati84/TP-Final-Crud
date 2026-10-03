// Construye la versión publicada de la demo (router en memoria, rutas
// relativas) en dist-artifact/ y deja index.html como fragmento: el visor
// agrega su propio <!doctype>, <head> y <body>.
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const raiz = resolve(import.meta.dirname, '..')
const salida = join(raiz, 'dist-artifact')

execFileSync('npx', ['vite', 'build', '--outDir', 'dist-artifact', '--emptyOutDir'], {
  cwd: raiz,
  stdio: 'inherit',
  env: { ...process.env, VITE_DESTINO: 'artifact', VITE_BASE: './' },
})

const html = readFileSync(join(salida, 'index.html'), 'utf8')
const titulo = '<title>Proyecto Libertad II</title>'
const temas = html.match(/<script>[\s\S]*?<\/script>/)?.[0] ?? ''
const recursos = html.match(/<(script type="module"|link rel="(modulepreload|stylesheet)")[^>]*>(<\/script>)?/g) ?? []
const fragmento = [titulo, temas, ...recursos, '<div id="root"></div>', ''].join('\n')
writeFileSync(join(salida, 'index.html'), fragmento)

// Lista de archivos para publicar junto a la página (sin index.html ni el fallback 404).
const archivos = []
const recorrer = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name)
    if (e.isDirectory()) recorrer(ruta)
    else archivos.push(relative(salida, ruta))
  }
}
recorrer(salida)
const publicar = archivos.filter((a) => !['index.html', '404.html', '_redirects', 'favicon.svg'].includes(a)).sort()
writeFileSync(join(salida, 'archivos.json'), JSON.stringify(publicar, null, 2))
console.log(`\nListo: dist-artifact/index.html + ${publicar.length} archivos (ver dist-artifact/archivos.json).`)
