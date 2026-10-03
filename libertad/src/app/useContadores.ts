import { useMemo } from 'react'
import { estadoCobro } from '@/domain/cobranza'
import type { Rol } from '@/domain/types'
import { useDemo } from '@/store/useDemo'

/** Badges numéricos del menú por rol (clave de ítem → cantidad). */
export function useContadores(rol: Rol): Partial<Record<string, number>> {
  const partes = useDemo((s) => s.partes)
  const liquidaciones = useDemo((s) => s.liquidaciones)
  const contratistas = useDemo((s) => s.contratistas)
  const disputas = useDemo((s) => s.disputas)
  const contratistaId = useDemo((s) => s.contratistaId)
  const productorId = useDemo((s) => s.productorId)
  const ingenieroId = useDemo((s) => s.ingenieroId)

  return useMemo(() => {
    switch (rol) {
      case 'contratista': {
        const propios = partes.filter((p) => p.contratistaId === contratistaId)
        return {
          trabajos: propios.filter((p) => p.estado === 'observado' || p.estado === 'pendiente_sync').length,
          cobros: liquidaciones.filter((l) => l.contratistaId === contratistaId && (l.estado === 'pago_informado' || estadoCobro(l) === 'vencido')).length,
        }
      }
      case 'productor':
        return {
          partes: partes.filter((p) => p.productorId === productorId && p.estado === 'enviado').length,
          pagos: liquidaciones.filter((l) => l.productorId === productorId && (l.estado === 'emitida' || (estadoCobro(l) === 'vencido' && l.estado !== 'pago_informado'))).length,
        }
      case 'ingeniero':
        return {
          aplicaciones: partes.filter((p) => p.validacion?.ingenieroId === ingenieroId && p.validacion.estado === 'pendiente').length,
        }
      case 'admin':
        return {
          verificaciones: contratistas.reduce((n, c) => n + c.documentos.filter((d) => d.estado === 'pendiente' || d.renovacion).length, 0),
          disputas: disputas.filter((d) => d.estado !== 'resuelta').length,
        }
    }
  }, [rol, partes, liquidaciones, contratistas, disputas, contratistaId, productorId, ingenieroId])
}
