import { estadoCobro, saldo, total } from './cobranza'
import { diasEntre } from './reloj'
import type { Liquidacion, ParteLabor } from './types'

/** Días entre el envío (o sincronización) y la conformidad de cada parte conformado. */
export function tiemposConformidad(partes: ParteLabor[]): number[] {
  const out: number[] = []
  for (const p of partes) {
    const envio = [...p.historial].reverse().find((e) => e.estado === 'enviado')
    const conf = p.historial.find((e) => e.estado === 'conformado')
    if (envio && conf) out.push(Math.max(0, diasEntre(envio.fecha.slice(0, 10), conf.fecha.slice(0, 10))))
  }
  return out
}

export function promedio(xs: number[]): number {
  return xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0
}

/** Cantidad de partes (no borradores) por mes 'YYYY-MM'. */
export function partesPorMes(partes: ParteLabor[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const p of partes.filter((x) => x.estado !== 'borrador')) m.set(p.fecha.slice(0, 7), (m.get(p.fecha.slice(0, 7)) ?? 0) + 1)
  return new Map([...m.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

/** Conformados sin observación sobre resueltos (conformado, rechazado, en disputa). */
export function tasaConformidadRed(partes: ParteLabor[]): number {
  const resueltos = partes.filter((p) => ['conformado', 'rechazado', 'en_disputa'].includes(p.estado))
  const limpios = resueltos.filter((p) => p.estado === 'conformado' && !p.historial.some((e) => e.estado === 'observado'))
  return resueltos.length ? limpios.length / resueltos.length : 0
}

export interface ResumenCobranzaRed {
  gestionado: number
  cobrado: number
  pendiente: number
  vencido: number
  enDisputa: number
  /** Liquidaciones cobradas en o antes del vencimiento / cobradas. */
  cobroEnTermino: number
}

export function resumenCobranzaRed(liquidaciones: Liquidacion[]): ResumenCobranzaRed {
  const cerradas = liquidaciones.filter((l) => l.estado === 'cobrada' && l.cobros.length)
  const enTermino = cerradas.filter((l) => (l.cobros[l.cobros.length - 1]?.fecha ?? '') <= l.vencimiento).length
  return {
    gestionado: liquidaciones.reduce((s, l) => s + total(l), 0),
    cobrado: liquidaciones.reduce((s, l) => s + l.cobros.reduce((a, c) => a + c.monto, 0), 0),
    pendiente: liquidaciones.filter((l) => l.estado !== 'cobrada').reduce((s, l) => s + saldo(l), 0),
    vencido: liquidaciones.filter((l) => estadoCobro(l) === 'vencido').reduce((s, l) => s + saldo(l), 0),
    enDisputa: liquidaciones.filter((l) => estadoCobro(l) === 'en_disputa').reduce((s, l) => s + saldo(l), 0),
    cobroEnTermino: cerradas.length ? enTermino / cerradas.length : 0,
  }
}
