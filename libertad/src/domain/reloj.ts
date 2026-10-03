import type { FechaHoraISO, FechaISO } from './types'

/**
 * Reloj de la demo. Todos los vencimientos, semáforos y antigüedades se
 * calculan contra esta fecha para que el escenario sea siempre coherente.
 */
export const HOY: FechaISO = '2026-10-15'

/** Campaña activa en la demo. */
export const CAMPANIA_ACTIVA = '2026/27' as const

const MS_DIA = 86_400_000

function aUTC(fecha: FechaISO): number {
  const [a, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return Date.UTC(a ?? 1970, (m ?? 1) - 1, d ?? 1)
}

function desdeUTC(ms: number): FechaISO {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Días desde `desde` hasta `hasta` (positivo si `hasta` es posterior). */
export function diasEntre(desde: FechaISO, hasta: FechaISO): number {
  return Math.round((aUTC(hasta) - aUTC(desde)) / MS_DIA)
}

/** Días que faltan desde HOY hasta `fecha` (negativo = ya pasó). */
export function diasHasta(fecha: FechaISO): number {
  return diasEntre(HOY, fecha)
}

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  return desdeUTC(aUTC(fecha) + dias * MS_DIA)
}

/** Hora real del dispositivo (solo para que las cargas se sientan "en vivo"). */
export function horaActual(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function ahora(): FechaHoraISO {
  return `${HOY}T${horaActual()}`
}

/** Día de la semana (0 = domingo) de una fecha ISO. */
export function diaSemana(fecha: FechaISO): number {
  return new Date(aUTC(fecha)).getUTCDay()
}
