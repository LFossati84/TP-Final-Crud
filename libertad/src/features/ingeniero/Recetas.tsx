import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { etiquetaCultivo, fecha, num } from '@/domain/format'
import { CAMPANIA_ACTIVA, HOY, sumarDias } from '@/domain/reloj'
import type { Cultivo, ID, InsumoAplicado, RecetaAgronomica } from '@/domain/types'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, IconButton } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Checkbox, Input, Select, Textarea } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { InputNumero } from '@/ui/InputNumero'
import { Modal } from '@/ui/Modal'
import { Table, type Columna } from '@/ui/Table'
import { Tabs } from '@/ui/Tabs'
import { toast } from '@/ui/toast-store'
import { useAgronomia } from './useAgronomia'

const CONDICIONES = 'Viento entre 5 y 15 km/h. No aplicar con temperatura mayor a 28 °C ni humedad relativa menor a 50 %. Respetar distancias a zonas sensibles.'

function estadoReceta(r: RecetaAgronomica, aplicada: boolean): { tono: 'verde' | 'cielo' | 'neutro'; texto: string } {
  if (aplicada) return { tono: 'verde', texto: 'Aplicada' }
  if (r.vence < HOY) return { tono: 'neutro', texto: 'Vencida' }
  return { tono: 'cielo', texto: 'Vigente' }
}

export function RecetasIngeniero() {
  const cat = useCatalogo()
  const { ing } = useAgronomia()
  const partes = useDemo((s) => s.partes)
  const [params, setParams] = useSearchParams()
  const [filtro, setFiltro] = useState<'todas' | 'vigentes'>('todas')
  const [ver, setVer] = useState<RecetaAgronomica | null>(null)
  const nueva = params.get('nueva') === '1'
  const parteId = params.get('parte') ?? undefined
  const propias = cat.recetas.filter((r) => r.ingenieroId === ing?.id).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const aplicada = (r: RecetaAgronomica) => partes.some((p) => p.recetaId === r.id && p.estado !== 'borrador')
  const filas = filtro === 'vigentes' ? propias.filter((r) => r.vence >= HOY) : propias

  const columnas: Columna<RecetaAgronomica>[] = [
    { clave: 'numero', titulo: 'Receta', render: (r) => <span><span className="block font-semibold">{r.numero}</span><span className="block text-xs text-texto-suave">{fecha(r.fecha)}</span></span> },
    { clave: 'cliente', titulo: 'Cliente / lotes', render: (r) => <span>{cat.productor(r.productorId)?.razonSocial}<span className="block text-xs text-texto-suave">{cat.establecimiento(r.establecimientoId)?.nombre} · {r.loteIds.map((l) => cat.lote(l)?.nombre.split('·')[0]?.trim()).join(', ')}</span></span> },
    { clave: 'objetivo', titulo: 'Objetivo', ocultarEnMovil: true, render: (r) => <span className="line-clamp-2 text-sm">{r.objetivo}</span> },
    { clave: 'productos', titulo: 'Productos', ocultarEnMovil: true, render: (r) => <span className="text-xs">{r.productos.map((p) => `${cat.insumo(p.insumoId)?.nombre.split(' ')[0] ?? ''} ${num(p.dosis)} ${cat.insumo(p.insumoId)?.unidad ?? ''}`).join(' + ')}</span> },
    { clave: 'vence', titulo: 'Vence', render: (r) => <span className="num">{fecha(r.vence)}</span> },
    { clave: 'estado', titulo: 'Estado', render: (r) => { const e = estadoReceta(r, aplicada(r)); return <Chip tono={e.tono}>{e.texto}</Chip> } },
  ]

  if (!ing) return <EmptyState titulo="No encontramos el ingeniero" />
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-tierra-900">Recetas agronómicas</h1>
          <p className="text-texto-suave">Digitales, vinculadas a lotes y a los partes que las aplican.</p>
        </div>
        <Button icono="mas" onClick={() => setParams({ nueva: '1' })} data-tour="nueva-receta">Nueva receta</Button>
      </header>
      <Card>
        <Tabs etiqueta="Filtro" className="mb-4" valor={filtro} onCambiar={setFiltro} tabs={[{ valor: 'todas', texto: 'Todas', cantidad: propias.length }, { valor: 'vigentes', texto: 'Vigentes', cantidad: propias.filter((r) => r.vence >= HOY).length }]} />
        <Table etiqueta="Recetas" columnas={columnas} filas={filas} claveFila={(r) => r.id} onFila={setVer} vacio={<EmptyState icono="receta" titulo="Sin recetas" />} />
      </Card>
      <p className="text-xs text-texto-suave">Maqueta de receta digital. El formato oficial y su registro deben validarse con la normativa de cada jurisdicción.</p>
      {nueva ? <NuevaReceta parteId={parteId} onCerrar={() => setParams({})} /> : null}
      {ver ? <VerReceta receta={ver} onCerrar={() => setVer(null)} /> : null}
    </div>
  )
}

function NuevaReceta({ parteId, onCerrar }: { parteId?: ID; onCerrar: () => void }) {
  const cat = useCatalogo()
  const { ing, activos, clientes } = useAgronomia()
  const emitir = useDemo((s) => s.emitirReceta)
  const asociar = useDemo((s) => s.asociarReceta)
  const parte = useDemo((s) => s.partes.find((p) => p.id === parteId))
  const posibles = activos.length ? activos : clientes
  const [productorId, setProductorId] = useState<ID>(parte?.productorId ?? posibles[0]?.id ?? '')
  const ests = cat.establecimientos.filter((e) => e.productorId === productorId)
  const [estId, setEstId] = useState<ID>(parte?.establecimientoId ?? ests[0]?.id ?? '')
  const lotes = cat.lotes.filter((l) => l.establecimientoId === estId)
  const [loteIds, setLoteIds] = useState<ID[]>(parte ? [parte.loteId] : [])
  const loteBase = cat.lote(loteIds[0] ?? '')
  const [cultivo, setCultivo] = useState<Cultivo | 'barbecho'>(loteBase?.cultivos[CAMPANIA_ACTIVA] ?? 'barbecho')
  const [objetivo, setObjetivo] = useState(parte ? 'Regularización: preemergente de maíz aplicado sin receta previa. Control residual de gramíneas y latifoliadas.' : '')
  const [productos, setProductos] = useState<InsumoAplicado[]>(parte ? parte.insumos.map((i) => ({ ...i })) : [{ insumoId: 'i-gli', dosis: 2.5 }])
  const [caldo, setCaldo] = useState(parte?.condiciones?.caldo ?? 80)
  const [condiciones, setCondiciones] = useState(CONDICIONES)
  const [vence, setVence] = useState(sumarDias(HOY, 15))
  const fitos = cat.insumos.filter((i) => ['herbicida', 'insecticida', 'fungicida', 'coadyuvante'].includes(i.tipo))

  const guardar = () => {
    if (!ing) return
    const r = emitir({ ingenieroId: ing.id, productorId, establecimientoId: estId, loteIds, fecha: HOY, vence, cultivo, objetivo, productos, caldoMin: caldo, condiciones })
    if (parte) asociar(parte.id, r.id)
    toast.ok(`Receta ${r.numero} emitida`, parte ? `Quedó vinculada a ${parte.numero}.` : 'El productor la ve en su cuaderno.')
    onCerrar()
  }

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={parte ? `Receta para ${parte.numero}` : 'Nueva receta agronómica'}
      descripcion={`Firmada por Ing. Agr. ${ing?.nombre ?? ''} – ${ing?.matricula ?? ''}`}
      tamano="lg"
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button icono="receta" onClick={guardar} disabled={!productorId || !estId || loteIds.length === 0 || !objetivo.trim() || productos.some((p) => !(p.dosis > 0))} data-tour="emitir-receta">Emitir receta</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Cliente" value={productorId} onChange={(e) => { setProductorId(e.target.value); setEstId(cat.establecimientos.find((x) => x.productorId === e.target.value)?.id ?? ''); setLoteIds([]) }} opciones={posibles.map((p) => ({ valor: p.id, texto: p.razonSocial }))} disabled={Boolean(parte)} />
          <Select label="Establecimiento" value={estId} onChange={(e) => { setEstId(e.target.value); setLoteIds([]) }} opciones={ests.map((e) => ({ valor: e.id, texto: e.nombre }))} disabled={Boolean(parte)} />
        </div>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Lotes</legend>
          <div className="grid gap-x-3 sm:grid-cols-2">
            {lotes.map((l) => (
              <Checkbox key={l.id} label={l.nombre} descripcion={`${num(l.has, 1)} has`} checked={loteIds.includes(l.id)} onChange={(e) => setLoteIds(e.target.checked ? [...loteIds, l.id] : loteIds.filter((x) => x !== l.id))} />
            ))}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Cultivo" value={cultivo} onChange={(e) => setCultivo(e.target.value as Cultivo | 'barbecho')} opciones={(['barbecho', 'soja', 'soja2', 'maiz', 'trigo'] as const).map((c) => ({ valor: c, texto: etiquetaCultivo[c] }))} />
          <Input label="Vence" type="date" min={HOY} value={vence} onChange={(e) => setVence(e.target.value)} />
        </div>
        <Textarea label="Objetivo / diagnóstico" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} rows={2} placeholder="Ej.: roya amarilla en hoja bandera por encima del umbral." />
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">Productos y dosis</legend>
          <ul className="space-y-2">
            {productos.map((p, i) => {
              const ins = cat.insumo(p.insumoId)
              return (
                <li key={i} className="grid grid-cols-[1fr_8rem_auto] items-end gap-2">
                  <Select label={`Producto ${i + 1}`} value={p.insumoId} onChange={(e) => setProductos(productos.map((x, j) => (j === i ? { ...x, insumoId: e.target.value } : x)))} opciones={fitos.map((f) => ({ valor: f.id, texto: f.nombre }))} />
                  <InputNumero label="Dosis" valor={p.dosis} onValor={(n) => setProductos(productos.map((x, j) => (j === i ? { ...x, dosis: n } : x)))} sufijo={ins?.unidad} />
                  <IconButton icono="basura" etiqueta={`Quitar producto ${i + 1}`} onClick={() => setProductos(productos.filter((_, j) => j !== i))} />
                </li>
              )
            })}
          </ul>
          <Button variante="secundario" tamano="sm" icono="mas" className="mt-2" onClick={() => setProductos([...productos, { insumoId: fitos[0]?.id ?? '', dosis: 0 }])}>Agregar producto</Button>
        </fieldset>
        <InputNumero label="Caldo mínimo" valor={caldo} onValor={setCaldo} sufijo="l/ha" className="max-w-xs" />
        <Textarea label="Condiciones y restricciones" value={condiciones} onChange={(e) => setCondiciones(e.target.value)} rows={2} />
      </div>
    </Modal>
  )
}

function VerReceta({ receta, onCerrar }: { receta: RecetaAgronomica; onCerrar: () => void }) {
  const cat = useCatalogo()
  const ing = useDemo((s) => s.ingenieros.find((i) => i.id === receta.ingenieroId))
  const partes = useDemo((s) => s.partes.filter((p) => p.recetaId === receta.id))
  return (
    <Modal abierto onCerrar={onCerrar} titulo={`Receta ${receta.numero}`} tamano="lg">
      <article className="forzar-claro rounded-xl border border-[#cdad88] bg-white p-5 text-sm text-[#1f1510]">
        <header className="flex flex-wrap justify-between gap-3 border-b-2 border-[#244720] pb-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4a3224]">Receta agronómica</p>
            <p className="font-serif text-lg">{cat.productor(receta.productorId)?.razonSocial}</p>
            <p className="text-[#4a3224]">{cat.establecimiento(receta.establecimientoId)?.nombre} · {receta.loteIds.map((l) => cat.lote(l)?.nombre).join(', ')}</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold">{receta.numero}</p>
            <p className="text-[#4a3224]">Emitida {fecha(receta.fecha)} · vence {fecha(receta.vence)}</p>
          </div>
        </header>
        <p className="mt-3"><strong>Cultivo:</strong> {etiquetaCultivo[receta.cultivo]} · <strong>Objetivo:</strong> {receta.objetivo}</p>
        <ul className="mt-2 list-disc pl-5">
          {receta.productos.map((p) => <li key={p.insumoId}>{cat.insumo(p.insumoId)?.nombre} — {num(p.dosis)} {cat.insumo(p.insumoId)?.unidad} {cat.insumo(p.insumoId)?.banda ? `(banda ${cat.insumo(p.insumoId)?.banda})` : ''}</li>)}
        </ul>
        <p className="mt-2"><strong>Caldo mínimo:</strong> {receta.caldoMin} l/ha. {receta.condiciones}</p>
        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="text-xs text-[#64432d]">Partes vinculados: {partes.length ? partes.map((p) => p.numero).join(', ') : 'ninguno todavía'}</p>
          <div className="w-56 text-center">
            <p className="font-serif text-xl italic text-[#244720]">{ing?.nombre}</p>
            <div className="border-t border-[#1f1510] pt-1 text-xs">Ing. Agr. {ing?.nombre} – {ing?.matricula}</div>
          </div>
        </div>
      </article>
      <p className="mt-3 flex items-start gap-2 text-xs text-texto-suave"><Icon nombre="info" tamano={14} className="mt-0.5 shrink-0" />Maqueta: la firma y el registro oficial de recetas dependen de la normativa provincial.</p>
    </Modal>
  )
}
