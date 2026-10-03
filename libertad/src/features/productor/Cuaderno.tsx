import { Link, useNavigate, useSearchParams } from 'react-router'
import { completitudCuaderno } from '@/domain/cuaderno'
import { etiquetaCultivo, etiquetaLabor, fechaCorta, num, slugCampania } from '@/domain/format'
import { CAMPANIA_ACTIVA } from '@/domain/reloj'
import type { Campania, EntradaCuaderno, TipoEntradaCuaderno } from '@/domain/types'
import { NOTA_VALIDACION_PROFESIONAL } from '@/domain/validacion'
import { useProductor } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, ButtonLink } from '@/ui/Button'
import { Card, CardHeader } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Select } from '@/ui/FormField'
import { Icon, type NombreIcono } from '@/ui/Icon'
import { ICONO_LABOR } from '@/ui/iconosDominio'
import { ProgressBar } from '@/ui/ProgressBar'
import { Timeline } from '@/ui/Timeline'
import type { Tono } from '@/ui/tonos'

const TIPOS: { valor: TipoEntradaCuaderno | 'todas'; texto: string }[] = [
  { valor: 'todas', texto: 'Todas' },
  { valor: 'siembra', texto: 'Siembra' },
  { valor: 'fertilizacion', texto: 'Fertilización' },
  { valor: 'pulverizacion', texto: 'Aplicaciones' },
  { valor: 'cosecha', texto: 'Cosecha' },
  { valor: 'laboreo', texto: 'Laboreo' },
  { valor: 'recorrida', texto: 'Recorridas y análisis' },
]

function iconoEntrada(e: EntradaCuaderno): { icono: NombreIcono; tono: Tono } {
  if (e.tipo === 'recorrida') return { icono: 'ojo', tono: 'cielo' }
  if (e.tipo === 'analisis') return { icono: 'documento', tono: 'cielo' }
  if (e.tipo === 'pulverizacion') return { icono: ICONO_LABOR[e.tipo], tono: 'trigo' }
  if (e.tipo === 'cosecha') return { icono: ICONO_LABOR[e.tipo], tono: 'tierra' }
  return { icono: ICONO_LABOR[e.tipo], tono: 'verde' }
}

export function CuadernoProductor() {
  const p = useProductor()
  const cat = useCatalogo()
  const cuaderno = useDemo((s) => s.cuaderno)
  const partes = useDemo((s) => s.partes)
  const ingenieros = useDemo((s) => s.ingenieros)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const establecimientos = cat.establecimientos.filter((e) => e.productorId === p?.id)
  const estId = params.get('est') ?? establecimientos[0]?.id ?? ''
  const campania = (params.get('campania') as Campania | null) ?? CAMPANIA_ACTIVA
  const loteId = params.get('lote') ?? 'todos'
  const tipo = (params.get('tipo') as TipoEntradaCuaderno | 'todas' | null) ?? 'todas'
  const q = params.get('q') ?? ''
  const lotes = cat.lotes.filter((l) => l.establecimientoId === estId)
  const ing = ingenieros.find((i) => i.id === p?.ingenieroId)

  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params)
    if (v === null || v === '') n.delete(k)
    else n.set(k, v)
    if (k === 'est') n.delete('lote')
    setParams(n, { replace: true })
  }

  const entradas = (
      cuaderno
        .filter((e) => e.establecimientoId === estId && e.campania === campania)
        .filter((e) => loteId === 'todos' || e.loteId === loteId)
        .filter((e) => tipo === 'todas' || e.tipo === tipo || (tipo === 'recorrida' && e.tipo === 'analisis'))
        .filter((e) => !q.trim() || `${e.titulo} ${e.detalle} ${e.autor}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
  )

  const completitudes = lotes.map((l) => ({ lote: l, ...completitudCuaderno(l, campania, partes, p, campania !== CAMPANIA_ACTIVA) }))
  const loteSel = lotes.find((l) => l.id === loteId)
  const compSel = completitudes.find((c) => c.lote.id === loteId)
  const promedio = completitudes.length ? completitudes.reduce((s, c) => s + c.porcentaje, 0) / completitudes.length : 0
  const aplicaciones = partes.filter((x) => x.establecimientoId === estId && x.campania === campania && x.labor === 'pulverizacion' && x.estado === 'conformado' && (loteId === 'todos' || x.loteId === loteId))
  const validadas = aplicaciones.filter((x) => x.validacion?.estado === 'validada').length

  if (!p) return <EmptyState titulo="No encontramos el productor" />
  if (establecimientos.length === 0) return <EmptyState icono="libro" titulo="Tu cuaderno está vacío" texto="Cargá un establecimiento y sus lotes para empezar." accion={<ButtonLink to="/productor/lotes">Cargar establecimiento</ButtonLink>} />

  const exportar = () => navigate(`/imprimir/cuaderno/${estId}/${slugCampania(campania)}${loteId !== 'todos' ? `?lote=${loteId}` : ''}`)

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-tierra-900">Cuaderno del establecimiento</h1>
          <p className="text-texto-suave">Se completa solo con cada parte conformado. Cronológico por lote y campaña.</p>
        </div>
        <Button icono="descargar" onClick={exportar} data-tour="exportar-pdf">Exportar informe PDF</Button>
      </header>

      {/* Filtros: una fila arriba de todo */}
      <div className="flex flex-wrap items-end gap-3">
        <Select label="Establecimiento" className="w-48" value={estId} onChange={(e) => set('est', e.target.value)} opciones={establecimientos.map((e) => ({ valor: e.id, texto: e.nombre }))} />
        <Select label="Campaña" className="w-36" value={campania} onChange={(e) => set('campania', e.target.value === CAMPANIA_ACTIVA ? null : e.target.value)} opciones={[{ valor: '2026/27', texto: '2026/27' }, { valor: '2025/26', texto: '2025/26' }]} />
        <Select label="Lote" className="w-52" value={loteId} onChange={(e) => set('lote', e.target.value === 'todos' ? null : e.target.value)} opciones={[{ valor: 'todos', texto: 'Todos los lotes' }, ...lotes.map((l) => ({ valor: l.id, texto: l.nombre }))]} />
        <label className="relative min-w-[12rem] flex-1">
          <span className="mb-1.5 block text-sm font-semibold">Buscar</span>
          <Icon nombre="buscar" tamano={16} className="pointer-events-none absolute bottom-3.5 left-3 text-texto-suave" />
          <input type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Producto, contratista, recorrida…" className="min-h-tactil w-full rounded-xl border border-borde-fuerte bg-superficie pl-9 pr-3 text-sm" />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card data-tour="timeline-cuaderno">
          <div className="mb-4 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tipo de registro">
            {TIPOS.map((t) => (
              <button
                key={t.valor}
                type="button"
                role="radio"
                aria-checked={tipo === t.valor}
                onClick={() => set('tipo', t.valor === 'todas' ? null : t.valor)}
                className={cx('min-h-9 rounded-full px-3 text-sm font-semibold transition', tipo === t.valor ? 'bg-tierra-800 text-tierra-50' : 'bg-paper-2 text-texto-suave hover:bg-paper-3')}
              >
                {t.texto}
              </button>
            ))}
          </div>
          {entradas.length === 0 ? (
            <EmptyState icono="libro" titulo="Sin registros para estos filtros" texto={campania === CAMPANIA_ACTIVA ? 'A medida que conformes partes, aparecen acá.' : 'Probá con otro lote o tipo de labor.'} />
          ) : (
            <Timeline
              items={entradas.map((e) => {
                const parte = e.parteId ? partes.find((x) => x.id === e.parteId) : undefined
                const receta = cat.receta(parte?.recetaId)
                const { icono, tono } = iconoEntrada(e)
                return {
                  id: e.id,
                  fecha: fechaCorta(e.fecha),
                  titulo: loteId === 'todos' ? e.titulo : e.tipo === 'recorrida' || e.tipo === 'analisis' ? e.titulo.split('·')[0] : etiquetaLabor[e.tipo as keyof typeof etiquetaLabor] ?? e.titulo,
                  detalle: e.detalle,
                  icono,
                  tono,
                  extra: (
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-texto-suave">
                      <span>{e.autor}</span>
                      {parte ? (
                        <Link to={`/productor/partes/${parte.id}`} className="font-semibold text-verde-800 underline-offset-2 hover:underline">
                          {parte.numero}
                        </Link>
                      ) : null}
                      {receta ? <Chip tono="neutro" icono="receta">{receta.numero}</Chip> : null}
                      {parte?.labor === 'pulverizacion' && !parte.recetaId ? <Chip tono="rojo" icono="receta">Sin receta</Chip> : null}
                      {parte?.validacion?.estado === 'validada' ? <Chip tono="verde" icono="sello">Validado</Chip> : null}
                      {parte?.validacion?.estado === 'pendiente' ? <Chip tono="cielo" icono="reloj">Validación pendiente</Chip> : null}
                      {parte?.validacion?.estado === 'observada' ? <Chip tono="trigo" icono="alerta">Observado por el ingeniero</Chip> : null}
                    </span>
                  ),
                }
              })}
            />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader titulo="Completitud" subtitulo={loteSel ? loteSel.nombre : `Promedio de ${lotes.length} lotes`} />
            {compSel && loteSel ? (
              <>
                <ProgressBar valor={compSel.porcentaje} etiqueta={`${loteSel.cultivos[campania] ? etiquetaCultivo[loteSel.cultivos[campania] ?? 'soja'] : ''} · ${num(loteSel.has, 1)} has`} />
                <ul className="mt-3 space-y-1.5 text-sm">
                  {compSel.items.map((i) => (
                    <li key={i.texto} className="flex items-center gap-2">
                      <Icon nombre={i.cumple ? 'checkCirculo' : i.pendiente ? 'reloj' : 'xCirculo'} tamano={16} className={i.cumple ? 'text-verde-600' : i.pendiente ? 'text-texto-suave' : 'text-rojo-600'} />
                      <span className={i.cumple ? '' : 'text-texto-suave'}>{i.texto}{i.pendiente && !i.cumple ? ' (pendiente)' : ''}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <ProgressBar valor={promedio} etiqueta="Promedio del establecimiento" />
                <ul className="mt-3 space-y-2">
                  {completitudes.map((c) => (
                    <li key={c.lote.id}>
                      <button type="button" onClick={() => set('lote', c.lote.id)} className="w-full rounded-lg p-1 text-left hover:bg-paper-2">
                        <ProgressBar valor={c.porcentaje} etiqueta={c.lote.nombre} tono={c.porcentaje >= 0.8 ? 'verde' : c.porcentaje >= 0.5 ? 'trigo' : 'rojo'} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          <Card className={p.validacionProfesional ? 'bg-verde-50' : ''}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-100 text-verde-800">
                <Icon nombre="sello" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">Validación profesional</p>
                {p.validacionProfesional && ing ? (
                  <>
                    <p className="text-sm text-texto-suave">Ing. Agr. {ing.nombre} · {ing.matricula}</p>
                    <p className="num mt-1 text-sm font-semibold text-verde-800">{validadas} de {aplicaciones.length} aplicaciones validadas</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-texto-suave">Sumá el sello de tu ingeniero agrónomo al cuaderno.</p>
                    <ButtonLink to="/productor/configuracion" variante="suave" tamano="sm" className="mt-2">Activar</ButtonLink>
                  </>
                )}
              </div>
            </div>
            <p className="mt-3 border-t border-borde pt-2 text-xs italic text-texto-suave">{NOTA_VALIDACION_PROFESIONAL}.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
