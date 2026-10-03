import type { ReactNode } from 'react'
import { cx } from './cx'
import { Icon, type NombreIcono } from './Icon'
import { TONOS, type Tono } from './tonos'

export type { Tono }

type Props = { tono?: Tono; icono?: NombreIcono; punto?: boolean; children: ReactNode; className?: string; tamano?: 'sm' | 'md' }

/** Chip de estado: color + texto (+ punto o ícono) para no depender solo del color. */
export function Chip({ tono = 'neutro', icono, punto = !icono, children, className, tamano = 'sm' }: Props) {
  const t = TONOS[tono]
  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset',
        tamano === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        t.chip,
        className,
      )}
    >
      {icono ? <Icon nombre={icono} tamano={14} /> : punto ? <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', t.punto)} aria-hidden /> : null}
      <span className="truncate">{children}</span>
    </span>
  )
}
