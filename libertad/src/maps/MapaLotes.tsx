import type { KeyboardEvent, ReactNode } from 'react'
import { useSvgId } from '@/ui/useSvgId'
import { etiquetaCultivo, num } from '@/domain/format'
import type { Campania, Cultivo, Establecimiento, ID, Lote } from '@/domain/types'
import { cx } from '@/ui/cx'
import type { Tono } from '@/ui/tonos'
import { centroide, puntosSvg } from './geometria'

const COLOR_CULTIVO: Record<Cultivo, { relleno: string; borde: string; texto: string }> = {
  soja: { relleno: 'fill-verde-200', borde: 'stroke-verde-600', texto: 'fill-verde-950' },
  soja2: { relleno: 'fill-verde-100', borde: 'stroke-verde-500', texto: 'fill-verde-950' },
  maiz: { relleno: 'fill-trigo-200', borde: 'stroke-trigo-600', texto: 'fill-trigo-950' },
  trigo: { relleno: 'fill-tierra-200', borde: 'stroke-tierra-600', texto: 'fill-tierra-950' },
}

const COLOR_TONO: Record<Tono, { relleno: string; borde: string; texto: string }> = {
  verde: { relleno: 'fill-verde-200', borde: 'stroke-verde-600', texto: 'fill-verde-950' },
  trigo: { relleno: 'fill-trigo-200', borde: 'stroke-trigo-600', texto: 'fill-trigo-950' },
  rojo: { relleno: 'fill-rojo-200', borde: 'stroke-rojo-600', texto: 'fill-rojo-950' },
  cielo: { relleno: 'fill-cielo-200', borde: 'stroke-cielo-600', texto: 'fill-cielo-950' },
  tierra: { relleno: 'fill-tierra-100', borde: 'stroke-tierra-500', texto: 'fill-tierra-950' },
  neutro: { relleno: 'fill-paper-3', borde: 'stroke-borde-fuerte', texto: 'fill-texto' },
}

export interface EstadoLoteMapa {
  tono: Tono
  etiqueta: string
}

type Props = {
  establecimiento: Establecimiento
  lotes: Lote[]
  campania: Campania
  /** Si se pasa, colorea por estado de labores en lugar de por cultivo. */
  estadoLote?: (lote: Lote) => EstadoLoteMapa | undefined
  seleccionado?: ID
  onSeleccionar?: (lote: Lote) => void
  /** Punto GPS simulado (coordenadas del mapa local). */
  ubicacion?: [number, number]
  leyenda?: ReactNode
  className?: string
  compacto?: boolean
}

export function MapaLotes({ establecimiento, lotes, campania, estadoLote, seleccionado, onSeleccionar, ubicacion, leyenda, className, compacto = false }: Props) {
  const idPatron = useSvgId('mapa')
  const propios = lotes.filter((l) => l.establecimientoId === establecimiento.id && l.poligono.length >= 3)

  const teclado = (e: KeyboardEvent, l: Lote) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSeleccionar?.(l)
    }
  }

  return (
    <figure className={cx('overflow-hidden rounded-2xl border border-borde bg-[#E9E2CF] dark:bg-paper-3', className)}>
      <svg viewBox="0 0 400 300" className="block h-auto w-full" role="group" aria-label={`Mapa de lotes de ${establecimiento.nombre}`}>
        <defs>
          <pattern id={`${idPatron}-surcos`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="6" className="stroke-tierra-950/10" strokeWidth="1.5" />
          </pattern>
          <filter id={`${idPatron}-sombra`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Camino rural */}
        <polyline points={puntosSvg(establecimiento.camino)} fill="none" className="stroke-tierra-300" strokeWidth="9" strokeLinecap="round" />
        <polyline points={puntosSvg(establecimiento.camino)} fill="none" className="stroke-tierra-100" strokeWidth="1.5" strokeDasharray="6 6" />

        {propios.map((l) => {
          const cultivo = l.cultivos[campania]
          const estado = estadoLote?.(l)
          const colores = estado ? COLOR_TONO[estado.tono] : cultivo ? COLOR_CULTIVO[cultivo] : COLOR_TONO.neutro
          const [cx0, cy0] = centroide(l.poligono)
          const activo = seleccionado === l.id
          const corto = l.nombre.split('·')[0]?.trim() ?? l.nombre
          const etiquetaAccesible = `${l.nombre}, ${num(l.has, 1)} has, ${cultivo ? etiquetaCultivo[cultivo] : 'sin cultivo'}${estado ? `, ${estado.etiqueta}` : ''}`
          return (
            <g
              key={l.id}
              role={onSeleccionar ? 'button' : 'img'}
              tabIndex={onSeleccionar ? 0 : undefined}
              aria-label={etiquetaAccesible}
              aria-pressed={onSeleccionar ? activo : undefined}
              onClick={onSeleccionar ? () => onSeleccionar(l) : undefined}
              onKeyDown={onSeleccionar ? (e) => teclado(e, l) : undefined}
              className={cx('outline-none', onSeleccionar && 'cursor-pointer [&:focus-visible>polygon:first-of-type]:stroke-foco [&:hover>polygon:first-of-type]:opacity-90')}
            >
              <polygon
                points={puntosSvg(l.poligono)}
                className={cx(colores.relleno, colores.borde, 'transition-all')}
                strokeWidth={activo ? 4 : 1.5}
                filter={activo ? `url(#${idPatron}-sombra)` : undefined}
              />
              <polygon points={puntosSvg(l.poligono)} fill={`url(#${idPatron}-surcos)`} pointerEvents="none" />
              {activo ? <polygon points={puntosSvg(l.poligono)} fill="none" className="stroke-superficie" strokeWidth="1" strokeDasharray="4 3" pointerEvents="none" /> : null}
              <g pointerEvents="none" className={colores.texto}>
                <text x={cx0} y={cy0 - (compacto ? 2 : 6)} textAnchor="middle" className="font-sans text-[13px] font-bold">
                  {corto}
                </text>
                {!compacto ? (
                  <text x={cx0} y={cy0 + 10} textAnchor="middle" className="font-sans text-[11px] font-medium opacity-80">
                    {num(l.has, 1)} has{estado ? ` · ${estado.etiqueta}` : cultivo ? ` · ${etiquetaCultivo[cultivo]}` : ''}
                  </text>
                ) : null}
              </g>
            </g>
          )
        })}

        {/* Casco */}
        <g transform={`translate(${establecimiento.casco[0]} ${establecimiento.casco[1]})`} pointerEvents="none">
          <circle r="9" className="fill-superficie stroke-tierra-700" strokeWidth="1.5" />
          <path d="M-4.5 2.5v-4l4.5-3.5 4.5 3.5v4z" className="fill-tierra-700" />
        </g>

        {/* Ubicación GPS simulada */}
        {ubicacion ? (
          <g transform={`translate(${ubicacion[0]} ${ubicacion[1]})`} pointerEvents="none">
            <circle r="18" className="animate-pulso fill-cielo-500/25" />
            <circle r="7" className="fill-cielo-600 stroke-white" strokeWidth="2.5" />
          </g>
        ) : null}

        {/* Norte y escala */}
        <g transform="translate(372 270)" pointerEvents="none" className="fill-tierra-800">
          <path d="M0 -14 L5 0 L0 -3 L-5 0 Z" />
          <text y="12" textAnchor="middle" className="font-sans text-[10px] font-bold">N</text>
        </g>
        <g transform="translate(14 284)" pointerEvents="none" className="fill-tierra-800">
          <rect width="60" height="3" rx="1" />
          <text x="64" y="4" className="font-sans text-[9px] font-semibold">500 m</text>
        </g>
      </svg>
      {leyenda ? <figcaption className="border-t border-borde bg-superficie/80 px-3 py-2 text-xs text-texto-suave">{leyenda}</figcaption> : null}
    </figure>
  )
}

export function LeyendaCultivos() {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1">
      {(['trigo', 'maiz', 'soja'] as const).map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden>
            <rect width="12" height="12" rx="3" className={cx(COLOR_CULTIVO[c].relleno, COLOR_CULTIVO[c].borde)} strokeWidth="1.5" />
          </svg>
          {etiquetaCultivo[c]}
        </span>
      ))}
    </span>
  )
}
