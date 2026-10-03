import type { ID, Rol } from '@/domain/types'
import type { Slice } from '../tipos'

export interface AccionesNotificaciones {
  marcarLeida: (id: ID) => void
  marcarTodasLeidas: (rol: Rol, usuarioId?: ID) => void
}

export const crearSliceNotificaciones: Slice<AccionesNotificaciones> = (set) => ({
  marcarLeida: (id) =>
    set((s) => ({ notificaciones: s.notificaciones.map((n) => (n.id === id ? { ...n, leida: true } : n)) })),
  marcarTodasLeidas: (rol, usuarioId) =>
    set((s) => ({
      notificaciones: s.notificaciones.map((n) =>
        n.rol === rol && (!n.usuarioId || !usuarioId || n.usuarioId === usuarioId) ? { ...n, leida: true } : n,
      ),
    })),
})
