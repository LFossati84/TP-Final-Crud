import { create } from 'zustand'
import type { FlujoDemo } from './catalogo'

interface TourState {
  flujo: FlujoDemo['id'] | null
  paso: number
  iniciar: (id: FlujoDemo['id']) => void
  ir: (paso: number) => void
  salir: () => void
}

export const useTour = create<TourState>()((set) => ({
  flujo: null,
  paso: 0,
  iniciar: (flujo) => set({ flujo, paso: 0 }),
  ir: (paso) => set({ paso }),
  salir: () => set({ flujo: null, paso: 0 }),
}))
