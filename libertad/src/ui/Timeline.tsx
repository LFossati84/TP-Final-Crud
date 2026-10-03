import type { ReactNode } from 'react'
import { cx } from './cx'
import { TONOS, type Tono } from './tonos'
import { Icon, type NombreIcono } from './Icon'

export interface ItemTimeline {
  id: string
  fecha: ReactNode
  titulo: ReactNode
  detalle?: ReactNode
  icono: NombreIcono
  tono?: Tono
  extra?: ReactNode
  /** Resalta el ítem (ej. recién agregado). */
  nuevo?: boolean
}

export function Timeline({ items, compacta = false }: { items: ItemTimeline[]; compacta?: boolean }) {
  return (
    <ol className="relative">
      {items.map((it, i) => {
        const t = TONOS[it.tono ?? 'tierra']
        const ultimo = i === items.length - 1
        return (
          <li key={it.id} className={cx('relative flex gap-3 sm:gap-4', !ultimo && (compacta ? 'pb-4' : 'pb-6'), it.nuevo && 'animate-entrar-arriba')}>
            {!ultimo ? <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-borde" aria-hidden /> : null}
            <span className={cx('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-superficie', t.chip)}>
              <Icon nombre={it.icono} tamano={18} />
            </span>
            <div className={cx('min-w-0 flex-1 pt-1', it.nuevo && 'rounded-xl bg-trigo-50 p-2 ring-1 ring-trigo-200 -m-2 mb-0')}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="font-semibold text-texto">{it.titulo}</p>
                <p className="num text-xs text-texto-suave">{it.fecha}</p>
              </div>
              {it.detalle ? <div className="mt-0.5 text-sm text-texto-suave">{it.detalle}</div> : null}
              {it.extra ? <div className="mt-2">{it.extra}</div> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
