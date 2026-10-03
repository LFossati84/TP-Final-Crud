import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { saldo } from '@/domain/cobranza'
import { etiquetaLabor, fecha, fechaConDia, fechaCorta, has as fmtHas, num, pesos, pesosCompacto, relativo } from '@/domain/format'
import { alertasProductor, estadoLote, saldoAPagar } from '@/domain/productor'
import { CAMPANIA_ACTIVA, diasHasta, HOY } from '@/domain/reloj'
import { MapaLotes } from '@/maps/MapaLotes'
import { useProductor } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { ButtonLink } from '@/ui/Button'
import { CalendarioMes, type EventoCalendario } from '@/ui/CalendarioMes'
import { Card, CardHeader } from '@/ui/Card'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { ICONO_LABOR } from '@/ui/iconosDominio'
import { Stat } from '@/ui/Stat'
import { EstadoParteChip } from '@/ui/StatusChip'
import { TONOS } from '@/ui/tonos'

const LEYENDA_ESTADO = [
  { tono: 'verde', texto: 'Al día' },
  { tono: 'cielo', texto: 'Por conformar' },
  { tono: 'trigo', texto: 'Observado' },
  { tono: 'rojo', texto: 'Sin receta / disputa' },
  { tono: 'neutro', texto: 'Sin labores' },
] as const

export function PanelProductor() {
  const p = useProductor()
  const cat = useCatalogo()
  const partes = useDemo((s) => s.partes)
  const liquidaciones = useDemo((s) => s.liquidaciones)
  const contratistas = useDemo((s) => s.contratistas)
  const establecimientos = cat.establecimientos.filter((e) => e.productorId === p?.id)
  const [estId, setEstId] = useState(establecimientos[0]?.id ?? '')
  const [dia, setDia] = useState(HOY)
  const est = establecimientos.find((e) => e.id === estId) ?? establecimientos[0]

  const datos = useMemo(() => {
    if (!p) return null
    const propios = partes.filter((x) => x.productorId === p.id)
    const campania = propios.filter((x) => x.campania === CAMPANIA_ACTIVA)
    const porConformar = campania.filter((x) => x.estado === 'enviado').sort((a, b) => b.fecha.localeCompare(a.fecha))
    const eventos: EventoCalendario[] = [
      ...campania.filter((x) => x.estado === 'conformado' || x.estado === 'en_disputa').map((x) => ({ fecha: x.fecha, tipo: 'labor' as const, texto: `${etiquetaLabor[x.labor]} · ${cat.lote(x.loteId)?.nombre ?? ''}` })),
      ...porConformar.map((x) => ({ fecha: x.fecha, tipo: 'pendiente' as const, texto: `${x.numero} por conformar` })),
      ...liquidaciones.filter((l) => l.productorId === p.id && l.estado !== 'cobrada').map((l) => ({ fecha: l.vencimiento, tipo: 'vencimiento' as const, texto: `Vence ${l.numero} · ${pesos(saldo(l))}` })),
    ]
    return {
      porConformar,
      hasConformadas: campania.filter((x) => x.estado === 'conformado').reduce((s, x) => s + x.has, 0),
      labores: campania.filter((x) => x.estado === 'conformado').length,
      pagos: saldoAPagar(liquidaciones, p.id),
      alertas: alertasProductor({ productorId: p.id, partes, lotes: cat.lotes, insumos: cat.insumos, recetas: cat.recetas, contratistas, liquidaciones, campania: CAMPANIA_ACTIVA }),
      eventos,
    }
  }, [p, partes, liquidaciones, contratistas, cat])

  if (!p || !datos) return <EmptyState titulo="No encontramos el productor" />
  const proximo = datos.pagos.proximos[0]
  const eventosDia = datos.eventos.filter((e) => e.fecha === dia)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-trigo-700">Campaña {CAMPANIA_ACTIVA}</p>
          <h1 className="text-3xl text-tierra-900">Hola, {p.contacto.split(' ')[0]}</h1>
          <p className="text-texto-suave">{fechaConDia(HOY)} · {establecimientos.length} {establecimientos.length === 1 ? 'establecimiento' : 'establecimientos'} · {cat.lotes.filter((l) => establecimientos.some((e) => e.id === l.establecimientoId)).length} lotes</p>
        </div>
        <ButtonLink to="/productor/cuaderno" variante="secundario" icono="libro">Ver cuaderno</ButtonLink>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/productor/partes" className="rounded-2xl focus-visible:ring-offset-paper" data-tour="kpi-por-conformar">
          <Stat etiqueta="Partes por conformar" valor={datos.porConformar.length} detalle="Revisalos para que entren al cuaderno" icono="documento" tono={datos.porConformar.length ? 'cielo' : 'verde'} className="h-full transition hover:border-borde-fuerte" />
        </Link>
        <Stat etiqueta="Hectáreas trabajadas" valor={fmtHas(datos.hasConformadas)} detalle={`${datos.labores} labores conformadas en la campaña`} icono="capas" tono="verde" />
        <Link to="/productor/pagos" className="rounded-2xl">
          <Stat etiqueta="Saldo a pagar" valor={pesosCompacto(datos.pagos.total)} detalle={datos.pagos.vencido ? `${pesos(datos.pagos.vencido)} vencido o en disputa` : 'Todo al día'} icono="billetera" tono={datos.pagos.vencido ? 'rojo' : 'tierra'} className="h-full transition hover:border-borde-fuerte" />
        </Link>
        <Stat
          etiqueta="Próximo vencimiento"
          valor={proximo ? fechaCorta(proximo.vencimiento) : '—'}
          detalle={proximo ? `${proximo.numero} · ${pesos(saldo(proximo))} · ${relativo(diasHasta(proximo.vencimiento))}` : 'Sin vencimientos próximos'}
          icono="calendario"
          tono="trigo"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader
            titulo="Estado de los lotes"
            subtitulo="Último movimiento de labores en la campaña"
            acciones={
              establecimientos.length > 1 ? (
                <div className="flex gap-1 rounded-xl bg-paper-2 p-1" role="tablist" aria-label="Establecimiento">
                  {establecimientos.map((e) => (
                    <button key={e.id} role="tab" aria-selected={e.id === est?.id} type="button" onClick={() => setEstId(e.id)} className={cx('min-h-9 rounded-lg px-3 text-sm font-semibold', e.id === est?.id ? 'bg-superficie shadow' : 'text-texto-suave')}>
                      {e.nombre}
                    </button>
                  ))}
                </div>
              ) : undefined
            }
          />
          {est ? (
            <MapaLotes
              establecimiento={est}
              lotes={cat.lotes}
              campania={CAMPANIA_ACTIVA}
              estadoLote={(l) => estadoLote(l, partes, CAMPANIA_ACTIVA)}
              leyenda={
                <span className="flex flex-wrap gap-x-4 gap-y-1">
                  {LEYENDA_ESTADO.map((l) => (
                    <span key={l.texto} className="inline-flex items-center gap-1.5">
                      <span className={cx('h-2.5 w-2.5 rounded-sm', TONOS[l.tono].punto)} /> {l.texto}
                    </span>
                  ))}
                </span>
              }
            />
          ) : (
            <EmptyState icono="mapa" titulo="Todavía no cargaste establecimientos" accion={<ButtonLink to="/productor/lotes" tamano="sm">Cargar establecimiento</ButtonLink>} />
          )}
        </Card>

        <Card data-tour="alertas-panel">
          <CardHeader titulo="Alertas" subtitulo={datos.alertas.length ? `${datos.alertas.length} para revisar` : 'Sin alertas'} />
          {datos.alertas.length === 0 ? (
            <EmptyState icono="checkCirculo" titulo="Todo en orden" texto="No hay aplicaciones sin receta ni vencimientos próximos." />
          ) : (
            <ul className="space-y-2">
              {datos.alertas.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link to={a.link} className={cx('flex items-start gap-3 rounded-xl p-3 ring-1 ring-inset transition hover:brightness-[0.98]', a.severidad === 'peligro' ? 'bg-rojo-50 ring-rojo-200' : a.severidad === 'alerta' ? 'bg-trigo-50 ring-trigo-200' : 'bg-cielo-50 ring-cielo-200')}>
                    <Icon nombre={a.severidad === 'info' ? 'info' : 'alerta'} tamano={18} className={cx('mt-0.5 shrink-0', a.severidad === 'peligro' ? 'text-rojo-700' : a.severidad === 'alerta' ? 'text-trigo-800' : 'text-cielo-700')} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-texto">{a.titulo}</span>
                      <span className="block text-xs text-texto-suave">{a.texto}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader titulo="Partes por conformar" subtitulo="Conformar alimenta tu cuaderno y habilita el cobro del contratista" acciones={<ButtonLink to="/productor/partes" variante="fantasma" tamano="sm" iconoDerecha="chevronDerecha">Ver todos</ButtonLink>} />
          {datos.porConformar.length === 0 ? (
            <EmptyState icono="checkCirculo" titulo="Nada pendiente" texto="Cuando un contratista cargue un parte, te llega acá y por notificación." />
          ) : (
            <ul className="divide-y divide-borde">
              {datos.porConformar.map((x) => {
                const lote = cat.lote(x.loteId)
                const excede = lote && x.has > lote.has * 1.02
                return (
                  <li key={x.id}>
                    <Link to={`/productor/partes/${x.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-paper-2" data-tour={`panel-parte-${x.numero}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verde-100 text-verde-800">
                        <Icon nombre={ICONO_LABOR[x.labor]} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{etiquetaLabor[x.labor]} · {lote?.nombre}</span>
                        <span className="block truncate text-xs text-texto-suave">{cat.contratista(x.contratistaId)?.razonSocial} · {fecha(x.fecha)} · <span className={excede ? 'font-semibold text-rojo-700' : ''}>{num(x.has, 1)} has</span></span>
                      </span>
                      {x.labor === 'pulverizacion' && !x.recetaId ? <span className="hidden text-xs font-semibold text-rojo-700 sm:inline">Sin receta</span> : null}
                      <EstadoParteChip estado={x.estado} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        <Card>
          <CardHeader titulo="Calendario" subtitulo="Labores y vencimientos" />
          <CalendarioMes anio={2026} mes={Number(dia.slice(5, 7))} hoy={HOY} eventos={datos.eventos} seleccion={dia} onSeleccionar={setDia} />
          <div className="mt-3 border-t border-borde pt-3" aria-live="polite">
            <p className="text-sm font-semibold capitalize">{fechaConDia(dia)}</p>
            {eventosDia.length === 0 ? (
              <p className="text-sm text-texto-suave">Sin movimientos.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {eventosDia.map((e, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={cx('h-2 w-2 shrink-0 rounded-full', e.tipo === 'labor' ? 'bg-verde-600' : e.tipo === 'pendiente' ? 'bg-cielo-600' : 'bg-rojo-600')} />
                    {e.texto}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
