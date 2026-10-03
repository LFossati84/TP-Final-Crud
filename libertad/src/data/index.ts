import { entradaDesdeParte } from '@/domain/cuaderno'
import type {
  Contratista,
  Conversacion,
  Disputa,
  EntradaCuaderno,
  Establecimiento,
  IngenieroAgronomo,
  Insumo,
  Liquidacion,
  Lote,
  Notificacion,
  ParteLabor,
  Presupuesto,
  Productor,
  RecetaAgronomica,
  Resena,
} from '@/domain/types'
import { AGENDA, type TrabajoAgenda } from './agenda'
import { CONTRATISTAS } from './contratistas'
import { ESTABLECIMIENTOS, LOTES } from './establecimientos'
import { INGENIEROS, RECETAS } from './ingenieros'
import { INSUMOS } from './insumos'
import { LIQUIDACIONES } from './liquidaciones'
import { PARTES } from './partes'
import { PRODUCTORES } from './productores'
import { CONVERSACIONES, DISPUTAS, ENTRADAS_MANUALES, NOTIFICACIONES, PRESUPUESTOS, RESENAS } from './red'

export interface Datos {
  contratistas: Contratista[]
  productores: Productor[]
  establecimientos: Establecimiento[]
  lotes: Lote[]
  insumos: Insumo[]
  ingenieros: IngenieroAgronomo[]
  recetas: RecetaAgronomica[]
  partes: ParteLabor[]
  cuaderno: EntradaCuaderno[]
  liquidaciones: Liquidacion[]
  resenas: Resena[]
  disputas: Disputa[]
  presupuestos: Presupuesto[]
  notificaciones: Notificacion[]
  conversaciones: Conversacion[]
  agenda: TrabajoAgenda[]
}

/** Escenario inicial de la demo. Devuelve copias para que "Reiniciar demo" sea limpio. */
export function crearDatosIniciales(): Datos {
  const partes = structuredClone(PARTES)
  const cuadernoDesdePartes = partes
    .filter((p) => p.estado === 'conformado' || p.estado === 'en_disputa')
    .map((p) =>
      entradaDesdeParte(
        p,
        LOTES.find((l) => l.id === p.loteId),
        CONTRATISTAS.find((c) => c.id === p.contratistaId),
        INSUMOS,
      ),
    )
  return {
    contratistas: structuredClone(CONTRATISTAS),
    productores: structuredClone(PRODUCTORES),
    establecimientos: structuredClone(ESTABLECIMIENTOS),
    lotes: structuredClone(LOTES),
    insumos: structuredClone(INSUMOS),
    ingenieros: structuredClone(INGENIEROS),
    recetas: structuredClone(RECETAS),
    partes,
    cuaderno: [...cuadernoDesdePartes, ...structuredClone(ENTRADAS_MANUALES)],
    liquidaciones: structuredClone(LIQUIDACIONES),
    resenas: structuredClone(RESENAS),
    disputas: structuredClone(DISPUTAS),
    presupuestos: structuredClone(PRESUPUESTOS),
    notificaciones: structuredClone(NOTIFICACIONES),
    conversaciones: structuredClone(CONVERSACIONES),
    agenda: structuredClone(AGENDA),
  }
}

export { LIQUIDACION_EXTERNA } from './partes'
export type { TrabajoAgenda } from './agenda'
