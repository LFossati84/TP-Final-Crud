import { HOY } from '@/domain/reloj'
import { reputacionContratista } from '@/domain/reputacion'
import { evaluarVerificacion, type ContextoVerificacion, type EvaluacionVerificacion } from '@/domain/verificacion'
import type { Datos } from '@/data'
import type { ID } from '@/domain/types'

/** Funciones puras sobre el estado completo: se usan en acciones y en hooks. */

export function contextoVerificacion(d: Pick<Datos, 'contratistas' | 'partes' | 'resenas' | 'disputas'>, contratistaId: ID): ContextoVerificacion | null {
  const c = d.contratistas.find((x) => x.id === contratistaId)
  if (!c) return null
  const rep = reputacionContratista(c, d.partes, d.resenas)
  return {
    trabajosConformados: rep.trabajos,
    calificacion: rep.calificacion,
    disputasAbiertas: d.disputas.filter((x) => x.contratistaId === contratistaId && x.estado !== 'resuelta').length,
    anioActual: Number(HOY.slice(0, 4)),
  }
}

export function verificacionDe(
  d: Pick<Datos, 'contratistas' | 'partes' | 'resenas' | 'disputas'>,
  contratistaId: ID,
): EvaluacionVerificacion | null {
  const c = d.contratistas.find((x) => x.id === contratistaId)
  const ctx = contextoVerificacion(d, contratistaId)
  if (!c || !ctx) return null
  return evaluarVerificacion(c, ctx)
}
