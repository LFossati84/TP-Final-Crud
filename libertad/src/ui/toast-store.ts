import { create } from 'zustand'

export type TipoToast = 'ok' | 'info' | 'alerta' | 'error'

export interface ToastItem {
  id: number
  tipo: TipoToast
  titulo: string
  detalle?: string
}

interface ToastState {
  toasts: ToastItem[]
  agregar: (t: Omit<ToastItem, 'id'>) => void
  quitar: (id: number) => void
}

let siguiente = 1

export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  agregar: (t) => {
    const id = siguiente++
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }))
    window.setTimeout(() => get().quitar(id), t.tipo === 'error' ? 7000 : 4500)
  },
  quitar: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

/** API corta: toast.ok('Parte enviado', 'Te avisamos cuando lo conformen'). */
export const toast = {
  ok: (titulo: string, detalle?: string) => useToasts.getState().agregar({ tipo: 'ok', titulo, detalle }),
  info: (titulo: string, detalle?: string) => useToasts.getState().agregar({ tipo: 'info', titulo, detalle }),
  alerta: (titulo: string, detalle?: string) => useToasts.getState().agregar({ tipo: 'alerta', titulo, detalle }),
  error: (titulo: string, detalle?: string) => useToasts.getState().agregar({ tipo: 'error', titulo, detalle }),
}
