import { useMemo } from 'react'
import { reputacionContratista, type ReputacionContratista } from '@/domain/reputacion'
import type { Contratista } from '@/domain/types'
import type { EvaluacionVerificacion } from '@/domain/verificacion'
import { verificacionDe } from '@/store/derivados'
import { useDemo } from '@/store/useDemo'

export interface FichaRed {
  c: Contratista
  ev: EvaluacionVerificacion | null
  rep: ReputacionContratista
}

/** Contratistas de la red con su verificación y reputación calculadas. */
export function useRed(): FichaRed[] {
  const contratistas = useDemo((s) => s.contratistas)
  const partes = useDemo((s) => s.partes)
  const resenas = useDemo((s) => s.resenas)
  const disputas = useDemo((s) => s.disputas)
  return useMemo(
    () =>
      contratistas.map((c) => ({
        c,
        ev: verificacionDe({ contratistas, partes, resenas, disputas }, c.id),
        rep: reputacionContratista(c, partes, resenas),
      })),
    [contratistas, partes, resenas, disputas],
  )
}
