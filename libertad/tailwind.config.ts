import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

/**
 * DESIGN TOKENS — Proyecto Libertad II
 *
 * Las paletas se emiten como variables CSS (canales RGB) para que una misma
 * clase funcione en claro y oscuro:
 *   - Escalas (tierra, verde, trigo, rojo, cielo): en modo oscuro se espejan
 *     (50↔950, 100↔900, …). Sirven para tintes, chips y texto de acento:
 *     `bg-verde-100 text-verde-800` se ve bien en ambos modos.
 *   - Semánticos (paper, superficie, borde, texto, accion, …): se redefinen a
 *     mano en oscuro. Todo relleno sólido con texto encima usa semánticos
 *     (`bg-accion text-sobre-accion`), nunca `bg-verde-700 text-white`.
 */

const escalas = {
  tierra: {
    50: '#FAF5EF', 100: '#F1E6D8', 200: '#E2CDB3', 300: '#CDAD88', 400: '#B48962',
    500: '#9A6D47', 600: '#7E5638', 700: '#64432D', 800: '#4A3224', 900: '#33231A', 950: '#1F1510',
  },
  verde: {
    50: '#F0F7EE', 100: '#DCEDD6', 200: '#B9DBAE', 300: '#8EC27E', 400: '#63A553',
    500: '#46893A', 600: '#356F2D', 700: '#2B5926', 800: '#244720', 900: '#1D3A1B', 950: '#0E200D',
  },
  trigo: {
    50: '#FDF8EC', 100: '#FAEDCB', 200: '#F4D993', 300: '#EDC25A', 400: '#E3A934',
    500: '#C98C1F', 600: '#A66D18', 700: '#845317', 800: '#6A4218', 900: '#573717', 950: '#321D09',
  },
  rojo: {
    50: '#FDF2F0', 100: '#FADFDA', 200: '#F3BDB3', 300: '#E89282', 400: '#D9634F',
    500: '#C44A35', 600: '#A63A28', 700: '#862F22', 800: '#6B2820', 900: '#58241D', 950: '#30100C',
  },
  cielo: {
    50: '#EFF6FA', 100: '#D9EAF3', 200: '#B3D4E7', 300: '#84B8D5', 400: '#5398BF',
    500: '#2F7BA6', 600: '#256489', 700: '#1F5676', 800: '#1C4760', 900: '#173A50', 950: '#0C2232',
  },
} as const

const semanticos = {
  claro: {
    paper: '#FAF6EE',
    'paper-2': '#F3ECDF',
    'paper-3': '#E9DFCC',
    superficie: '#FFFDF8',
    borde: '#E3D6C1',
    'borde-fuerte': '#BFAA8A',
    texto: '#2B1F16',
    'texto-suave': '#66533F',
    accion: '#2B5926',
    'accion-hover': '#244720',
    'sobre-accion': '#FFFFFF',
    foco: '#356F2D',
    acento: '#EDC25A',
    'acento-hover': '#F4D993',
    'sobre-acento': '#2B1F16',
    peligro: '#862F22',
    'peligro-hover': '#6B2820',
    'sobre-peligro': '#FFFFFF',
    barra: '#2A1D14',
    'barra-2': '#3D2B1F',
    'sobre-barra': '#F3EBDD',
  },
  oscuro: {
    paper: '#17120E',
    'paper-2': '#1F1813',
    'paper-3': '#2A211A',
    superficie: '#221A14',
    borde: '#3A2E24',
    'borde-fuerte': '#5E4D3F',
    texto: '#F3EBDD',
    'texto-suave': '#C4B49E',
    accion: '#7DB86D',
    'accion-hover': '#9DCB90',
    'sobre-accion': '#0E200D',
    foco: '#9DCB90',
    acento: '#E3A934',
    'acento-hover': '#EDC25A',
    'sobre-acento': '#1F1510',
    peligro: '#E89282',
    'peligro-hover': '#F3BDB3',
    'sobre-peligro': '#30100C',
    barra: '#0F0B08',
    'barra-2': '#241B14',
    'sobre-barra': '#F3EBDD',
  },
} as const

const pasos = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const

function canales(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

function variablesClaras(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [nombre, escala] of Object.entries(escalas)) {
    for (const paso of pasos) vars[`--${nombre}-${paso}`] = canales(escala[paso])
  }
  for (const [nombre, hex] of Object.entries(semanticos.claro)) vars[`--${nombre}`] = canales(hex)
  return vars
}

function variablesOscuras(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [nombre, escala] of Object.entries(escalas)) {
    pasos.forEach((paso, i) => {
      const espejo = pasos[pasos.length - 1 - i] ?? paso
      vars[`--${nombre}-${paso}`] = canales(escala[espejo])
    })
  }
  for (const [nombre, hex] of Object.entries(semanticos.oscuro)) vars[`--${nombre}`] = canales(hex)
  return vars
}

function colorVar(nombre: string): string {
  return `rgb(var(--${nombre}) / <alpha-value>)`
}

const colores: Record<string, string | Record<string, string>> = {
  transparent: 'transparent',
  current: 'currentColor',
  white: '#FFFFFF',
  black: '#000000',
}
for (const nombre of Object.keys(escalas)) {
  colores[nombre] = Object.fromEntries(pasos.map((p) => [p, colorVar(`${nombre}-${p}`)]))
}
for (const nombre of Object.keys(semanticos.claro)) colores[nombre] = colorVar(nombre)

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  // Solo para las muestras de color de /kit (clases armadas dinámicamente).
  safelist: [
    { pattern: /^bg-(tierra|verde|trigo|rojo|cielo)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
    { pattern: /^bg-(paper|paper-2|paper-3|superficie|borde|borde-fuerte|texto|texto-suave|accion|acento|peligro|barra)$/ },
  ],
  theme: {
    colors: colores,
    extend: {
      fontFamily: {
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', '"Book Antiqua"', 'Georgia', 'ui-serif', 'serif'],
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        tarjeta: '0 1px 2px rgb(31 21 16 / 0.06), 0 1px 3px rgb(31 21 16 / 0.05)',
        elevada: '0 10px 30px -10px rgb(31 21 16 / 0.28), 0 4px 10px -4px rgb(31 21 16 / 0.14)',
        telefono: '0 30px 80px -20px rgb(31 21 16 / 0.45), 0 0 0 1px rgb(31 21 16 / 0.08)',
      },
      minHeight: { tactil: '44px' },
      minWidth: { tactil: '44px' },
      keyframes: {
        'entrar-arriba': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        'entrar-derecha': { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'none' } },
        aparecer: { from: { opacity: '0' }, to: { opacity: '1' } },
        pulso: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.45' } },
        carga: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(300%)' } },
      },
      animation: {
        'entrar-arriba': 'entrar-arriba 180ms ease-out both',
        'entrar-derecha': 'entrar-derecha 200ms ease-out both',
        aparecer: 'aparecer 150ms ease-out both',
        pulso: 'pulso 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root': { ...variablesClaras(), colorScheme: 'light' },
        '.dark': { ...variablesOscuras(), colorScheme: 'dark' },
        // Documentos imprimibles: siempre en claro, aunque la app esté en modo oscuro.
        '.forzar-claro': { ...variablesClaras(), colorScheme: 'light' },
      })
    }),
  ],
} satisfies Config
