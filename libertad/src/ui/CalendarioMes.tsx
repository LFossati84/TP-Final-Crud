import { diaSemana } from '@/domain/reloj'
import { mesLargo } from '@/domain/format'
import type { FechaISO } from '@/domain/types'
import { cx } from './cx'

export interface EventoCalendario {
  fecha: FechaISO
  tipo: 'labor' | 'vencimiento' | 'pendiente'
  texto: string
}

const COLOR = { labor: 'bg-verde-600', vencimiento: 'bg-rojo-600', pendiente: 'bg-cielo-600' }
const DIAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

type Props = { anio: number; mes: number; hoy: FechaISO; eventos: EventoCalendario[]; seleccion?: FechaISO; onSeleccionar?: (f: FechaISO) => void }

/** Calendario mensual compacto con puntos por tipo de evento. */
export function CalendarioMes({ anio, mes, hoy, eventos, seleccion, onSeleccionar }: Props) {
  const primero = `${anio}-${String(mes).padStart(2, '0')}-01`
  const offset = (diaSemana(primero) + 6) % 7
  const diasMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
  const celdas = Array.from({ length: offset + diasMes }, (_, i) => (i < offset ? null : i - offset + 1))

  return (
    <div>
      <p className="mb-2 text-sm font-semibold capitalize text-texto">{mesLargo(mes)} {anio}</p>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={`Calendario de ${mesLargo(mes)}`}>
        {DIAS.map((d, i) => (
          <span key={i} className="py-1 text-[11px] font-semibold text-texto-suave" aria-hidden>{d}</span>
        ))}
        {celdas.map((d, i) => {
          if (d === null) return <span key={`v${i}`} />
          const f = `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const ev = eventos.filter((e) => e.fecha === f)
          const tipos = [...new Set(ev.map((e) => e.tipo))]
          return (
            <button
              key={f}
              type="button"
              onClick={() => onSeleccionar?.(f)}
              aria-label={`${d} de ${mesLargo(mes)}${ev.length ? `: ${ev.map((e) => e.texto).join('; ')}` : ''}`}
              aria-pressed={seleccion === f}
              className={cx(
                'flex aspect-square min-h-9 flex-col items-center justify-center rounded-lg text-sm transition',
                f === hoy && 'font-bold ring-2 ring-inset ring-verde-500',
                seleccion === f ? 'bg-tierra-800 text-tierra-50' : 'hover:bg-paper-2',
                f < hoy && seleccion !== f && 'text-texto-suave',
              )}
            >
              <span className="num">{d}</span>
              <span className="flex h-1.5 gap-0.5">
                {tipos.map((t) => <span key={t} className={cx('h-1.5 w-1.5 rounded-full', COLOR[t])} />)}
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 text-[11px] text-texto-suave">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-verde-600" />Labor</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cielo-600" />Por conformar</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rojo-600" />Vencimiento</span>
      </div>
    </div>
  )
}
