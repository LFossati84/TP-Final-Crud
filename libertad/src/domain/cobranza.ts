import { diasHasta, sumarDias } from './reloj'
import type {
  CondicionPago,
  ParteLabor,
  Contratista,
  EstadoCobro,
  FechaISO,
  Liquidacion,
  Productor,
  TipoLabor,
  TipoRecordatorio,
  UnidadTarifa,
} from './types'
import { fecha, pesos } from './format'

export const NOTA_COBRANZA =
  'Demo ilustrativa: no procesa pagos ni emite comprobantes fiscales. Los tratamientos impositivos deben validarse con un contador'
export const LEYENDA_COMPROBANTE = 'Documento de gestión – no reemplaza la factura electrónica ARCA'

/** Alícuota sugerida para servicios de labores agrícolas (editable en cada liquidación). */
export const IVA_SUGERIDO = 10.5

export function subtotal(l: Pick<Liquidacion, 'items'>): number {
  return l.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)
}

export function iva(l: Pick<Liquidacion, 'items' | 'alicuotaIva'>): number {
  return (subtotal(l) * l.alicuotaIva) / 100
}

export function total(l: Pick<Liquidacion, 'items' | 'alicuotaIva'>): number {
  return subtotal(l) + iva(l)
}

export function cobrado(l: Pick<Liquidacion, 'cobros'>): number {
  return l.cobros.reduce((s, c) => s + c.monto, 0)
}

export function saldo(l: Liquidacion): number {
  return Math.max(0, total(l) - cobrado(l))
}

export function estadoCobro(l: Liquidacion): EstadoCobro {
  if (l.estado === 'cobrada') return 'cobrado'
  if (l.estado === 'en_disputa') return 'en_disputa'
  return diasHasta(l.vencimiento) < 0 ? 'vencido' : 'a_vencer'
}

/** Días de atraso (0 si no está vencida). */
export function diasVencida(l: Liquidacion): number {
  if (estadoCobro(l) !== 'vencido') return 0
  return -diasHasta(l.vencimiento)
}

export type TramoMora = '1–15 días' | '16–30 días' | '31–60 días' | 'Más de 60 días'
export const TRAMOS_MORA: TramoMora[] = ['1–15 días', '16–30 días', '31–60 días', 'Más de 60 días']

export function tramoMora(dias: number): TramoMora {
  if (dias <= 15) return '1–15 días'
  if (dias <= 30) return '16–30 días'
  if (dias <= 60) return '31–60 días'
  return 'Más de 60 días'
}

export function diasPorCondicion(c: CondicionPago): number {
  switch (c) {
    case 'contado':
      return 0
    case 'transferencia':
      return 7
    case '15_dias':
      return 15
    case '30_dias':
    case 'echeq':
      return 30
    case 'cheque_a_fecha':
      return 45
    case '60_dias':
      return 60
  }
}

export function vencimientoSugerido(emision: FechaISO, c: CondicionPago): FechaISO {
  return sumarDias(emision, diasPorCondicion(c))
}

export function tarifaPara(c: Contratista, labor: TipoLabor): { precio: number; unidad: UnidadTarifa } {
  const t = c.tarifas.find((x) => x.labor === labor)
  return t ? { precio: t.precio, unidad: t.unidad } : { precio: 0, unidad: 'ha' }
}

export const ETIQUETA_RECORDATORIO: Record<TipoRecordatorio, string> = {
  manual: 'Enviado a mano',
  auto_3_antes: '3 días antes del vencimiento',
  auto_dia: 'El día del vencimiento',
  auto_7_despues: '7 días después del vencimiento',
}

export function calendarioRecordatorios(vencimiento: FechaISO): { tipo: TipoRecordatorio; fecha: FechaISO }[] {
  return [
    { tipo: 'auto_3_antes', fecha: sumarDias(vencimiento, -3) },
    { tipo: 'auto_dia', fecha: vencimiento },
    { tipo: 'auto_7_despues', fecha: sumarDias(vencimiento, 7) },
  ]
}

export function plantillaRecordatorio(l: Liquidacion, p: Productor, c: Contratista, tipo: TipoRecordatorio): string {
  const nombre = p.contacto.split(' ')[0] ?? p.contacto
  const monto = pesos(saldo(l))
  const firma = `${c.titular.split(' ')[0] ?? c.titular} – ${c.razonSocial}`
  if (tipo === 'auto_3_antes') {
    return `Hola ${nombre}, ¿cómo va? Te recuerdo que la liquidación ${l.numero} por ${monto} vence el ${fecha(l.vencimiento)}. Cualquier duda me avisás. Saludos, ${firma}.`
  }
  if (tipo === 'auto_dia') {
    return `Hola ${nombre}, hoy vence la liquidación ${l.numero} por ${monto}. Si ya la pagaste, podés marcarla como pagada desde la plataforma. ¡Gracias! ${firma}.`
  }
  const dias = diasVencida(l)
  return `Hola ${nombre}, la liquidación ${l.numero} por ${monto} figura vencida${dias > 0 ? ` hace ${dias} días` : ''}. ¿Me confirmás cuándo podés pagarla? Si hay algo que revisar, lo vemos. Saludos, ${firma}.`
}

export interface MovimientoCuenta {
  fecha: FechaISO
  concepto: string
  debe: number
  haber: number
  saldo: number
  liquidacionId: string
}

/** Cuenta corriente de un productor con un contratista, en orden cronológico. */
export function cuentaCorriente(liquidaciones: Liquidacion[]): MovimientoCuenta[] {
  const movs: Omit<MovimientoCuenta, 'saldo'>[] = []
  for (const l of liquidaciones) {
    movs.push({ fecha: l.fechaEmision, concepto: `Liquidación ${l.numero}`, debe: total(l), haber: 0, liquidacionId: l.id })
    for (const c of l.cobros) {
      movs.push({ fecha: c.fecha, concepto: `Cobro ${l.numero}`, debe: 0, haber: c.monto, liquidacionId: l.id })
    }
  }
  movs.sort((a, b) => a.fecha.localeCompare(b.fecha))
  let acumulado = 0
  return movs.map((m) => {
    acumulado += m.debe - m.haber
    return { ...m, saldo: acumulado }
  })
}

/** Un parte conformado que todavía no está en ninguna liquidación. */
export function listoParaCobrar(p: ParteLabor): boolean {
  return p.estado === 'conformado' && !p.liquidacionId
}

export interface ResumenCobros {
  aCobrar: number
  vencido: number
  cobradoMes: number
  listos: number
  pagosInformados: number
}

/** Tablero de cobros del contratista (montos con IVA). `mes` = 'YYYY-MM'. */
export function resumenCobros(liquidaciones: Liquidacion[], partes: ParteLabor[], contratistaId: string, mes: string): ResumenCobros {
  const propias = liquidaciones.filter((l) => l.contratistaId === contratistaId)
  let aCobrar = 0
  let vencido = 0
  let cobradoMes = 0
  for (const l of propias) {
    const e = estadoCobro(l)
    if (e === 'a_vencer') aCobrar += saldo(l)
    if (e === 'vencido' || e === 'en_disputa') vencido += saldo(l)
    for (const c of l.cobros) if (c.fecha.startsWith(mes)) cobradoMes += c.monto
  }
  return {
    aCobrar,
    vencido,
    cobradoMes,
    listos: partes.filter((p) => p.contratistaId === contratistaId && listoParaCobrar(p)).length,
    pagosInformados: propias.filter((l) => l.estado === 'pago_informado').length,
  }
}
