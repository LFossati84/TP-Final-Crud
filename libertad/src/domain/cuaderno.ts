import { etiquetaLabor, num } from './format'
import type {
  Campania,
  Contratista,
  EntradaCuaderno,
  Insumo,
  Lote,
  ParteLabor,
  Productor,
} from './types'

export function describirInsumos(p: ParteLabor, insumos: Insumo[]): string {
  return p.insumos
    .map((ia) => {
      const ins = insumos.find((i) => i.id === ia.insumoId)
      return ins ? `${ins.nombre} ${num(ia.dosis)} ${ins.unidad}` : ''
    })
    .filter(Boolean)
    .join(' + ')
}

export function entradaDesdeParte(
  p: ParteLabor,
  lote: Lote | undefined,
  contratista: Contratista | undefined,
  insumos: Insumo[],
): EntradaCuaderno {
  const partesDetalle: string[] = [`${num(p.has, 1)} has`]
  const ins = describirInsumos(p, insumos)
  if (ins) partesDetalle.push(ins)
  if (p.condiciones) {
    partesDetalle.push(
      `caldo ${p.condiciones.caldo} l/ha`,
      `viento ${p.condiciones.viento} km/h ${p.condiciones.direccionViento}`,
      `${p.condiciones.temperatura} °C`,
      `HR ${p.condiciones.humedad} %`,
    )
  }
  return {
    id: `cu-${p.id}`,
    establecimientoId: p.establecimientoId,
    loteId: p.loteId,
    campania: p.campania,
    fecha: p.fecha,
    tipo: p.labor,
    titulo: `${etiquetaLabor[p.labor]} · ${lote?.nombre ?? 'Lote'}`,
    detalle: partesDetalle.join(' · '),
    parteId: p.id,
    contratistaId: p.contratistaId,
    autor: contratista?.razonSocial ?? 'Contratista',
  }
}

export interface ItemCompletitud {
  texto: string
  cumple: boolean
  pendiente?: boolean
}

/**
 * Completitud del cuaderno de un lote en una campaña.
 * Ítems "pendientes" (ej. cosecha de una campaña en curso) no restan.
 */
export function completitudCuaderno(
  lote: Lote,
  campania: Campania,
  partes: ParteLabor[],
  productor: Productor | undefined,
  campaniaCerrada: boolean,
): { porcentaje: number; items: ItemCompletitud[] } {
  const delLote = partes.filter((p) => p.loteId === lote.id && p.campania === campania && p.estado === 'conformado')
  const tiene = (l: ParteLabor['labor']) => delLote.some((p) => p.labor === l)
  const aplicaciones = delLote.filter((p) => p.labor === 'pulverizacion')

  const items: ItemCompletitud[] = [
    { texto: 'Siembra registrada', cumple: tiene('siembra') },
    { texto: 'Fertilización registrada', cumple: tiene('fertilizacion') },
    {
      texto: 'Aplicaciones con receta agronómica',
      cumple: aplicaciones.length > 0 && aplicaciones.every((p) => Boolean(p.recetaId)),
      pendiente: aplicaciones.length === 0,
    },
  ]
  if (productor?.validacionProfesional) {
    items.push({
      texto: 'Aplicaciones validadas por profesional',
      cumple: aplicaciones.length > 0 && aplicaciones.every((p) => p.validacion?.estado === 'validada'),
      pendiente: aplicaciones.length === 0,
    })
  }
  items.push({ texto: 'Cosecha registrada', cumple: tiene('cosecha'), pendiente: !campaniaCerrada && !tiene('cosecha') })

  const evaluables = items.filter((i) => i.cumple || !i.pendiente)
  const porcentaje = evaluables.length === 0 ? 0 : evaluables.filter((i) => i.cumple).length / evaluables.length
  return { porcentaje, items }
}
