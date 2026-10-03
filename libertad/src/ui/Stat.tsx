import type { ReactNode } from 'react'
import { cx } from './cx'
import { TONOS, type Tono } from './tonos'
import { Icon, type NombreIcono } from './Icon'

/** Tarjeta de indicador (KPI). */
export function Stat({ etiqueta, valor, detalle, icono, tono = 'tierra', className, destacado }: { etiqueta: string; valor: ReactNode; detalle?: ReactNode; icono?: NombreIcono; tono?: Tono; className?: string; destacado?: boolean }) {
  const t = TONOS[tono]
  return (
    <div className={cx('rounded-2xl border p-4', destacado ? cx(t.fondo, 'border-transparent ring-1 ring-inset', t.chip.split(' ').find((c) => c.startsWith('ring-'))) : 'border-borde bg-superficie shadow-tarjeta', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{etiqueta}</p>
        {icono ? (
          <span className={cx('flex h-8 w-8 items-center justify-center rounded-full', t.chip)}>
            <Icon nombre={icono} tamano={16} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold leading-tight text-tierra-900">{valor}</p>
      {detalle ? <div className="mt-1 text-sm text-texto-suave">{detalle}</div> : null}
    </div>
  )
}
