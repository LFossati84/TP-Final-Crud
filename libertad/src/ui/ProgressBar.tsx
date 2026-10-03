import { cx } from './cx'

/** Barra de progreso 0–1 con etiqueta accesible. */
export function ProgressBar({ valor, etiqueta, tono = 'verde', className, mostrarValor = true }: { valor: number; etiqueta: string; tono?: 'verde' | 'trigo' | 'rojo'; className?: string; mostrarValor?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, valor)) * 100)
  const color = { verde: 'bg-verde-500', trigo: 'bg-trigo-500', rojo: 'bg-rojo-500' }[tono]
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-texto-suave">{etiqueta}</span>
        {mostrarValor ? <span className="num font-semibold text-texto">{pct} %</span> : null}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-paper-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={etiqueta}>
        <div className={cx('h-full rounded-full transition-[width] duration-500', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
