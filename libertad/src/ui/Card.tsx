import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

type Props = HTMLAttributes<HTMLDivElement> & { relleno?: boolean; interactiva?: boolean }

export function Card({ relleno = true, interactiva = false, className, ...resto }: Props) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-borde bg-superficie shadow-tarjeta',
        relleno && 'p-4 sm:p-5',
        interactiva && 'transition hover:-translate-y-px hover:border-borde-fuerte hover:shadow-elevada',
        className,
      )}
      {...resto}
    />
  )
}

export function CardHeader({ titulo, subtitulo, acciones, className }: { titulo: ReactNode; subtitulo?: ReactNode; acciones?: ReactNode; className?: string }) {
  return (
    <div className={cx('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <h2 className="text-lg leading-tight text-tierra-900">{titulo}</h2>
        {subtitulo ? <p className="mt-0.5 text-sm text-texto-suave">{subtitulo}</p> : null}
      </div>
      {acciones ? <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div> : null}
    </div>
  )
}
