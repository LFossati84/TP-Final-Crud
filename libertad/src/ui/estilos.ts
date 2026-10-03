import { cx } from './cx'

export type VarianteBoton = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'suave' | 'acento'
export type TamanoBoton = 'sm' | 'md' | 'lg'

export const VARIANTES_BOTON: Record<VarianteBoton, string> = {
  primario: 'bg-accion text-sobre-accion hover:bg-accion-hover shadow-tarjeta',
  secundario: 'bg-superficie text-texto border border-borde-fuerte hover:bg-paper-2',
  fantasma: 'text-texto hover:bg-paper-2',
  peligro: 'bg-peligro text-sobre-peligro hover:bg-peligro-hover',
  suave: 'bg-verde-100 text-verde-900 hover:bg-verde-200',
  acento: 'bg-acento text-sobre-acento hover:bg-acento-hover',
}

// sm queda en 36px solo con puntero fino (escritorio); en pantallas táctiles sube a 44px.
const TAMANOS: Record<TamanoBoton, string> = {
  sm: 'min-h-9 [@media(pointer:coarse)]:min-h-tactil px-3 text-sm gap-1.5',
  md: 'min-h-tactil px-4 text-sm gap-2',
  lg: 'min-h-12 px-5 text-base gap-2',
}

export function estilosBoton(variante: VarianteBoton = 'primario', tamano: TamanoBoton = 'md', bloque = false): string {
  return cx(
    'inline-flex select-none items-center justify-center rounded-xl font-semibold transition duration-150',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    VARIANTES_BOTON[variante],
    TAMANOS[tamano],
    bloque && 'w-full',
  )
}

