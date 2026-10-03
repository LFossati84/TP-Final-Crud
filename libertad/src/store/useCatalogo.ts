import { useMemo } from 'react'
import type { Contratista, Establecimiento, ID, Insumo, Lote, Productor, RecetaAgronomica } from '@/domain/types'
import { useDemo } from './useDemo'

/** Índices por id de las entidades de referencia (para resolver nombres en listas). */
export function useCatalogo() {
  const lotes = useDemo((s) => s.lotes)
  const establecimientos = useDemo((s) => s.establecimientos)
  const productores = useDemo((s) => s.productores)
  const contratistas = useDemo((s) => s.contratistas)
  const insumos = useDemo((s) => s.insumos)
  const recetas = useDemo((s) => s.recetas)
  return useMemo(() => {
    const idx = <T extends { id: ID }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]))
    const L = idx<Lote>(lotes)
    const E = idx<Establecimiento>(establecimientos)
    const P = idx<Productor>(productores)
    const C = idx<Contratista>(contratistas)
    const I = idx<Insumo>(insumos)
    const R = idx<RecetaAgronomica>(recetas)
    return {
      lote: (id: ID) => L.get(id),
      establecimiento: (id: ID) => E.get(id),
      productor: (id: ID) => P.get(id),
      contratista: (id: ID) => C.get(id),
      insumo: (id: ID) => I.get(id),
      receta: (id?: ID) => (id ? R.get(id) : undefined),
      lotes,
      establecimientos,
      productores,
      insumos,
      recetas,
    }
  }, [lotes, establecimientos, productores, contratistas, insumos, recetas])
}
