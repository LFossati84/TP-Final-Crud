import type { Establecimiento, Lote } from '@/domain/types'

/** Polígonos en coordenadas locales de cada establecimiento (viewBox 400×300). */
export const ESTABLECIMIENTOS: Establecimiento[] = [
  {
    id: 'e1',
    productorId: 'p1',
    nombre: 'La Esperanza',
    localidad: 'Murphy',
    lat: -33.668,
    lng: -61.884,
    casco: [200, 145],
    camino: [[0, 145], [400, 142]],
  },
  {
    id: 'e2',
    productorId: 'p1',
    nombre: 'Don Aurelio',
    localidad: 'Villa Cañás',
    lat: -34.021,
    lng: -61.637,
    casco: [155, 132],
    camino: [[155, 0], [155, 300]],
  },
  {
    id: 'e3',
    productorId: 'p2',
    nombre: 'Las Acacias',
    localidad: 'Firmat',
    lat: -33.482,
    lng: -61.512,
    casco: [390, 105],
    camino: [[0, 105], [400, 105]],
  },
]

export const LOTES: Lote[] = [
  // La Esperanza
  { id: 'l1', establecimientoId: 'e1', nombre: 'Lote 1 · El Bajo', has: 96, ambiente: 'bajo',
    cultivos: { '2025/26': 'soja', '2026/27': 'maiz' },
    poligono: [[18, 18], [196, 14], [192, 134], [22, 138]] },
  { id: 'l2', establecimientoId: 'e1', nombre: 'Lote 2 · La Loma', has: 120, ambiente: 'loma',
    cultivos: { '2025/26': 'maiz', '2026/27': 'trigo' },
    poligono: [[206, 14], [382, 20], [380, 132], [202, 134]] },
  { id: 'l3', establecimientoId: 'e1', nombre: 'Lote 3 · Los Paraísos', has: 84, ambiente: 'media loma',
    cultivos: { '2025/26': 'trigo', '2026/27': 'soja' },
    poligono: [[22, 154], [188, 152], [184, 284], [18, 282]] },
  { id: 'l4', establecimientoId: 'e1', nombre: 'Lote 4 · El Molino', has: 110, ambiente: 'loma',
    cultivos: { '2025/26': 'soja', '2026/27': 'trigo' },
    poligono: [[214, 152], [380, 150], [384, 284], [210, 286]] },
  // Don Aurelio
  { id: 'l5', establecimientoId: 'e2', nombre: 'Lote 1 · La Tranquera', has: 105, ambiente: 'loma',
    cultivos: { '2025/26': 'soja', '2026/27': 'maiz' },
    poligono: [[168, 16], [300, 16], [296, 122], [168, 126]] },
  { id: 'l6', establecimientoId: 'e2', nombre: 'Lote 2 · Monte Viejo', has: 92, ambiente: 'media loma',
    cultivos: { '2025/26': 'maiz', '2026/27': 'soja' },
    poligono: [[310, 16], [384, 18], [384, 176], [306, 168]] },
  { id: 'l7', establecimientoId: 'e2', nombre: 'Lote 3 · La Aguada', has: 78, ambiente: 'bajo',
    cultivos: { '2025/26': 'soja', '2026/27': 'trigo' },
    poligono: [[16, 20], [142, 16], [142, 284], [20, 280]] },
  { id: 'l8', establecimientoId: 'e2', nombre: 'Lote 4 · El Puesto', has: 115, ambiente: 'media loma',
    cultivos: { '2025/26': 'trigo', '2026/27': 'soja' },
    poligono: [[168, 140], [296, 136], [302, 180], [384, 190], [384, 284], [168, 284]] },
  // Las Acacias
  { id: 'l9', establecimientoId: 'e3', nombre: 'Lote A · Norte', has: 88, ambiente: 'loma',
    cultivos: { '2025/26': 'soja', '2026/27': 'trigo' },
    poligono: [[16, 14], [382, 18], [380, 92], [18, 96]] },
  { id: 'l10', establecimientoId: 'e3', nombre: 'Lote B · Centro', has: 101, ambiente: 'media loma',
    cultivos: { '2025/26': 'trigo', '2026/27': 'maiz' },
    poligono: [[18, 118], [376, 116], [380, 194], [16, 198]] },
  { id: 'l11', establecimientoId: 'e3', nombre: 'Lote C · Sur', has: 74, ambiente: 'bajo',
    cultivos: { '2025/26': 'maiz', '2026/27': 'soja' },
    poligono: [[16, 212], [380, 208], [384, 286], [20, 284]] },
]
