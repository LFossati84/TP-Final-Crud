import type {
  Campania,
  CondicionesAplicacion,
  EstadoParte,
  EventoParte,
  FechaISO,
  Foto,
  ID,
  InsumoAplicado,
  MotivoObservacion,
  ParteLabor,
  TipoLabor,
  ValidacionProfesional,
} from '@/domain/types'
import { sumarDias } from '@/domain/reloj'
import { ESTABLECIMIENTOS, LOTES } from './establecimientos'

/** Marca de partes de campañas anteriores liquidados fuera de la plataforma. */
export const LIQUIDACION_EXTERNA = 'fuera-de-plataforma'

interface DatosParte {
  id: ID
  numero: string
  contratistaId: ID
  loteId: ID
  campania: Campania
  labor: TipoLabor
  maquinaId: ID
  operario: string
  fecha: FechaISO
  horaInicio: string
  horaFin: string
  has: number
  insumos?: InsumoAplicado[]
  condiciones?: CondicionesAplicacion
  recetaId?: ID
  notas?: string
  estado: EstadoParte
  /** Días entre el envío y la conformidad (por defecto 1). */
  demoraConformidad?: number
  validacion?: ValidacionProfesional
  observacion?: { motivo: MotivoObservacion; detalle: string }
  rechazo?: string
  liquidacionId?: ID
}

function horasEntre(inicio: string, fin: string): number {
  const [hi = 0, mi = 0] = inicio.split(':').map(Number)
  const [hf = 0, mf = 0] = fin.split(':').map(Number)
  return Math.round(((hf * 60 + mf - (hi * 60 + mi)) / 60) * 10) / 10
}

function fotosPara(id: ID, labor: TipoLabor): Foto[] {
  const fotos: Foto[] = [
    { id: `${id}-f1`, tipo: 'lote', descripcion: 'Vista del lote al finalizar' },
    { id: `${id}-f2`, tipo: 'maquina', descripcion: 'Equipo trabajando' },
  ]
  if (labor === 'pulverizacion') fotos.push({ id: `${id}-f3`, tipo: 'caldo', descripcion: 'Preparación del caldo' })
  if (labor === 'fertilizacion') fotos.push({ id: `${id}-f3`, tipo: 'remito', descripcion: 'Remito de fertilizante' })
  return fotos
}

function armar(d: DatosParte): ParteLabor {
  const lote = LOTES.find((l) => l.id === d.loteId)
  const est = ESTABLECIMIENTOS.find((e) => e.id === lote?.establecimientoId)
  if (!lote || !est) throw new Error(`Lote inexistente en parte ${d.id}`)

  const envio = `${d.fecha}T${d.horaFin}`
  const historial: EventoParte[] = [{ fecha: envio, estado: 'enviado', actor: 'contratista' }]
  const respuesta = `${sumarDias(d.fecha, d.demoraConformidad ?? 1)}T09:15`

  if (d.estado === 'borrador') historial.splice(0, 1, { fecha: envio, estado: 'borrador', actor: 'contratista' })
  if (d.estado === 'observado') historial.push({ fecha: respuesta, estado: 'observado', actor: 'productor', nota: d.observacion?.detalle })
  if (d.estado === 'conformado' || d.estado === 'en_disputa') historial.push({ fecha: respuesta, estado: 'conformado', actor: 'productor' })
  if (d.estado === 'rechazado') historial.push({ fecha: respuesta, estado: 'rechazado', actor: 'productor', nota: d.rechazo })
  if (d.estado === 'en_disputa') {
    historial.push({ fecha: '2026-10-11T18:40', estado: 'en_disputa', actor: 'productor', nota: 'Reclamo por deriva' })
  }

  const parte: ParteLabor = {
    id: d.id,
    numero: d.numero,
    contratistaId: d.contratistaId,
    productorId: est.productorId,
    establecimientoId: est.id,
    loteId: d.loteId,
    campania: d.campania,
    labor: d.labor,
    maquinaId: d.maquinaId,
    operario: d.operario,
    fecha: d.fecha,
    horaInicio: d.horaInicio,
    horaFin: d.horaFin,
    has: d.has,
    horas: horasEntre(d.horaInicio, d.horaFin),
    insumos: d.insumos ?? [],
    condiciones: d.condiciones,
    recetaId: d.recetaId,
    notas: d.notas,
    fotos: d.estado === 'borrador' ? [] : fotosPara(d.id, d.labor),
    firma: d.estado === 'borrador' ? undefined : { nombre: d.operario, fecha: envio },
    ubicacion: {
      lat: Math.round((est.lat + (lote.poligono[0]?.[1] ?? 0) / -40000) * 10000) / 10000,
      lng: Math.round((est.lng + (lote.poligono[0]?.[0] ?? 0) / 40000) * 10000) / 10000,
      precision: 6,
    },
    estado: d.estado,
    historial,
    validacion: d.validacion,
    liquidacionId: d.liquidacionId,
  }
  if (d.observacion) parte.observacion = { ...d.observacion, fecha: respuesta, por: 'productor' }
  if (d.rechazo) parte.rechazo = { motivo: d.rechazo, fecha: respuesta }
  return parte
}

const validadaI1 = (fecha: FechaISO, nota?: string): ValidacionProfesional => ({
  estado: 'validada',
  ingenieroId: 'i1',
  fecha: `${fecha}T19:30`,
  nota,
})

export const PARTES: ParteLabor[] = [
  // ─────────── Campaña 2025/26 · La Esperanza (cuaderno completo para F3) ───────────
  armar({ id: 'pt01', numero: 'PL-0187', contratistaId: 'c1', loteId: 'l2', campania: '2025/26', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2025-08-20', horaInicio: '07:30', horaFin: '12:10', has: 120,
    insumos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-24d', dosis: 0.5 }],
    condiciones: { caldo: 80, viento: 9, direccionViento: 'NE', temperatura: 18, humedad: 62 }, recetaId: 'r1',
    estado: 'conformado', validacion: validadaI1('2025-08-21'), liquidacionId: 'lq1' }),
  armar({ id: 'pt02', numero: 'PL-0201', contratistaId: 'c2', loteId: 'l2', campania: '2025/26', labor: 'siembra', maquinaId: 'm21', operario: 'Iván Pascualini',
    fecha: '2025-09-25', horaInicio: '06:45', horaFin: '18:30', has: 120,
    insumos: [{ insumoId: 'i-smaiz', dosis: 78000 }, { insumoId: 'i-map', dosis: 120 }],
    notas: 'Siembra a 52,5 cm, profundidad 5 cm. Buena humedad en la cama de siembra.',
    estado: 'conformado', liquidacionId: LIQUIDACION_EXTERNA }),
  armar({ id: 'pt03', numero: 'PL-0203', contratistaId: 'c1', loteId: 'l2', campania: '2025/26', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Nahuel Ortiz',
    fecha: '2025-09-26', horaInicio: '08:00', horaFin: '12:40', has: 120,
    insumos: [{ insumoId: 'i-atr', dosis: 1.5 }, { insumoId: 'i-sme', dosis: 1.2 }],
    condiciones: { caldo: 90, viento: 7, direccionViento: 'N', temperatura: 20, humedad: 65 }, recetaId: 'r2',
    estado: 'conformado', validacion: validadaI1('2025-09-27'), liquidacionId: 'lq1' }),
  armar({ id: 'pt04', numero: 'PL-0244', contratistaId: 'c1', loteId: 'l2', campania: '2025/26', labor: 'fertilizacion', maquinaId: 'm13', operario: 'Nahuel Ortiz',
    fecha: '2025-10-30', horaInicio: '07:15', horaFin: '13:00', has: 120,
    insumos: [{ insumoId: 'i-ure', dosis: 150 }], estado: 'conformado', liquidacionId: 'lq1' }),
  armar({ id: 'pt05', numero: 'PL-0306', contratistaId: 'c1', loteId: 'l2', campania: '2025/26', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2025-12-10', horaInicio: '06:30', horaFin: '10:45', has: 120,
    insumos: [{ insumoId: 'i-lam', dosis: 30 }],
    condiciones: { caldo: 70, viento: 11, direccionViento: 'SE', temperatura: 26, humedad: 55 }, recetaId: 'r3',
    estado: 'conformado', validacion: validadaI1('2025-12-11'), liquidacionId: 'lq1' }),
  armar({ id: 'pt06', numero: 'PL-0461', contratistaId: 'c5', loteId: 'l2', campania: '2025/26', labor: 'cosecha', maquinaId: 'm52', operario: 'Walter Giménez',
    fecha: '2026-03-20', horaInicio: '10:00', horaFin: '21:30', has: 120,
    notas: 'Rinde promedio 98 qq/ha, humedad de grano 16,5 %. Mapa de rendimiento entregado.',
    estado: 'conformado', liquidacionId: LIQUIDACION_EXTERNA }),
  armar({ id: 'pt07', numero: 'PL-0251', contratistaId: 'c1', loteId: 'l1', campania: '2025/26', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2025-10-20', horaInicio: '07:00', horaFin: '10:50', has: 96,
    insumos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-dic', dosis: 0.15 }],
    condiciones: { caldo: 75, viento: 10, direccionViento: 'E', temperatura: 19, humedad: 60 }, recetaId: 'r4',
    estado: 'conformado', validacion: validadaI1('2025-10-21'), liquidacionId: 'lq1' }),
  armar({ id: 'pt08', numero: 'PL-0270', contratistaId: 'c2', loteId: 'l1', campania: '2025/26', labor: 'siembra', maquinaId: 'm21', operario: 'Darío Pascualini',
    fecha: '2025-11-12', horaInicio: '07:00', horaFin: '17:20', has: 96,
    insumos: [{ insumoId: 'i-ssoja', dosis: 70 }], estado: 'conformado', liquidacionId: LIQUIDACION_EXTERNA }),
  armar({ id: 'pt09', numero: 'PL-0318', contratistaId: 'c1', loteId: 'l1', campania: '2025/26', labor: 'pulverizacion', maquinaId: 'm12', operario: 'Nahuel Ortiz',
    fecha: '2025-12-15', horaInicio: '06:40', horaFin: '10:10', has: 96,
    insumos: [{ insumoId: 'i-gli', dosis: 2 }],
    condiciones: { caldo: 65, viento: 8, direccionViento: 'S', temperatura: 24, humedad: 58 }, recetaId: 'r5',
    estado: 'conformado', validacion: validadaI1('2025-12-16'), liquidacionId: 'lq1' }),
  armar({ id: 'pt10', numero: 'PL-0472', contratistaId: 'c5', loteId: 'l1', campania: '2025/26', labor: 'cosecha', maquinaId: 'm51', operario: 'Cristian Paz',
    fecha: '2026-04-18', horaInicio: '11:00', horaFin: '20:00', has: 96,
    notas: 'Rinde promedio 41 qq/ha. Humedad 13 %.', estado: 'conformado', liquidacionId: LIQUIDACION_EXTERNA }),

  // ─────────── Campaña 2026/27 · La Esperanza ───────────
  armar({ id: 'pt11', numero: 'PL-0512', contratistaId: 'c2', loteId: 'l2', campania: '2026/27', labor: 'siembra', maquinaId: 'm22', operario: 'Iván Pascualini',
    fecha: '2026-06-08', horaInicio: '08:00', horaFin: '17:30', has: 120,
    insumos: [{ insumoId: 'i-strigo', dosis: 120 }, { insumoId: 'i-map', dosis: 80 }], estado: 'conformado', liquidacionId: 'lq10' }),
  armar({ id: 'pt12', numero: 'PL-0515', contratistaId: 'c2', loteId: 'l4', campania: '2026/27', labor: 'siembra', maquinaId: 'm22', operario: 'Iván Pascualini',
    fecha: '2026-06-12', horaInicio: '08:10', horaFin: '16:50', has: 110,
    insumos: [{ insumoId: 'i-strigo', dosis: 120 }, { insumoId: 'i-map', dosis: 80 }], estado: 'conformado', liquidacionId: 'lq10' }),
  armar({ id: 'pt13', numero: 'PL-0548', contratistaId: 'c1', loteId: 'l2', campania: '2026/27', labor: 'fertilizacion', maquinaId: 'm13', operario: 'Nahuel Ortiz',
    fecha: '2026-07-20', horaInicio: '09:00', horaFin: '14:30', has: 120,
    insumos: [{ insumoId: 'i-ure', dosis: 180 }], estado: 'conformado', liquidacionId: 'lq2' }),
  armar({ id: 'pt14', numero: 'PL-0551', contratistaId: 'c1', loteId: 'l4', campania: '2026/27', labor: 'fertilizacion', maquinaId: 'm13', operario: 'Nahuel Ortiz',
    fecha: '2026-07-22', horaInicio: '09:10', horaFin: '14:00', has: 110,
    insumos: [{ insumoId: 'i-ure', dosis: 170 }], estado: 'conformado', liquidacionId: 'lq2' }),
  armar({ id: 'pt15', numero: 'PL-0583', contratistaId: 'c1', loteId: 'l2', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2026-08-12', horaInicio: '10:30', horaFin: '14:20', has: 120,
    insumos: [{ insumoId: 'i-met', dosis: 6 }, { insumoId: 'i-dic', dosis: 0.12 }],
    condiciones: { caldo: 75, viento: 8, direccionViento: 'NO', temperatura: 14, humedad: 70 }, recetaId: 'r6',
    estado: 'conformado', validacion: validadaI1('2026-08-13'), liquidacionId: 'lq7' }),
  armar({ id: 'pt16', numero: 'PL-0597', contratistaId: 'c7', loteId: 'l1', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm71', operario: 'Joaquín Peralta',
    fecha: '2026-08-28', horaInicio: '08:20', horaFin: '12:00', has: 96,
    insumos: [{ insumoId: 'i-gli', dosis: 2.8 }, { insumoId: 'i-24d', dosis: 0.6 }],
    condiciones: { caldo: 80, viento: 12, direccionViento: 'N', temperatura: 17, humedad: 64 }, recetaId: 'r7',
    estado: 'conformado', validacion: validadaI1('2026-08-29') }),
  armar({ id: 'pt18', numero: 'PL-0624', contratistaId: 'c2', loteId: 'l1', campania: '2026/27', labor: 'siembra', maquinaId: 'm21', operario: 'Darío Pascualini',
    fecha: '2026-09-28', horaInicio: '07:00', horaFin: '17:40', has: 96,
    insumos: [{ insumoId: 'i-smaiz', dosis: 80000 }, { insumoId: 'i-map', dosis: 100 }],
    notas: 'Maíz temprano. Siembra con dosis variable por ambiente.', estado: 'conformado' }),
  armar({ id: 'pt19', numero: 'PL-0631', contratistaId: 'c1', loteId: 'l2', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2026-09-25', horaInicio: '07:40', horaFin: '11:30', has: 120,
    insumos: [{ insumoId: 'i-azo', dosis: 0.4 }, { insumoId: 'i-ace', dosis: 0.3 }],
    condiciones: { caldo: 85, viento: 10, direccionViento: 'NE', temperatura: 19, humedad: 61 }, recetaId: 'r8',
    estado: 'conformado', validacion: validadaI1('2026-09-26') }),
  armar({ id: 'pt20', numero: 'PL-0640', contratistaId: 'c1', loteId: 'l4', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Nahuel Ortiz',
    fecha: '2026-10-02', horaInicio: '08:00', horaFin: '11:45', has: 110,
    insumos: [{ insumoId: 'i-azo', dosis: 0.9 }, { insumoId: 'i-ace', dosis: 0.3 }],
    condiciones: { caldo: 80, viento: 12, direccionViento: 'E', temperatura: 21, humedad: 58 }, recetaId: 'r8',
    estado: 'conformado', validacion: { estado: 'pendiente', ingenieroId: 'i1' } }),
  armar({ id: 'pt21', numero: 'PL-0645', contratistaId: 'c1', loteId: 'l1', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm12', operario: 'Nahuel Ortiz',
    fecha: '2026-09-30', horaInicio: '07:30', horaFin: '11:00', has: 96,
    insumos: [{ insumoId: 'i-atr', dosis: 1.5 }, { insumoId: 'i-sme', dosis: 1 }],
    condiciones: { caldo: 85, viento: 9, direccionViento: 'N', temperatura: 20, humedad: 63 },
    notas: 'Preemergente de maíz pedido por teléfono por el encargado.', estado: 'enviado' }),

  // ─────────── Campaña 2026/27 · Don Aurelio ───────────
  armar({ id: 'pt22', numero: 'PL-0602', contratistaId: 'c7', loteId: 'l7', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm71', operario: 'Ricardo Peralta',
    fecha: '2026-09-10', horaInicio: '13:00', horaFin: '15:40', has: 78,
    insumos: [{ insumoId: 'i-met', dosis: 7 }, { insumoId: 'i-dic', dosis: 0.15 }],
    condiciones: { caldo: 70, viento: 17, direccionViento: 'SO', temperatura: 23, humedad: 48 }, recetaId: 'r10',
    estado: 'en_disputa', demoraConformidad: 2, liquidacionId: 'lq8',
    validacion: { estado: 'observada', ingenieroId: 'i1', fecha: '2026-09-13T10:00', nota: 'Viento y humedad fuera de las condiciones de la receta.', motivos: ['viento_alto', 'humedad_baja'] } }),
  armar({ id: 'pt23', numero: 'PL-0612', contratistaId: 'c4', loteId: 'l5', campania: '2026/27', labor: 'fertilizacion', maquinaId: 'm43', operario: 'Facundo Romero',
    fecha: '2026-09-20', horaInicio: '08:30', horaFin: '13:10', has: 105,
    insumos: [{ insumoId: 'i-map', dosis: 110 }], estado: 'conformado', liquidacionId: 'lq9' }),
  armar({ id: 'pt24', numero: 'PL-0605', contratistaId: 'c4', loteId: 'l8', campania: '2026/27', labor: 'laboreo', maquinaId: 'm42', operario: 'Héctor Romero',
    fecha: '2026-09-05', horaInicio: '07:00', horaFin: '18:00', has: 115,
    notas: 'Pasada de rastra para emparejar huellas de cosecha.', estado: 'conformado', liquidacionId: 'lq9' }),
  armar({ id: 'pt25', numero: 'PL-0606', contratistaId: 'c4', loteId: 'l8', campania: '2026/27', labor: 'laboreo', maquinaId: 'm42', operario: 'Facundo Romero',
    fecha: '2026-09-05', horaInicio: '07:00', horaFin: '18:00', has: 115,
    estado: 'rechazado', rechazo: 'Parte duplicado de PL-0605 (misma labor, mismo día).' }),
  armar({ id: 'pt26', numero: 'PL-0650', contratistaId: 'c1', loteId: 'l6', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2026-10-08', horaInicio: '07:15', horaFin: '10:30', has: 92,
    insumos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-sme', dosis: 1.2 }],
    condiciones: { caldo: 80, viento: 11, direccionViento: 'NE', temperatura: 18, humedad: 66 }, recetaId: 'r9', estado: 'enviado' }),
  armar({ id: 'pt27', numero: 'PL-0657', contratistaId: 'c1', loteId: 'l5', campania: '2026/27', labor: 'fertilizacion', maquinaId: 'm13', operario: 'Nahuel Ortiz',
    fecha: '2026-10-12', horaInicio: '08:00', horaFin: '13:20', has: 150,
    insumos: [{ insumoId: 'i-ure', dosis: 160 }], notas: 'Urea al voleo en V4.', estado: 'enviado' }),
  armar({ id: 'pt33', numero: 'PL-0654', contratistaId: 'c1', loteId: 'l8', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2026-10-09', horaInicio: '11:00', horaFin: '14:30', has: 115,
    insumos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-sme', dosis: 1.2 }],
    condiciones: { caldo: 80, viento: 13, direccionViento: 'N', temperatura: 22, humedad: 57 }, recetaId: 'r9',
    estado: 'observado', observacion: { motivo: 'fecha', detalle: 'La aplicación fue el sábado 10, no el viernes 9. Corregí la fecha así queda bien en el cuaderno.' } }),
  armar({ id: 'pt28', numero: 'PL-0659', contratistaId: 'c1', loteId: 'l3', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm12', operario: 'Nahuel Ortiz',
    fecha: '2026-10-14', horaInicio: '16:00', horaFin: '18:10', has: 84,
    insumos: [{ insumoId: 'i-gli', dosis: 2.5 }], estado: 'borrador' }),

  // ─────────── Campaña 2026/27 · Las Acacias (Bonetto) ───────────
  armar({ id: 'pt30', numero: 'PL-0610', contratistaId: 'c3', loteId: 'l9', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm31', operario: 'Gustavo Arce',
    fecha: '2026-09-01', horaInicio: '08:00', horaFin: '10:40', has: 88,
    insumos: [{ insumoId: 'i-met', dosis: 6 }, { insumoId: 'i-dic', dosis: 0.12 }],
    condiciones: { caldo: 70, viento: 9, direccionViento: 'O', temperatura: 15, humedad: 68 }, recetaId: 'r11',
    estado: 'conformado', validacion: { estado: 'validada', ingenieroId: 'i2', fecha: '2026-09-02T18:00' } }),
  armar({ id: 'pt32', numero: 'PL-0615', contratistaId: 'c1', loteId: 'l11', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm11', operario: 'Sergio Bianchi',
    fecha: '2026-09-15', horaInicio: '07:30', horaFin: '10:20', has: 74,
    insumos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-24d', dosis: 0.5 }],
    condiciones: { caldo: 75, viento: 10, direccionViento: 'NE', temperatura: 17, humedad: 63 }, recetaId: 'r12',
    estado: 'conformado', validacion: { estado: 'validada', ingenieroId: 'i2', fecha: '2026-09-16T12:10' }, liquidacionId: 'lq3' }),
  armar({ id: 'pt17', numero: 'PL-0618', contratistaId: 'c3', loteId: 'l3', campania: '2026/27', labor: 'pulverizacion', maquinaId: 'm32', operario: 'Matías Funes',
    fecha: '2026-09-18', horaInicio: '07:50', horaFin: '10:30', has: 84,
    insumos: [{ insumoId: 'i-gli', dosis: 2.8 }, { insumoId: 'i-24d', dosis: 0.6 }],
    condiciones: { caldo: 80, viento: 8, direccionViento: 'NE', temperatura: 16, humedad: 69 }, recetaId: 'r7',
    estado: 'conformado', validacion: validadaI1('2026-09-19') }),
]
