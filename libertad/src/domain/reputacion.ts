import { diasEntre } from './reloj'
import type { Contratista, Liquidacion, ParteLabor, Productor, Resena } from './types'

export function calificacionPromedio(resenas: Resena[]): number | null {
  if (resenas.length === 0) return null
  return resenas.reduce((s, r) => s + r.puntaje, 0) / resenas.length
}

function fueObservado(p: ParteLabor): boolean {
  return p.historial.some((e) => e.estado === 'observado')
}

/** Partes conformados dentro de la plataforma + trabajos históricos auditados. */
export function trabajosConformados(c: Contratista, partes: ParteLabor[]): number {
  const enPlataforma = partes.filter((p) => p.contratistaId === c.id && p.estado === 'conformado').length
  return c.historico.partes + enPlataforma
}

/**
 * Tasa de conformidad: partes conformados sin ninguna observación sobre el
 * total de partes resueltos (conformados, rechazados o en disputa).
 */
export function tasaConformidad(c: Contratista, partes: ParteLabor[]): number {
  const propios = partes.filter((p) => p.contratistaId === c.id)
  const resueltos = propios.filter((p) => ['conformado', 'rechazado', 'en_disputa'].includes(p.estado))
  const limpios = resueltos.filter((p) => p.estado === 'conformado' && !fueObservado(p))
  const total = c.historico.partes + resueltos.length
  if (total === 0) return 0
  return (c.historico.conformadosSinObservacion + limpios.length) / total
}

export interface ReputacionContratista {
  calificacion: number | null
  resenas: number
  tasaConformidad: number
  trabajos: number
}

export function reputacionContratista(c: Contratista, partes: ParteLabor[], resenas: Resena[]): ReputacionContratista {
  const propias = resenas.filter((r) => r.contratistaId === c.id)
  return {
    calificacion: calificacionPromedio(propias),
    resenas: propias.length,
    tasaConformidad: tasaConformidad(c, partes),
    trabajos: trabajosConformados(c, partes),
  }
}

export interface ReputacionPago {
  liquidaciones: number
  /** Días promedio de pago respecto del vencimiento (negativo = paga antes). */
  diasPromedio: number
  /** Proporción de liquidaciones pagadas en término. */
  enTermino: number
}

/** Historial de cumplimiento de pago de un productor (base histórica + liquidaciones cobradas). */
export function reputacionPago(p: Productor, liquidaciones: Liquidacion[]): ReputacionPago {
  const cerradas = liquidaciones.filter((l) => l.productorId === p.id && l.estado === 'cobrada' && l.cobros.length > 0)
  const base = p.historicoPagos
  let sumaDias = base.diasPromedioDesdeVencimiento * base.liquidaciones
  let enTermino = Math.round(base.enTermino * base.liquidaciones)
  for (const l of cerradas) {
    const ultimo = l.cobros.reduce((max, c) => (c.fecha > max ? c.fecha : max), l.cobros[0]?.fecha ?? l.vencimiento)
    const dias = diasEntre(l.vencimiento, ultimo)
    sumaDias += dias
    if (dias <= 0) enTermino += 1
  }
  const total = base.liquidaciones + cerradas.length
  return {
    liquidaciones: total,
    diasPromedio: total === 0 ? 0 : sumaDias / total,
    enTermino: total === 0 ? 0 : enTermino / total,
  }
}
