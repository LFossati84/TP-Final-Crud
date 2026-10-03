import { useMemo } from 'react'
import type { ParteLabor, Productor } from '@/domain/types'
import { useIngeniero } from '@/store/hooks'
import { useDemo } from '@/store/useDemo'

/** Clientes y aplicaciones del ingeniero activo. */
export function useAgronomia() {
  const ing = useIngeniero()
  const productores = useDemo((s) => s.productores)
  const partes = useDemo((s) => s.partes)
  return useMemo(() => {
    const clientes: Productor[] = productores.filter((p) => ing?.clientes.includes(p.id) || p.ingenieroId === ing?.id)
    const activos = clientes.filter((p) => p.validacionProfesional && p.ingenieroId === ing?.id)
    const aplicaciones: ParteLabor[] = partes.filter(
      (p) => p.labor === 'pulverizacion' && activos.some((c) => c.id === p.productorId) && p.estado !== 'borrador' && p.estado !== 'rechazado' && p.estado !== 'pendiente_sync',
    )
    return {
      ing,
      clientes,
      activos,
      aplicaciones,
      pendientes: aplicaciones.filter((p) => p.validacion?.ingenieroId === ing?.id && p.validacion?.estado === 'pendiente'),
      observadas: aplicaciones.filter((p) => p.validacion?.estado === 'observada'),
      validadas: aplicaciones.filter((p) => p.validacion?.estado === 'validada'),
      sinReceta: aplicaciones.filter((p) => !p.recetaId),
    }
  }, [ing, productores, partes])
}
