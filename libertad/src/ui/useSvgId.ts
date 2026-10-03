import { useId } from 'react'

/** useId apto para referencias url(#id) en SVG (sin caracteres especiales). */
export function useSvgId(prefijo = 'svg'): string {
  return `${prefijo}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}
