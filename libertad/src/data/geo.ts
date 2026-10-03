import type { Localidad } from '@/domain/types'

/** Localidades de la zona piloto (sur de Santa Fe), coordenadas aproximadas. */
export const LOCALIDADES: Record<Localidad, { lat: number; lng: number }> = {
  'Venado Tuerto': { lat: -33.746, lng: -61.969 },
  Rufino: { lat: -34.264, lng: -62.712 },
  Firmat: { lat: -33.459, lng: -61.486 },
  Murphy: { lat: -33.642, lng: -61.858 },
  Hughes: { lat: -33.802, lng: -61.336 },
  'Villa Cañás': { lat: -34.005, lng: -61.607 },
  'Santa Isabel': { lat: -33.891, lng: -61.698 },
  Carmen: { lat: -33.731, lng: -61.761 },
  'María Teresa': { lat: -34.003, lng: -61.898 },
}

export const LOCALIDADES_PILOTO: Localidad[] = ['Venado Tuerto', 'Rufino', 'Firmat', 'Murphy', 'Hughes', 'Villa Cañás']

/** Proyección simple a un viewBox de 620×400 para el mapa de zona. */
export const VISTA_ZONA = { ancho: 620, alto: 400 } as const

export function proyectar(lat: number, lng: number): [number, number] {
  const x = (lng + 62.86) * 380
  const y = (-lat - 33.36) * 380
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
}
