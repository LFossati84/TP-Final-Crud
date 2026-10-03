import type {
  CondicionPago,
  Cultivo,
  EstadoCobro,
  EstadoLiquidacion,
  EstadoParte,
  FechaHoraISO,
  FechaISO,
  MedioPago,
  MotivoObservacion,
  NivelVerificacion,
  Rol,
  TipoDocumento,
  TipoLabor,
  TipoMaquina,
  UnidadTarifa,
} from './types'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const monedaCompacta = new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 })
const numero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 })
const numero1 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })

export function pesos(n: number): string {
  return moneda.format(Math.round(n))
}

/** $ 12,4 M — para tarjetas de resumen. */
export function pesosCompacto(n: number): string {
  return `$ ${monedaCompacta.format(n)}`
}

export function num(n: number, decimales = 2): string {
  return decimales === 1 ? numero1.format(n) : numero.format(n)
}

export function has(n: number): string {
  return `${numero1.format(n)} has`
}

export function porcentaje(n: number, decimales = 0): string {
  return `${(n * 100).toFixed(decimales).replace('.', ',')} %`
}

function partes(fecha: FechaISO): [number, number, number] {
  const [a, m, d] = fecha.slice(0, 10).split('-').map(Number)
  return [a ?? 1970, m ?? 1, d ?? 1]
}

/** 15/10/2026 */
export function fecha(f: FechaISO): string {
  const [a, m, d] = partes(f)
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`
}

/** 15 oct */
export function fechaCorta(f: FechaISO): string {
  const [, m, d] = partes(f)
  return `${d} ${MESES[m - 1] ?? ''}`
}

/** 15 de octubre de 2026 */
export function fechaLarga(f: FechaISO): string {
  const [a, m, d] = partes(f)
  return `${d} de ${MESES_LARGOS[m - 1] ?? ''} de ${a}`
}

/** mié 15 oct */
export function fechaConDia(f: FechaISO): string {
  const [a, m, d] = partes(f)
  const dia = new Date(Date.UTC(a, m - 1, d)).getUTCDay()
  return `${DIAS[dia] ?? ''} ${d} ${MESES[m - 1] ?? ''}`
}

export function mesLargo(m: number): string {
  return MESES_LARGOS[m - 1] ?? ''
}

/** 15/10/2026 · 08:40 */
export function fechaHora(f: FechaHoraISO): string {
  const hora = f.slice(11, 16)
  return hora ? `${fecha(f)} · ${hora}` : fecha(f)
}

export function hora(f: FechaHoraISO): string {
  return f.slice(11, 16)
}

/** "hoy", "ayer", "hace 3 días", "en 5 días" */
export function relativo(dias: number): string {
  if (dias === 0) return 'hoy'
  if (dias === -1) return 'ayer'
  if (dias === 1) return 'mañana'
  if (dias < 0) return `hace ${-dias} días`
  return `en ${dias} días`
}

export function plural(n: number, singular: string, pluralForma = `${singular}s`): string {
  return `${num(n, 1)} ${n === 1 ? singular : pluralForma}`
}

/** '2025/26' ⇄ '2025-26' (para usar la campaña en una URL). */
export function slugCampania(c: string): string {
  return c.replace('/', '-')
}

export function campaniaDeSlug(s: string | undefined): '2025/26' | '2026/27' {
  return s === '2025-26' ? '2025/26' : '2026/27'
}

// ───────────────────────── Etiquetas del dominio ─────────────────────────

export const etiquetaRol: Record<Rol, string> = {
  contratista: 'Contratista',
  productor: 'Productor',
  ingeniero: 'Ingeniero agrónomo',
  admin: 'Administrador',
}

export const etiquetaLabor: Record<TipoLabor, string> = {
  siembra: 'Siembra',
  pulverizacion: 'Pulverización',
  fertilizacion: 'Fertilización',
  cosecha: 'Cosecha',
  laboreo: 'Laboreo',
}

export const etiquetaCultivo: Record<Cultivo | 'barbecho', string> = {
  soja: 'Soja',
  soja2: 'Soja de 2.ª',
  maiz: 'Maíz',
  trigo: 'Trigo',
  barbecho: 'Barbecho',
}

export const etiquetaEstadoParte: Record<EstadoParte, string> = {
  borrador: 'Borrador',
  pendiente_sync: 'Sin sincronizar',
  enviado: 'Enviado',
  observado: 'Observado',
  conformado: 'Conformado',
  rechazado: 'Rechazado',
  en_disputa: 'En disputa',
}

export const etiquetaEstadoLiquidacion: Record<EstadoLiquidacion, string> = {
  emitida: 'Enviada',
  aceptada: 'Aceptada',
  observada: 'Observada',
  pago_informado: 'Pago informado',
  cobrada_parcial: 'Cobro parcial',
  cobrada: 'Cobrada',
  en_disputa: 'En disputa',
}

export const etiquetaEstadoCobro: Record<EstadoCobro, string> = {
  a_vencer: 'A vencer',
  vencido: 'Vencido',
  cobrado: 'Cobrado',
  en_disputa: 'En disputa',
}

export const etiquetaNivel: Record<NivelVerificacion, string> = {
  basico: 'Básico',
  verificado: 'Verificado',
  destacado: 'Destacado',
}

export const etiquetaDocumento: Record<TipoDocumento, string> = {
  identidad: 'Identidad del titular',
  cuit: 'CUIT activo',
  situacion_impositiva: 'Situación impositiva regular',
  art: 'ART vigente',
  seguro_maquinaria: 'Seguro de maquinaria',
  habilitacion_aplicador: 'Habilitación de aplicador',
}

/** Nombre corto para avisos ("Tu ART vence…"). */
export const etiquetaDocumentoCorta: Record<TipoDocumento, string> = {
  identidad: 'Identidad',
  cuit: 'CUIT',
  situacion_impositiva: 'Constancia fiscal',
  art: 'ART',
  seguro_maquinaria: 'Seguro de maquinaria',
  habilitacion_aplicador: 'Habilitación de aplicador',
}

export const etiquetaCondicionPago: Record<CondicionPago, string> = {
  contado: 'Contado',
  '15_dias': '15 días',
  '30_dias': '30 días',
  '60_dias': '60 días',
  cheque_a_fecha: 'Cheque a fecha',
  echeq: 'e-cheq',
  transferencia: 'Transferencia',
}

export const etiquetaMedioPago: Record<MedioPago, string> = {
  transferencia: 'Transferencia',
  echeq: 'e-cheq',
  cheque: 'Cheque',
  efectivo: 'Efectivo',
  canje_granos: 'Canje de granos',
}

export const etiquetaMotivoObservacion: Record<MotivoObservacion, string> = {
  hectareas: 'Hectáreas',
  fecha: 'Fecha u horario',
  insumos: 'Insumos o dosis',
  condiciones: 'Condiciones de aplicación',
  lote: 'Lote equivocado',
  otro: 'Otro',
}

export const etiquetaMaquina: Record<TipoMaquina, string> = {
  pulverizadora_autopropulsada: 'Pulverizadora autopropulsada',
  pulverizadora_arrastre: 'Pulverizadora de arrastre',
  sembradora: 'Sembradora',
  cosechadora: 'Cosechadora',
  fertilizadora: 'Fertilizadora',
  tolva: 'Tolva autodescargable',
  tractor: 'Tractor',
  rastra: 'Rastra / laboreo',
}

export function etiquetaUnidad(u: UnidadTarifa): string {
  return u === 'ha' ? 'por ha' : 'por hora'
}
