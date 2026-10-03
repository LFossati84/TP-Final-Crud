import { expect, test, type Page } from '@playwright/test'
import { vigilarConsola } from './consola'

const FLUJOS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'] as const

/**
 * Hace cada recorrido guiado como lo haría una persona: lee el tooltip,
 * toca el elemento resaltado (o "Siguiente") y sigue hasta "Terminar".
 */
async function completarRecorrido(page: Page, flujo: string): Promise<number> {
  await page.locator('[data-tour=boton-recorrido]').click()
  await page.locator(`[data-tour=iniciar-${flujo}]`).click()

  const tip = page.locator('[data-tour-tooltip]')
  let ultimo = ''
  let repeticiones = 0
  for (let i = 0; i < 80; i++) {
    await tip.waitFor({ timeout: 8_000 })
    await page.waitForTimeout(450)
    const texto = (await tip.locator('p').first().textContent()) ?? ''
    if (texto === ultimo) {
      repeticiones += 1
      expect(repeticiones, `${flujo} quedó trabado en "${texto}"`).toBeLessThan(15)
    } else {
      repeticiones = 0
      ultimo = texto
    }

    const terminar = tip.getByRole('button', { name: 'Terminar' })
    if (await terminar.count()) {
      const total = Number(texto.match(/\d+\/(\d+)/)?.[1] ?? 0)
      await terminar.click()
      return total
    }
    const siguiente = tip.locator('[data-tour=tour-siguiente]')
    if (await siguiente.count()) {
      await siguiente.click()
      await page.waitForTimeout(300)
      continue
    }

    const selector = await tip.getAttribute('data-objetivo')
    const avance = await tip.getAttribute('data-avance')
    if (!selector) continue
    const objetivo = page.locator(selector).first()
    if (!(await objetivo.count())) continue

    if (selector === '[data-tour="firma"]') {
      const caja = await objetivo.boundingBox()
      if (!caja) continue
      await page.mouse.move(caja.x + 30, caja.y + 80)
      await page.mouse.down()
      await page.mouse.move(caja.x + 180, caja.y + 40, { steps: 6 })
      await page.mouse.up()
    } else if (selector.includes('pedido-lotes')) {
      await objetivo.locator('input[type=checkbox]').first().check()
    } else if (avance === 'click' || avance === 'aparece') {
      await objetivo.click({ timeout: 6_000 })
    }
    await page.waitForTimeout(400)
  }
  throw new Error(`${flujo}: no llegó a "Terminar"`)
}

for (const flujo of FLUJOS) {
  test(`recorrido ${flujo} completo sin errores de consola`, async ({ page }) => {
    const errores = vigilarConsola(page)
    await page.goto('/', { waitUntil: 'networkidle' })
    const pasos = await completarRecorrido(page, flujo)
    expect(pasos).toBeGreaterThan(0)
    await expect(page.locator('[data-tour-tooltip]')).toHaveCount(0)
    expect(errores).toEqual([])
  })
}
