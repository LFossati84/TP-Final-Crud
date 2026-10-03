import { cx } from './cx'
import { iniciales } from './iniciales'

const PALETAS = [
  'bg-verde-200 text-verde-900',
  'bg-trigo-200 text-trigo-900',
  'bg-tierra-200 text-tierra-900',
  'bg-cielo-200 text-cielo-900',
  'bg-rojo-100 text-rojo-900',
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function Avatar({ nombre, tamano = 'md', className }: { nombre: string; tamano?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const tam = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' }[tamano]
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-serif font-semibold', tam, PALETAS[hash(nombre) % PALETAS.length], className)} aria-hidden>
      {iniciales(nombre)}
    </span>
  )
}
