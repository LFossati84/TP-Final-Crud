import { diasHasta } from './reloj'
import type { Contratista, Documento, FechaISO, NivelVerificacion, TipoDocumento } from './types'

export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'gris'

/** Días de anticipación con que un vencimiento pasa a amarillo. */
export const DIAS_AVISO_VENCIMIENTO = 30

export const CRITERIOS_DESTACADO = {
  aniosMinimos: 3,
  trabajosMinimos: 40,
  calificacionMinima: 4.5,
} as const

export const NOTA_NORMATIVA =
  'Los requisitos de habilitación deben validarse con la normativa vigente de cada jurisdicción antes del lanzamiento'

export function semaforoVencimiento(vence?: FechaISO): Semaforo {
  if (!vence) return 'gris'
  const dias = diasHasta(vence)
  if (dias < 0) return 'rojo'
  if (dias <= DIAS_AVISO_VENCIMIENTO) return 'amarillo'
  return 'verde'
}

export function documentoVigente(doc: Documento | undefined): boolean {
  if (!doc || doc.estado !== 'aprobado') return false
  return !doc.vence || diasHasta(doc.vence) >= 0
}

export function documentosRequeridos(c: Pick<Contratista, 'servicios'>): {
  basico: TipoDocumento[]
  verificado: TipoDocumento[]
} {
  const verificado: TipoDocumento[] = ['situacion_impositiva', 'art', 'seguro_maquinaria']
  if (c.servicios.includes('pulverizacion')) verificado.push('habilitacion_aplicador')
  return { basico: ['identidad', 'cuit'], verificado }
}

export interface Requisito {
  id: string
  nivel: NivelVerificacion
  texto: string
  cumple: boolean
  detalle?: string
}

export interface ContextoVerificacion {
  trabajosConformados: number
  calificacion: number | null
  disputasAbiertas: number
  anioActual: number
}

export interface EvaluacionVerificacion {
  /** null = todavía no alcanza el nivel Básico (alta en revisión). */
  nivel: NivelVerificacion | null
  requisitos: Requisito[]
  proximoNivel: NivelVerificacion | null
  /** Documentos aprobados que vencen pronto o ya vencieron. */
  alertas: { documento: Documento; dias: number }[]
}

function docDe(c: Contratista, tipo: TipoDocumento): Documento | undefined {
  return c.documentos.find((d) => d.tipo === tipo)
}

export function evaluarVerificacion(c: Contratista, ctx: ContextoVerificacion): EvaluacionVerificacion {
  const req = documentosRequeridos(c)
  const etiquetas: Record<TipoDocumento, string> = {
    identidad: 'Identidad del titular validada',
    cuit: 'CUIT activo',
    situacion_impositiva: 'Situación impositiva regular',
    art: 'ART vigente',
    seguro_maquinaria: 'Seguro de maquinaria vigente',
    habilitacion_aplicador: 'Habilitación de aplicador',
  }

  const requisitos: Requisito[] = []
  for (const tipo of req.basico) {
    requisitos.push({ id: tipo, nivel: 'basico', texto: etiquetas[tipo], cumple: documentoVigente(docDe(c, tipo)) })
  }
  for (const tipo of req.verificado) {
    requisitos.push({ id: tipo, nivel: 'verificado', texto: etiquetas[tipo], cumple: documentoVigente(docDe(c, tipo)) })
  }

  const anios = ctx.anioActual - c.desde
  requisitos.push(
    {
      id: 'antiguedad',
      nivel: 'destacado',
      texto: `Antigüedad de ${CRITERIOS_DESTACADO.aniosMinimos} años o más`,
      cumple: anios >= CRITERIOS_DESTACADO.aniosMinimos,
      detalle: `${anios} ${anios === 1 ? 'año' : 'años'}`,
    },
    {
      id: 'trabajos',
      nivel: 'destacado',
      texto: `${CRITERIOS_DESTACADO.trabajosMinimos} trabajos conformados o más`,
      cumple: ctx.trabajosConformados >= CRITERIOS_DESTACADO.trabajosMinimos,
      detalle: `${ctx.trabajosConformados} conformados`,
    },
    {
      id: 'calificacion',
      nivel: 'destacado',
      texto: `Calificación de ${CRITERIOS_DESTACADO.calificacionMinima.toString().replace('.', ',')} o más`,
      cumple: ctx.calificacion !== null && ctx.calificacion >= CRITERIOS_DESTACADO.calificacionMinima,
      detalle: ctx.calificacion === null ? 'sin reseñas' : ctx.calificacion.toFixed(1).replace('.', ','),
    },
    {
      id: 'disputas',
      nivel: 'destacado',
      texto: 'Sin disputas abiertas',
      cumple: ctx.disputasAbiertas === 0,
      detalle: ctx.disputasAbiertas === 0 ? 'ninguna' : `${ctx.disputasAbiertas} abierta(s)`,
    },
  )

  const cumpleNivel = (n: NivelVerificacion) => requisitos.filter((r) => r.nivel === n).every((r) => r.cumple)
  let nivel: NivelVerificacion | null = null
  if (cumpleNivel('basico')) {
    nivel = 'basico'
    if (cumpleNivel('verificado')) {
      nivel = 'verificado'
      if (cumpleNivel('destacado')) nivel = 'destacado'
    }
  }
  const proximoNivel: NivelVerificacion | null =
    nivel === null ? 'basico' : nivel === 'basico' ? 'verificado' : nivel === 'verificado' ? 'destacado' : null

  const alertas = c.documentos
    .filter((d) => d.estado === 'aprobado' && d.vence && semaforoVencimiento(d.vence) !== 'verde')
    .map((d) => ({ documento: d, dias: diasHasta(d.vence ?? '') }))
    .sort((a, b) => a.dias - b.dias)

  return { nivel, requisitos, proximoNivel, alertas }
}
