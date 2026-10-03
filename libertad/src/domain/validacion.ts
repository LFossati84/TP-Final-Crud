import type { Hallazgo, Insumo, Lote, ParteLabor, RecetaAgronomica } from './types'
import { num } from './format'

export const NOTA_VALIDACION_PROFESIONAL =
  'La validación profesional la ejerce un ingeniero agrónomo matriculado; la plataforma solo la registra'

/** Umbrales orientativos de buenas prácticas de aplicación (configurables por el profesional). */
export const UMBRALES = {
  vientoMax: 15,
  vientoMin: 3,
  temperaturaMax: 30,
  humedadMin: 50,
} as const

export function esAplicacion(p: Pick<ParteLabor, 'labor'>): boolean {
  return p.labor === 'pulverizacion'
}

/** Controles automáticos sobre un parte. No reemplazan el criterio profesional. */
export function evaluarParte(
  p: ParteLabor,
  insumos: Insumo[],
  lote: Lote | undefined,
  receta: RecetaAgronomica | undefined,
): Hallazgo[] {
  const hallazgos: Hallazgo[] = []

  if (lote && p.has > lote.has * 1.02) {
    hallazgos.push({
      codigo: 'has_excedidas',
      severidad: 'peligro',
      texto: `Se declararon ${num(p.has, 1)} has y el lote tiene ${num(lote.has, 1)} has.`,
    })
  }

  if (!esAplicacion(p)) return hallazgos

  for (const ia of p.insumos) {
    const ins = insumos.find((i) => i.id === ia.insumoId)
    if (!ins || ins.dosisMax === undefined || ins.dosisMin === undefined) continue
    if (ia.dosis > ins.dosisMax) {
      hallazgos.push({
        codigo: 'dosis_alta',
        severidad: 'peligro',
        texto: `${ins.nombre}: ${num(ia.dosis)} ${ins.unidad} supera el rango de referencia (${num(ins.dosisMin)}–${num(ins.dosisMax)} ${ins.unidad}).`,
      })
    } else if (ia.dosis < ins.dosisMin) {
      hallazgos.push({
        codigo: 'dosis_baja',
        severidad: 'alerta',
        texto: `${ins.nombre}: ${num(ia.dosis)} ${ins.unidad} está por debajo del rango de referencia (${num(ins.dosisMin)}–${num(ins.dosisMax)} ${ins.unidad}).`,
      })
    }
  }

  const c = p.condiciones
  if (c) {
    if (c.viento > UMBRALES.vientoMax) {
      hallazgos.push({
        codigo: 'viento_alto',
        severidad: 'peligro',
        texto: `Viento de ${c.viento} km/h: supera ${UMBRALES.vientoMax} km/h, riesgo de deriva.`,
      })
    } else if (c.viento < UMBRALES.vientoMin) {
      hallazgos.push({
        codigo: 'viento_bajo',
        severidad: 'alerta',
        texto: `Viento de ${c.viento} km/h: posible inversión térmica.`,
      })
    }
    if (c.temperatura > UMBRALES.temperaturaMax) {
      hallazgos.push({ codigo: 'temperatura_alta', severidad: 'alerta', texto: `Temperatura de ${c.temperatura} °C.` })
    }
    if (c.humedad < UMBRALES.humedadMin) {
      hallazgos.push({ codigo: 'humedad_baja', severidad: 'alerta', texto: `Humedad relativa de ${c.humedad} %.` })
    }
  }

  if (!p.recetaId || !receta) {
    hallazgos.push({ codigo: 'sin_receta', severidad: 'peligro', texto: 'Aplicación sin receta agronómica asociada.' })
  } else {
    const fuera = p.insumos.filter(
      (ia) => !receta.productos.some((rp) => rp.insumoId === ia.insumoId) && insumos.find((i) => i.id === ia.insumoId)?.tipo !== 'coadyuvante',
    )
    for (const ia of fuera) {
      const ins = insumos.find((i) => i.id === ia.insumoId)
      hallazgos.push({
        codigo: 'producto_fuera_de_receta',
        severidad: 'alerta',
        texto: `${ins?.nombre ?? 'Producto'} no figura en la receta ${receta.numero}.`,
      })
    }
  }

  return hallazgos
}
