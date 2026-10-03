import type { KeyboardEvent, ReactNode } from 'react'
import { cx } from './cx'

export interface Columna<T> {
  clave: string
  titulo: ReactNode
  render: (fila: T) => ReactNode
  alinear?: 'izq' | 'der' | 'centro'
  className?: string
  /** Ocultar en pantallas chicas (se ve igual en la tarjeta móvil). */
  ocultarEnMovil?: boolean
}

type Props<T> = {
  columnas: Columna<T>[]
  filas: T[]
  claveFila: (fila: T) => string
  onFila?: (fila: T) => void
  vacio?: ReactNode
  /** Render alternativo en mobile (< sm). Si no se pasa, la tabla scrollea horizontalmente. */
  tarjetaMovil?: (fila: T) => ReactNode
  etiqueta: string
  filaActiva?: string
}

export function Table<T>({ columnas, filas, claveFila, onFila, vacio, tarjetaMovil, etiqueta, filaActiva }: Props<T>) {
  if (filas.length === 0 && vacio) return <>{vacio}</>

  const alinear = (a?: Columna<T>['alinear']) => (a === 'der' ? 'text-right' : a === 'centro' ? 'text-center' : 'text-left')
  const teclado = (e: KeyboardEvent, fila: T) => {
    if (onFila && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onFila(fila)
    }
  }

  return (
    <>
      {tarjetaMovil ? (
        <ul className="space-y-2 sm:hidden" aria-label={etiqueta}>
          {filas.map((f) => (
            <li key={claveFila(f)}>
              {onFila ? (
                <button type="button" onClick={() => onFila(f)} className="block w-full rounded-xl text-left">
                  {tarjetaMovil(f)}
                </button>
              ) : (
                tarjetaMovil(f)
              )}
            </li>
          ))}
        </ul>
      ) : null}
      <div className={cx('overflow-x-auto rounded-xl border border-borde', tarjetaMovil && 'hidden sm:block')}>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">{etiqueta}</caption>
          <thead className="bg-paper-2 text-xs uppercase tracking-wide text-texto-suave">
            <tr>
              {columnas.map((c) => (
                <th key={c.clave} scope="col" className={cx('px-3 py-2.5 font-semibold', alinear(c.alinear), c.ocultarEnMovil && 'hidden md:table-cell', c.className)}>
                  {c.titulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-borde bg-superficie">
            {filas.map((f) => {
              const clave = claveFila(f)
              return (
                <tr
                  key={clave}
                  onClick={onFila ? () => onFila(f) : undefined}
                  onKeyDown={onFila ? (e) => teclado(e, f) : undefined}
                  tabIndex={onFila ? 0 : undefined}
                  className={cx(onFila && 'cursor-pointer transition hover:bg-paper-2 focus-visible:bg-paper-2', filaActiva === clave && 'bg-verde-50')}
                >
                  {columnas.map((c) => (
                    <td key={c.clave} className={cx('px-3 py-3 align-middle', alinear(c.alinear), c.ocultarEnMovil && 'hidden md:table-cell', c.className)}>
                      {c.render(f)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
