import { expect, test } from '@playwright/test'
import { vigilarConsola } from './consola'

/** Todas las pantallas de la demo, con ids reales del escenario inicial. */
const RUTAS = [
  '/', '/kit', '/onboarding', '/planes', '/no-existe',
  '/contratista', '/contratista/nuevo-parte', '/contratista/trabajos', '/contratista/trabajos/pt33',
  '/contratista/cobros', '/contratista/cobros?vista=seguimiento', '/contratista/cobros/nueva', '/contratista/cobros/lq4', '/contratista/perfil',
  '/productor', '/productor/partes', '/productor/partes/pt20', '/productor/cuaderno', '/productor/contratistas', '/productor/contratistas/c3',
  '/productor/pagos', '/productor/pagos/lq4', '/productor/lotes', '/productor/informes', '/productor/configuracion',
  '/ingeniero', '/ingeniero/aplicaciones', '/ingeniero/aplicaciones/pt20', '/ingeniero/recetas', '/ingeniero/cuadernos',
  '/admin', '/admin/contratistas', '/admin/disputas', '/admin/cobranza', '/admin/metricas',
  '/imprimir/cuaderno/e1/2025-26', '/imprimir/liquidacion/lq1',
]

const ANCHOS = [
  { ancho: 390, alto: 844 },
  { ancho: 768, alto: 1024 },
  { ancho: 1440, alto: 900 },
]

const nombreArchivo = (ruta: string) => ruta.replace(/[/?=]/g, '_').replace(/^_/, '') || 'inicio'

for (const tema of ['claro', 'oscuro'] as const) {
  for (const { ancho, alto } of ANCHOS) {
    test(`pantallas en ${ancho}px (${tema}): sin errores ni desborde`, async ({ browser }) => {
      const page = await browser.newPage({ viewport: { width: ancho, height: alto }, colorScheme: tema === 'oscuro' ? 'dark' : 'light' })
      const errores = vigilarConsola(page, { avisos: true })
      const desbordes: string[] = []
      for (const ruta of RUTAS) {
        await page.goto(ruta, { waitUntil: 'networkidle' })
        await expect(page.locator('main, [role=main], #contenido').first()).toBeVisible()
        const exceso = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        if (exceso > 0) desbordes.push(`${ruta}: ${exceso}px`)
        if (tema === 'claro' || ancho === 1440) {
          await page.screenshot({ path: `capturas/${tema}/${ancho}/${nombreArchivo(ruta)}.png` })
        }
      }
      await page.close()
      expect(desbordes, 'desborde horizontal').toEqual([])
      expect(errores, 'errores o avisos de consola').toEqual([])
    })
  }
}
