import {
  etiquetaEstadoCobro,
  etiquetaEstadoLiquidacion,
  etiquetaEstadoParte,
} from '@/domain/format'
import type {
  EstadoCobro,
  EstadoDocumento,
  EstadoLiquidacion,
  EstadoParte,
  EstadoValidacion,
} from '@/domain/types'
import type { Semaforo } from '@/domain/verificacion'
import type { Tono } from './tonos'
import type { NombreIcono } from './Icon'

export type Def = { tono: Tono; icono: NombreIcono; texto: string }

export const ESTADO_PARTE: Record<EstadoParte, Def> = {
  borrador: { tono: 'neutro', icono: 'editar', texto: etiquetaEstadoParte.borrador },
  pendiente_sync: { tono: 'trigo', icono: 'nubeOff', texto: etiquetaEstadoParte.pendiente_sync },
  enviado: { tono: 'cielo', icono: 'enviar', texto: etiquetaEstadoParte.enviado },
  observado: { tono: 'trigo', icono: 'alerta', texto: etiquetaEstadoParte.observado },
  conformado: { tono: 'verde', icono: 'checkCirculo', texto: etiquetaEstadoParte.conformado },
  rechazado: { tono: 'rojo', icono: 'xCirculo', texto: etiquetaEstadoParte.rechazado },
  en_disputa: { tono: 'rojo', icono: 'balanza', texto: etiquetaEstadoParte.en_disputa },
}

export const ESTADO_LIQUIDACION: Record<EstadoLiquidacion, Def> = {
  emitida: { tono: 'cielo', icono: 'enviar', texto: etiquetaEstadoLiquidacion.emitida },
  aceptada: { tono: 'verde', icono: 'check', texto: etiquetaEstadoLiquidacion.aceptada },
  observada: { tono: 'trigo', icono: 'alerta', texto: etiquetaEstadoLiquidacion.observada },
  pago_informado: { tono: 'cielo', icono: 'clip', texto: etiquetaEstadoLiquidacion.pago_informado },
  cobrada_parcial: { tono: 'trigo', icono: 'porcentaje', texto: etiquetaEstadoLiquidacion.cobrada_parcial },
  cobrada: { tono: 'verde', icono: 'checkCirculo', texto: etiquetaEstadoLiquidacion.cobrada },
  en_disputa: { tono: 'rojo', icono: 'balanza', texto: etiquetaEstadoLiquidacion.en_disputa },
}

export const ESTADO_COBRO: Record<EstadoCobro, Def> = {
  a_vencer: { tono: 'cielo', icono: 'reloj', texto: etiquetaEstadoCobro.a_vencer },
  vencido: { tono: 'rojo', icono: 'alerta', texto: etiquetaEstadoCobro.vencido },
  cobrado: { tono: 'verde', icono: 'checkCirculo', texto: etiquetaEstadoCobro.cobrado },
  en_disputa: { tono: 'rojo', icono: 'balanza', texto: etiquetaEstadoCobro.en_disputa },
}

export const ESTADO_DOCUMENTO: Record<EstadoDocumento, Def> = {
  aprobado: { tono: 'verde', icono: 'checkCirculo', texto: 'Aprobado' },
  pendiente: { tono: 'cielo', icono: 'reloj', texto: 'En revisión' },
  observado: { tono: 'trigo', icono: 'alerta', texto: 'Corregir' },
  rechazado: { tono: 'rojo', icono: 'xCirculo', texto: 'Rechazado' },
}

export const ESTADO_VALIDACION: Record<EstadoValidacion, Def> = {
  pendiente: { tono: 'cielo', icono: 'reloj', texto: 'Validación pendiente' },
  validada: { tono: 'verde', icono: 'sello', texto: 'Validada' },
  observada: { tono: 'trigo', icono: 'alerta', texto: 'Observada por el ingeniero' },
}

export const SEMAFORO: Record<Semaforo, Def> = {
  verde: { tono: 'verde', icono: 'checkCirculo', texto: 'Vigente' },
  amarillo: { tono: 'trigo', icono: 'reloj', texto: 'Por vencer' },
  rojo: { tono: 'rojo', icono: 'alerta', texto: 'Vencido' },
  gris: { tono: 'neutro', icono: 'info', texto: 'Sin vencimiento' },
}

