import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { cobrado, diasVencida, estadoCobro, saldo, total } from '@/domain/cobranza'
import { etiquetaCondicionPago, etiquetaMedioPago, fecha, fechaConDia, pesos, pesosCompacto, porcentaje, relativo } from '@/domain/format'
import { diasHasta, HOY } from '@/domain/reloj'
import type { Liquidacion } from '@/domain/types'
import { useProductor, useReputacion, useVerificacion } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, ButtonLink } from '@/ui/Button'
import { CalendarioMes } from '@/ui/CalendarioMes'
import { Card, CardHeader } from '@/ui/Card'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Textarea } from '@/ui/FormField'
import { Modal } from '@/ui/Modal'
import { Stat } from '@/ui/Stat'
import { EstadoCobroChip, EstadoLiquidacionChip } from '@/ui/StatusChip'
import { Table, type Columna } from '@/ui/Table'
import { Tabs } from '@/ui/Tabs'
import { toast } from '@/ui/toast-store'
import { VerificationBadge } from '@/ui/VerificationBadge'
import { ChatWhatsApp } from '../cobranza/ChatWhatsApp'
import { HiloDisputa } from '../cobranza/HiloDisputa'
import { AbrirDisputaModal, MarcarPagadoModal } from '../cobranza/Modales'
import { NotaLegalCobranza, TablaLiquidacion } from '../cobranza/piezas'

type Filtro = 'revisar' | 'pagar' | 'vencidas' | 'disputa' | 'historial'

function grupo(l: Liquidacion): Filtro {
  if (l.estado === 'cobrada') return 'historial'
  if (l.estado === 'en_disputa') return 'disputa'
  if (l.estado === 'emitida' || l.estado === 'observada') return 'revisar'
  if (estadoCobro(l) === 'vencido' && l.estado !== 'pago_informado') return 'vencidas'
  return 'pagar'
}

export function PagosProductor() {
  const p = useProductor()
  const cat = useCatalogo()
  const liquidaciones = useDemo((s) => s.liquidaciones)
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [dia, setDia] = useState(HOY)
  const propias = useMemo(() => liquidaciones.filter((l) => l.productorId === p?.id), [liquidaciones, p])
  const filtroUrl = params.get('estado') as Filtro | null
  const filtro: Filtro = filtroUrl ?? (propias.some((l) => grupo(l) === 'revisar') ? 'revisar' : 'pagar')
  const visibles = propias.filter((l) => grupo(l) === filtro).sort((a, b) => a.vencimiento.localeCompare(b.vencimiento))
  const contar = (f: Filtro) => propias.filter((l) => grupo(l) === f).length
  const pendientes = propias.filter((l) => l.estado !== 'cobrada')
  const saldoTotal = pendientes.reduce((s, l) => s + saldo(l), 0)
  const vencido = pendientes.filter((l) => ['vencido', 'en_disputa'].includes(estadoCobro(l))).reduce((s, l) => s + saldo(l), 0)
  const proximos30 = pendientes.filter((l) => estadoCobro(l) === 'a_vencer' && diasHasta(l.vencimiento) <= 30)
  const pagadoAnio = propias.flatMap((l) => l.cobros).filter((c) => c.fecha.startsWith(HOY.slice(0, 4))).reduce((s, c) => s + c.monto, 0)
  const seleccion = id ? propias.find((l) => l.id === id) : undefined
  const eventos = pendientes.map((l) => ({ fecha: l.vencimiento, tipo: 'vencimiento' as const, texto: `${l.numero} · ${cat.contratista(l.contratistaId)?.razonSocial ?? ''} · ${pesos(saldo(l))}` }))
  const delDia = eventos.filter((e) => e.fecha === dia)

  if (!p) return <EmptyState titulo="No encontramos el productor" />

  const columnas: Columna<Liquidacion>[] = [
    { clave: 'liq', titulo: 'Liquidación', render: (l) => <span><span className="block font-semibold">{l.numero}</span><span className="block text-xs text-texto-suave">{l.periodo}</span></span> },
    { clave: 'contratista', titulo: 'Contratista', ocultarEnMovil: true, render: (l) => cat.contratista(l.contratistaId)?.razonSocial },
    { clave: 'total', titulo: 'Total', alinear: 'der', render: (l) => <span className="num">{pesos(total(l))}</span> },
    { clave: 'saldo', titulo: 'Saldo', alinear: 'der', render: (l) => <span className="num font-semibold">{pesos(saldo(l))}</span> },
    {
      clave: 'vence',
      titulo: 'Vencimiento',
      render: (l) => {
        const e = estadoCobro(l)
        return <span className={cx('num', e === 'vencido' && 'font-semibold text-rojo-700')}>{fecha(l.vencimiento)}<span className="block text-xs text-texto-suave">{e === 'vencido' ? `hace ${diasVencida(l)} días` : e === 'cobrado' ? 'pagada' : relativo(diasHasta(l.vencimiento))}</span></span>
      },
    },
    { clave: 'estado', titulo: 'Estado', render: (l) => <span className="flex flex-wrap gap-1"><EstadoLiquidacionChip estado={l.estado} />{estadoCobro(l) === 'vencido' ? <EstadoCobroChip estado="vencido" /> : null}</span> },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl text-tierra-900">Pagos</h1>
        <p className="text-texto-suave">Liquidaciones de tus contratistas, armadas sobre partes que conformaste.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat etiqueta="Saldo a pagar" valor={pesosCompacto(saldoTotal)} detalle={`${pendientes.length} liquidaciones abiertas`} icono="billetera" tono="tierra" />
        <Stat etiqueta="Vencido o en disputa" valor={pesosCompacto(vencido)} detalle={vencido ? 'Requiere atención' : 'Nada vencido'} icono="alerta" tono={vencido ? 'rojo' : 'verde'} />
        <Stat etiqueta="Vence en 30 días" valor={pesosCompacto(proximos30.reduce((s, l) => s + saldo(l), 0))} detalle={`${proximos30.length} liquidaciones`} icono="calendario" tono="trigo" />
        <Stat etiqueta={`Pagado en ${HOY.slice(0, 4)}`} valor={pesosCompacto(pagadoAnio)} detalle="Conciliado por los contratistas" icono="checkCirculo" tono="verde" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card>
          <Tabs
            etiqueta="Estado"
            valor={filtro}
            onCambiar={(v) => setParams(v === 'revisar' ? {} : { estado: v }, { replace: true })}
            className="mb-4"
            tabs={[
              { valor: 'revisar', texto: 'Por revisar', cantidad: contar('revisar') },
              { valor: 'pagar', texto: 'A pagar', cantidad: contar('pagar') },
              { valor: 'vencidas', texto: 'Vencidas', cantidad: contar('vencidas') },
              { valor: 'disputa', texto: 'En disputa', cantidad: contar('disputa') },
              { valor: 'historial', texto: 'Historial', cantidad: contar('historial') },
            ]}
          />
          <Table
            etiqueta="Liquidaciones"
            columnas={columnas}
            filas={visibles}
            claveFila={(l) => l.id}
            filaActiva={id}
            onFila={(l) => navigate({ pathname: `/productor/pagos/${l.id}`, search: params.toString() })}
            vacio={<EmptyState icono="billetera" titulo="No hay liquidaciones en este estado" />}
            tarjetaMovil={(l) => (
              <div className="rounded-xl border border-borde bg-superficie p-3">
                <div className="flex justify-between gap-2"><span className="font-semibold">{l.numero}</span><span className="num font-semibold">{pesos(saldo(l))}</span></div>
                <p className="truncate text-xs text-texto-suave">{cat.contratista(l.contratistaId)?.razonSocial} · vence {fecha(l.vencimiento)}</p>
                <div className="mt-1"><EstadoLiquidacionChip estado={l.estado} /></div>
              </div>
            )}
          />
          {filtro === 'historial' ? (
            <div className="mt-6">
              <h2 className="mb-2 font-sans text-sm font-semibold">Historial de pagos</h2>
              <ul className="divide-y divide-borde rounded-xl border border-borde text-sm">
                {propias.flatMap((l) => l.cobros.map((c) => ({ c, l }))).sort((a, b) => b.c.fecha.localeCompare(a.c.fecha)).map(({ c, l }) => (
                  <li key={c.id} className="flex justify-between gap-3 px-3 py-2">
                    <span>{fecha(c.fecha)} · {l.numero} · {cat.contratista(l.contratistaId)?.razonSocial}<span className="block text-xs text-texto-suave">{etiquetaMedioPago[c.medio]}{c.comprobante ? ` · ${c.comprobante}` : ''}</span></span>
                    <span className="num font-semibold">{pesos(c.monto)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader titulo="Vencimientos" />
            <CalendarioMes anio={Number(dia.slice(0, 4))} mes={Number(dia.slice(5, 7))} hoy={HOY} eventos={eventos} seleccion={dia} onSeleccionar={setDia} />
            <div className="mt-3 flex gap-2">
              <Button variante="fantasma" tamano="sm" icono="chevronIzquierda" onClick={() => setDia(Number(dia.slice(5, 7)) === 1 ? `${Number(dia.slice(0, 4)) - 1}-12-01` : `${dia.slice(0, 4)}-${String(Number(dia.slice(5, 7)) - 1).padStart(2, '0')}-01`)}>Anterior</Button>
              <Button variante="fantasma" tamano="sm" iconoDerecha="chevronDerecha" onClick={() => setDia(Number(dia.slice(5, 7)) === 12 ? `${Number(dia.slice(0, 4)) + 1}-01-01` : `${dia.slice(0, 4)}-${String(Number(dia.slice(5, 7)) + 1).padStart(2, '0')}-01`)}>Siguiente</Button>
            </div>
            <div className="mt-3 border-t border-borde pt-3" aria-live="polite">
              <p className="text-sm font-semibold capitalize">{fechaConDia(dia)}</p>
              {delDia.length ? <ul className="mt-1 space-y-1 text-sm">{delDia.map((e, i) => <li key={i}>{e.texto}</li>)}</ul> : <p className="text-sm text-texto-suave">Sin vencimientos.</p>}
            </div>
          </Card>
          <NotaLegalCobranza />
        </div>
      </div>

      {seleccion ? <DetallePago liq={seleccion} onCerrar={() => navigate({ pathname: '/productor/pagos', search: params.toString() })} /> : null}
    </div>
  )
}

function DetallePago({ liq, onCerrar }: { liq: Liquidacion; onCerrar: () => void }) {
  const cat = useCatalogo()
  const p = useProductor()
  const aceptar = useDemo((s) => s.aceptarLiquidacion)
  const observar = useDemo((s) => s.observarLiquidacion)
  const disputa = useDemo((s) => s.disputas.find((d) => d.liquidacionId === liq.id))
  const ev = useVerificacion(liq.contratistaId)
  const rep = useReputacion(liq.contratistaId)
  const [modal, setModal] = useState<'pagar' | 'observar' | 'disputa' | null>(null)
  const [texto, setTexto] = useState('')
  const c = cat.contratista(liq.contratistaId)
  const e = estadoCobro(liq)
  const puedePagar = ['aceptada', 'cobrada_parcial'].includes(liq.estado)

  const pie =
    liq.estado === 'emitida' ? (
      <>
        <Button variante="secundario" icono="alerta" onClick={() => setModal('observar')} data-tour="observar-liquidacion">Observar</Button>
        <Button icono="check" onClick={() => { aceptar(liq.id); toast.ok(`${liq.numero} aceptada`, 'Te recordamos el vencimiento.') }} data-tour="aceptar-liquidacion">Aceptar</Button>
      </>
    ) : puedePagar ? (
      <>
        <Button variante="fantasma" icono="balanza" onClick={() => setModal('disputa')}>Abrir disputa</Button>
        <Button icono="check" onClick={() => setModal('pagar')} data-tour="marcar-pagado">Marcar como pagado</Button>
      </>
    ) : undefined

  return (
    <>
      <Modal abierto onCerrar={onCerrar} variante="lateral" titulo={`Liquidación ${liq.numero}`} descripcion={`${c?.razonSocial ?? ''} · ${liq.periodo}`} pie={pie}>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <EstadoLiquidacionChip estado={liq.estado} tamano="md" />
            <EstadoCobroChip estado={e} />
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-paper-2 p-4">
            <div><p className="text-xs text-texto-suave">Saldo</p><p className="text-2xl font-semibold">{pesos(saldo(liq))}</p><p className="num text-xs text-texto-suave">de {pesos(total(liq))}{cobrado(liq) ? ` · pagado ${pesos(cobrado(liq))}` : ''}</p></div>
            <div><p className="text-xs text-texto-suave">Vencimiento</p><p className={cx('text-lg font-semibold', e === 'vencido' && 'text-rojo-700')}>{fecha(liq.vencimiento)}</p><p className="text-xs text-texto-suave">{etiquetaCondicionPago[liq.condicion]} · {e === 'vencido' ? `vencida hace ${diasVencida(liq)} días` : relativo(diasHasta(liq.vencimiento))}</p></div>
          </div>
          {liq.estado === 'observada' ? <p className="rounded-xl bg-trigo-50 p-3 text-sm ring-1 ring-inset ring-trigo-200"><strong>La observaste:</strong> “{liq.observacion}” Esperando corrección del contratista.</p> : null}
          {liq.estado === 'pago_informado' && liq.pagoInformado ? (
            <p className="rounded-xl bg-cielo-50 p-3 text-sm ring-1 ring-inset ring-cielo-200">Informaste un pago de <strong>{pesos(liq.pagoInformado.monto)}</strong> por {etiquetaMedioPago[liq.pagoInformado.medio]} ({liq.pagoInformado.comprobante}). El contratista tiene que confirmarlo.</p>
          ) : null}

          <section className="flex items-center gap-3 rounded-2xl border border-borde p-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c?.razonSocial}</p>
              <p className="text-xs text-texto-suave">Conformidad {rep ? porcentaje(rep.tasaConformidad) : '—'} · {rep?.trabajos ?? 0} trabajos conformados</p>
            </div>
            <VerificationBadge nivel={ev?.nivel ?? null} tamano="sm" />
          </section>

          <section>
            <h3 className="mb-1 font-sans text-sm font-semibold">Detalle</h3>
            <TablaLiquidacion liq={liq} />
            <div className="mt-2 flex flex-wrap gap-2">
              {liq.items.filter((i) => i.parteId && i.parteId !== 'fuera-de-plataforma').map((i) => {
                return i.parteId ? <Link key={i.id} to={`/productor/partes/${i.parteId}`} className="text-xs font-semibold text-verde-800 underline-offset-2 hover:underline">Ver parte {i.descripcion.match(/PL-\d+/)?.[0] ?? ''}</Link> : null
              })}
            </div>
            <ButtonLink to={`/imprimir/liquidacion/${liq.id}`} variante="suave" tamano="sm" icono="documento" className="mt-3">Ver comprobante</ButtonLink>
          </section>

          {disputa && p ? <HiloDisputa disputa={disputa} rol="productor" nombre={p.contacto} /> : null}

          {liq.cobros.length ? (
            <section>
              <h3 className="mb-1 font-sans text-sm font-semibold">Pagos conciliados</h3>
              <ul className="divide-y divide-borde text-sm">
                {liq.cobros.map((cb) => <li key={cb.id} className="flex justify-between py-1.5"><span>{fecha(cb.fecha)} · {etiquetaMedioPago[cb.medio]}</span><span className="num font-semibold">{pesos(cb.monto)}</span></li>)}
              </ul>
            </section>
          ) : null}

          <section>
            <h3 className="mb-1 font-sans text-sm font-semibold">Mensajes del contratista</h3>
            <ChatWhatsApp liq={liq} puedeEnviar={false} perspectiva="productor" />
          </section>
          <NotaLegalCobranza />
        </div>
      </Modal>

      {modal === 'pagar' ? <MarcarPagadoModal liq={liq} onCerrar={() => setModal(null)} /> : null}
      {modal === 'disputa' ? <AbrirDisputaModal liq={liq} por="productor" onCerrar={() => setModal(null)} /> : null}
      <Modal
        abierto={modal === 'observar'}
        onCerrar={() => setModal(null)}
        titulo={`Observar ${liq.numero}`}
        tamano="sm"
        pie={
          <>
            <Button variante="fantasma" onClick={() => setModal(null)}>Cancelar</Button>
            <Button icono="alerta" disabled={!texto.trim()} onClick={() => { observar(liq.id, texto); setModal(null); toast.ok('Observación enviada') }}>Enviar</Button>
          </>
        }
      >
        <Textarea label="¿Qué hay que corregir?" value={texto} onChange={(ev) => setTexto(ev.target.value)} placeholder="Ej.: la tarifa acordada fue $ 14.000/ha." rows={3} />
      </Modal>
    </>
  )
}

