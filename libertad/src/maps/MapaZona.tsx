import { LOCALIDADES, proyectar, VISTA_ZONA } from '@/data/geo'
import type { Contratista, ID, Localidad } from '@/domain/types'
import { cx } from '@/ui/cx'

export interface MarcadorZona {
  contratista: Contratista
  advertencia?: boolean
}

type Props = {
  marcadores: MarcadorZona[]
  seleccionado?: ID
  onSeleccionar?: (id: ID) => void
  /** Localidades a resaltar (ej. zona del establecimiento). */
  resaltar?: Localidad[]
}

/** Mapa esquemático del sur de Santa Fe con las bases de los contratistas. */
export function MapaZona({ marcadores, seleccionado, onSeleccionar, resaltar = [] }: Props) {
  const porLocalidad = new Map<Localidad, MarcadorZona[]>()
  for (const m of marcadores) porLocalidad.set(m.contratista.localidad, [...(porLocalidad.get(m.contratista.localidad) ?? []), m])

  return (
    <figure className="overflow-hidden rounded-2xl border border-borde bg-[#ECE6D6] dark:bg-paper-3">
      <svg viewBox={`0 0 ${VISTA_ZONA.ancho} ${VISTA_ZONA.alto}`} className="block h-auto w-full" role="group" aria-label="Mapa de contratistas por localidad">
        {/* Rutas esquemáticas */}
        <polyline points={[proyectar(-34.264, -62.712), proyectar(-33.746, -61.969), proyectar(-33.459, -61.486)].map((p) => p.join(',')).join(' ')} fill="none" className="stroke-tierra-300" strokeWidth="5" strokeLinecap="round" />
        <polyline points={[proyectar(-33.642, -61.858), proyectar(-33.746, -61.969), proyectar(-34.005, -61.607)].map((p) => p.join(',')).join(' ')} fill="none" className="stroke-tierra-300" strokeWidth="4" strokeLinecap="round" />
        <polyline points={[proyectar(-33.802, -61.336), proyectar(-34.005, -61.607), proyectar(-34.003, -61.898)].map((p) => p.join(',')).join(' ')} fill="none" className="stroke-tierra-300" strokeWidth="3" strokeLinecap="round" />
        {(Object.keys(LOCALIDADES) as Localidad[]).map((loc) => {
          const c = LOCALIDADES[loc]
          const [x, y] = proyectar(c.lat, c.lng)
          const res = resaltar.includes(loc)
          return (
            <g key={loc} pointerEvents="none">
              {res ? <circle cx={x} cy={y} r="38" className="fill-verde-500/10 stroke-verde-500/40" strokeDasharray="3 3" /> : null}
              <circle cx={x} cy={y} r="4" className="fill-tierra-700" />
              <text x={x} y={y + 18} textAnchor="middle" className="fill-tierra-800 font-sans text-[12px] font-semibold">{loc}</text>
            </g>
          )
        })}
        {[...porLocalidad.entries()].map(([loc, lista]) => {
          const base = LOCALIDADES[loc]
          const [x, y] = proyectar(base.lat, base.lng)
          return lista.map((m, i) => {
            const ang = (i / Math.max(1, lista.length)) * Math.PI * 2 - Math.PI / 2
            const r = lista.length > 1 ? 16 : 0
            const mx = x + Math.cos(ang) * r
            const my = y - 14 + Math.sin(ang) * r
            const sel = m.contratista.id === seleccionado
            return (
              <g
                key={m.contratista.id}
                role="button"
                tabIndex={0}
                aria-label={`${m.contratista.razonSocial}, ${loc}${m.advertencia ? ', con documentación por vencer' : ''}`}
                aria-pressed={sel}
                onClick={() => onSeleccionar?.(m.contratista.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSeleccionar?.(m.contratista.id)
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible>circle:nth-child(2)]:stroke-foco"
              >
                <title>{`${m.contratista.razonSocial} · ${loc}`}</title>
                <circle cx={mx} cy={my} r="14" fill="transparent" />
                <circle cx={mx} cy={my} r={sel ? 10 : 7} className={cx(sel ? 'fill-accion' : 'fill-verde-600', 'stroke-superficie transition-all')} strokeWidth="2" />
                {m.advertencia ? <circle cx={mx + 6} cy={my - 6} r="4" className="fill-trigo-500 stroke-superficie" strokeWidth="1.5" /> : null}
              </g>
            )
          })
        })}
      </svg>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 border-t border-borde bg-superficie/80 px-3 py-2 text-xs text-texto-suave">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-verde-600" /> Base del contratista</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-trigo-500" /> Documentación por vencer</span>
        <span>Mapa esquemático, no a escala.</span>
      </figcaption>
    </figure>
  )
}
