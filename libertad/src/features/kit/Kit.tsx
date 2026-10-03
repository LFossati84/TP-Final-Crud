import { useMemo, useState, type ReactNode } from 'react'
import { describirInsumos } from '@/domain/cuaderno'
import { etiquetaLabor, fecha, fechaCorta, has, pesos } from '@/domain/format'
import type { EstadoCobro, EstadoLiquidacion, EstadoParte, ID, NivelVerificacion, ParteLabor, TipoLabor } from '@/domain/types'
import { LeyendaCultivos, MapaLotes } from '@/maps/MapaLotes'
import { useVerificacion } from '@/store/hooks'
import { useDemo } from '@/store/useDemo'
import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { Card, CardHeader } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState, ErrorState, SkeletonLista } from '@/ui/EmptyState'
import { Estrellas } from '@/ui/Estrellas'
import { Checkbox, Input, OpcionesGrandes, Select, Textarea, Toggle } from '@/ui/FormField'
import { Icon, type NombreIcono } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'
import { ProgressBar } from '@/ui/ProgressBar'
import { Stat } from '@/ui/Stat'
import { ESTADO_PARTE } from '@/ui/estados'
import { EstadoCobroChip, EstadoLiquidacionChip, EstadoParteChip, SemaforoChip } from '@/ui/StatusChip'
import { Stepper } from '@/ui/Stepper'
import { Table, type Columna } from '@/ui/Table'
import { Tabs } from '@/ui/Tabs'
import { Timeline } from '@/ui/Timeline'
import { toast } from '@/ui/toast-store'
import { VerificationBadge } from '@/ui/VerificationBadge'

const ESCALAS = ['tierra', 'verde', 'trigo', 'rojo', 'cielo'] as const
const PASOS_ESCALA = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
const SEMANTICOS = ['paper', 'paper-2', 'paper-3', 'superficie', 'borde', 'borde-fuerte', 'texto', 'texto-suave', 'accion', 'acento', 'peligro', 'barra'] as const

const ICONO_LABOR: Record<TipoLabor, NombreIcono> = {
  siembra: 'brote',
  pulverizacion: 'gota',
  fertilizacion: 'capas',
  cosecha: 'trigo',
  laboreo: 'tractor',
}

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-32">
      <h2 id={`${id}-t`} className="mb-4 text-2xl text-tierra-900">{titulo}</h2>
      {children}
    </section>
  )
}

function FilaContratista({ id }: { id: ID }) {
  const c = useDemo((s) => s.contratistas.find((x) => x.id === id))
  const ev = useVerificacion(id)
  if (!c) return null
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar nombre={c.razonSocial} tamano="sm" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.razonSocial}</span>
      <VerificationBadge nivel={ev?.nivel ?? null} tamano="sm" />
    </li>
  )
}

export function Kit() {
  const partes = useDemo((s) => s.partes)
  const lotes = useDemo((s) => s.lotes)
  const establecimientos = useDemo((s) => s.establecimientos)
  const contratistas = useDemo((s) => s.contratistas)
  const insumos = useDemo((s) => s.insumos)
  const cuaderno = useDemo((s) => s.cuaderno)
  const [modal, setModal] = useState(false)
  const [paso, setPaso] = useState(1)
  const [tab, setTab] = useState<'todos' | EstadoParte>('todos')
  const [labor, setLabor] = useState<TipoLabor | ''>('pulverizacion')
  const [toggle, setToggle] = useState(true)
  const [estrellas, setEstrellas] = useState<number>(4)
  const [loteSel, setLoteSel] = useState<ID>('l2')

  const partesP1 = useMemo(() => partes.filter((p) => p.productorId === 'p1' && p.campania === '2026/27'), [partes])
  const filtrados = tab === 'todos' ? partesP1 : partesP1.filter((p) => p.estado === tab)
  const timeline = useMemo(
    () =>
      cuaderno
        .filter((e) => e.loteId === 'l2' && e.campania === '2025/26')
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .map((e) => ({
          id: e.id,
          fecha: fechaCorta(e.fecha),
          titulo: e.titulo,
          detalle: e.detalle,
          icono: e.tipo === 'recorrida' || e.tipo === 'analisis' ? ('ojo' as const) : ICONO_LABOR[e.tipo],
          tono: e.tipo === 'recorrida' || e.tipo === 'analisis' ? ('cielo' as const) : ('verde' as const),
        })),
    [cuaderno],
  )

  const columnas: Columna<ParteLabor>[] = [
    { clave: 'numero', titulo: 'Parte', render: (p) => <span className="font-semibold">{p.numero}</span> },
    { clave: 'labor', titulo: 'Labor', render: (p) => etiquetaLabor[p.labor] },
    { clave: 'lote', titulo: 'Lote', render: (p) => lotes.find((l) => l.id === p.loteId)?.nombre },
    { clave: 'contratista', titulo: 'Contratista', ocultarEnMovil: true, render: (p) => contratistas.find((c) => c.id === p.contratistaId)?.razonSocial },
    { clave: 'fecha', titulo: 'Fecha', render: (p) => <span className="num">{fecha(p.fecha)}</span> },
    { clave: 'has', titulo: 'Has', alinear: 'der', render: (p) => <span className="num">{p.has}</span> },
    { clave: 'estado', titulo: 'Estado', render: (p) => <EstadoParteChip estado={p.estado} /> },
  ]

  const contar = (e: EstadoParte) => partesP1.filter((p) => p.estado === e).length
  const nav = [
    ['colores', 'Colores'], ['tipografia', 'Tipografía'], ['botones', 'Botones'], ['estados', 'Estados'], ['verificacion', 'Verificación'],
    ['formularios', 'Formularios'], ['stepper', 'Stepper'], ['timeline', 'Timeline'], ['tabla', 'Tabla'], ['dialogos', 'Modal y toasts'],
    ['vacios', 'Vacío, error y carga'], ['indicadores', 'Indicadores'], ['mapas', 'Mapa de lotes'],
  ] as const

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-trigo-700">Fase 1</p>
        <h1 className="text-4xl text-tierra-900">Sistema de diseño</h1>
        <p className="mt-2 max-w-2xl text-texto-suave">Componentes base de la demo con datos reales del escenario. Probá el modo oscuro desde la barra superior: todo usa los mismos tokens.</p>
      </header>
      <nav aria-label="Secciones" className="sticky top-14 z-20 -mx-4 mb-8 overflow-x-auto border-b border-borde bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <ul className="flex gap-1">
          {nav.map(([id, t]) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium text-texto-suave hover:bg-paper-2 hover:text-texto">
                {t}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14">
        <Seccion id="colores" titulo="Colores">
          <Card>
            <div className="space-y-3">
              {ESCALAS.map((e) => (
                <div key={e} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-sm font-semibold capitalize">{e}</span>
                  <div className="grid flex-1 grid-cols-11 overflow-hidden rounded-lg ring-1 ring-borde">
                    {PASOS_ESCALA.map((p) => (
                      <span key={p} className={`bg-${e}-${p} h-10`} title={`${e}-${p}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {SEMANTICOS.map((s) => (
                <div key={s} className="overflow-hidden rounded-xl ring-1 ring-borde">
                  <div className={`bg-${s} h-12`} />
                  <p className="bg-superficie px-2 py-1.5 font-mono text-xs">{s}</p>
                </div>
              ))}
            </div>
          </Card>
        </Seccion>

        <Seccion id="tipografia" titulo="Tipografía">
          <Card className="space-y-3">
            <p className="font-serif text-4xl text-tierra-900">Cuaderno de La Esperanza</p>
            <p className="font-serif text-2xl text-tierra-900">Campaña 2026/27 · Lote 2 La Loma</p>
            <p className="text-base">Interfaz en sans del sistema: legible al sol y con guantes. Pulverización con 85 l/ha de caldo, viento 10 km/h NE.</p>
            <p className="text-sm text-texto-suave">Texto secundario para detalles y ayudas.</p>
            <p className="num font-serif text-3xl font-semibold text-tierra-900">{pesos(1922700)} · {has(120)}</p>
          </Card>
        </Seccion>

        <Seccion id="botones" titulo="Botones">
          <Card className="flex flex-wrap items-center gap-3">
            <Button icono="check">Conformar</Button>
            <Button variante="secundario" icono="alerta">Observar</Button>
            <Button variante="peligro" icono="x">Rechazar</Button>
            <Button variante="suave" icono="descargar">Exportar PDF</Button>
            <Button variante="acento" icono="play">Recorrido guiado</Button>
            <Button variante="fantasma">Cancelar</Button>
            <Button cargando>Sincronizando</Button>
            <Button tamano="sm" variante="secundario">Chico</Button>
            <Button tamano="lg" iconoDerecha="flechaDerecha">Siguiente paso</Button>
            <Button disabled>Deshabilitado</Button>
          </Card>
        </Seccion>

        <Seccion id="estados" titulo="Chips de estado">
          <Card className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-texto-suave">Parte de labor</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ESTADO_PARTE) as EstadoParte[]).map((e) => <EstadoParteChip key={e} estado={e} />)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-texto-suave">Liquidación</p>
              <div className="flex flex-wrap gap-2">
                {(['emitida', 'aceptada', 'observada', 'pago_informado', 'cobrada_parcial', 'cobrada', 'en_disputa'] as EstadoLiquidacion[]).map((e) => <EstadoLiquidacionChip key={e} estado={e} />)}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-texto-suave">Seguimiento de cobro y semáforo de vencimientos</p>
              <div className="flex flex-wrap gap-2">
                {(['a_vencer', 'vencido', 'cobrado', 'en_disputa'] as EstadoCobro[]).map((e) => <EstadoCobroChip key={e} estado={e} />)}
                <SemaforoChip semaforo="verde" />
                <SemaforoChip semaforo="amarillo" texto="Vence en 6 días" />
                <SemaforoChip semaforo="rojo" />
              </div>
            </div>
          </Card>
        </Seccion>

        <Seccion id="verificacion" titulo="Badges de verificación">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader titulo="Niveles" subtitulo="Pasá el mouse o enfocá un badge para ver los requisitos." />
              <div className="flex flex-wrap items-center gap-3">
                {([null, 'basico', 'verificado', 'destacado'] as (NivelVerificacion | null)[]).map((n) => (
                  <VerificationBadge key={n ?? 'p'} nivel={n} tamano="lg" />
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader titulo="Red de contratistas (calculado en vivo)" subtitulo="Nivel derivado de documentos, trabajos, reseñas y disputas." />
              <ul className="divide-y divide-borde">
                {contratistas.map((c) => <FilaContratista key={c.id} id={c.id} />)}
              </ul>
            </Card>
          </div>
        </Seccion>

        <Seccion id="formularios" titulo="Formularios">
          <Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Hectáreas trabajadas" inputMode="decimal" defaultValue="120" sufijo="has" hint="El lote tiene 120 has." />
              <Input label="Hectáreas (con error)" defaultValue="150" sufijo="has" error="Supera la superficie del lote (105 has)." />
              <Select label="Establecimiento" defaultValue="e1" opciones={establecimientos.map((e) => ({ valor: e.id, texto: `${e.nombre} · ${e.localidad}` }))} />
              <Input label="Tarifa" prefijo="$" defaultValue="14.500" sufijo="/ ha" />
              <Textarea label="Motivo de la observación" placeholder="Contale al contratista qué hay que corregir" opcional className="md:col-span-2" />
              <div className="md:col-span-2">
                <OpcionesGrandes<TipoLabor>
                  label="Tipo de labor"
                  valor={labor}
                  onCambiar={setLabor}
                  columnas={3}
                  opciones={(['siembra', 'pulverizacion', 'fertilizacion', 'cosecha', 'laboreo'] as TipoLabor[]).map((l) => ({
                    valor: l,
                    texto: etiquetaLabor[l],
                    icono: <Icon nombre={ICONO_LABOR[l]} />,
                  }))}
                />
              </div>
              <Toggle label="Recordatorios automáticos" descripcion="3 días antes, el día del vencimiento y 7 días después." activo={toggle} onCambiar={setToggle} />
              <Checkbox label="Compartir mi historial de pago" descripcion="Solo lo ven contratistas que ya trabajaron con vos." defaultChecked />
            </div>
          </Card>
        </Seccion>

        <Seccion id="stepper" titulo="Stepper">
          <Card className="space-y-6">
            <Stepper pasos={['Lote', 'Labor', 'Superficie', 'Insumos', 'Firma']} actual={paso} onIr={setPaso} />
            <div className="max-w-sm">
              <Stepper compacto pasos={['Lote', 'Labor', 'Superficie', 'Insumos', 'Firma']} actual={paso} />
            </div>
            <div className="flex gap-2">
              <Button variante="secundario" tamano="sm" onClick={() => setPaso((p) => Math.max(0, p - 1))}>Anterior</Button>
              <Button tamano="sm" onClick={() => setPaso((p) => Math.min(4, p + 1))}>Siguiente</Button>
            </div>
          </Card>
        </Seccion>

        <Seccion id="timeline" titulo="Timeline del cuaderno">
          <Card>
            <CardHeader titulo="Lote 2 · La Loma · Campaña 2025/26" subtitulo="Generado desde los partes conformados y las recorridas." />
            <Timeline items={timeline} />
          </Card>
        </Seccion>

        <Seccion id="tabla" titulo="Tabla">
          <Card>
            <Tabs
              etiqueta="Filtrar por estado"
              valor={tab}
              onCambiar={setTab}
              className="mb-4"
              tabs={[
                { valor: 'todos', texto: 'Todos', cantidad: partesP1.length },
                { valor: 'enviado', texto: 'Por conformar', cantidad: contar('enviado') },
                { valor: 'observado', texto: 'Observados', cantidad: contar('observado') },
                { valor: 'conformado', texto: 'Conformados', cantidad: contar('conformado') },
                { valor: 'en_disputa', texto: 'En disputa', cantidad: contar('en_disputa') },
              ]}
            />
            <Table
              etiqueta="Partes de labor de Los Talas, campaña 2026/27"
              columnas={columnas}
              filas={filtrados}
              claveFila={(p) => p.id}
              onFila={(p) => toast.info(`${p.numero} · ${etiquetaLabor[p.labor]}`, describirInsumos(p, insumos) || 'Sin insumos')}
              vacio={<EmptyState icono="documento" titulo="No hay partes en este estado" />}
              tarjetaMovil={(p) => (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-borde bg-superficie p-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{p.numero} · {etiquetaLabor[p.labor]}</p>
                    <p className="truncate text-sm text-texto-suave">{lotes.find((l) => l.id === p.loteId)?.nombre} · {p.has} has</p>
                  </div>
                  <EstadoParteChip estado={p.estado} />
                </div>
              )}
            />
          </Card>
        </Seccion>

        <Seccion id="dialogos" titulo="Modal y toasts">
          <Card className="flex flex-wrap gap-3">
            <Button variante="secundario" icono="ojo" onClick={() => setModal(true)}>Abrir modal</Button>
            <Button variante="suave" onClick={() => toast.ok('Parte conformado', 'Ya aparece en el cuaderno y quedó listo para cobrar.')}>Toast OK</Button>
            <Button variante="secundario" onClick={() => toast.alerta('Sin señal', 'El parte quedó guardado en el teléfono.')}>Toast alerta</Button>
            <Button variante="secundario" onClick={() => toast.error('No se pudo enviar', 'Probá de nuevo en un rato.')}>Toast error</Button>
            <Modal
              abierto={modal}
              onCerrar={() => setModal(false)}
              titulo="Observar parte PL-0657"
              descripcion="El contratista recibe la observación y puede corregir y reenviar."
              pie={
                <>
                  <Button variante="fantasma" onClick={() => setModal(false)}>Cancelar</Button>
                  <Button
                    icono="alerta"
                    onClick={() => {
                      setModal(false)
                      toast.ok('Observación enviada', 'Te avisamos cuando lo corrija.')
                    }}
                  >
                    Enviar observación
                  </Button>
                </>
              }
            >
              <Textarea label="Detalle" defaultValue="Declaraste 150 has y La Tranquera tiene 105 has. ¿Lo revisás?" />
            </Modal>
          </Card>
        </Seccion>

        <Seccion id="vacios" titulo="Estados vacío, error y carga">
          <div className="grid gap-4 md:grid-cols-3">
            <EmptyState icono="billetera" titulo="Todavía no hay cobros" texto="Cuando el productor conforme tus partes, vas a poder armar la liquidación." accion={<Button tamano="sm">Ver partes</Button>} />
            <ErrorState onReintentar={() => toast.info('Reintentando…')} />
            <SkeletonLista />
          </div>
        </Seccion>

        <Seccion id="indicadores" titulo="Indicadores">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat etiqueta="A cobrar" valor={pesos(6957365)} detalle="4 liquidaciones" icono="billetera" tono="verde" />
            <Stat etiqueta="Vencido" valor={pesos(5768100)} detalle="Más de 30 días" icono="alerta" tono="rojo" />
            <Stat etiqueta="Cobrado en octubre" valor={pesos(0)} detalle="Mes en curso" icono="checkCirculo" tono="cielo" />
            <Stat etiqueta="Conformidad" valor="93 %" detalle={<Estrellas valor={4.4} />} icono="estrella" tono="trigo" />
          </div>
          <Card className="mt-4 grid gap-6 md:grid-cols-3">
            <ProgressBar valor={0.8} etiqueta="Completitud del cuaderno" />
            <ProgressBar valor={0.45} etiqueta="Cobrado de la campaña" tono="trigo" />
            <div className="flex items-center gap-3">
              <Estrellas valor={estrellas} onCambiar={setEstrellas} />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:col-span-3">
              {['Mariela Costantini', 'Sergio Bianchi', 'Julieta Varela', 'Darío Pascualini', 'Ricardo Peralta'].map((n) => <Avatar key={n} nombre={n} />)}
              <Chip tono="verde" icono="sello">Validado por Ing. Agr. Julieta Varela – Mat. 2-1487</Chip>
            </div>
          </Card>
        </Seccion>

        <Seccion id="mapas" titulo="Mapa de lotes (SVG)">
          <div className="grid gap-4 lg:grid-cols-3">
            {establecimientos.map((e) => (
              <Card key={e.id} relleno={false} className="p-3">
                <p className="mb-2 px-1 font-serif text-lg text-tierra-900">{e.nombre} <span className="text-sm font-sans text-texto-suave">· {e.localidad}</span></p>
                <MapaLotes
                  establecimiento={e}
                  lotes={lotes}
                  campania="2026/27"
                  seleccionado={loteSel}
                  onSeleccionar={(l) => setLoteSel(l.id)}
                  ubicacion={e.id === 'e1' ? [330, 104] : undefined}
                  leyenda={<LeyendaCultivos />}
                />
              </Card>
            ))}
          </div>
          <p className="mt-3 text-sm text-texto-suave">
            Lote seleccionado: <strong>{lotes.find((l) => l.id === loteSel)?.nombre}</strong>. Los lotes se pueden elegir con el mouse, el dedo o el teclado (Tab + Enter).
          </p>
        </Seccion>
      </div>
    </main>
  )
}
