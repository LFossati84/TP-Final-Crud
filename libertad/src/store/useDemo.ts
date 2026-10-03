import { create } from 'zustand'
import { crearDatosIniciales } from '@/data'
import type { Rol } from '@/domain/types'
import { crearSliceCobranza } from './slices/cobranza'
import { crearSliceNotificaciones } from './slices/notificaciones'
import { crearSlicePartes } from './slices/partes'
import { crearSliceRed } from './slices/red'
import { CLAVE_ROL, CLAVE_TEMA, crearSliceSesion, leerPreferencia } from './slices/sesion'
import type { DemoState, Tema } from './tipos'

const ROLES: Rol[] = ['contratista', 'productor', 'ingeniero', 'admin']

function rolInicial(): Rol {
  const r = leerPreferencia(CLAVE_ROL)
  return ROLES.find((x) => x === r) ?? 'productor'
}

function temaInicial(): Tema {
  const t = leerPreferencia(CLAVE_TEMA)
  if (t === 'oscuro' || t === 'claro') return t
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

/** Store en memoria de la demo. Refrescar la página vuelve al escenario inicial. */
export const useDemo = create<DemoState>()((...a) => ({
  ...crearDatosIniciales(),
  rol: rolInicial(),
  contratistaId: 'c1',
  productorId: 'p1',
  ingenieroId: 'i1',
  online: true,
  sincronizando: false,
  tema: temaInicial(),
  ...crearSliceSesion(...a),
  ...crearSlicePartes(...a),
  ...crearSliceRed(...a),
  ...crearSliceCobranza(...a),
  ...crearSliceNotificaciones(...a),
}))
