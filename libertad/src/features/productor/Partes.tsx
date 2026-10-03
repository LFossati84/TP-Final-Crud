import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { describirInsumos } from '@/domain/cuaderno'
import { etiquetaLabor, etiquetaMaquina, etiquetaMotivoObservacion, fecha, fechaHora, num } from '@/domain/format'
import { CAMPANIA_ACTIVA } from '@/domain/reloj'
import type { Campania, EstadoParte, MotivoObservacion, ParteLabor, Resena } from '@/domain/types'
import { evaluarParte } from '@/domain/validacion'
import { FotoIlustrada } from '@/features/contratista/FotoIlustrada'
import { MapaLotes } from '@/maps/MapaLotes'
import { useProductor, useVerificacion } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Estrellas } from '@/ui/Estrellas'
import { Select, Textarea } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { ICONO_LABOR } from '@/ui/iconosDominio'
import { Modal } from '@/ui/Modal'
import { EstadoParteChip, EstadoValidacionChip } from '@/ui/StatusChip'
import { Table, type Columna } from '@/ui/Table'
import { Tabs } from '@/ui/Tabs'
import { toast } from '@/ui/toast-store'
import { VerificationBadge } from '@/ui/VerificationBadge'

type Filtro = 'enviado' | 'observado' | 'conformado' | 'en_disputa' | 'rechazado' | 'todos'

export function PartesProductor() {
  const p = useProductor()
  const cat = useCatalogo()
  const partes = useDemo((s) => s.partes)
  const navigate = useNavigate()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const filtro = (params.get('estado') as Filtro | null) ?? 'enviado'
  const campania = (params.get('campania') as Campania | null) ?? CAMPANIA_ACTIVA
  const [busqueda, setBusqueda] = useState('')

  const propios = useMemo(
    () => partes.filter((x) => x.productorId === p?.id && x.campania === campania && x.estado !== 'borrador' && x.estado !== 'pendiente_sync').sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [partes, p, campania],
  )
  const contar = (e: EstadoParte) => propios.filter((x) => x.estado === e).length
  const visibles = propios.filter((x) => {
    if (filtro !== 'todos' && x.estado !== filtro) return false
    if (!busqueda.trim()) return true
    const t = [x.numero, cat.lote(x.loteId)?.nombre, cat.contratista(x.contratistaId)?.razonSocial, etiquetaLabor[x.labor]].join(' ').toLowerCase()
    return t.includes(busqueda.toLowerCase())
  })
  const seleccionado = id ? partes.find((x) => x.id === id && x.productorId === p?.id) : undefined

  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params)
    if (v === null) n.delete(k)
    else n.set(k, v)
    setParams(n, { replace: true })
  }

  const columnas: Columna<ParteLabor>[] = [
    {
      clave: 'parte',
      titulo: 'Parte',
      render: (x) => (
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-verde-100 text-verde-800">
            <Icon nombre={ICONO_LABOR[x.labor]} tamano={16} />
          </span>
          <span>
            <span className="block font-semibold">{etiquetaLabor[x.labor]}</span>
            <span className="block text-xs text-texto-suave">{x.numero}</span>
          </span>
        </span>
      ),
    },
    { clave: 'lote', titulo: 'Lote', render: (x) => <span>{cat.lote(x.loteId)?.nombre}<span className="block text-xs text-texto-suave">{cat.establecimiento(x.establecimientoId)?.nombre}</span></span> },
    { clave: 'contratista', titulo: 'Contratista', ocultarEnMovil: true, render: (x) => cat.contratista(x.contratistaId)?.razonSocial },
    { clave: 'fecha', titulo: 'Fecha', render: (x) => <span className="num">{fecha(x.fecha)}</span> },
    {
      clave: 'has',
      titulo: 'Has',
      alinear: 'der',
      render: (x) => {
        const lote = cat.lote(x.loteId)
        const excede = lote && x.has > lote.has * 1.02
        return <span className={cx('num', excede && 'font-bold text-rojo-700')} title={excede ? `El lote tiene ${lote.has} has` : undefined}>{num(x.has, 1)}{excede ? ' ⚠' : ''}</span>
      },
    },
    {
      clave: 'estado',
      titulo: 'Estado',
      render: (x) => (
        <span className="flex flex-wrap gap-1">
          <EstadoParteChip estado={x.estado} />
          {x.labor === 'pulverizacion' && !x.recetaId ? <Chip tono="rojo" icono="receta">Sin receta</Chip> : null}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-tierra-900">Partes de labor</h1>
          <p className="text-texto-suave">Conformá, observá o rechazá lo que cargan tus contratistas.</p>
        </div>
        <Select
          label="Campaña"
          className="w-40"
          value={campania}
          onChange={(e) => set('campania', e.target.value === CAMPANIA_ACTIVA ? null : e.target.value)}
          opciones={[{ valor: '2026/27', texto: '2026/27' }, { valor: '2025/26', texto: '2025/26' }]}
        />
      </header>
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Tabs
            etiqueta="Estado"
            valor={filtro}
            onCambiar={(v) => set('estado', v === 'enviado' ? null : v)}
            tabs={[
              { valor: 'enviado', texto: 'Por conformar', cantidad: contar('enviado') },
              { valor: 'observado', texto: 'Observados', cantidad: contar('observado') },
              { valor: 'conformado', texto: 'Conformados', cantidad: contar('conformado') },
              { valor: 'en_disputa', texto: 'En disputa', cantidad: contar('en_disputa') },
              { valor: 'rechazado', texto: 'Rechazados', cantidad: contar('rechazado') },
              { valor: 'todos', texto: 'Todos', cantidad: propios.length },
            ]}
          />
          <label className="relative ml-auto w-full sm:w-64">
            <span className="sr-only">Buscar</span>
            <Icon nombre="buscar" tamano={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-texto-suave" />
            <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Lote, contratista o número" className="min-h-10 w-full rounded-xl border border-borde-fuerte bg-superficie pl-9 pr-3 text-sm" />
          </label>
        </div>
        <Table
          etiqueta="Partes de labor"
          columnas={columnas}
          filas={visibles}
          claveFila={(x) => x.id}
          filaActiva={id}
          onFila={(x) => navigate({ pathname: `/productor/partes/${x.id}`, search: params.toString() })}
          vacio={<EmptyState icono="checkCirculo" titulo={filtro === 'enviado' ? 'No hay partes por conformar' : 'No hay partes en este estado'} texto="Cuando un contratista cargue un parte, te llega una notificación." />}
          tarjetaMovil={(x) => (
            <div className="flex items-center gap-3 rounded-xl border border-borde bg-superficie p-3">
              <Icon nombre={ICONO_LABOR[x.labor]} className="shrink-0 text-verde-700" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{etiquetaLabor[x.labor]} · {cat.lote(x.loteId)?.nombre}</p>
                <p className="truncate text-xs text-texto-suave">{x.numero} · {fecha(x.fecha)} · {num(x.has, 1)} has</p>
              </div>
              <EstadoParteChip estado={x.estado} />
            </div>
          )}
        />
      </Card>

      {seleccionado ? <DetalleParteProductor parte={seleccionado} onCerrar={() => navigate({ pathname: '/productor/partes', search: params.toString() })} /> : null}
    </div>
  )
}

const MOTIVOS: MotivoObservacion[] = ['hectareas', 'fecha', 'insumos', 'condiciones', 'lote', 'otro']

function DetalleParteProductor({ parte, onCerrar }: { parte: ParteLabor; onCerrar: () => void }) {
  const cat = useCatalogo()
  const conformar = useDemo((s) => s.conformarParte)
  const observar = useDemo((s) => s.observarParte)
  const rechazar = useDemo((s) => s.rechazarParte)
  const ingenieros = useDemo((s) => s.ingenieros)
  const ev = useVerificacion(parte.contratistaId)
  const [accion, setAccion] = useState<'conformar' | 'observar' | 'rechazar' | null>(null)
  const lote = cat.lote(parte.loteId)
  const est = cat.establecimiento(parte.establecimientoId)
  const c = cat.contratista(parte.contratistaId)
  const receta = cat.receta(parte.recetaId)
  const maquina = c?.flota.find((m) => m.id === parte.maquinaId)
  const hallazgos = evaluarParte(parte, cat.insumos, lote, receta)
  const excede = hallazgos.find((h) => h.codigo === 'has_excedidas')
  const ing = ingenieros.find((i) => i.id === parte.validacion?.ingenieroId)

  // Valores propuestos por los controles automáticos.
  const [motivo, setMotivo] = useState<MotivoObservacion>(excede ? 'hectareas' : 'otro')
  const [detalle, setDetalle] = useState(excede && lote ? `Declaraste ${num(parte.has, 1)} has y ${lote.nombre} tiene ${num(lote.has, 1)} has. ¿Lo revisás?` : '')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [puntaje, setPuntaje] = useState<Resena['puntaje'] | 0>(0)
  const [resena, setResena] = useState('')

  const pie =
    parte.estado === 'enviado' ? (
      <>
        <Button variante="peligro" icono="x" onClick={() => setAccion('rechazar')} data-tour="rechazar-parte">Rechazar</Button>
        <Button variante="secundario" icono="alerta" onClick={() => setAccion('observar')} data-tour="observar-parte">Observar</Button>
        <Button icono="check" onClick={() => setAccion('conformar')} data-tour="conformar-parte">Conformar</Button>
      </>
    ) : undefined

  return (
    <>
      <Modal abierto onCerrar={onCerrar} variante="lateral" titulo={`${etiquetaLabor[parte.labor]} · ${parte.numero}`} descripcion={`${est?.nombre ?? ''} · ${lote?.nombre ?? ''}`} pie={pie}>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <EstadoParteChip estado={parte.estado} tamano="md" />
            {parte.validacion ? <EstadoValidacionChip estado={parte.validacion.estado} /> : null}
            {parte.cargadoSinConexion ? <Chip tono="neutro" icono="nubeOff">Cargado sin señal</Chip> : null}
          </div>

          {hallazgos.length ? (
            <ul className="space-y-1.5" aria-label="Controles automáticos">
              {hallazgos.map((h) => (
                <li key={h.codigo + h.texto} className={cx('flex items-start gap-2 rounded-xl p-2.5 text-sm ring-1 ring-inset', h.severidad === 'peligro' ? 'bg-rojo-50 text-rojo-900 ring-rojo-200' : 'bg-trigo-50 text-trigo-900 ring-trigo-200')}>
                  <Icon nombre="alerta" tamano={16} className="mt-0.5 shrink-0" />
                  {h.texto}
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-2 rounded-xl bg-verde-50 p-2.5 text-sm text-verde-900 ring-1 ring-inset ring-verde-200">
              <Icon nombre="checkCirculo" tamano={16} /> Los controles automáticos no encontraron problemas.
            </p>
          )}

          {parte.observacion ? (
            <p className="rounded-xl bg-trigo-50 p-3 text-sm ring-1 ring-inset ring-trigo-200">
              <strong>Observaste: {etiquetaMotivoObservacion[parte.observacion.motivo]}.</strong> “{parte.observacion.detalle}”
            </p>
          ) : null}
          {parte.validacion?.estado === 'observada' ? (
            <p className="rounded-xl bg-trigo-50 p-3 text-sm ring-1 ring-inset ring-trigo-200">
              <strong>Observado por Ing. Agr. {ing?.nombre}:</strong> {parte.validacion.nota}
            </p>
          ) : null}

          <section className="flex items-center gap-3 rounded-2xl border border-borde p-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c?.razonSocial}</p>
              <p className="text-xs text-texto-suave">{parte.operario} · {maquina ? `${etiquetaMaquina[maquina.tipo]} ${maquina.anio}` : ''}</p>
            </div>
            <VerificationBadge nivel={ev?.nivel ?? null} tamano="sm" />
          </section>

          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-texto-suave">Fecha</dt><dd className="num font-semibold">{fecha(parte.fecha)}</dd></div>
            <div><dt className="text-xs text-texto-suave">Horario</dt><dd className="num font-semibold">{parte.horaInicio}–{parte.horaFin}</dd></div>
            <div><dt className="text-xs text-texto-suave">Superficie</dt><dd className={cx('num font-semibold', excede && 'text-rojo-700')}>{num(parte.has, 1)} has</dd></div>
            <div><dt className="text-xs text-texto-suave">Lote</dt><dd className="num font-semibold">{num(lote?.has ?? 0, 1)} has</dd></div>
          </dl>

          {parte.insumos.length ? (
            <section>
              <h3 className="mb-1.5 font-sans text-sm font-semibold">Datos de aplicación</h3>
              <p className="text-sm">{describirInsumos(parte, cat.insumos)}</p>
              {parte.condiciones ? (
                <p className="num mt-1 text-sm text-texto-suave">
                  Caldo {parte.condiciones.caldo} l/ha · viento {parte.condiciones.viento} km/h {parte.condiciones.direccionViento} · {parte.condiciones.temperatura} °C · HR {parte.condiciones.humedad} %
                </p>
              ) : null}
              {parte.labor === 'pulverizacion' ? (
                <p className="mt-1 text-sm">{receta ? `Receta ${receta.numero} · ${receta.objetivo}` : <span className="font-semibold text-rojo-700">Sin receta agronómica asociada</span>}</p>
              ) : null}
            </section>
          ) : null}
          {parte.notas ? <p className="rounded-xl bg-paper-2 p-3 text-sm">{parte.notas}</p> : null}

          {est ? (
            <section>
              <h3 className="mb-1.5 font-sans text-sm font-semibold">Ubicación</h3>
              <MapaLotes establecimiento={est} lotes={cat.lotes} campania={parte.campania} seleccionado={parte.loteId} compacto />
              <p className="num mt-1 text-xs text-texto-suave">GPS {parte.ubicacion.lat}, {parte.ubicacion.lng} · ±{parte.ubicacion.precision} m</p>
            </section>
          ) : null}

          {parte.fotos.length ? (
            <section>
              <h3 className="mb-1.5 font-sans text-sm font-semibold">Fotos</h3>
              <div className="grid grid-cols-3 gap-2">
                {parte.fotos.map((f) => <FotoIlustrada key={f.id} foto={f} pie={f.descripcion} />)}
              </div>
            </section>
          ) : null}

          {parte.firma ? (
            <section>
              <h3 className="mb-1.5 font-sans text-sm font-semibold">Firma del operario</h3>
              <div className="rounded-xl border border-borde bg-white p-2">
                {parte.firma.trazo ? <img src={parte.firma.trazo} alt={`Firma de ${parte.firma.nombre}`} className="h-16 w-full object-contain" /> : <p className="py-3 text-center font-serif text-2xl italic text-verde-900">{parte.firma.nombre}</p>}
                <p className="border-t border-tierra-200 pt-1 text-center text-xs text-tierra-600">{parte.firma.nombre} · {fechaHora(parte.firma.fecha)}</p>
              </div>
            </section>
          ) : null}
        </div>
      </Modal>

      <Modal
        abierto={accion === 'conformar'}
        onCerrar={() => setAccion(null)}
        titulo={`Conformar ${parte.numero}`}
        descripcion="Al conformar, la labor entra a tu cuaderno, suma a la reputación del contratista y queda lista para cobrar."
        tamano="sm"
        pie={
          <>
            <Button variante="fantasma" onClick={() => setAccion(null)}>Cancelar</Button>
            <Button
              icono="check"
              data-autofocus
              onClick={() => {
                conformar(parte.id, puntaje ? { puntaje, texto: resena || 'Sin comentarios.' } : undefined)
                setAccion(null)
                toast.ok(`${parte.numero} conformado`, 'Ya está en el cuaderno y el contratista lo puede liquidar.')
              }}
              data-tour="confirmar-conformidad"
            >
              Conformar
            </Button>
          </>
        }
      >
        {hallazgos.length ? <p className="mb-3 rounded-xl bg-trigo-50 p-2.5 text-sm text-trigo-900">Hay {hallazgos.length} {hallazgos.length === 1 ? 'alerta' : 'alertas'} en los controles. Podés conformar igual o volver y observarlo.</p> : null}
        <p className="mb-1 text-sm font-semibold">¿Cómo fue el trabajo? <span className="font-normal text-texto-suave">(opcional)</span></p>
        <Estrellas valor={puntaje} onCambiar={setPuntaje} />
        {puntaje ? <Textarea className="mt-3" label="Reseña" opcional value={resena} onChange={(e) => setResena(e.target.value)} placeholder="Ej.: prolijo, respetó la receta y avisó a tiempo." rows={2} /> : null}
      </Modal>

      <Modal
        abierto={accion === 'observar'}
        onCerrar={() => setAccion(null)}
        titulo={`Observar ${parte.numero}`}
        descripcion="El contratista recibe la observación, corrige y reenvía."
        pie={
          <>
            <Button variante="fantasma" onClick={() => setAccion(null)}>Cancelar</Button>
            <Button
              icono="alerta"
              disabled={!detalle.trim()}
              onClick={() => {
                observar(parte.id, motivo, detalle)
                setAccion(null)
                toast.ok('Observación enviada', `${c?.razonSocial ?? 'El contratista'} la recibe al instante.`)
              }}
              data-tour="enviar-observacion"
            >
              Enviar observación
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoObservacion)} opciones={MOTIVOS.map((m) => ({ valor: m, texto: etiquetaMotivoObservacion[m] }))} />
          <Textarea label="Detalle para el contratista" value={detalle} onChange={(e) => setDetalle(e.target.value)} rows={3} />
        </div>
      </Modal>

      <Modal
        abierto={accion === 'rechazar'}
        onCerrar={() => setAccion(null)}
        titulo={`Rechazar ${parte.numero}`}
        descripcion="Usalo cuando la labor no corresponde (duplicado, otro campo, no se hizo). Para errores de carga, mejor observar."
        tamano="sm"
        pie={
          <>
            <Button variante="fantasma" onClick={() => setAccion(null)}>Cancelar</Button>
            <Button
              variante="peligro"
              icono="x"
              disabled={!motivoRechazo.trim()}
              onClick={() => {
                rechazar(parte.id, motivoRechazo)
                setAccion(null)
                toast.info(`${parte.numero} rechazado`, 'Le avisamos al contratista con el motivo.')
              }}
            >
              Rechazar parte
            </Button>
          </>
        }
      >
        <Textarea label="Motivo del rechazo" value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} placeholder="Ej.: parte duplicado de PL-0650." rows={3} />
      </Modal>
    </>
  )
}

