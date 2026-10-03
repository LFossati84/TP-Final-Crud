import type { Page } from '@playwright/test'

/** Junta errores (y avisos, si se pide) de consola y excepciones no capturadas. */
export function vigilarConsola(page: Page, { avisos = false } = {}): string[] {
  const errores: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error' || (avisos && m.type() === 'warning')) errores.push(`${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`))
  return errores
}
