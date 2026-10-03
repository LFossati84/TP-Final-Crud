import { useMemo } from 'react'
import { reputacionContratista, reputacionPago } from '@/domain/reputacion'
import type { ID } from '@/domain/types'
import { verificacionDe } from './derivados'
import { useDemo } from './useDemo'

/**
 * Hooks de lectura. Seleccionan referencias estables del store y derivan con
 * useMemo (Zustand v5 no admite selectores que devuelvan objetos nuevos).
 */

export function useContratista(id?: ID) {
  const activo = useDemo((s) => s.contratistaId)
  const buscado = id ?? activo
  return useDemo((s) => s.contratistas.find((c) => c.id === buscado))
}

export function useProductor(id?: ID) {
  const activo = useDemo((s) => s.productorId)
  const buscado = id ?? activo
  return useDemo((s) => s.productores.find((p) => p.id === buscado))
}

export function useIngeniero(id?: ID) {
  const activo = useDemo((s) => s.ingenieroId)
  const buscado = id ?? activo
  return useDemo((s) => s.ingenieros.find((i) => i.id === buscado))
}

export function useVerificacion(contratistaId: ID) {
  const contratistas = useDemo((s) => s.contratistas)
  const partes = useDemo((s) => s.partes)
  const resenas = useDemo((s) => s.resenas)
  const disputas = useDemo((s) => s.disputas)
  return useMemo(
    () => verificacionDe({ contratistas, partes, resenas, disputas }, contratistaId),
    [contratistas, partes, resenas, disputas, contratistaId],
  )
}

export function useReputacion(contratistaId: ID) {
  const c = useDemo((s) => s.contratistas.find((x) => x.id === contratistaId))
  const partes = useDemo((s) => s.partes)
  const resenas = useDemo((s) => s.resenas)
  return useMemo(() => (c ? reputacionContratista(c, partes, resenas) : null), [c, partes, resenas])
}

export function useReputacionPago(productorId: ID) {
  const p = useDemo((s) => s.productores.find((x) => x.id === productorId))
  const liquidaciones = useDemo((s) => s.liquidaciones)
  return useMemo(() => (p ? reputacionPago(p, liquidaciones) : null), [p, liquidaciones])
}

/** Notificaciones del usuario activo en el rol activo. */
export function useMisNotificaciones() {
  const rol = useDemo((s) => s.rol)
  const contratistaId = useDemo((s) => s.contratistaId)
  const productorId = useDemo((s) => s.productorId)
  const ingenieroId = useDemo((s) => s.ingenieroId)
  const todas = useDemo((s) => s.notificaciones)
  const usuarioId = rol === 'contratista' ? contratistaId : rol === 'productor' ? productorId : rol === 'ingeniero' ? ingenieroId : undefined
  return useMemo(
    () => ({
      usuarioId,
      lista: todas
        .filter((n) => n.rol === rol && (!n.usuarioId || n.usuarioId === usuarioId))
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    }),
    [todas, rol, usuarioId],
  )
}
