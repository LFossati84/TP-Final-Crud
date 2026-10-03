import type {
  Conversacion,
  Disputa,
  EntradaCuaderno,
  Notificacion,
  Presupuesto,
  Resena,
} from '@/domain/types'

export const RESENAS: Resena[] = [
  // c1 El Ombú → promedio 4,4 (le falta poco para Destacado)
  { id: 'rs1', contratistaId: 'c1', productorId: 'p1', fecha: '2026-09-26', puntaje: 5, labor: 'pulverizacion', texto: 'Aplicó el fungicida en la ventana justa. Mandó fotos del caldo y las condiciones sin que se las pidiéramos.' },
  { id: 'rs2', contratistaId: 'c1', productorId: 'p2', fecha: '2026-09-16', puntaje: 4, labor: 'pulverizacion', texto: 'Buen trabajo y prolijo con las cabeceras. Se demoró un día por viento, pero avisó con tiempo.' },
  { id: 'rs3', contratistaId: 'c1', productorId: 'p1', fecha: '2026-07-23', puntaje: 5, labor: 'fertilizacion', texto: 'Distribución pareja de la urea, se notó en el lote. Muy cumplidor.' },
  { id: 'rs4', contratistaId: 'c1', productorId: 'p4', fecha: '2026-08-25', puntaje: 4, labor: 'pulverizacion', texto: 'Cumplió con lo pactado. El parte llegó completo el mismo día.' },
  { id: 'rs5', contratistaId: 'c1', productorId: 'p3', fecha: '2026-07-18', puntaje: 4, labor: 'fertilizacion', texto: 'Trabajo correcto. Tuvimos que reprogramar una vez por lluvia.' },
  // c2 Pascualini → 4,8
  { id: 'rs6', contratistaId: 'c2', productorId: 'p1', fecha: '2026-09-30', puntaje: 5, labor: 'siembra', texto: 'Siembra de maíz impecable, con dosis variable por ambiente como le pedimos. Emergencia muy pareja.' },
  { id: 'rs7', contratistaId: 'c2', productorId: 'p2', fecha: '2026-06-10', puntaje: 5, labor: 'siembra', texto: 'Trigo sembrado a horario y con la densidad justa.' },
  { id: 'rs8', contratistaId: 'c2', productorId: 'p1', fecha: '2026-06-14', puntaje: 5, labor: 'siembra', texto: 'Como siempre, los Pascualini son garantía.' },
  { id: 'rs9', contratistaId: 'c2', productorId: 'p5', fecha: '2026-05-02', puntaje: 4, labor: 'cosecha', texto: 'Cosecha prolija, pocas pérdidas. Un día de demora por la tolva.' },
  { id: 'rs10', contratistaId: 'c2', productorId: 'p4', fecha: '2026-04-20', puntaje: 5, labor: 'cosecha', texto: 'Entregaron el mapa de rendimiento al otro día.' },
  // c3 La Chacra → 4,75
  { id: 'rs11', contratistaId: 'c3', productorId: 'p2', fecha: '2026-09-03', puntaje: 5, labor: 'pulverizacion', texto: 'Registro georreferenciado de cada pasada y el parte con la estación meteorológica. Un lujo.' },
  { id: 'rs12', contratistaId: 'c3', productorId: 'p1', fecha: '2026-09-20', puntaje: 5, labor: 'pulverizacion', texto: 'Muy profesionales. Respetaron las distancias a la casa del puesto.' },
  { id: 'rs13', contratistaId: 'c3', productorId: 'p5', fecha: '2026-03-11', puntaje: 4, labor: 'pulverizacion', texto: 'Buen servicio, un poco más caro que el promedio pero vale la pena.' },
  { id: 'rs14', contratistaId: 'c3', productorId: 'p4', fecha: '2026-02-08', puntaje: 5, labor: 'pulverizacion', texto: 'Vinieron en el día cuando apareció la isoca. Excelente respuesta.' },
  // c4 Don Tito → 4,25
  { id: 'rs15', contratistaId: 'c4', productorId: 'p1', fecha: '2026-09-22', puntaje: 4, labor: 'fertilizacion', texto: 'Trabajo bien hecho. Hubo un parte duplicado que se aclaró enseguida.' },
  { id: 'rs16', contratistaId: 'c4', productorId: 'p3', fecha: '2026-05-15', puntaje: 4, labor: 'laboreo', texto: 'Cumplidor, gente de campo de verdad.' },
  { id: 'rs17', contratistaId: 'c4', productorId: 'p5', fecha: '2026-03-28', puntaje: 5, labor: 'siembra', texto: 'Muy buena disposición, se adaptó a los tiempos del campo.' },
  { id: 'rs18', contratistaId: 'c4', productorId: 'p4', fecha: '2026-01-19', puntaje: 4, labor: 'laboreo', texto: 'Bien, aunque la maquinaria ya tiene sus años.' },
  // c5 Cosechas Villa Cañás → 4,3
  { id: 'rs19', contratistaId: 'c5', productorId: 'p1', fecha: '2026-04-20', puntaje: 4, labor: 'cosecha', texto: 'Cosecharon la soja en tiempo. Buen manejo de la humedad.' },
  { id: 'rs20', contratistaId: 'c5', productorId: 'p1', fecha: '2026-03-22', puntaje: 5, labor: 'cosecha', texto: 'Maíz cosechado con muy pocas pérdidas de cabezal.' },
  { id: 'rs21', contratistaId: 'c5', productorId: 'p3', fecha: '2026-05-06', puntaje: 4, labor: 'cosecha', texto: 'Buen servicio, se llenan rápido de trabajo: hay que reservar con tiempo.' },
  // c7 Pampa Gringa → 4,25
  { id: 'rs22', contratistaId: 'c7', productorId: 'p1', fecha: '2026-08-30', puntaje: 5, labor: 'pulverizacion', texto: 'Barbecho bien hecho, sin escapes.' },
  { id: 'rs23', contratistaId: 'c7', productorId: 'p3', fecha: '2026-06-02', puntaje: 4, labor: 'fertilizacion', texto: 'Correcto.' },
  { id: 'rs24', contratistaId: 'c7', productorId: 'p5', fecha: '2026-04-11', puntaje: 4, labor: 'pulverizacion', texto: 'Buena atención, a veces cuesta ubicarlos por teléfono.' },
  { id: 'rs25', contratistaId: 'c7', productorId: 'p4', fecha: '2026-02-26', puntaje: 4, labor: 'pulverizacion', texto: 'Trabajo prolijo.' },
]

export const DISPUTAS: Disputa[] = [
  {
    id: 'dp1',
    numero: 'DP-0012',
    contratistaId: 'c7',
    productorId: 'p1',
    liquidacionId: 'lq8',
    parteId: 'pt22',
    abiertaPor: 'productor',
    fecha: '2026-10-11',
    motivo: 'Daño por deriva sobre la cortina forestal del puesto. La aplicación se hizo con viento de 17 km/h, fuera de lo indicado en la receta.',
    monto: 1_198_041,
    estado: 'en_mediacion',
    mensajes: [
      { fecha: '2026-10-11T18:40', autor: 'productor', nombre: 'Mariela Costantini', texto: 'Abrimos la disputa: hay daño visible en la cortina del puesto. Adjunto fotos de la recorrida.' },
      { fecha: '2026-10-12T08:15', autor: 'contratista', nombre: 'Ricardo Peralta', texto: 'Cuando arrancamos el viento era de 12 km/h, después levantó. Propongo revisar juntos el lote.' },
      { fecha: '2026-10-13T11:00', autor: 'admin', nombre: 'Mesa de ayuda Libertad', texto: 'Tomamos la mediación. Pedimos a ambas partes las fotos y el registro meteorológico del día antes del 17/10.' },
    ],
  },
]

export const PRESUPUESTOS: Presupuesto[] = [
  {
    id: 'pr1', tipo: 'presupuesto', productorId: 'p5', contratistaId: 'c1', labor: 'pulverizacion', establecimientoId: 'e2', loteIds: [], has: 210,
    fechaDeseada: '2026-10-25', fecha: '2026-10-14', estado: 'solicitado',
    comentario: 'Barbecho corto previo a soja en dos lotes de Villa Cañás. Tenemos receta. ¿Tienen fecha la semana del 25?',
  },
  {
    id: 'pr2', tipo: 'presupuesto', productorId: 'p1', contratistaId: 'c4', labor: 'laboreo', establecimientoId: 'e2', loteIds: ['l8'], has: 115,
    fechaDeseada: '2026-09-03', fecha: '2026-08-25', estado: 'aceptado',
    comentario: 'Una pasada de rastra en El Puesto para emparejar huellas.',
    respuesta: { precio: 34000, unidad: 'ha', fechaPropuesta: '2026-09-05', mensaje: 'Te lo hacemos a $ 34.000 la ha. Entramos el viernes 5.', fecha: '2026-08-26' },
  },
]

export const CONVERSACIONES: Conversacion[] = [
  {
    id: 'cv1', contratistaId: 'c1', productorId: 'p3',
    mensajes: [
      { id: 'w1', autor: 'contratista', automatico: true, fecha: '2026-09-10T09:00', estado: 'leido',
        texto: 'Hola Horacio, ¿cómo va? Te recuerdo que la liquidación LQ-0127 por $ 5.768.100 vence el 13/09/2026. Cualquier duda me avisás. Saludos, Sergio – Servicios Agrícolas El Ombú S.R.L.' },
      { id: 'w2', autor: 'contratista', automatico: true, fecha: '2026-09-13T09:00', estado: 'leido',
        texto: 'Hola Horacio, hoy vence la liquidación LQ-0127 por $ 5.768.100. Si ya la pagaste, podés marcarla como pagada desde la plataforma. ¡Gracias!' },
      { id: 'w3', autor: 'contratista', automatico: true, fecha: '2026-09-20T09:00', estado: 'leido',
        texto: 'Hola Horacio, la liquidación LQ-0127 por $ 5.768.100 figura vencida hace 7 días. ¿Me confirmás cuándo podés pagarla?' },
      { id: 'w4', autor: 'productor', fecha: '2026-09-21T19:42', estado: 'leido',
        texto: 'Sergio, esta semana te giro. Estoy esperando que me liquide el acopio.' },
      { id: 'w5', autor: 'contratista', fecha: '2026-10-01T10:15', estado: 'leido',
        texto: 'Horacio, ¿novedades con la LQ-0127? Ya pasaron más de dos semanas. Avisame así me organizo con el gasoil.' },
    ],
  },
  {
    id: 'cv2', contratistaId: 'c1', productorId: 'p1',
    mensajes: [
      { id: 'w6', autor: 'productor', fecha: '2026-10-07T17:20', estado: 'leido', texto: 'Sergio, ¿podés entrar el jueves a Monte Viejo con el barbecho? La receta ya está cargada.' },
      { id: 'w7', autor: 'contratista', fecha: '2026-10-07T17:35', estado: 'leido', texto: 'Dale Mariela, entramos el jueves temprano si el viento acompaña.' },
    ],
  },
]

/** Entradas del cuaderno que no vienen de partes (recorridas, análisis). */
export const ENTRADAS_MANUALES: EntradaCuaderno[] = [
  { id: 'cm1', establecimientoId: 'e1', loteId: 'l2', campania: '2025/26', fecha: '2025-12-05', tipo: 'recorrida', autor: 'Ing. Agr. Julieta Varela',
    titulo: 'Recorrida · Lote 2 La Loma', detalle: 'Isoca bolillera por encima del umbral de daño en V12. Se emite receta RA-2025-0298.' },
  { id: 'cm2', establecimientoId: 'e1', loteId: 'l2', campania: '2026/27', fecha: '2026-09-20', tipo: 'recorrida', autor: 'Ing. Agr. Julieta Varela',
    titulo: 'Recorrida · Lote 2 La Loma', detalle: 'Roya amarilla en hoja bandera, 15 % de incidencia. Se recomienda fungicida (RA-2026-0187).' },
  { id: 'cm3', establecimientoId: 'e1', loteId: 'l4', campania: '2026/27', fecha: '2026-09-20', tipo: 'recorrida', autor: 'Ing. Agr. Julieta Varela',
    titulo: 'Recorrida · Lote 4 El Molino', detalle: 'Roya amarilla incipiente, 8 % de incidencia. Incluido en la receta RA-2026-0187.' },
  { id: 'cm4', establecimientoId: 'e2', loteId: 'l5', campania: '2026/27', fecha: '2026-08-15', tipo: 'analisis', autor: 'Laboratorio de suelos (muestra 4471)',
    titulo: 'Análisis de suelo · Lote 1 La Tranquera', detalle: 'P Bray 12 ppm · MO 2,8 % · N-nitratos 0-60 cm: 38 kg/ha · pH 6,1.' },
  { id: 'cm5', establecimientoId: 'e1', loteId: 'l1', campania: '2026/27', fecha: '2026-10-10', tipo: 'recorrida', autor: 'Mariela Costantini',
    titulo: 'Recorrida · Lote 1 El Bajo', detalle: 'Emergencia de maíz pareja, 78.500 pl/ha. Sin malezas a la vista.' },
]

export const NOTIFICACIONES: Notificacion[] = [
  // Contratista c1
  { id: 'n1', rol: 'contratista', usuarioId: 'c1', fecha: '2026-10-15T07:00', tipo: 'alerta', leida: false,
    titulo: 'Tu ART vence en 6 días', texto: 'Subí el certificado renovado para mantener el nivel Verificado.', link: '/contratista/perfil' },
  { id: 'n2', rol: 'contratista', usuarioId: 'c1', fecha: '2026-10-14T19:10', tipo: 'ok', leida: false,
    titulo: 'Bonetto e Hijos informó un pago', texto: 'LQ-0152 · transferencia por $ 1.185.665. Confirmá el cobro.', link: '/contratista/cobros' },
  { id: 'n3', rol: 'contratista', usuarioId: 'c1', fecha: '2026-10-14T12:30', tipo: 'info', leida: false,
    titulo: 'Nuevo pedido de presupuesto', texto: 'Campos del Sur Santafesino S.A. · Pulverización · 210 has.', link: '/contratista/trabajos' },
  { id: 'n4', rol: 'contratista', usuarioId: 'c1', fecha: '2026-10-11T09:15', tipo: 'alerta', leida: true,
    titulo: 'Parte PL-0654 observado', texto: 'Los Talas pidió corregir la fecha de aplicación.', link: '/contratista/trabajos' },
  // Productor p1
  { id: 'n5', rol: 'productor', usuarioId: 'p1', fecha: '2026-10-12T13:30', tipo: 'info', leida: false,
    titulo: '3 partes para conformar', texto: 'El Ombú cargó partes en El Bajo, Monte Viejo y La Tranquera.', link: '/productor/partes' },
  { id: 'n6', rol: 'productor', usuarioId: 'p1', fecha: '2026-09-30T11:05', tipo: 'peligro', leida: false,
    titulo: 'Aplicación sin receta asociada', texto: 'PL-0645 · preemergente en Lote 1 El Bajo no tiene receta agronómica.', link: '/productor/partes' },
  { id: 'n7', rol: 'productor', usuarioId: 'p1', fecha: '2026-10-15T07:00', tipo: 'alerta', leida: false,
    titulo: 'LQ-0146 vence el 20/10', texto: 'El Ombú · $ 1.922.700.', link: '/productor/pagos' },
  { id: 'n8', rol: 'productor', usuarioId: 'p1', fecha: '2026-10-13T11:00', tipo: 'info', leida: true,
    titulo: 'Disputa DP-0012 en mediación', texto: 'La mesa de ayuda pidió fotos y registro meteorológico.', link: '/productor/pagos' },
  // Ingeniero i1
  { id: 'n9', rol: 'ingeniero', usuarioId: 'i1', fecha: '2026-10-03T09:00', tipo: 'alerta', leida: false,
    titulo: 'Aplicación para validar', texto: 'PL-0640 · fungicida en Lote 4 El Molino (Los Talas).', link: '/ingeniero/aplicaciones' },
  { id: 'n10', rol: 'ingeniero', usuarioId: 'i1', fecha: '2026-09-30T11:05', tipo: 'peligro', leida: false,
    titulo: 'Aplicación sin receta', texto: 'PL-0645 en Lote 1 El Bajo se cargó sin receta.', link: '/ingeniero/aplicaciones' },
  // Admin
  { id: 'n11', rol: 'admin', fecha: '2026-10-13T16:20', tipo: 'info', leida: false,
    titulo: 'Documentos para revisar', texto: 'Giuliani Servicios Agropecuarios cargó 4 documentos.', link: '/admin/verificaciones' },
  { id: 'n12', rol: 'admin', fecha: '2026-10-11T18:41', tipo: 'peligro', leida: false,
    titulo: 'Nueva disputa', texto: 'DP-0012 · Los Talas vs. La Pampa Gringa (deriva).', link: '/admin/disputas' },
  { id: 'n13', rol: 'admin', fecha: '2026-10-14T07:00', tipo: 'alerta', leida: true,
    titulo: 'Mora mayor a 30 días', texto: 'LQ-0127 · El Ombú → Estancia El Mirasol.', link: '/admin/cobranza' },
]
