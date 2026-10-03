/**
 * Modelo de dominio de Proyecto Libertad II.
 * Fechas: 'YYYY-MM-DD'. Fecha y hora: 'YYYY-MM-DDTHH:mm'. Montos en ARS.
 */

export type ID = string
export type FechaISO = string
export type FechaHoraISO = string

export type Rol = 'contratista' | 'productor' | 'ingeniero' | 'admin'
export type Campania = '2025/26' | '2026/27'

export type Localidad =
  | 'Venado Tuerto'
  | 'Rufino'
  | 'Firmat'
  | 'Murphy'
  | 'Hughes'
  | 'Villa Cañás'
  | 'Santa Isabel'
  | 'Carmen'
  | 'María Teresa'

export type Cultivo = 'soja' | 'maiz' | 'trigo' | 'soja2'
export type TipoLabor = 'siembra' | 'pulverizacion' | 'fertilizacion' | 'cosecha' | 'laboreo'
export type UnidadTarifa = 'ha' | 'hora'

// ───────────────────────── Red de contratistas ─────────────────────────

export type NivelVerificacion = 'basico' | 'verificado' | 'destacado'

export type TipoDocumento =
  | 'identidad'
  | 'cuit'
  | 'situacion_impositiva'
  | 'art'
  | 'seguro_maquinaria'
  | 'habilitacion_aplicador'

export type EstadoDocumento = 'aprobado' | 'pendiente' | 'observado' | 'rechazado'

export interface Documento {
  id: ID
  tipo: TipoDocumento
  estado: EstadoDocumento
  archivo: string
  cargado: FechaISO
  vence?: FechaISO
  nota?: string
}

export type TipoMaquina =
  | 'pulverizadora_autopropulsada'
  | 'pulverizadora_arrastre'
  | 'sembradora'
  | 'cosechadora'
  | 'fertilizadora'
  | 'tolva'
  | 'tractor'
  | 'rastra'

export interface Maquina {
  id: ID
  tipo: TipoMaquina
  descripcion: string
  anio: number
  labores: TipoLabor[]
  patente?: string
}

export interface Tarifa {
  labor: TipoLabor
  unidad: UnidadTarifa
  precio: number
}

export type Disponibilidad = 'disponible' | 'agenda_limitada' | 'sin_disponibilidad'

export interface Contratista {
  id: ID
  razonSocial: string
  titular: string
  cuit: string
  localidad: Localidad
  telefono: string
  email: string
  desde: number
  descripcion: string
  servicios: TipoLabor[]
  zonas: Localidad[]
  flota: Maquina[]
  tarifas: Tarifa[]
  documentos: Documento[]
  disponibilidad: Disponibilidad
  proximaFechaLibre?: FechaISO
  /** Trabajos previos a la plataforma, informados y auditados en el alta. */
  historico: { partes: number; conformadosSinObservacion: number }
  operarios: string[]
}

export interface Resena {
  id: ID
  contratistaId: ID
  productorId: ID
  fecha: FechaISO
  puntaje: 1 | 2 | 3 | 4 | 5
  texto: string
  labor: TipoLabor
}

// ───────────────────────── Productores y campos ─────────────────────────

export interface Productor {
  id: ID
  razonSocial: string
  contacto: string
  cuit: string
  localidad: Localidad
  telefono: string
  plan: 'gratis' | 'pro'
  ingenieroId?: ID
  validacionProfesional: boolean
  consentimientoReputacionPago: boolean
  /** Comportamiento de pago previo a la demo (para calcular la reputación de pago). */
  historicoPagos: { liquidaciones: number; diasPromedioDesdeVencimiento: number; enTermino: number }
}

export interface Establecimiento {
  id: ID
  productorId: ID
  nombre: string
  localidad: Localidad
  lat: number
  lng: number
  /** Casco del campo en coordenadas del mapa local (viewBox 400×300). */
  casco: [number, number]
  camino: [number, number][]
}

export interface Lote {
  id: ID
  establecimientoId: ID
  nombre: string
  has: number
  cultivos: Partial<Record<Campania, Cultivo>>
  poligono: [number, number][]
  ambiente: 'loma' | 'media loma' | 'bajo'
}

// ───────────────────────── Insumos y agronomía ─────────────────────────

export type TipoInsumo = 'herbicida' | 'insecticida' | 'fungicida' | 'coadyuvante' | 'fertilizante' | 'semilla'
export type UnidadDosis = 'l/ha' | 'kg/ha' | 'cc/ha' | 'g/ha' | 'pl/ha'

export interface Insumo {
  id: ID
  nombre: string
  tipo: TipoInsumo
  unidad: UnidadDosis
  /** Rango de dosis de referencia (solo fitosanitarios). */
  dosisMin?: number
  dosisMax?: number
  banda?: 'IV' | 'III' | 'II'
}

export interface InsumoAplicado {
  insumoId: ID
  dosis: number
}

export interface CondicionesAplicacion {
  caldo: number
  viento: number
  direccionViento: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO'
  temperatura: number
  humedad: number
}

export interface IngenieroAgronomo {
  id: ID
  nombre: string
  matricula: string
  localidad: Localidad
  telefono: string
  clientes: ID[]
}

export type EstadoReceta = 'emitida' | 'aplicada' | 'vencida'

export interface RecetaAgronomica {
  id: ID
  numero: string
  ingenieroId: ID
  productorId: ID
  establecimientoId: ID
  loteIds: ID[]
  fecha: FechaISO
  vence: FechaISO
  cultivo: Cultivo | 'barbecho'
  objetivo: string
  productos: InsumoAplicado[]
  caldoMin: number
  condiciones: string
  estado: EstadoReceta
}

export type EstadoValidacion = 'pendiente' | 'validada' | 'observada'

export type CodigoHallazgo =
  | 'dosis_alta'
  | 'dosis_baja'
  | 'viento_alto'
  | 'viento_bajo'
  | 'temperatura_alta'
  | 'humedad_baja'
  | 'sin_receta'
  | 'producto_fuera_de_receta'
  | 'has_excedidas'

export interface Hallazgo {
  codigo: CodigoHallazgo
  severidad: 'alerta' | 'peligro'
  texto: string
}

export interface ValidacionProfesional {
  estado: EstadoValidacion
  ingenieroId: ID
  fecha?: FechaHoraISO
  nota?: string
  motivos?: CodigoHallazgo[]
}

// ───────────────────────── Parte de labor ─────────────────────────

export type EstadoParte =
  | 'borrador'
  | 'pendiente_sync'
  | 'enviado'
  | 'observado'
  | 'conformado'
  | 'rechazado'
  | 'en_disputa'

export type MotivoObservacion =
  | 'hectareas'
  | 'fecha'
  | 'insumos'
  | 'condiciones'
  | 'lote'
  | 'otro'

export interface Foto {
  id: ID
  tipo: 'lote' | 'maquina' | 'caldo' | 'remito' | 'otro'
  descripcion: string
  /** URL local (objectURL) si el usuario subió una imagen; si no, se dibuja una ilustración. */
  url?: string
}

export interface Firma {
  nombre: string
  fecha: FechaHoraISO
  /** dataURL PNG del trazo hecho en pantalla. */
  trazo?: string
}

export interface EventoParte {
  fecha: FechaHoraISO
  estado: EstadoParte
  actor: Rol | 'sistema'
  nota?: string
}

export interface ParteLabor {
  id: ID
  numero: string
  contratistaId: ID
  productorId: ID
  establecimientoId: ID
  loteId: ID
  campania: Campania
  labor: TipoLabor
  maquinaId: ID
  operario: string
  fecha: FechaISO
  horaInicio: string
  horaFin: string
  has: number
  horas: number
  insumos: InsumoAplicado[]
  condiciones?: CondicionesAplicacion
  recetaId?: ID
  notas?: string
  fotos: Foto[]
  firma?: Firma
  ubicacion: { lat: number; lng: number; precision: number }
  estado: EstadoParte
  historial: EventoParte[]
  observacion?: { motivo: MotivoObservacion; detalle: string; fecha: FechaHoraISO; por: Rol }
  rechazo?: { motivo: string; fecha: FechaHoraISO }
  validacion?: ValidacionProfesional
  liquidacionId?: ID
  cargadoSinConexion?: boolean
}

// ───────────────────────── Cuaderno ─────────────────────────

export type TipoEntradaCuaderno = TipoLabor | 'recorrida' | 'analisis'

export interface EntradaCuaderno {
  id: ID
  establecimientoId: ID
  loteId: ID
  campania: Campania
  fecha: FechaISO
  tipo: TipoEntradaCuaderno
  titulo: string
  detalle: string
  parteId?: ID
  contratistaId?: ID
  autor: string
}

// ───────────────────────── Cobranza ─────────────────────────

export type CondicionPago =
  | 'contado'
  | '15_dias'
  | '30_dias'
  | '60_dias'
  | 'cheque_a_fecha'
  | 'echeq'
  | 'transferencia'

export type MedioPago = 'transferencia' | 'echeq' | 'cheque' | 'efectivo' | 'canje_granos'

export type EstadoLiquidacion =
  | 'emitida'
  | 'aceptada'
  | 'observada'
  | 'pago_informado'
  | 'cobrada_parcial'
  | 'cobrada'
  | 'en_disputa'

/** Estado de seguimiento de cobro (derivado). */
export type EstadoCobro = 'a_vencer' | 'vencido' | 'cobrado' | 'en_disputa'

export interface ItemLiquidacion {
  id: ID
  parteId?: ID
  descripcion: string
  unidad: UnidadTarifa
  cantidad: number
  precioUnitario: number
}

export interface Cobro {
  id: ID
  fecha: FechaISO
  monto: number
  medio: MedioPago
  comprobante?: string
  nota?: string
}

export type TipoRecordatorio = 'manual' | 'auto_3_antes' | 'auto_dia' | 'auto_7_despues'

export interface Recordatorio {
  id: ID
  fecha: FechaISO
  tipo: TipoRecordatorio
  estado: 'enviado' | 'programado'
  mensaje: string
}

export interface Liquidacion {
  id: ID
  numero: string
  contratistaId: ID
  productorId: ID
  fechaEmision: FechaISO
  periodo: string
  items: ItemLiquidacion[]
  alicuotaIva: number
  condicion: CondicionPago
  vencimiento: FechaISO
  estado: EstadoLiquidacion
  cobros: Cobro[]
  recordatorios: Recordatorio[]
  recordatoriosAutomaticos: boolean
  observacion?: string
  pagoInformado?: { fecha: FechaISO; monto: number; medio: MedioPago; comprobante: string }
  disputaId?: ID
  aceptadaEl?: FechaISO
}

// ───────────────────────── Disputas, presupuestos, mensajes ─────────────────────────

export type EstadoDisputa = 'abierta' | 'en_mediacion' | 'resuelta'

export interface MensajeDisputa {
  fecha: FechaHoraISO
  autor: Rol
  nombre: string
  texto: string
}

export interface Disputa {
  id: ID
  numero: string
  contratistaId: ID
  productorId: ID
  liquidacionId?: ID
  parteId?: ID
  abiertaPor: Rol
  fecha: FechaISO
  motivo: string
  monto?: number
  estado: EstadoDisputa
  mensajes: MensajeDisputa[]
  resolucion?: string
}

export type EstadoPresupuesto = 'solicitado' | 'respondido' | 'aceptado' | 'rechazado'

export interface Presupuesto {
  id: ID
  tipo: 'presupuesto' | 'contratacion'
  productorId: ID
  contratistaId: ID
  labor: TipoLabor
  establecimientoId: ID
  loteIds: ID[]
  has: number
  fechaDeseada: FechaISO
  comentario: string
  fecha: FechaISO
  estado: EstadoPresupuesto
  respuesta?: { precio: number; unidad: UnidadTarifa; fechaPropuesta: FechaISO; mensaje: string; fecha: FechaISO }
}

export type TipoNotificacion = 'info' | 'ok' | 'alerta' | 'peligro'

export interface Notificacion {
  id: ID
  rol: Rol
  /** Usuario destinatario dentro del rol (contratista/productor/ingeniero). Vacío = todos. */
  usuarioId?: ID
  fecha: FechaHoraISO
  titulo: string
  texto: string
  tipo: TipoNotificacion
  link?: string
  leida: boolean
}

export interface MensajeWhatsApp {
  id: ID
  autor: 'contratista' | 'productor'
  texto: string
  fecha: FechaHoraISO
  estado: 'enviado' | 'entregado' | 'leido'
  automatico?: boolean
}

export interface Conversacion {
  id: ID
  contratistaId: ID
  productorId: ID
  mensajes: MensajeWhatsApp[]
}
