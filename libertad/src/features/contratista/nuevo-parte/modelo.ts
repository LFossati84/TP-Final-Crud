import { CAMPANIA_ACTIVA, ahora, HOY, horaActual } from '@/domain/reloj'
import { esAplicacion } from '@/domain/validacion'
import type {
  CondicionesAplicacion,
  Contratista,
  Establecimiento,
  Foto,
  ID,
  InsumoAplicado,
  Lote,
  ParteLabor,
  RecetaAgronomica,
  TipoLabor,
} from '@/domain/types'
import type { TrabajoAgenda } from '@/data'
import { centroide } from '@/maps/geometria'
import { nuevoId } from '@/store/helpers'

/** Estado editable del asistente "Nuevo parte". */
export interface BorradorParte {
  id: ID
  numero: string
  establecimientoId: ID | ''
  loteId: ID | ''
  labor: TipoLabor | ''
  maquinaId: ID | ''
  operario: string
  fecha: string
  horaInicio: string
  horaFin: string
  has: string
  insumos: InsumoAplicado[]
  condiciones: { caldo: string; viento: string; direccionViento: CondicionesAplicacion['direccionViento']; temperatura: string; humedad: string }
  recetaId: ID | ''
  notas: string
  fotos: Foto[]
  firma?: string
  /** Punto GPS simulado en coordenadas del mapa del establecimiento. */
  ubicacion?: [number, number]
}

export type ClavePaso = 'lote' | 'labor' | 'superficie' | 'insumos' | 'firma'

export const TITULOS_PASO: Record<ClavePaso, string> = {
  lote: 'Lote',
  labor: 'Labor',
  superficie: 'Superficie y horario',
  insumos: 'Insumos y condiciones',
  firma: 'Fotos y firma',
}

export function pasosPara(labor: TipoLabor | ''): ClavePaso[] {
  return labor && esAplicacion({ labor }) ? ['lote', 'labor', 'superficie', 'insumos', 'firma'] : ['lote', 'labor', 'superficie', 'firma']
}

function restarHoras(hora: string, horas: number): string {
  const [h = 0, m = 0] = hora.split(':').map(Number)
  const total = Math.max(5 * 60, h * 60 + m - horas * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function horasEntre(inicio: string, fin: string): number {
  const [hi = 0, mi = 0] = inicio.split(':').map(Number)
  const [hf = 0, mf = 0] = fin.split(':').map(Number)
  return Math.max(0, Math.round(((hf * 60 + mf - hi * 60 - mi) / 60) * 10) / 10)
}

export function maquinaPorDefecto(c: Contratista, labor: TipoLabor | ''): ID | '' {
  if (!labor) return ''
  return c.flota.find((m) => m.labores.includes(labor))?.id ?? ''
}

export function borradorVacio(c: Contratista): BorradorParte {
  const fin = horaActual()
  return {
    id: nuevoId('pt'),
    numero: '',
    establecimientoId: '',
    loteId: '',
    labor: c.servicios.length === 1 ? (c.servicios[0] ?? '') : '',
    maquinaId: c.servicios.length === 1 ? maquinaPorDefecto(c, c.servicios[0] ?? '') : '',
    operario: c.operarios[0] ?? c.titular,
    fecha: HOY,
    horaInicio: restarHoras(fin, 3),
    horaFin: fin < '06:00' ? '09:00' : fin,
    has: '',
    insumos: [],
    condiciones: { caldo: '', viento: '', direccionViento: 'NE', temperatura: '', humedad: '' },
    recetaId: '',
    notas: '',
    fotos: [],
  }
}

export function borradorDesdeAgenda(c: Contratista, a: TrabajoAgenda, lote: Lote | undefined, receta: RecetaAgronomica | undefined): BorradorParte {
  const b = borradorVacio(c)
  return {
    ...b,
    establecimientoId: lote?.establecimientoId ?? '',
    loteId: a.loteId,
    labor: a.labor,
    maquinaId: maquinaPorDefecto(c, a.labor),
    has: String(a.has),
    recetaId: receta?.id ?? '',
    insumos: receta ? receta.productos.map((p) => ({ ...p })) : [],
    condiciones: { ...b.condiciones, caldo: receta ? String(receta.caldoMin) : '' },
  }
}

export function borradorDesdeParte(p: ParteLabor): BorradorParte {
  return {
    id: p.id,
    numero: p.numero,
    establecimientoId: p.establecimientoId,
    loteId: p.loteId,
    labor: p.labor,
    maquinaId: p.maquinaId,
    operario: p.operario,
    fecha: p.fecha,
    horaInicio: p.horaInicio,
    horaFin: p.horaFin,
    has: String(p.has),
    insumos: p.insumos.map((i) => ({ ...i })),
    condiciones: {
      caldo: p.condiciones ? String(p.condiciones.caldo) : '',
      viento: p.condiciones ? String(p.condiciones.viento) : '',
      direccionViento: p.condiciones?.direccionViento ?? 'NE',
      temperatura: p.condiciones ? String(p.condiciones.temperatura) : '',
      humedad: p.condiciones ? String(p.condiciones.humedad) : '',
    },
    recetaId: p.recetaId ?? '',
    notas: p.notas ?? '',
    fotos: p.fotos,
    firma: p.firma?.trazo,
  }
}

export function aNumero(v: string): number {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

/** Errores que bloquean avanzar desde un paso. */
export function erroresPaso(paso: ClavePaso, b: BorradorParte): Partial<Record<string, string>> {
  const e: Partial<Record<string, string>> = {}
  if (paso === 'lote' && !b.loteId) e.lote = 'Elegí el lote en el mapa o usá tu ubicación.'
  if (paso === 'labor') {
    if (!b.labor) e.labor = 'Elegí el tipo de labor.'
    if (!b.maquinaId) e.maquina = 'Elegí la máquina.'
  }
  if (paso === 'superficie') {
    const h = aNumero(b.has)
    if (!(h > 0)) e.has = 'Ingresá las hectáreas trabajadas.'
    if (!b.fecha) e.fecha = 'Ingresá la fecha.'
    else if (b.fecha > HOY) e.fecha = 'La fecha no puede ser futura.'
    if (horasEntre(b.horaInicio, b.horaFin) <= 0) e.horario = 'La hora de fin tiene que ser posterior al inicio.'
  }
  if (paso === 'insumos') {
    if (b.insumos.length === 0) e.insumos = 'Agregá al menos un producto.'
    if (b.insumos.some((i) => !(i.dosis > 0))) e.insumos = 'Completá la dosis de cada producto.'
    if (!(aNumero(b.condiciones.caldo) > 0)) e.caldo = 'Ingresá el caldo (l/ha).'
    if (b.condiciones.viento === '' || b.condiciones.temperatura === '' || b.condiciones.humedad === '') e.condiciones = 'Completá viento, temperatura y humedad.'
  }
  if (paso === 'firma' && !b.firma) e.firma = 'Falta la firma del operario.'
  return e
}

/** Arma el ParteLabor a partir del borrador. */
export function construirParte(b: BorradorParte, c: Contratista, lote: Lote, est: Establecimiento): ParteLabor {
  const aplicacion = b.labor === 'pulverizacion'
  const punto = b.ubicacion ?? centroide(lote.poligono)
  return {
    id: b.id,
    numero: b.numero,
    contratistaId: c.id,
    productorId: est.productorId,
    establecimientoId: est.id,
    loteId: lote.id,
    campania: CAMPANIA_ACTIVA,
    labor: b.labor || 'laboreo',
    maquinaId: b.maquinaId,
    operario: b.operario,
    fecha: b.fecha,
    horaInicio: b.horaInicio,
    horaFin: b.horaFin,
    has: aNumero(b.has) || 0,
    horas: horasEntre(b.horaInicio, b.horaFin),
    insumos: b.insumos.filter((i) => i.insumoId),
    condiciones: aplicacion
      ? {
          caldo: aNumero(b.condiciones.caldo) || 0,
          viento: aNumero(b.condiciones.viento) || 0,
          direccionViento: b.condiciones.direccionViento,
          temperatura: aNumero(b.condiciones.temperatura) || 0,
          humedad: aNumero(b.condiciones.humedad) || 0,
        }
      : undefined,
    recetaId: aplicacion && b.recetaId ? b.recetaId : undefined,
    notas: b.notas || undefined,
    fotos: b.fotos,
    firma: b.firma ? { nombre: b.operario, fecha: ahora(), trazo: b.firma } : undefined,
    ubicacion: {
      lat: Math.round((est.lat - punto[1] / 40000) * 10000) / 10000,
      lng: Math.round((est.lng + punto[0] / 40000) * 10000) / 10000,
      precision: b.ubicacion ? 6 : 25,
    },
    estado: 'borrador',
    historial: [],
  }
}
