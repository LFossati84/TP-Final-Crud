import { useState } from 'react'
import { etiquetaCultivo, num } from '@/domain/format'
import { CAMPANIA_ACTIVA } from '@/domain/reloj'
import { centroide, masCercano } from '@/maps/geometria'
import { LeyendaCultivos, MapaLotes } from '@/maps/MapaLotes'
import { useCatalogo } from '@/store/useCatalogo'
import { Button } from '@/ui/Button'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { toast } from '@/ui/toast-store'
import type { BorradorParte } from './modelo'

type Props = { b: BorradorParte; cambiar: (p: Partial<BorradorParte>) => void; error?: string; loteSugerido?: string }

export function PasoLote({ b, cambiar, error, loteSugerido }: Props) {
  const cat = useCatalogo()
  const [buscando, setBuscando] = useState(false)
  const est = b.establecimientoId ? cat.establecimiento(b.establecimientoId) : undefined
  const lote = b.loteId ? cat.lote(b.loteId) : undefined
  const cultivo = lote?.cultivos[CAMPANIA_ACTIVA]

  const usarUbicacion = () => {
    setBuscando(true)
    window.setTimeout(() => {
      // GPS simulado: el teléfono "está" en el lote agendado o, si no hay, en La Esperanza.
      const objetivo = cat.lote(loteSugerido ?? b.loteId ?? '') ?? cat.lote('l3')
      if (!objetivo) return setBuscando(false)
      const [cx0, cy0] = centroide(objetivo.poligono)
      const punto: [number, number] = [Math.round(cx0 + 14), Math.round(cy0 - 18)]
      const delEst = cat.lotes.filter((l) => l.establecimientoId === objetivo.establecimientoId)
      const elegido = delEst[masCercano(punto, delEst.map((l) => l.poligono))] ?? objetivo
      cambiar({ establecimientoId: elegido.establecimientoId, loteId: elegido.id, ubicacion: punto, has: b.has || String(elegido.has) })
      setBuscando(false)
      toast.ok(`Estás en ${elegido.nombre}`, 'Ubicación por GPS · precisión 6 m. Funciona sin señal de datos.')
    }, 1200)
  }

  return (
    <div className="space-y-4">
      <Button variante="suave" bloque icono={buscando ? undefined : 'gps'} cargando={buscando} onClick={usarUbicacion} data-tour="usar-ubicacion">
        {buscando ? 'Buscando señal GPS…' : 'Usar mi ubicación actual'}
      </Button>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-texto">Establecimiento</legend>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {cat.establecimientos.map((e) => {
            const sel = e.id === b.establecimientoId
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={sel}
                onClick={() => cambiar({ establecimientoId: e.id, loteId: e.id === b.establecimientoId ? b.loteId : '', ubicacion: undefined })}
                className={cx(
                  'min-h-tactil shrink-0 rounded-xl border-2 px-3 py-1.5 text-left transition',
                  sel ? 'border-verde-500 bg-verde-50' : 'border-borde bg-superficie',
                )}
              >
                <span className="block text-sm font-semibold text-texto">{e.nombre}</span>
                <span className="block text-xs text-texto-suave">{cat.productor(e.productorId)?.razonSocial.replace(/ S\.A\.| S\.H\./, '')} · {e.localidad}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {est ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-texto">Tocá el lote en el mapa</p>
          <MapaLotes
            establecimiento={est}
            lotes={cat.lotes}
            campania={CAMPANIA_ACTIVA}
            seleccionado={b.loteId || undefined}
            ubicacion={b.ubicacion}
            onSeleccionar={(l) => cambiar({ loteId: l.id, has: b.has && b.loteId === l.id ? b.has : String(l.has) })}
            leyenda={<LeyendaCultivos />}
          />
        </div>
      ) : (
        <p className="rounded-xl bg-paper-2 p-4 text-center text-sm text-texto-suave">Elegí un establecimiento o usá tu ubicación.</p>
      )}

      {lote ? (
        <div className="flex items-center gap-3 rounded-xl bg-verde-50 p-3 ring-1 ring-inset ring-verde-200" aria-live="polite">
          <Icon nombre="checkCirculo" className="shrink-0 text-verde-700" />
          <div className="min-w-0">
            <p className="font-semibold text-texto">{lote.nombre}</p>
            <p className="text-xs text-texto-suave">
              {num(lote.has, 1)} has · {cultivo ? etiquetaCultivo[cultivo] : 'Sin cultivo'} · {lote.ambiente}
            </p>
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm font-medium text-rojo-700">{error}</p> : null}
    </div>
  )
}
