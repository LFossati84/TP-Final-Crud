import { useMemo, useState } from 'react'
import { BarrasHorizontales } from '@/charts/BarrasHorizontales'
import { etiquetaLabor, has as fmtHas, num, pesos, pesosCompacto } from '@/domain/format'
import { costoParte } from '@/domain/productor'
import { CAMPANIA_ACTIVA } from '@/domain/reloj'
import type { Campania, TipoLabor } from '@/domain/types'
import { useProductor } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Card, CardHeader } from '@/ui/Card'
import { EmptyState } from '@/ui/EmptyState'
import { Select } from '@/ui/FormField'
import { Stat } from '@/ui/Stat'

export function InformesProductor() {
  const p = useProductor()
  const cat = useCatalogo()
  const partes = useDemo((s) => s.partes)
  const liquidaciones = useDemo((s) => s.liquidaciones)
  const ests = cat.establecimientos.filter((e) => e.productorId === p?.id)
  const [campania, setCampania] = useState<Campania>(CAMPANIA_ACTIVA)
  const [estId, setEstId] = useState('todos')

  const datos = useMemo(() => {
    const conformados = partes.filter(
      (x) => x.productorId === p?.id && x.campania === campania && (x.estado === 'conformado' || x.estado === 'en_disputa') && (estId === 'todos' || x.establecimientoId === estId),
    )
    const costos = conformados.map((x) => ({ parte: x, ...costoParte(x, liquidaciones, cat.contratista(x.contratistaId)) }))
    const agrupar = <K extends string>(clave: (c: (typeof costos)[number]) => K) => {
      const m = new Map<K, { has: number; costo: number; estimado: boolean; n: number }>()
      for (const c of costos) {
        const k = clave(c)
        const a = m.get(k) ?? { has: 0, costo: 0, estimado: false, n: 0 }
        m.set(k, { has: a.has + c.parte.has, costo: a.costo + c.monto, estimado: a.estimado || c.estimado, n: a.n + 1 })
      }
      return m
    }
    const porContratista = agrupar((c) => c.parte.contratistaId)
    const porLabor = agrupar((c) => c.parte.labor)
    const porLote = agrupar((c) => c.parte.loteId)
    const total = costos.reduce((s, c) => s + c.monto, 0)
    const hasTot = costos.reduce((s, c) => s + c.parte.has, 0)
    const superficie = cat.lotes.filter((l) => ests.some((e) => e.id === l.establecimientoId) && (estId === 'todos' || l.establecimientoId === estId)).reduce((s, l) => s + l.has, 0)
    return { costos, porContratista, porLabor, porLote, total, hasTot, superficie, estimados: costos.filter((c) => c.estimado).length }
  }, [partes, liquidaciones, p, campania, estId, cat, ests])

  if (!p) return <EmptyState titulo="No encontramos el productor" />

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl text-tierra-900">Informes</h1>
        <p className="text-texto-suave">Calculado sobre labores conformadas. Montos sin IVA.</p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <Select label="Campaña" className="w-36" value={campania} onChange={(e) => setCampania(e.target.value as Campania)} opciones={[{ valor: '2026/27', texto: '2026/27' }, { valor: '2025/26', texto: '2025/26' }]} />
        <Select label="Establecimiento" className="w-52" value={estId} onChange={(e) => setEstId(e.target.value)} opciones={[{ valor: 'todos', texto: 'Todos' }, ...ests.map((e) => ({ valor: e.id, texto: e.nombre }))]} />
      </div>

      {datos.costos.length === 0 ? (
        <EmptyState icono="grafico" titulo="Sin labores conformadas" texto="Cuando conformes partes en esta campaña, los informes se arman solos." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat etiqueta="Costo de labores" valor={pesosCompacto(datos.total)} detalle={datos.estimados ? `Incluye ${datos.estimados} sin liquidar, a tarifa de referencia` : 'Todo liquidado'} icono="moneda" tono="tierra" />
            <Stat etiqueta="Costo promedio" valor={pesos(datos.total / Math.max(1, datos.superficie))} detalle={`por ha de superficie (${fmtHas(datos.superficie)})`} icono="capas" tono="tierra" />
            <Stat etiqueta="Hectáreas trabajadas" valor={fmtHas(datos.hasTot)} detalle={`${datos.costos.length} labores conformadas`} icono="tractor" tono="verde" />
            <Stat etiqueta="Contratistas" valor={datos.porContratista.size} detalle="trabajaron en la campaña" icono="usuarios" tono="cielo" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader titulo="Hectáreas por contratista" subtitulo="Superficie trabajada y conformada" />
              <BarrasHorizontales
                titulo="Hectáreas por contratista"
                columnaValor="Hectáreas"
                formato={(v) => `${num(v, 1)} has`}
                datos={[...datos.porContratista.entries()].map(([id, v]) => ({ clave: id, etiqueta: cat.contratista(id)?.razonSocial ?? id, valor: v.has, detalle: `${v.n} labores · ${pesos(v.costo)}` }))}
              />
            </Card>
            <Card>
              <CardHeader titulo="Costo por labor" subtitulo="Total de la campaña" />
              <BarrasHorizontales
                titulo="Costo por tipo de labor"
                columnaValor="Costo"
                formato={pesos}
                datos={[...datos.porLabor.entries()].map(([l, v]) => ({ clave: l, etiqueta: etiquetaLabor[l as TipoLabor], valor: v.costo, detalle: `${num(v.has, 1)} has${v.estimado ? ' · incluye estimados' : ''}` }))}
              />
            </Card>
          </div>
          <Card>
            <CardHeader titulo="Costo por hectárea de cada lote" subtitulo="Suma de labores conformadas ÷ superficie del lote" />
            <BarrasHorizontales
              titulo="Costo por hectárea por lote"
              columnaValor="$/ha"
              formato={(v) => `${pesos(v)}/ha`}
              datos={[...datos.porLote.entries()].map(([id, v]) => {
                const l = cat.lote(id)
                const e = l ? cat.establecimiento(l.establecimientoId) : undefined
                return { clave: id, etiqueta: estId === 'todos' && l ? `${l.nombre.split('·')[1]?.trim() ?? l.nombre} (${e?.nombre ?? ''})` : (l?.nombre ?? id), valor: v.costo / Math.max(1, l?.has ?? 1), detalle: `${v.n} labores · ${pesos(v.costo)}` }
              })}
            />
          </Card>
          <p className="text-xs text-texto-suave">Valores ilustrativos. Las labores sin liquidar se estiman con la tarifa de referencia del contratista.</p>
        </>
      )}
    </div>
  )
}
