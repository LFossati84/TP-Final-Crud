import type { ReactNode } from 'react'
import { cx } from './cx'
import { Icon, type NombreIcono } from './Icon'

export function EmptyState({ icono = 'hoja', titulo, texto, accion, className }: { icono?: NombreIcono; titulo: string; texto?: ReactNode; accion?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-col items-center justify-center rounded-2xl border border-dashed border-borde-fuerte bg-paper-2/50 px-6 py-10 text-center', className)}>
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-verde-100 text-verde-700">
        <Icon nombre={icono} tamano={26} />
      </span>
      <p className="font-serif text-lg text-tierra-900">{titulo}</p>
      {texto ? <p className="mt-1 max-w-sm text-sm text-texto-suave">{texto}</p> : null}
      {accion ? <div className="mt-4">{accion}</div> : null}
    </div>
  )
}

export function ErrorState({ titulo = 'No pudimos cargar esta sección', texto, onReintentar }: { titulo?: string; texto?: string; onReintentar?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-rojo-200 bg-rojo-50 px-6 py-8 text-center">
      <Icon nombre="alerta" tamano={28} className="mb-2 text-rojo-700" />
      <p className="font-semibold text-rojo-900">{titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-rojo-800">{texto ?? 'Revisá la conexión y probá de nuevo. Lo que cargaste queda guardado en el teléfono.'}</p>
      {onReintentar ? (
        <button type="button" onClick={onReintentar} className="mt-4 inline-flex min-h-tactil items-center gap-2 rounded-xl bg-superficie px-4 text-sm font-semibold text-rojo-800 ring-1 ring-rojo-300 hover:bg-rojo-100">
          <Icon nombre="sync" tamano={16} /> Reintentar
        </button>
      ) : null}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulso rounded-lg bg-paper-3', className)} aria-hidden />
}

/** Bloque de carga genérico para listas/tarjetas. */
export function SkeletonLista({ filas = 3 }: { filas?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
