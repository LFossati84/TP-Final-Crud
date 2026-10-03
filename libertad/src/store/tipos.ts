import type { StateCreator } from 'zustand'
import type { Datos } from '@/data'
import type { ID, Rol } from '@/domain/types'
import type { AccionesCobranza } from './slices/cobranza'
import type { AccionesNotificaciones } from './slices/notificaciones'
import type { AccionesPartes } from './slices/partes'
import type { AccionesRed } from './slices/red'
import type { AccionesSesion } from './slices/sesion'

export type Tema = 'claro' | 'oscuro'

export interface Sesion {
  rol: Rol
  /** Persona activa dentro de cada rol (la demo permite "ver como" otro usuario). */
  contratistaId: ID
  productorId: ID
  ingenieroId: ID
  online: boolean
  /** Animación de sincronización en curso (al recuperar señal). */
  sincronizando: boolean
  tema: Tema
}

export type DemoState = Datos &
  Sesion &
  AccionesSesion &
  AccionesPartes &
  AccionesRed &
  AccionesCobranza &
  AccionesNotificaciones

export type Slice<T> = StateCreator<DemoState, [], [], T>
