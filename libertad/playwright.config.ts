import { defineConfig } from '@playwright/test'

/**
 * Verificación de la demo (`npm run verify`): recorre F1–F8 con clics reales y
 * barre todas las pantallas en 390/768/1440 buscando errores de consola y
 * desbordes. Sirve el build de producción (`dist/`) con `vite preview`.
 */
export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 180_000,
  expect: { timeout: 8_000 },
  reporter: [['list']],
  use: {
    // DEMO_URL permite probar otra copia servida (ej. la versión publicada).
    baseURL: process.env.DEMO_URL ?? 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { viewport: { width: 1440, height: 900 } } },
    // El barrido de pantallas define sus propios anchos: corre una sola vez.
    { name: 'celular', testIgnore: /pantallas/, use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: process.env.DEMO_URL ? undefined : {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
})
