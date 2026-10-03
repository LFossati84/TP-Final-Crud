import { cx } from './cx'
import { Icon } from './Icon'

type Props = { pasos: string[]; actual: number; compacto?: boolean; onIr?: (i: number) => void }

/** Indicador de pasos. `actual` es 0-based. Solo se puede volver a pasos ya hechos. */
export function Stepper({ pasos, actual, compacto = false, onIr }: Props) {
  return (
    <nav aria-label="Progreso">
      {compacto ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
          Paso {actual + 1} de {pasos.length} · <span className="text-verde-700">{pasos[actual]}</span>
        </p>
      ) : null}
      <ol className="flex items-center gap-1.5">
        {pasos.map((p, i) => {
          const hecho = i < actual
          const activo = i === actual
          const contenido = compacto ? (
            <span className={cx('block h-1.5 w-full rounded-full transition-colors', hecho ? 'bg-verde-500' : activo ? 'bg-verde-400' : 'bg-paper-3')} />
          ) : (
            <span className="flex items-center gap-2">
              <span
                className={cx(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 transition',
                  hecho && 'bg-accion text-sobre-accion ring-accion',
                  activo && 'bg-superficie text-verde-800 ring-verde-500',
                  !hecho && !activo && 'bg-paper-2 text-texto-suave ring-borde',
                )}
              >
                {hecho ? <Icon nombre="check" tamano={16} /> : i + 1}
              </span>
              <span className={cx('hidden text-sm lg:inline', activo ? 'font-semibold text-texto' : 'text-texto-suave')}>{p}</span>
            </span>
          )
          return (
            <li key={p} className={cx('flex items-center', compacto ? 'flex-1' : 'gap-1.5', !compacto && i < pasos.length - 1 && 'flex-1')} aria-current={activo ? 'step' : undefined}>
              {onIr && hecho ? (
                <button type="button" onClick={() => onIr(i)} className="w-full rounded-full" aria-label={`Volver a: ${p}`}>
                  {contenido}
                </button>
              ) : (
                <span className="w-full" aria-label={compacto ? `${p}${hecho ? ' (hecho)' : activo ? ' (actual)' : ''}` : undefined}>
                  {contenido}
                </span>
              )}
              {!compacto && i < pasos.length - 1 ? <span className={cx('h-0.5 flex-1 rounded-full', hecho ? 'bg-verde-500' : 'bg-borde')} aria-hidden /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
