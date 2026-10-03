import type { FechaISO, ID, TipoLabor } from '@/domain/types'

/** Trabajos agendados del contratista (para "Trabajos de hoy" y precarga del parte). */
export interface TrabajoAgenda {
  id: ID
  contratistaId: ID
  fecha: FechaISO
  hora: string
  loteId: ID
  labor: TipoLabor
  has: number
  recetaId?: ID
  borradorId?: ID
  nota: string
}

export const AGENDA: TrabajoAgenda[] = [
  { id: 'ag1', contratistaId: 'c1', fecha: '2026-10-15', hora: '07:30', loteId: 'l3', labor: 'pulverizacion', has: 84, recetaId: 'r13',
    nota: 'Barbecho corto previo a soja. Ojo con la casa del puesto al norte del lote.' },
  { id: 'ag2', contratistaId: 'c1', fecha: '2026-10-15', hora: '14:00', loteId: 'l10', labor: 'fertilizacion', has: 101, borradorId: 'pt28',
    nota: 'Terminar la urea que se cortó ayer por la lluvia.' },
  { id: 'ag3', contratistaId: 'c1', fecha: '2026-10-17', hora: '08:00', loteId: 'l4', labor: 'pulverizacion', has: 110,
    nota: 'Segunda aplicación de fungicida, a confirmar con la Ing. Varela.' },
  { id: 'ag4', contratistaId: 'c3', fecha: '2026-10-15', hora: '08:00', loteId: 'l9', labor: 'pulverizacion', has: 88, nota: 'Recorrida de control post aplicación.' },
]
