import type { ItemLiquidacion, Liquidacion } from '@/domain/types'

function item(id: string, descripcion: string, cantidad: number, precioUnitario: number, parteId?: string): ItemLiquidacion {
  return { id, descripcion, unidad: 'ha', cantidad, precioUnitario, parteId }
}

/**
 * Liquidaciones en todos los estados de cobro. Escenarios:
 *  - lq4: mora de más de 30 días con recordatorios escalonados ya enviados (F7).
 *  - lq8: en disputa (deriva) con el administrador mediando.
 *  - lq3: el productor informó el pago y falta registrar el cobro.
 */
export const LIQUIDACIONES: Liquidacion[] = [
  {
    id: 'lq1', numero: 'LQ-0098', contratistaId: 'c1', productorId: 'p1', fechaEmision: '2025-12-20', periodo: 'Campaña 2025/26 · La Esperanza',
    items: [
      item('lq1-1', 'Pulverización barbecho · Lote 2 La Loma (PL-0187)', 120, 9800, 'pt01'),
      item('lq1-2', 'Pulverización preemergente · Lote 2 La Loma (PL-0203)', 120, 9800, 'pt03'),
      item('lq1-3', 'Fertilización urea · Lote 2 La Loma (PL-0244)', 120, 7600, 'pt04'),
      item('lq1-4', 'Pulverización barbecho · Lote 1 El Bajo (PL-0251)', 96, 9800, 'pt07'),
      item('lq1-5', 'Pulverización insecticida · Lote 2 La Loma (PL-0306)', 120, 9800, 'pt05'),
      item('lq1-6', 'Pulverización postemergente · Lote 1 El Bajo (PL-0318)', 96, 9800, 'pt09'),
    ],
    alicuotaIva: 10.5, condicion: '30_dias', vencimiento: '2026-01-19', estado: 'cobrada', aceptadaEl: '2025-12-21',
    cobros: [{ id: 'cb1', fecha: '2026-01-16', monto: 8_284_848, medio: 'transferencia', comprobante: 'transferencia-160126.pdf' }],
    recordatorios: [], recordatoriosAutomaticos: true,
  },
  {
    id: 'lq2', numero: 'LQ-0131', contratistaId: 'c1', productorId: 'p1', fechaEmision: '2026-07-31', periodo: 'Julio 2026 · fertilización de trigo',
    items: [
      item('lq2-1', 'Fertilización urea · Lote 2 La Loma (PL-0548)', 120, 11200, 'pt13'),
      item('lq2-2', 'Fertilización urea · Lote 4 El Molino (PL-0551)', 110, 11200, 'pt14'),
    ],
    alicuotaIva: 10.5, condicion: '30_dias', vencimiento: '2026-08-30', estado: 'cobrada', aceptadaEl: '2026-08-01',
    cobros: [{ id: 'cb2', fecha: '2026-08-28', monto: 2_846_480, medio: 'echeq', comprobante: 'echeq-00451288.pdf' }],
    recordatorios: [{ id: 'rc2-1', fecha: '2026-08-27', tipo: 'auto_3_antes', estado: 'enviado', mensaje: 'Recordatorio automático 3 días antes.' }],
    recordatoriosAutomaticos: true,
  },
  {
    id: 'lq3', numero: 'LQ-0152', contratistaId: 'c1', productorId: 'p2', fechaEmision: '2026-10-01', periodo: 'Septiembre 2026 · Las Acacias',
    items: [item('lq3-1', 'Pulverización barbecho · Lote C Sur (PL-0615)', 74, 14500, 'pt32')],
    alicuotaIva: 10.5, condicion: '30_dias', vencimiento: '2026-10-31', estado: 'pago_informado', aceptadaEl: '2026-10-02',
    pagoInformado: { fecha: '2026-10-14', monto: 1_185_665, medio: 'transferencia', comprobante: 'comprobante-transferencia-141026.pdf' },
    cobros: [], recordatorios: [], recordatoriosAutomaticos: true,
  },
  {
    id: 'lq4', numero: 'LQ-0127', contratistaId: 'c1', productorId: 'p3', fechaEmision: '2026-07-15', periodo: 'Julio 2026 · Estancia El Mirasol',
    items: [
      item('lq4-1', 'Pulverización barbecho · Lote 7 (Est. El Mirasol)', 142, 13800),
      item('lq4-2', 'Pulverización barbecho · Lote 9 (Est. El Mirasol)', 98, 13800),
      item('lq4-3', 'Fertilización urea en trigo · Lotes 2 y 3 (Est. El Mirasol)', 180, 10600),
    ],
    alicuotaIva: 10.5, condicion: '60_dias', vencimiento: '2026-09-13', estado: 'aceptada', aceptadaEl: '2026-07-17',
    cobros: [],
    recordatorios: [
      { id: 'rc4-1', fecha: '2026-09-10', tipo: 'auto_3_antes', estado: 'enviado', mensaje: 'Recordatorio automático 3 días antes del vencimiento.' },
      { id: 'rc4-2', fecha: '2026-09-13', tipo: 'auto_dia', estado: 'enviado', mensaje: 'Recordatorio automático el día del vencimiento.' },
      { id: 'rc4-3', fecha: '2026-09-20', tipo: 'auto_7_despues', estado: 'enviado', mensaje: 'Recordatorio automático 7 días después del vencimiento.' },
      { id: 'rc4-4', fecha: '2026-10-01', tipo: 'manual', estado: 'enviado', mensaje: 'Recordatorio enviado a mano por WhatsApp.' },
    ],
    recordatoriosAutomaticos: true,
  },
  {
    id: 'lq5', numero: 'LQ-0139', contratistaId: 'c1', productorId: 'p4', fechaEmision: '2026-08-20', periodo: 'Agosto 2026 · campo Montenegro (Hughes)',
    items: [
      item('lq5-1', 'Pulverización herbicida en trigo · Lote 1 (Montenegro)', 86, 14200),
      item('lq5-2', 'Pulverización herbicida en trigo · Lote 3 (Montenegro)', 64, 14200),
    ],
    alicuotaIva: 10.5, condicion: 'cheque_a_fecha', vencimiento: '2026-10-04', estado: 'cobrada_parcial', aceptadaEl: '2026-08-22',
    cobros: [{ id: 'cb5', fecha: '2026-09-30', monto: 1_200_000, medio: 'cheque', comprobante: 'cheque-diferido-300926.pdf', nota: 'Cheque a fecha 30/09' }],
    recordatorios: [
      { id: 'rc5-1', fecha: '2026-10-01', tipo: 'auto_3_antes', estado: 'enviado', mensaje: 'Recordatorio automático 3 días antes del vencimiento.' },
      { id: 'rc5-2', fecha: '2026-10-04', tipo: 'auto_dia', estado: 'enviado', mensaje: 'Recordatorio automático el día del vencimiento.' },
      { id: 'rc5-3', fecha: '2026-10-11', tipo: 'auto_7_despues', estado: 'enviado', mensaje: 'Recordatorio automático 7 días después del vencimiento.' },
    ],
    recordatoriosAutomaticos: true,
  },
  {
    id: 'lq6', numero: 'LQ-0155', contratistaId: 'c1', productorId: 'p5', fechaEmision: '2026-10-10', periodo: 'Octubre 2026 · Campos del Sur',
    items: [item('lq6-1', 'Pulverización barbecho · Lotes 4 y 5 (Campos del Sur)', 210, 14500)],
    alicuotaIva: 10.5, condicion: 'echeq', vencimiento: '2026-11-09', estado: 'emitida',
    cobros: [], recordatorios: [], recordatoriosAutomaticos: true,
  },
  {
    id: 'lq7', numero: 'LQ-0146', contratistaId: 'c1', productorId: 'p1', fechaEmision: '2026-09-20', periodo: 'Agosto 2026 · herbicida en trigo',
    items: [item('lq7-1', 'Pulverización herbicida · Lote 2 La Loma (PL-0583)', 120, 14500, 'pt15')],
    alicuotaIva: 10.5, condicion: '30_dias', vencimiento: '2026-10-20', estado: 'aceptada', aceptadaEl: '2026-09-21',
    cobros: [],
    recordatorios: [{ id: 'rc7-1', fecha: '2026-10-17', tipo: 'auto_3_antes', estado: 'programado', mensaje: 'Recordatorio automático 3 días antes del vencimiento.' }],
    recordatoriosAutomaticos: true,
  },
  {
    id: 'lq8', numero: 'LQ-0149', contratistaId: 'c7', productorId: 'p1', fechaEmision: '2026-09-25', periodo: 'Septiembre 2026 · Don Aurelio',
    items: [item('lq8-1', 'Pulverización herbicida · Lote 3 La Aguada (PL-0602)', 78, 13900, 'pt22')],
    alicuotaIva: 10.5, condicion: '15_dias', vencimiento: '2026-10-10', estado: 'en_disputa', disputaId: 'dp1',
    cobros: [], recordatorios: [], recordatoriosAutomaticos: false,
  },
  {
    id: 'lq9', numero: 'LQ-0151', contratistaId: 'c4', productorId: 'p1', fechaEmision: '2026-09-28', periodo: 'Septiembre 2026 · Don Aurelio',
    items: [
      item('lq9-1', 'Fertilización MAP · Lote 1 La Tranquera (PL-0612)', 105, 10500, 'pt23'),
      item('lq9-2', 'Laboreo con rastra · Lote 4 El Puesto (PL-0605)', 115, 38000, 'pt24'),
    ],
    alicuotaIva: 10.5, condicion: '30_dias', vencimiento: '2026-10-28', estado: 'observada',
    observacion: 'La tarifa de laboreo acordada por WhatsApp fue $ 34.000/ha, no $ 38.000/ha. Corregila y la acepto.',
    cobros: [], recordatorios: [], recordatoriosAutomaticos: true,
  },
  {
    id: 'lq10', numero: 'LQ-0119', contratistaId: 'c2', productorId: 'p1', fechaEmision: '2026-06-30', periodo: 'Junio 2026 · siembra de trigo',
    items: [
      item('lq10-1', 'Siembra de trigo · Lote 2 La Loma (PL-0512)', 120, 62000, 'pt11'),
      item('lq10-2', 'Siembra de trigo · Lote 4 El Molino (PL-0515)', 110, 62000, 'pt12'),
    ],
    alicuotaIva: 10.5, condicion: '30_dias', vencimiento: '2026-07-30', estado: 'cobrada', aceptadaEl: '2026-07-01',
    cobros: [{ id: 'cb10', fecha: '2026-07-29', monto: 15_757_300, medio: 'transferencia', comprobante: 'transferencia-290726.pdf' }],
    recordatorios: [], recordatoriosAutomaticos: true,
  },
]
