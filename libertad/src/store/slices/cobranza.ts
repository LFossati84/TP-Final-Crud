import { calendarioRecordatorios, ETIQUETA_RECORDATORIO, saldo, total } from '@/domain/cobranza'
import { fecha, pesos } from '@/domain/format'
import { ahora, diasHasta, HOY } from '@/domain/reloj'
import type {
  Cobro,
  Conversacion,
  Disputa,
  ID,
  ItemLiquidacion,
  Liquidacion,
  MedioPago,
  Rol,
} from '@/domain/types'
import { nuevoId, notificacion, reemplazar, siguienteNumero } from '../helpers'
import type { DemoState, Slice } from '../tipos'

export type DatosLiquidacion = Pick<
  Liquidacion,
  'contratistaId' | 'productorId' | 'periodo' | 'items' | 'alicuotaIva' | 'condicion' | 'vencimiento' | 'recordatoriosAutomaticos'
>

export interface AccionesCobranza {
  crearLiquidacion: (d: DatosLiquidacion) => Liquidacion
  aceptarLiquidacion: (id: ID) => void
  observarLiquidacion: (id: ID, texto: string) => void
  corregirLiquidacion: (id: ID, items: ItemLiquidacion[], alicuotaIva: number) => void
  enviarRecordatorio: (id: ID, texto: string) => void
  setRecordatoriosAutomaticos: (id: ID, activos: boolean) => void
  informarPago: (id: ID, pago: { monto: number; medio: MedioPago; comprobante: string }) => void
  registrarCobro: (id: ID, cobro: Omit<Cobro, 'id' | 'fecha'>) => void
  abrirDisputa: (liquidacionId: ID, por: Rol, motivo: string) => Disputa | null
  mensajeDisputa: (id: ID, autor: Rol, nombre: string, texto: string) => void
  intervenirDisputa: (id: ID, texto: string) => void
  resolverDisputa: (id: ID, resolucion: string) => void
}

function nombres(s: DemoState, l: Pick<Liquidacion, 'contratistaId' | 'productorId'>) {
  return {
    contratista: s.contratistas.find((c) => c.id === l.contratistaId)?.razonSocial ?? 'El contratista',
    productor: s.productores.find((p) => p.id === l.productorId)?.razonSocial ?? 'El productor',
  }
}

/** Recordatorios automáticos que todavía no ocurrieron (según el reloj de la demo). */
function programados(vencimiento: string): Liquidacion['recordatorios'] {
  return calendarioRecordatorios(vencimiento)
    .filter((r) => diasHasta(r.fecha) >= 0)
    .map((r) => ({ id: nuevoId('rc'), fecha: r.fecha, tipo: r.tipo, estado: 'programado' as const, mensaje: `Recordatorio automático: ${ETIQUETA_RECORDATORIO[r.tipo].toLowerCase()}.` }))
}

export const crearSliceCobranza: Slice<AccionesCobranza> = (set, get) => ({
  crearLiquidacion: (d) => {
    const s = get()
    const liq: Liquidacion = {
      ...d,
      id: nuevoId('lq'),
      numero: siguienteNumero(s.liquidaciones.map((l) => l.numero), 'LQ'),
      fechaEmision: HOY,
      estado: 'emitida',
      cobros: [],
      recordatorios: d.recordatoriosAutomaticos ? programados(d.vencimiento) : [],
    }
    const partesIds = new Set(d.items.map((i) => i.parteId).filter(Boolean))
    const n = nombres(s, d)
    set((st) => ({
      liquidaciones: [liq, ...st.liquidaciones],
      partes: st.partes.map((p) => (partesIds.has(p.id) ? { ...p, liquidacionId: liq.id } : p)),
      notificaciones: [
        notificacion('productor', d.productorId, 'info', `Nueva liquidación ${liq.numero}`, `${n.contratista} · ${pesos(total(liq))} · vence el ${fecha(liq.vencimiento)}.`, `/productor/pagos/${liq.id}`),
        ...st.notificaciones,
      ],
    }))
    return liq
  },

  aceptarLiquidacion: (id) =>
    set((s) => {
      const l = s.liquidaciones.find((x) => x.id === id)
      if (!l) return {}
      return {
        liquidaciones: reemplazar(s.liquidaciones, id, (x) => ({ ...x, estado: 'aceptada', aceptadaEl: HOY, observacion: undefined })),
        notificaciones: [
          notificacion('contratista', l.contratistaId, 'ok', `${l.numero} aceptada`, `${nombres(s, l).productor} aceptó la liquidación por ${pesos(total(l))}.`, `/contratista/cobros/${l.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  observarLiquidacion: (id, texto) =>
    set((s) => {
      const l = s.liquidaciones.find((x) => x.id === id)
      if (!l) return {}
      return {
        liquidaciones: reemplazar(s.liquidaciones, id, (x) => ({ ...x, estado: 'observada', observacion: texto })),
        notificaciones: [
          notificacion('contratista', l.contratistaId, 'alerta', `${l.numero} observada`, texto, `/contratista/cobros/${l.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  corregirLiquidacion: (id, items, alicuotaIva) =>
    set((s) => {
      const l = s.liquidaciones.find((x) => x.id === id)
      if (!l) return {}
      return {
        liquidaciones: reemplazar(s.liquidaciones, id, (x) => ({ ...x, items, alicuotaIva, estado: 'emitida', observacion: undefined })),
        notificaciones: [
          notificacion('productor', l.productorId, 'info', `${l.numero} corregida`, `${nombres(s, l).contratista} reenvió la liquidación corregida.`, `/productor/pagos/${l.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  enviarRecordatorio: (id, texto) =>
    set((s) => {
      const l = s.liquidaciones.find((x) => x.id === id)
      if (!l) return {}
      const mensaje = { id: nuevoId('w'), autor: 'contratista' as const, texto, fecha: ahora(), estado: 'entregado' as const }
      const existe = s.conversaciones.find((c) => c.contratistaId === l.contratistaId && c.productorId === l.productorId)
      const conversaciones: Conversacion[] = existe
        ? reemplazar(s.conversaciones, existe.id, (c) => ({ ...c, mensajes: [...c.mensajes, mensaje] }))
        : [...s.conversaciones, { id: nuevoId('cv'), contratistaId: l.contratistaId, productorId: l.productorId, mensajes: [mensaje] }]
      return {
        conversaciones,
        liquidaciones: reemplazar(s.liquidaciones, id, (x) => ({
          ...x,
          recordatorios: [...x.recordatorios, { id: nuevoId('rc'), fecha: HOY, tipo: 'manual', estado: 'enviado', mensaje: texto }],
        })),
        notificaciones: [
          notificacion('productor', l.productorId, 'alerta', `Recordatorio de pago · ${l.numero}`, `${nombres(s, l).contratista}: saldo ${pesos(saldo(l))}.`, `/productor/pagos/${l.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  setRecordatoriosAutomaticos: (id, activos) =>
    set((s) => ({
      liquidaciones: reemplazar(s.liquidaciones, id, (x) => ({
        ...x,
        recordatoriosAutomaticos: activos,
        recordatorios: activos
          ? [...x.recordatorios.filter((r) => r.estado === 'enviado'), ...programados(x.vencimiento)]
          : x.recordatorios.filter((r) => r.estado === 'enviado'),
      })),
    })),

  informarPago: (id, pago) =>
    set((s) => {
      const l = s.liquidaciones.find((x) => x.id === id)
      if (!l) return {}
      return {
        liquidaciones: reemplazar(s.liquidaciones, id, (x) => ({ ...x, estado: 'pago_informado', pagoInformado: { ...pago, fecha: HOY } })),
        notificaciones: [
          notificacion('contratista', l.contratistaId, 'ok', `${nombres(s, l).productor} informó un pago`, `${l.numero} · ${pesos(pago.monto)} por ${pago.medio}. Confirmá el cobro.`, `/contratista/cobros/${l.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  registrarCobro: (id, datos) =>
    set((s) => {
      const l = s.liquidaciones.find((x) => x.id === id)
      if (!l) return {}
      const cobro: Cobro = { ...datos, id: nuevoId('cb'), fecha: HOY }
      const actualizada: Liquidacion = { ...l, cobros: [...l.cobros, cobro], pagoInformado: undefined }
      const restante = saldo(actualizada)
      actualizada.estado = restante <= 0.5 ? 'cobrada' : 'cobrada_parcial'
      actualizada.recordatorios = restante <= 0.5 ? actualizada.recordatorios.filter((r) => r.estado === 'enviado') : actualizada.recordatorios
      return {
        liquidaciones: reemplazar(s.liquidaciones, id, () => actualizada),
        notificaciones: [
          notificacion(
            'productor',
            l.productorId,
            'ok',
            restante <= 0.5 ? `${l.numero} conciliada` : `Pago parcial registrado · ${l.numero}`,
            restante <= 0.5 ? `${nombres(s, l).contratista} confirmó el cobro total.` : `Saldo pendiente: ${pesos(restante)}.`,
            `/productor/pagos/${l.id}`,
          ),
          ...s.notificaciones,
        ],
      }
    }),

  abrirDisputa: (liquidacionId, por, motivo) => {
    const s = get()
    const l = s.liquidaciones.find((x) => x.id === liquidacionId)
    if (!l) return null
    const n = nombres(s, l)
    const disputa: Disputa = {
      id: nuevoId('dp'),
      numero: siguienteNumero(s.disputas.map((d) => d.numero), 'DP'),
      contratistaId: l.contratistaId,
      productorId: l.productorId,
      liquidacionId,
      abiertaPor: por,
      fecha: HOY,
      motivo,
      monto: saldo(l),
      estado: 'abierta',
      mensajes: [{ fecha: ahora(), autor: por, nombre: por === 'contratista' ? n.contratista : n.productor, texto: motivo }],
    }
    const otro: Rol = por === 'contratista' ? 'productor' : 'contratista'
    set((st) => ({
      disputas: [disputa, ...st.disputas],
      liquidaciones: reemplazar(st.liquidaciones, liquidacionId, (x) => ({ ...x, estado: 'en_disputa', disputaId: disputa.id })),
      notificaciones: [
        notificacion('admin', undefined, 'peligro', `Nueva disputa ${disputa.numero}`, `${n.contratista} / ${n.productor} · ${l.numero} · ${pesos(saldo(l))}.`, '/admin/disputas'),
        notificacion(otro, otro === 'contratista' ? l.contratistaId : l.productorId, 'alerta', `Se abrió la disputa ${disputa.numero}`, motivo, otro === 'contratista' ? `/contratista/cobros/${l.id}` : `/productor/pagos/${l.id}`),
        ...st.notificaciones,
      ],
    }))
    return disputa
  },

  mensajeDisputa: (id, autor, nombre, texto) =>
    set((s) => ({
      disputas: reemplazar(s.disputas, id, (d) => ({ ...d, mensajes: [...d.mensajes, { fecha: ahora(), autor, nombre, texto }] })),
    })),

  intervenirDisputa: (id, texto) =>
    set((s) => {
      const d = s.disputas.find((x) => x.id === id)
      if (!d) return {}
      return {
        disputas: reemplazar(s.disputas, id, (x) => ({
          ...x,
          estado: 'en_mediacion',
          mensajes: [...x.mensajes, { fecha: ahora(), autor: 'admin', nombre: 'Mesa de ayuda Libertad', texto }],
        })),
        notificaciones: [
          notificacion('contratista', d.contratistaId, 'info', `${d.numero}: la red tomó la mediación`, texto),
          notificacion('productor', d.productorId, 'info', `${d.numero}: la red tomó la mediación`, texto),
          ...s.notificaciones,
        ],
      }
    }),

  resolverDisputa: (id, resolucion) =>
    set((s) => {
      const d = s.disputas.find((x) => x.id === id)
      if (!d) return {}
      return {
        disputas: reemplazar(s.disputas, id, (x) => ({
          ...x,
          estado: 'resuelta',
          resolucion,
          mensajes: [...x.mensajes, { fecha: ahora(), autor: 'admin', nombre: 'Mesa de ayuda Libertad', texto: `Disputa resuelta: ${resolucion}` }],
        })),
        liquidaciones: d.liquidacionId
          ? reemplazar(s.liquidaciones, d.liquidacionId, (l) => ({ ...l, estado: saldo(l) <= 0.5 ? 'cobrada' : 'aceptada' }))
          : s.liquidaciones,
        partes: d.parteId ? reemplazar(s.partes, d.parteId, (p) => (p.estado === 'en_disputa' ? { ...p, estado: 'conformado' } : p)) : s.partes,
        notificaciones: [
          notificacion('contratista', d.contratistaId, 'ok', `${d.numero} resuelta`, resolucion),
          notificacion('productor', d.productorId, 'ok', `${d.numero} resuelta`, resolucion),
          ...s.notificaciones,
        ],
      }
    }),
})
