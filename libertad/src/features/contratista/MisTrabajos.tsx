import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { EncabezadoMovil } from '@/app/EncabezadoMovil'
import { etiquetaLabor, fecha, fechaCorta, num, pesos } from '@/domain/format'
import { tarifaPara } from '@/domain/cobranza'
import type { EstadoParte, Presupuesto } from '@/domain/types'
import { useContratista } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, ButtonLink } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Input, Select, Textarea } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { InputNumero } from '@/ui/InputNumero'
import { Modal } from '@/ui/Modal'
import { Tabs } from '@/ui/Tabs'
import { toast } from '@/ui/toast-store'
import { TarjetaParte } from './TarjetaParte'

type Filtro = 'todos' | EstadoParte

const ORDEN_FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'borrador', texto: 'Borrador' },
  { valor: 'pendiente_sync', texto: 'Sin sincronizar' },
  { valor: 'enviado', texto: 'Enviado' },
  { valor: 'observado', texto: 'Observado' },
  { valor: 'conformado', texto: 'Conformado' },
  { valor: 'en_disputa', texto: 'En disputa' },
  { valor: 'rechazado', texto: 'Rechazado' },
]

export function MisTrabajos() {
  const c = useContratista()
  const cat = useCatalogo()
  const partes = useDemo((s) => s.partes)
  const presupuestos = useDemo((s) => s.presupuestos)
  const [params, setParams] = useSearchParams()
  const [busqueda, setBusqueda] = useState('')
  const vista = params.get('vista') === 'pedidos' ? 'pedidos' : 'partes'
  const filtro = (ORDEN_FILTROS.find((f) => f.valor === params.get('estado'))?.valor ?? 'todos') as Filtro

  const propios = useMemo(() => partes.filter((p) => p.contratistaId === c?.id).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.numero.localeCompare(a.numero)), [partes, c])
  const pedidos = useMemo(() => presupuestos.filter((p) => p.contratistaId === c?.id).sort((a, b) => b.fecha.localeCompare(a.fecha)), [presupuestos, c])
  const pedidosNuevos = pedidos.filter((p) => p.estado === 'solicitado').length

  const visibles = propios.filter((p) => {
    if (filtro !== 'todos' && p.estado !== filtro) return false
    if (!busqueda.trim()) return true
    const t = busqueda.toLowerCase()
    const texto = [p.numero, cat.lote(p.loteId)?.nombre, cat.establecimiento(p.establecimientoId)?.nombre, cat.productor(p.productorId)?.razonSocial, etiquetaLabor[p.labor]].join(' ').toLowerCase()
    return texto.includes(t)
  })

  const set = (clave: string, valor: string | null) => {
    const n = new URLSearchParams(params)
    if (valor === null) n.delete(clave)
    else n.set(clave, valor)
    setParams(n, { replace: true })
  }

  const tabs = ORDEN_FILTROS.filter((f) => f.valor !== 'pendiente_sync' || propios.some((p) => p.estado === 'pendiente_sync')).map((f) => ({
    ...f,
    cantidad: f.valor === 'todos' ? propios.length : propios.filter((p) => p.estado === f.valor).length,
  }))

  return (
    <>
      <EncabezadoMovil titulo="Mis trabajos" />
      <div className="sticky top-14 z-10 space-y-3 border-b border-borde bg-paper/95 px-4 pb-3 pt-3 backdrop-blur">
        <div role="tablist" aria-label="Vista" className="grid grid-cols-2 gap-1 rounded-xl bg-paper-3 p-1">
          {(['partes', 'pedidos'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              type="button"
              aria-selected={vista === v}
              onClick={() => set('vista', v === 'partes' ? null : v)}
              className={cx('flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition', vista === v ? 'bg-superficie text-texto shadow' : 'text-texto-suave')}
              data-tour={`vista-${v}`}
            >
              {v === 'partes' ? 'Partes de labor' : 'Pedidos'}
              {v === 'pedidos' && pedidosNuevos ? <span className="num rounded-full bg-peligro px-1.5 text-[11px] text-sobre-peligro">{pedidosNuevos}</span> : null}
            </button>
          ))}
        </div>
        {vista === 'partes' ? (
          <>
            <label className="relative block">
              <span className="sr-only">Buscar partes</span>
              <Icon nombre="buscar" tamano={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-texto-suave" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por lote, campo, productor o número"
                className="min-h-tactil w-full rounded-xl border border-borde-fuerte bg-superficie pl-10 pr-3 text-base sm:text-sm"
              />
            </label>
            <Tabs etiqueta="Filtrar por estado" tabs={tabs} valor={filtro} onCambiar={(v) => set('estado', v === 'todos' ? null : v)} />
          </>
        ) : null}
      </div>

      <div className="space-y-2 px-4 py-4">
        {vista === 'partes' ? (
          visibles.length === 0 ? (
            <EmptyState
              icono="documento"
              titulo={busqueda ? 'No encontramos partes' : 'No hay partes en este estado'}
              texto={busqueda ? 'Probá con otro lote, campo o número.' : 'Cuando cargues partes, los vas a ver acá.'}
              accion={<ButtonLink to="/contratista/nuevo-parte" icono="mas" tamano="sm">Nuevo parte</ButtonLink>}
            />
          ) : (
            visibles.map((p) => <TarjetaParte key={p.id} parte={p} destacada={p.estado === 'observado' || p.validacion?.estado === 'observada'} />)
          )
        ) : pedidos.length === 0 ? (
          <EmptyState icono="chat" titulo="Sin pedidos de presupuesto" texto="Cuando un productor te pida un presupuesto desde la red, aparece acá." />
        ) : (
          pedidos.map((p) => <TarjetaPedido key={p.id} pedido={p} />)
        )}
      </div>
    </>
  )
}

function TarjetaPedido({ pedido }: { pedido: Presupuesto }) {
  const c = useContratista()
  const cat = useCatalogo()
  const responder = useDemo((s) => s.responderPresupuesto)
  const [abierto, setAbierto] = useState(false)
  const prod = cat.productor(pedido.productorId)
  const est = cat.establecimiento(pedido.establecimientoId)
  const tarifa = c ? tarifaPara(c, pedido.labor) : { precio: 0, unidad: 'ha' as const }
  const [precio, setPrecio] = useState(tarifa.precio)
  const [unidad, setUnidad] = useState(tarifa.unidad)
  const [fechaProp, setFechaProp] = useState(pedido.fechaDeseada)
  const [mensaje, setMensaje] = useState(
    `Hola ${prod?.contacto.split(' ')[0] ?? ''}, te lo hacemos a ${pesos(tarifa.precio)} + IVA por ${tarifa.unidad === 'ha' ? 'hectárea' : 'hora'}. Podemos entrar el ${fecha(pedido.fechaDeseada)}. Trabajamos con receta y te mandamos el parte con fotos y condiciones.`,
  )

  const estado = {
    solicitado: <Chip tono="cielo" icono="reloj">Nuevo</Chip>,
    respondido: <Chip tono="verde" icono="enviar">Respondido</Chip>,
    aceptado: <Chip tono="verde" icono="checkCirculo">Aceptado</Chip>,
    rechazado: <Chip tono="neutro" icono="x">No aceptado</Chip>,
  }[pedido.estado]

  return (
    <article className={cx('rounded-2xl border bg-superficie p-4 shadow-tarjeta', pedido.estado === 'solicitado' ? 'border-cielo-300' : 'border-borde')} data-tour={`pedido-${pedido.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-texto">{pedido.tipo === 'contratacion' ? 'Contratación' : 'Presupuesto'} · {etiquetaLabor[pedido.labor]}</p>
          <p className="truncate text-sm text-texto-suave">{prod?.razonSocial}</p>
        </div>
        {estado}
      </div>
      <p className="num mt-2 text-sm text-texto">
        {num(pedido.has, 1)} has · {est?.nombre ?? 'Campo del productor'} · para el {fechaCorta(pedido.fechaDeseada)}
      </p>
      <p className="mt-2 rounded-xl bg-paper-2 p-2.5 text-sm italic text-texto-suave">“{pedido.comentario}”</p>
      {pedido.respuesta ? (
        <p className="mt-2 text-sm text-texto">
          <strong>Tu respuesta:</strong> {pesos(pedido.respuesta.precio)}/{pedido.respuesta.unidad} · entrada {fechaCorta(pedido.respuesta.fechaPropuesta)}
        </p>
      ) : null}
      {pedido.estado === 'solicitado' ? (
        <Button bloque className="mt-3" icono="enviar" onClick={() => setAbierto(true)} data-tour="responder-pedido">
          Responder
        </Button>
      ) : null}

      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Responder pedido"
        descripcion={`${prod?.razonSocial ?? ''} · ${etiquetaLabor[pedido.labor]} · ${num(pedido.has, 1)} has`}
        pie={
          <>
            <Button variante="fantasma" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button
              icono="enviar"
              disabled={!(precio > 0)}
              onClick={() => {
                responder(pedido.id, { precio, unidad, fechaPropuesta: fechaProp, mensaje })
                setAbierto(false)
                toast.ok('Respuesta enviada', `${prod?.razonSocial ?? 'El productor'} la recibe en la plataforma.`)
              }}
              data-tour="enviar-respuesta"
            >
              Enviar respuesta
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_8rem] gap-3">
            <InputNumero label="Precio (sin IVA)" valor={precio} onValor={setPrecio} prefijo="$" />
            <Select label="Unidad" value={unidad} onChange={(e) => setUnidad(e.target.value === 'hora' ? 'hora' : 'ha')} opciones={[{ valor: 'ha', texto: 'por ha' }, { valor: 'hora', texto: 'por hora' }]} />
          </div>
          <p className="num text-sm text-texto-suave">Total estimado: {pesos(precio * (unidad === 'ha' ? pedido.has : 1))} + IVA</p>
          <Input label="Fecha propuesta" type="date" value={fechaProp} onChange={(e) => setFechaProp(e.target.value)} />
          <Textarea label="Mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} rows={4} />
        </div>
      </Modal>
    </article>
  )
}
