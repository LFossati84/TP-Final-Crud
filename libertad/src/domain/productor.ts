import { estadoCobro, saldo, tarifaPara, total } from './cobranza'
import { etiquetaLabor, fechaCorta, num, pesos, relativo } from './format'
import { diasHasta } from './reloj'
import type {
  Campania,
  Contratista,
  ID,
  Insumo,
  Liquidacion,
  Lote,
  ParteLabor,
  RecetaAgronomica,
} from './types'
import { evaluarParte } from './validacion'
import { semaforoVencimiento } from './verificacion'

/** Tono semántico (coincide con los tonos de la UI). */
export type Tono = 'verde' | 'trigo' | 'rojo' | 'cielo' | 'tierra' | 'neutro'

/** Estado de labores de un lote en la campaña, para colorear el mapa del panel. */
export function estadoLote(lote: Lote, partes: ParteLabor[], campania: Campania): { tono: Tono; etiqueta: string } | undefined {
  const delLote = partes.filter((p) => p.loteId === lote.id && p.campania === campania && p.estado !== 'borrador' && p.estado !== 'rechazado')
  if (delLote.length === 0) return { tono: 'neutro', etiqueta: 'Sin labores' }
  if (delLote.some((p) => p.estado === 'en_disputa')) return { tono: 'rojo', etiqueta: 'En disputa' }
  if (delLote.some((p) => p.labor === 'pulverizacion' && !p.recetaId && p.estado !== 'rechazado')) return { tono: 'rojo', etiqueta: 'Sin receta' }
  if (delLote.some((p) => p.estado === 'observado' || p.validacion?.estado === 'observada')) return { tono: 'trigo', etiqueta: 'Observado' }
  if (delLote.some((p) => p.estado === 'enviado' || p.estado === 'pendiente_sync')) return { tono: 'cielo', etiqueta: 'Por conformar' }
  const ultima = [...delLote].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]
  return { tono: 'verde', etiqueta: ultima ? `Al día · ${fechaCorta(ultima.fecha)}` : 'Al día' }
}

export interface AlertaProductor {
  id: string
  severidad: 'peligro' | 'alerta' | 'info'
  titulo: string
  texto: string
  link: string
}

interface Contexto {
  productorId: ID
  partes: ParteLabor[]
  lotes: Lote[]
  insumos: Insumo[]
  recetas: RecetaAgronomica[]
  contratistas: Contratista[]
  liquidaciones: Liquidacion[]
  campania: Campania
}

/** Alertas del panel del productor, de mayor a menor gravedad. */
export function alertasProductor(ctx: Contexto): AlertaProductor[] {
  const alertas: AlertaProductor[] = []
  const propios = ctx.partes.filter((p) => p.productorId === ctx.productorId && p.campania === ctx.campania)
  const nombreLote = (id: ID) => ctx.lotes.find((l) => l.id === id)?.nombre ?? 'lote'

  for (const p of propios.filter((x) => x.estado === 'enviado' || x.estado === 'conformado')) {
    const hallazgos = evaluarParte(p, ctx.insumos, ctx.lotes.find((l) => l.id === p.loteId), ctx.recetas.find((r) => r.id === p.recetaId))
    if (hallazgos.some((h) => h.codigo === 'sin_receta')) {
      alertas.push({ id: `rec-${p.id}`, severidad: 'peligro', titulo: 'Aplicación sin receta asociada', texto: `${p.numero} · ${etiquetaLabor[p.labor]} en ${nombreLote(p.loteId)}.`, link: `/productor/partes/${p.id}` })
    }
    const has = hallazgos.find((h) => h.codigo === 'has_excedidas')
    if (has && p.estado === 'enviado') {
      alertas.push({ id: `has-${p.id}`, severidad: 'alerta', titulo: 'Hectáreas de más en un parte', texto: `${p.numero}: ${has.texto}`, link: `/productor/partes/${p.id}` })
    }
    if (p.validacion?.estado === 'observada') {
      alertas.push({ id: `val-${p.id}`, severidad: 'alerta', titulo: 'Aplicación observada por el ingeniero', texto: `${p.numero} en ${nombreLote(p.loteId)}: ${p.validacion.nota ?? ''}`, link: `/productor/partes/${p.id}` })
    }
  }

  // F8: contratistas que trabajan en mis lotes con documentación por vencer.
  const contratados = new Set(propios.map((p) => p.contratistaId))
  for (const c of ctx.contratistas.filter((x) => contratados.has(x.id))) {
    for (const d of c.documentos.filter((x) => x.estado === 'aprobado' && semaforoVencimiento(x.vence) !== 'verde' && semaforoVencimiento(x.vence) !== 'gris')) {
      const dias = diasHasta(d.vence ?? '')
      const nombre = d.tipo === 'art' ? 'ART' : d.tipo === 'seguro_maquinaria' ? 'seguro de maquinaria' : 'documentación'
      alertas.push({
        id: `doc-${c.id}-${d.id}`,
        severidad: dias < 0 ? 'peligro' : 'info',
        titulo: `${c.razonSocial}: ${nombre} ${dias < 0 ? 'vencida' : `vence ${relativo(dias)}`}`,
        texto: dias < 0 ? 'No debería ingresar al campo hasta regularizar.' : 'Ya le avisamos. Si lo vas a contratar estos días, confirmá la renovación.',
        link: `/productor/contratistas/${c.id}`,
      })
    }
  }

  for (const l of ctx.liquidaciones.filter((x) => x.productorId === ctx.productorId)) {
    const e = estadoCobro(l)
    const dias = diasHasta(l.vencimiento)
    if (e === 'vencido' && l.estado !== 'pago_informado') {
      alertas.push({ id: `liq-${l.id}`, severidad: 'peligro', titulo: `Liquidación ${l.numero} vencida`, texto: `${pesos(saldo(l))} · venció ${relativo(dias)}.`, link: `/productor/pagos/${l.id}` })
    } else if (e === 'a_vencer' && dias <= 7 && l.estado !== 'pago_informado' && l.estado !== 'emitida' && l.estado !== 'observada') {
      alertas.push({ id: `liq-${l.id}`, severidad: 'alerta', titulo: `${l.numero} vence ${relativo(dias)}`, texto: `${pesos(saldo(l))} a pagar.`, link: `/productor/pagos/${l.id}` })
    }
  }

  const peso = { peligro: 0, alerta: 1, info: 2 }
  return alertas.sort((a, b) => peso[a.severidad] - peso[b.severidad])
}

/** Costo de un parte: el liquidado si existe, si no la tarifa de referencia (estimado). */
export function costoParte(p: ParteLabor, liquidaciones: Liquidacion[], contratista: Contratista | undefined): { monto: number; estimado: boolean } {
  const liq = liquidaciones.find((l) => l.id === p.liquidacionId)
  const item = liq?.items.find((i) => i.parteId === p.id)
  if (item) return { monto: item.cantidad * item.precioUnitario, estimado: false }
  if (!contratista) return { monto: 0, estimado: true }
  const t = tarifaPara(contratista, p.labor)
  return { monto: t.unidad === 'ha' ? t.precio * p.has : t.precio * p.horas, estimado: true }
}

/** Saldo a pagar del productor (liquidaciones no cobradas). */
export function saldoAPagar(liquidaciones: Liquidacion[], productorId: ID): { total: number; vencido: number; proximos: Liquidacion[] } {
  const propias = liquidaciones.filter((l) => l.productorId === productorId && l.estado !== 'cobrada')
  return {
    total: propias.reduce((s, l) => s + saldo(l), 0),
    vencido: propias.filter((l) => estadoCobro(l) === 'vencido' || estadoCobro(l) === 'en_disputa').reduce((s, l) => s + saldo(l), 0),
    proximos: propias.filter((l) => estadoCobro(l) === 'a_vencer').sort((a, b) => a.vencimiento.localeCompare(b.vencimiento)),
  }
}

export function resumenLiquidacion(l: Liquidacion): string {
  return `${l.numero} · ${pesos(total(l))} · ${num(l.items.reduce((s, i) => s + i.cantidad, 0), 1)} has`
}
