export type Tono = 'verde' | 'trigo' | 'rojo' | 'cielo' | 'tierra' | 'neutro'

export const TONOS: Record<Tono, { chip: string; punto: string; texto: string; fondo: string }> = {
  verde: { chip: 'bg-verde-100 text-verde-800 ring-verde-200', punto: 'bg-verde-500', texto: 'text-verde-700', fondo: 'bg-verde-50' },
  trigo: { chip: 'bg-trigo-100 text-trigo-900 ring-trigo-200', punto: 'bg-trigo-500', texto: 'text-trigo-800', fondo: 'bg-trigo-50' },
  rojo: { chip: 'bg-rojo-100 text-rojo-800 ring-rojo-200', punto: 'bg-rojo-500', texto: 'text-rojo-700', fondo: 'bg-rojo-50' },
  cielo: { chip: 'bg-cielo-100 text-cielo-800 ring-cielo-200', punto: 'bg-cielo-500', texto: 'text-cielo-700', fondo: 'bg-cielo-50' },
  tierra: { chip: 'bg-tierra-100 text-tierra-800 ring-tierra-200', punto: 'bg-tierra-500', texto: 'text-tierra-700', fondo: 'bg-tierra-50' },
  neutro: { chip: 'bg-paper-3 text-texto-suave ring-borde', punto: 'bg-tierra-400', texto: 'text-texto-suave', fondo: 'bg-paper-2' },
}

