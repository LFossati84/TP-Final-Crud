import type { IngenieroAgronomo, RecetaAgronomica } from '@/domain/types'

export const INGENIEROS: IngenieroAgronomo[] = [
  { id: 'i1', nombre: 'Julieta Varela', matricula: 'Mat. 2-1487', localidad: 'Venado Tuerto', telefono: '+54 9 3462 43-9015', clientes: ['p1', 'p4'] },
  { id: 'i2', nombre: 'Hernán Sosa Bruno', matricula: 'Mat. 2-0963', localidad: 'Firmat', telefono: '+54 9 3465 47-2201', clientes: ['p2', 'p5'] },
]

const CONDICIONES = 'Viento entre 5 y 15 km/h. No aplicar con temperatura mayor a 28 °C ni humedad relativa menor a 50 %. Respetar distancias a zonas sensibles.'

export const RECETAS: RecetaAgronomica[] = [
  // Campaña 2025/26
  { id: 'r1', numero: 'RA-2025-0211', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l2'], fecha: '2025-08-18', vence: '2025-09-17',
    cultivo: 'barbecho', objetivo: 'Barbecho químico: rama negra y yuyo colorado en emergencia.', productos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-24d', dosis: 0.5 }],
    caldoMin: 70, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r2', numero: 'RA-2025-0236', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l2'], fecha: '2025-09-24', vence: '2025-10-09',
    cultivo: 'maiz', objetivo: 'Preemergente de maíz: control residual de gramíneas y latifoliadas.', productos: [{ insumoId: 'i-atr', dosis: 1.5 }, { insumoId: 'i-sme', dosis: 1.2 }],
    caldoMin: 80, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r3', numero: 'RA-2025-0298', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l2'], fecha: '2025-12-08', vence: '2025-12-23',
    cultivo: 'maiz', objetivo: 'Isoca bolillera por encima del umbral en recorrida del 05/12.', productos: [{ insumoId: 'i-lam', dosis: 30 }],
    caldoMin: 60, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r4', numero: 'RA-2025-0249', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l1'], fecha: '2025-10-18', vence: '2025-11-02',
    cultivo: 'barbecho', objetivo: 'Barbecho corto previo a soja.', productos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-dic', dosis: 0.15 }],
    caldoMin: 70, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r5', numero: 'RA-2025-0302', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l1'], fecha: '2025-12-12', vence: '2025-12-27',
    cultivo: 'soja', objetivo: 'Postemergente de soja: escapes de malezas latifoliadas.', productos: [{ insumoId: 'i-gli', dosis: 2 }],
    caldoMin: 60, condiciones: CONDICIONES, estado: 'aplicada' },
  // Campaña 2026/27
  { id: 'r6', numero: 'RA-2026-0118', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l2', 'l4'], fecha: '2026-08-10', vence: '2026-08-25',
    cultivo: 'trigo', objetivo: 'Control de latifoliadas en trigo macollado.', productos: [{ insumoId: 'i-met', dosis: 6 }, { insumoId: 'i-dic', dosis: 0.12 }],
    caldoMin: 70, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r7', numero: 'RA-2026-0164', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l1', 'l3'], fecha: '2026-08-26', vence: '2026-09-25',
    cultivo: 'barbecho', objetivo: 'Barbecho largo: control de rama negra y gramíneas invernales.', productos: [{ insumoId: 'i-gli', dosis: 2.8 }, { insumoId: 'i-24d', dosis: 0.6 }],
    caldoMin: 80, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r8', numero: 'RA-2026-0187', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l2', 'l4'], fecha: '2026-09-22', vence: '2026-10-07',
    cultivo: 'trigo', objetivo: 'Roya amarilla en hoja bandera por encima del umbral (recorrida 20/09).', productos: [{ insumoId: 'i-azo', dosis: 0.4 }, { insumoId: 'i-ace', dosis: 0.3 }],
    caldoMin: 80, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r9', numero: 'RA-2026-0195', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e2', loteIds: ['l6', 'l8'], fecha: '2026-10-05', vence: '2026-10-25',
    cultivo: 'barbecho', objetivo: 'Barbecho corto previo a soja con residual.', productos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-sme', dosis: 1.2 }],
    caldoMin: 80, condiciones: CONDICIONES, estado: 'emitida' },
  { id: 'r10', numero: 'RA-2026-0151', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e2', loteIds: ['l7'], fecha: '2026-09-08', vence: '2026-09-23',
    cultivo: 'trigo', objetivo: 'Control de latifoliadas en trigo.', productos: [{ insumoId: 'i-met', dosis: 7 }, { insumoId: 'i-dic', dosis: 0.15 }],
    caldoMin: 70, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r13', numero: 'RA-2026-0201', ingenieroId: 'i1', productorId: 'p1', establecimientoId: 'e1', loteIds: ['l3'], fecha: '2026-10-12', vence: '2026-10-27',
    cultivo: 'barbecho', objetivo: 'Barbecho corto previo a soja: rama negra rebrotada y residual para gramíneas.', productos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-sme', dosis: 1.2 }],
    caldoMin: 80, condiciones: CONDICIONES, estado: 'emitida' },
  { id: 'r11', numero: 'RA-2026-0172', ingenieroId: 'i2', productorId: 'p2', establecimientoId: 'e3', loteIds: ['l9'], fecha: '2026-08-30', vence: '2026-09-14',
    cultivo: 'trigo', objetivo: 'Control de latifoliadas en trigo.', productos: [{ insumoId: 'i-met', dosis: 6 }, { insumoId: 'i-dic', dosis: 0.12 }],
    caldoMin: 70, condiciones: CONDICIONES, estado: 'aplicada' },
  { id: 'r12', numero: 'RA-2026-0179', ingenieroId: 'i2', productorId: 'p2', establecimientoId: 'e3', loteIds: ['l11'], fecha: '2026-09-12', vence: '2026-09-27',
    cultivo: 'barbecho', objetivo: 'Barbecho químico previo a soja.', productos: [{ insumoId: 'i-gli', dosis: 2.5 }, { insumoId: 'i-24d', dosis: 0.5 }],
    caldoMin: 70, condiciones: CONDICIONES, estado: 'aplicada' },
]
