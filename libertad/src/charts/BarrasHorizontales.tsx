import { useState } from 'react'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'

export interface DatoBarra {
  clave: string
  etiqueta: string
  valor: number
  detalle?: string
}

type Props = {
  titulo: string
  datos: DatoBarra[]
  formato: (v: number) => string
  /** Encabezado de la columna de valores en la vista de tabla. */
  columnaValor: string
}

/**
 * Barras horizontales de una sola serie (magnitud). Barra ≤ 20 px, extremo
 * redondeado de 4 px y recto en la base; valor en la punta con tokens de texto;
 * tooltip por barra en hover y foco; vista de tabla alternativa.
 */
export function BarrasHorizontales({ titulo, datos, formato, columnaValor }: Props) {
  const [tabla, setTabla] = useState(false)
  const [activo, setActivo] = useState<string | null>(null)
  const max = Math.max(1, ...datos.map((d) => d.valor))
  const ordenados = [...datos].sort((a, b) => b.valor - a.valor)

  return (
    <figure>
      <div className="mb-3 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setTabla((t) => !t)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-texto-suave hover:bg-paper-2 hover:text-texto"
          aria-pressed={tabla}
        >
          <Icon nombre={tabla ? 'grafico' : 'lista'} tamano={14} /> {tabla ? 'Ver gráfico' : 'Ver tabla'}
        </button>
      </div>
      {tabla ? (
        <table className="w-full text-sm">
          <caption className="sr-only">{titulo}</caption>
          <thead>
            <tr className="border-b border-borde text-left text-xs uppercase tracking-wide text-texto-suave">
              <th scope="col" className="py-2 font-semibold">Categoría</th>
              <th scope="col" className="py-2 text-right font-semibold">{columnaValor}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {ordenados.map((d) => (
              <tr key={d.clave}>
                <td className="py-2">
                  {d.etiqueta}
                  {d.detalle ? <span className="block text-xs text-texto-suave">{d.detalle}</span> : null}
                </td>
                <td className="num py-2 text-right font-semibold">{formato(d.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="space-y-3" aria-label={titulo}>
          {ordenados.map((d) => {
            const pct = (d.valor / max) * 100
            const on = activo === d.clave
            return (
              <li key={d.clave} className="grid grid-cols-[minmax(6rem,11rem)_1fr] items-center gap-3">
                <span className="truncate text-sm text-texto" title={d.etiqueta}>{d.etiqueta}</span>
                <div
                  className="relative flex h-7 items-center border-l border-borde-fuerte outline-none"
                  tabIndex={0}
                  role="img"
                  aria-label={`${d.etiqueta}: ${formato(d.valor)}${d.detalle ? `, ${d.detalle}` : ''}`}
                  onPointerEnter={() => setActivo(d.clave)}
                  onPointerLeave={() => setActivo(null)}
                  onFocus={() => setActivo(d.clave)}
                  onBlur={() => setActivo(null)}
                >
                  <span
                    className={cx('h-5 rounded-r bg-verde-600 transition-[width,opacity] duration-500', activo && !on && 'opacity-50')}
                    style={{ width: `max(2px, calc(${pct}% - 5.5rem))` }}
                  />
                  <span className="num ml-2 whitespace-nowrap text-xs font-semibold text-texto">{formato(d.valor)}</span>
                  {on ? (
                    <span role="tooltip" className="pointer-events-none absolute -top-10 left-0 z-10 whitespace-nowrap rounded-lg bg-superficie px-2.5 py-1.5 text-xs shadow-elevada ring-1 ring-borde">
                      <strong className="num block text-texto">{formato(d.valor)}</strong>
                      <span className="text-texto-suave">{d.etiqueta}{d.detalle ? ` · ${d.detalle}` : ''}</span>
                    </span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <figcaption className="sr-only">{titulo}</figcaption>
    </figure>
  )
}
