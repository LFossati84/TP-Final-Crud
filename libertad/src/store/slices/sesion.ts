import { crearDatosIniciales } from '@/data'
import type { ID, Rol } from '@/domain/types'
import type { Slice, Tema } from '../tipos'

export const CLAVE_ROL = 'libertad:rol'
export const CLAVE_TEMA = 'libertad:tema'

/** localStorage solo guarda preferencias de UI (rol y tema), nunca datos de negocio. */
function guardarPreferencia(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor)
  } catch {
    // Navegación privada o almacenamiento bloqueado: la demo sigue funcionando.
  }
}

export function leerPreferencia(clave: string): string | null {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

export interface AccionesSesion {
  setRol: (rol: Rol) => void
  setContratista: (id: ID) => void
  setProductor: (id: ID) => void
  setIngeniero: (id: ID) => void
  setOnline: (online: boolean) => void
  /**
   * Recupera la señal y, si hay partes en cola, simula la sincronización
   * (~2 s). Devuelve cuántos partes se enviaron.
   */
  reconectar: () => Promise<number>
  setTema: (tema: Tema) => void
  reiniciar: () => void
}

export const crearSliceSesion: Slice<AccionesSesion> = (set, get) => ({
  setRol: (rol) => {
    guardarPreferencia(CLAVE_ROL, rol)
    set({ rol })
  },
  setContratista: (contratistaId) => set({ contratistaId }),
  setProductor: (productorId) => set({ productorId }),
  setIngeniero: (ingenieroId) => set({ ingenieroId }),
  setOnline: (online) => set({ online }),
  reconectar: () => {
    const pendientes = get().partes.filter((p) => p.estado === 'pendiente_sync').length
    set({ online: true, sincronizando: pendientes > 0 })
    if (pendientes === 0) return Promise.resolve(0)
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const n = get().sincronizar()
        set({ sincronizando: false })
        resolve(n)
      }, 2000)
    })
  },
  setTema: (tema) => {
    guardarPreferencia(CLAVE_TEMA, tema)
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    set({ tema })
  },
  reiniciar: () =>
    set({ ...crearDatosIniciales(), online: true, sincronizando: false, contratistaId: 'c1', productorId: 'p1', ingenieroId: 'i1' }),
})
