import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { LOCALIDADES_PILOTO } from '@/data/geo'
import { tarifaPara } from '@/domain/cobranza'
import { etiquetaLabor, fechaCorta, num, pesos, porcentaje } from '@/domain/format'
import type { Localidad, NivelVerificacion, Presupuesto, TipoLabor } from '@/domain/types'
import { MapaZona } from '@/maps/MapaZona'
import { useProductor } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Avatar } from '@/ui/Avatar'
import { Button, ButtonLink } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Checkbox, Select } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { toast } from '@/ui/toast-store'
import { VerificationBadge } from '@/ui/VerificationBadge'
import { AvisoDocumentacion } from './AvisoDocumentacion'
import { useRed, type FichaRed } from './useRed'

const RANGO: Record<NivelVerificacion, number> = { basico: 1, verificado: 2, destacado: 3 }
const DISP = { disponible: { tono: 'verde', texto: 'Disponible' }, agenda_limitada: { tono: 'trigo', texto: 'Agenda limitada' }, sin_disponibilidad: { tono: 'neutro', texto: 'Sin disponibilidad' } } as const

export function DirectorioContratistas() {
  const red = useRed()
  const p = useProductor()
  const presupuestos = useDemo((s) => s.presupuestos)
  const [params, setParams] = useSearchParams()
  const vista = (params.get('vista') as 'lista' | 'mapa' | 'pedidos' | null) ?? 'lista'
  const servicio = (params.get('servicio') as TipoLabor | null) ?? ''
  const zona = (params.get('zona') as Localidad | null) ?? ''
  const nivel = (params.get('nivel') as NivelVerificacion | null) ?? ''
  const soloDisponibles = params.get('disponible') === '1'
  const calificacion = Number(params.get('calif') ?? 0)
  const [seleccion, setSeleccion] = useState<string | undefined>()

  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params)
    if (v === null || v === '' || v === '0') n.delete(k)
    else n.set(k, v)
    setParams(n, { replace: true })
  }

  const filtrados = useMemo(
    () =>
      red
        .filter(({ c, ev, rep }) => {
          if (servicio && !c.servicios.includes(servicio)) return false
          if (zona && !c.zonas.includes(zona)) return false
          if (nivel && (!ev?.nivel || RANGO[ev.nivel] < RANGO[nivel])) return false
          if (soloDisponibles && c.disponibilidad !== 'disponible') return false
          if (calificacion && (rep.calificacion ?? 0) < calificacion) return false
          return true
        })
        .sort((a, b) => (RANGO[b.ev?.nivel ?? 'basico'] - RANGO[a.ev?.nivel ?? 'basico']) || (b.rep.calificacion ?? 0) - (a.rep.calificacion ?? 0)),
    [red, servicio, zona, nivel, soloDisponibles, calificacion],
  )
  const misPedidos = presupuestos.filter((x) => x.productorId === p?.id).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const respondidos = misPedidos.filter((x) => x.estado === 'respondido').length
  const fichaSel = filtrados.find((f) => f.c.id === seleccion) ?? filtrados[0]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-tierra-900">Red de contratistas</h1>
          <p className="text-texto-suave">Verificados con documentación y reputación basada en trabajos reales conformados.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-paper-3 p-1" role="tablist" aria-label="Vista">
          {([['lista', 'Lista', 'lista'], ['mapa', 'Mapa', 'mapa'], ['pedidos', 'Mis pedidos', 'chat']] as const).map(([v, t, i]) => (
            <button key={v} role="tab" type="button" aria-selected={vista === v} onClick={() => set('vista', v === 'lista' ? null : v)} className={cx('inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold', vista === v ? 'bg-superficie shadow' : 'text-texto-suave')} data-tour={`vista-${v}`}>
              <Icon nombre={i} tamano={16} /> {t}
              {v === 'pedidos' && respondidos ? <span className="num rounded-full bg-peligro px-1.5 text-[11px] text-sobre-peligro">{respondidos}</span> : null}
            </button>
          ))}
        </div>
      </header>

      {vista !== 'pedidos' ? (
        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-borde bg-superficie p-4" data-tour="filtros-red">
          <Select label="Servicio" className="w-44" value={servicio} placeholder="Todos" onChange={(e) => set('servicio', e.target.value)} opciones={(['pulverizacion', 'siembra', 'fertilizacion', 'cosecha', 'laboreo'] as TipoLabor[]).map((s) => ({ valor: s, texto: etiquetaLabor[s] }))} />
          <Select label="Zona" className="w-44" value={zona} placeholder="Todas" onChange={(e) => set('zona', e.target.value)} opciones={LOCALIDADES_PILOTO.map((l) => ({ valor: l, texto: l }))} />
          <Select label="Verificación" className="w-48" value={nivel} placeholder="Cualquier nivel" onChange={(e) => set('nivel', e.target.value)} opciones={[{ valor: 'verificado', texto: 'Verificado o más' }, { valor: 'destacado', texto: 'Solo Destacados' }]} />
          <Select label="Calificación" className="w-36" value={String(calificacion)} onChange={(e) => set('calif', e.target.value)} opciones={[{ valor: '0', texto: 'Cualquiera' }, { valor: '4', texto: '4 o más' }, { valor: '4.5', texto: '4,5 o más' }]} />
          <Checkbox label="Solo disponibles" checked={soloDisponibles} onChange={(e) => set('disponible', e.target.checked ? '1' : null)} className="pb-0" />
          <p className="num ml-auto self-center text-sm text-texto-suave" aria-live="polite">{filtrados.length} {filtrados.length === 1 ? 'resultado' : 'resultados'}</p>
        </div>
      ) : null}

      {vista === 'lista' ? (
        filtrados.length === 0 ? (
          <EmptyState icono="usuarios" titulo="Ningún contratista cumple los filtros" texto="Probá ampliar la zona o bajar la calificación mínima." accion={<Button variante="secundario" tamano="sm" onClick={() => setParams({}, { replace: true })}>Limpiar filtros</Button>} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((f) => <TarjetaRed key={f.c.id} ficha={f} servicio={servicio || undefined} />)}
          </ul>
        )
      ) : null}

      {vista === 'mapa' ? (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <MapaZona marcadores={filtrados.map((f) => ({ contratista: f.c, advertencia: (f.ev?.alertas.length ?? 0) > 0 }))} seleccionado={fichaSel?.c.id} onSeleccionar={setSeleccion} resaltar={zona ? [zona] : []} />
          <div>{fichaSel ? <TarjetaRed ficha={fichaSel} servicio={servicio || undefined} /> : <EmptyState icono="mapa" titulo="Sin resultados en el mapa" />}</div>
        </div>
      ) : null}

      {vista === 'pedidos' ? <MisPedidos pedidos={misPedidos} /> : null}
    </div>
  )
}

function TarjetaRed({ ficha, servicio }: { ficha: FichaRed; servicio?: TipoLabor }) {
  const { c, ev, rep } = ficha
  const disp = DISP[c.disponibilidad]
  const tarifa = tarifaPara(c, servicio ?? c.servicios[0] ?? 'pulverizacion')
  return (
    <li className="list-none">
      <Card interactiva className="relative flex h-full flex-col" data-tour={`tarjeta-${c.id}`}>
        <div className="flex items-start gap-3">
          <Avatar nombre={c.razonSocial} tamano="lg" />
          <div className="min-w-0 flex-1">
            <Link to={`/productor/contratistas/${c.id}`} className="block font-serif text-lg leading-tight text-tierra-900 after:absolute after:inset-0 hover:underline">
              {c.razonSocial}
            </Link>
            <p className="text-sm text-texto-suave">{c.localidad} · desde {c.desde}</p>
          </div>
        </div>
        <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
          <VerificationBadge nivel={ev?.nivel ?? null} tamano="sm" />
          <Chip tono={disp.tono}>{disp.texto}{c.proximaFechaLibre && c.disponibilidad !== 'disponible' ? ` · ${fechaCorta(c.proximaFechaLibre)}` : ''}</Chip>
          <AvisoDocumentacion ev={ev} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {c.servicios.map((s) => <span key={s} className={cx('rounded-md px-2 py-0.5 text-xs', s === servicio ? 'bg-verde-100 font-semibold text-verde-900' : 'bg-paper-2 text-texto-suave')}>{etiquetaLabor[s]}</span>)}
        </div>
        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-borde pt-3 text-center">
          <div>
            <dt className="text-[11px] text-texto-suave">Calificación</dt>
            <dd className="flex items-center justify-center gap-1 text-sm font-semibold"><Icon nombre="estrella" relleno tamano={14} className="text-trigo-500" />{rep.calificacion ? rep.calificacion.toFixed(1).replace('.', ',') : '—'}<span className="font-normal text-texto-suave">({rep.resenas})</span></dd>
          </div>
          <div>
            <dt className="text-[11px] text-texto-suave">Conformidad</dt>
            <dd className="num text-sm font-semibold">{porcentaje(rep.tasaConformidad)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-texto-suave">{etiquetaLabor[servicio ?? c.servicios[0] ?? 'pulverizacion']}</dt>
            <dd className="num text-sm font-semibold">{pesos(tarifa.precio)}<span className="font-normal text-texto-suave">/{tarifa.unidad}</span></dd>
          </div>
        </dl>
      </Card>
    </li>
  )
}

function MisPedidos({ pedidos }: { pedidos: Presupuesto[] }) {
  const cat = useCatalogo()
  const decidir = useDemo((s) => s.decidirPresupuesto)
  if (pedidos.length === 0) return <EmptyState icono="chat" titulo="Todavía no pediste presupuestos" texto="Desde el perfil de un contratista podés pedir presupuesto o contratarlo para una labor." />
  return (
    <ul className="space-y-3">
      {pedidos.map((x) => {
        const c = cat.contratista(x.contratistaId)
        return (
          <li key={x.id}>
            <Card className={x.estado === 'respondido' ? 'ring-2 ring-verde-300' : ''} data-tour={`mi-pedido-${x.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{x.tipo === 'contratacion' ? 'Contratación' : 'Presupuesto'} · {etiquetaLabor[x.labor]} · {num(x.has, 1)} has</p>
                  <p className="text-sm text-texto-suave">{c?.razonSocial} · {cat.establecimiento(x.establecimientoId)?.nombre} · para el {fechaCorta(x.fechaDeseada)}</p>
                </div>
                <Chip tono={x.estado === 'solicitado' ? 'cielo' : x.estado === 'respondido' ? 'trigo' : x.estado === 'aceptado' ? 'verde' : 'neutro'} icono={x.estado === 'solicitado' ? 'reloj' : x.estado === 'respondido' ? 'chat' : x.estado === 'aceptado' ? 'check' : 'x'}>
                  {x.estado === 'solicitado' ? 'Esperando respuesta' : x.estado === 'respondido' ? 'Respondido' : x.estado === 'aceptado' ? 'Aceptado' : 'No aceptado'}
                </Chip>
              </div>
              {x.respuesta ? (
                <div className="mt-3 rounded-xl bg-paper-2 p-3">
                  <p className="num font-serif text-xl text-tierra-900">{pesos(x.respuesta.precio)} <span className="text-sm text-texto-suave">+ IVA por {x.respuesta.unidad === 'ha' ? 'ha' : 'hora'} · total {pesos(x.respuesta.precio * (x.respuesta.unidad === 'ha' ? x.has : 1))} + IVA</span></p>
                  <p className="mt-1 text-sm">“{x.respuesta.mensaje}”</p>
                  <p className="mt-1 text-xs text-texto-suave">Entrada propuesta: {fechaCorta(x.respuesta.fechaPropuesta)}</p>
                </div>
              ) : null}
              {x.estado === 'respondido' ? (
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <Button variante="fantasma" onClick={() => { decidir(x.id, 'rechazado'); toast.info('Presupuesto no aceptado') }}>No aceptar</Button>
                  <Button icono="check" onClick={() => { decidir(x.id, 'aceptado'); toast.ok('Presupuesto aceptado', `${c?.razonSocial ?? 'El contratista'} ya lo tiene en su agenda.`) }} data-tour="aceptar-presupuesto">Aceptar</Button>
                </div>
              ) : null}
              {c ? <ButtonLink to={`/productor/contratistas/${c.id}`} variante="fantasma" tamano="sm" className="mt-2" iconoDerecha="chevronDerecha">Ver perfil</ButtonLink> : null}
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
