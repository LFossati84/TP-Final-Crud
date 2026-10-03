import { useState } from 'react'
import { LOCALIDADES, LOCALIDADES_PILOTO } from '@/data/geo'
import { etiquetaCultivo, num } from '@/domain/format'
import { CAMPANIA_ACTIVA } from '@/domain/reloj'
import type { Cultivo, Establecimiento, Localidad, Lote } from '@/domain/types'
import { LeyendaCultivos, MapaLotes } from '@/maps/MapaLotes'
import { nuevoId } from '@/store/helpers'
import { useProductor } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, IconButton } from '@/ui/Button'
import { Card, CardHeader } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Input, Select } from '@/ui/FormField'
import { InputNumero } from '@/ui/InputNumero'
import { Modal } from '@/ui/Modal'
import { toast } from '@/ui/toast-store'

const CULTIVOS: Cultivo[] = ['soja', 'maiz', 'trigo', 'soja2']

/** Grilla 2×3 para dibujar lotes de un establecimiento nuevo (simulación del dibujo sobre satelital). */
function poligonoEnGrilla(i: number): [number, number][] {
  const col = i % 3
  const fila = Math.floor(i / 3) % 2
  const x = 16 + col * 124
  const y = 16 + fila * 138
  return [[x, y], [x + 116, y + 2], [x + 114, y + 128], [x + 2, y + 126]]
}

export function LotesProductor() {
  const p = useProductor()
  const cat = useCatalogo()
  const [editEst, setEditEst] = useState<Establecimiento | 'nuevo' | null>(null)
  const [editLote, setEditLote] = useState<{ lote: Lote | null; establecimientoId: string } | null>(null)
  const ests = cat.establecimientos.filter((e) => e.productorId === p?.id)

  if (!p) return <EmptyState titulo="No encontramos el productor" />

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-tierra-900">Establecimientos y lotes</h1>
          <p className="text-texto-suave">La base sobre la que se cargan partes, cuaderno y recetas.</p>
        </div>
        <Button icono="mas" onClick={() => setEditEst('nuevo')}>Nuevo establecimiento</Button>
      </header>

      {ests.length === 0 ? <EmptyState icono="mapa" titulo="Sin establecimientos" texto="Cargá tu primer campo para empezar." /> : null}

      {ests.map((e) => {
        const lotes = cat.lotes.filter((l) => l.establecimientoId === e.id)
        const total = lotes.reduce((s, l) => s + l.has, 0)
        return (
          <Card key={e.id}>
            <CardHeader
              titulo={e.nombre}
              subtitulo={`${e.localidad} · ${lotes.length} lotes · ${num(total, 1)} has`}
              acciones={
                <>
                  <Button variante="fantasma" tamano="sm" icono="editar" onClick={() => setEditEst(e)}>Editar</Button>
                  <Button variante="secundario" tamano="sm" icono="mas" onClick={() => setEditLote({ lote: null, establecimientoId: e.id })}>Nuevo lote</Button>
                </>
              }
            />
            <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
              <MapaLotes establecimiento={e} lotes={cat.lotes} campania={CAMPANIA_ACTIVA} onSeleccionar={(l) => setEditLote({ lote: l, establecimientoId: e.id })} leyenda={<LeyendaCultivos />} />
              {lotes.length === 0 ? (
                <EmptyState icono="capas" titulo="Sin lotes" texto="Agregá el primero." />
              ) : (
                <ul className="divide-y divide-borde self-start rounded-xl border border-borde">
                  {lotes.map((l) => {
                    const cultivo = l.cultivos[CAMPANIA_ACTIVA]
                    return (
                      <li key={l.id} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{l.nombre}</p>
                          <p className="text-xs text-texto-suave">{num(l.has, 1)} has · {l.ambiente} · campaña anterior: {l.cultivos['2025/26'] ? etiquetaCultivo[l.cultivos['2025/26']] : '—'}</p>
                        </div>
                        {cultivo ? <Chip tono={cultivo === 'maiz' ? 'trigo' : cultivo === 'trigo' ? 'tierra' : 'verde'}>{etiquetaCultivo[cultivo]}</Chip> : null}
                        {l.poligono.length === 0 ? <Chip tono="neutro" icono="mapa">Sin dibujar</Chip> : null}
                        <IconButton icono="editar" etiqueta={`Editar ${l.nombre}`} onClick={() => setEditLote({ lote: l, establecimientoId: e.id })} />
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </Card>
        )
      })}

      <p className="text-xs text-texto-suave">En la versión real los lotes se dibujan sobre imagen satelital o se importan desde KML/shapefile. En la demo el polígono se ubica de forma aproximada.</p>

      {editEst ? <FormEstablecimiento est={editEst === 'nuevo' ? null : editEst} productorId={p.id} onCerrar={() => setEditEst(null)} /> : null}
      {editLote ? <FormLote lote={editLote.lote} establecimientoId={editLote.establecimientoId} onCerrar={() => setEditLote(null)} /> : null}
    </div>
  )
}

function FormEstablecimiento({ est, productorId, onCerrar }: { est: Establecimiento | null; productorId: string; onCerrar: () => void }) {
  const guardar = useDemo((s) => s.guardarEstablecimiento)
  const [nombre, setNombre] = useState(est?.nombre ?? '')
  const [localidad, setLocalidad] = useState<Localidad>(est?.localidad ?? 'Venado Tuerto')
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={est ? `Editar ${est.nombre}` : 'Nuevo establecimiento'}
      tamano="sm"
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button
            icono="check"
            disabled={!nombre.trim()}
            onClick={() => {
              const base = LOCALIDADES[localidad]
              guardar(est ? { ...est, nombre, localidad } : { id: nuevoId('e'), productorId, nombre, localidad, lat: base.lat - 0.03, lng: base.lng + 0.03, casco: [392, 150], camino: [[0, 150], [400, 150]] })
              toast.ok(est ? 'Establecimiento actualizado' : 'Establecimiento creado', est ? undefined : 'Ahora cargá sus lotes.')
              onCerrar()
            }}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: La Celina" data-autofocus />
        <Select label="Localidad" value={localidad} onChange={(e) => setLocalidad(e.target.value as Localidad)} opciones={LOCALIDADES_PILOTO.map((l) => ({ valor: l, texto: l }))} />
      </div>
    </Modal>
  )
}

function FormLote({ lote, establecimientoId, onCerrar }: { lote: Lote | null; establecimientoId: string; onCerrar: () => void }) {
  const guardar = useDemo((s) => s.guardarLote)
  const lotes = useDemo((s) => s.lotes)
  const [nombre, setNombre] = useState(lote?.nombre ?? '')
  const [has, setHas] = useState(lote?.has ?? 0)
  const [cultivo, setCultivo] = useState<Cultivo>(lote?.cultivos[CAMPANIA_ACTIVA] ?? 'soja')
  const [ambiente, setAmbiente] = useState<Lote['ambiente']>(lote?.ambiente ?? 'loma')
  const delEst = lotes.filter((l) => l.establecimientoId === establecimientoId)
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={lote ? `Editar ${lote.nombre}` : 'Nuevo lote'}
      tamano="sm"
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button
            icono="check"
            disabled={!nombre.trim() || has <= 0}
            onClick={() => {
              const dibujable = delEst.every((l) => l.poligono.length === 0 || l.id.startsWith('l-')) && delEst.length < 6
              guardar(
                lote
                  ? { ...lote, nombre, has, ambiente, cultivos: { ...lote.cultivos, [CAMPANIA_ACTIVA]: cultivo } }
                  : { id: nuevoId('l'), establecimientoId, nombre, has, ambiente, cultivos: { [CAMPANIA_ACTIVA]: cultivo }, poligono: dibujable ? poligonoEnGrilla(delEst.length) : [] },
              )
              toast.ok(lote ? 'Lote actualizado' : 'Lote creado')
              onCerrar()
            }}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Lote 5 · El Ombú" data-autofocus />
        <InputNumero label="Superficie" valor={has} onValor={setHas} sufijo="has" />
        <div className="grid grid-cols-2 gap-3">
          <Select label={`Cultivo ${CAMPANIA_ACTIVA}`} value={cultivo} onChange={(e) => setCultivo(e.target.value as Cultivo)} opciones={CULTIVOS.map((c) => ({ valor: c, texto: etiquetaCultivo[c] }))} />
          <Select label="Ambiente" value={ambiente} onChange={(e) => setAmbiente(e.target.value as Lote['ambiente'])} opciones={[{ valor: 'loma', texto: 'Loma' }, { valor: 'media loma', texto: 'Media loma' }, { valor: 'bajo', texto: 'Bajo' }]} />
        </div>
      </div>
    </Modal>
  )
}
