import type { Rol } from '@/domain/types'
import type { DemoState } from '@/store/tipos'
import type { FlujoDemo } from './catalogo'

type Dinamico = string | ((s: DemoState) => string)

export interface PasoTour {
  /** Rol en el que ocurre el paso; si cambia, se muestra la transición "Ahora sos…". */
  rol: Rol
  /** Ruta a la que hay que ir antes de mostrar el paso (opcional). */
  ruta?: Dinamico
  /** Selector CSS del elemento a resaltar. Sin selector = tarjeta centrada. */
  objetivo?: Dinamico
  titulo: string
  texto: string
  /**
   * Cómo se avanza: 'click' en el objetivo, 'aparece' cuando aparece `cuando`,
   * o 'siguiente' con el botón del recorrido.
   */
  avance: 'click' | 'aparece' | 'siguiente'
  cuando?: Dinamico
  /** Se ejecuta al entrar al paso (ej. cambiar la persona activa). */
  antes?: (s: DemoState) => void
  /** Cierra el diálogo abierto (Esc) al avanzar. */
  cerrarDialogo?: boolean
}

export interface DefinicionFlujo {
  id: FlujoDemo['id']
  preparar: (s: DemoState) => void
  pasos: PasoTour[]
  alTerminar?: (s: DemoState) => void
}

export function resolver(v: Dinamico | undefined, s: DemoState): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'function' ? v(s) : v
}

/** Atajo: selector por data-tour. */
export const t = (clave: string) => `[data-tour="${clave}"]`
