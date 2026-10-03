import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { EncabezadoMovil } from '@/app/EncabezadoMovil'
import { cuentaCorriente, diasVencida, estadoCobro, listoParaCobrar, resumenCobros, saldo, tarifaPara, total, tramoMora, TRAMOS_MORA } from '@/domain/cobranza'
import { etiquetaLabor, fecha, fechaCorta, mesLargo, num, pesos, pesosCompacto, relativo } from '@/domain/format'
import { diasHasta, HOY } from '@/domain/reloj'
import type { Contratista, EstadoCobro, ID, Liquidacion, ParteLabor } from '@/domain/types'
import { useContratista } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Select } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { ICONO_LABOR } from '@/ui/iconosDominio'
import { EstadoCobroChip, EstadoLiquidacionChip } from '@/ui/StatusChip'
import { Tabs } from '@/ui/Tabs'
import { CobrarAlInstante, NotaLegalCobranza } from '../../cobranza/piezas'
import { ReputacionPago } from '../../cobranza/ReputacionPago'

type Vista = 'listos' | 'seguimiento' | 'cuenta'

export function CobrosContratista() {
  const c = useContratista()
  const partes = useDemo((s) => s.partes)
  const liquidaciones = useDemo((s) => s.liquidaciones)
  const [params, setParams] = useSearchParams()
  const vista = (params.get('vista') as Vista | null) ?? 'listos'
  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params)
    if (v === null) n.delete(k)
    else n.set(k, v)
    setParams(n, { replace: true })
  }

  const resumen = useMemo(() => (c ? resumenCobros(liquidaciones, partes, c.id, HOY.slice(0, 7)) : null), [c, liquidaciones, partes])
  const propias = useMemo(() => liquidaciones.filter((l) => l.contratistaId === c?.id), [liquidaciones, c])

  if (!c || !resumen) return <EmptyState titulo="No encontramos el contratista" />

  return (
    <>
      <EncabezadoMovil titulo="Cobros" subtitulo="Liquidaciones y seguimiento" />
      <div className="space-y-4 px-4 py-4">
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-cielo-50 px-1 py-2.5"><dt className="text-[11px] font-semibold text-cielo-800">A cobrar</dt><dd className="text-base font-semibold">{pesosCompacto(resumen.aCobrar)}</dd></div>
          <div className="rounded-xl bg-rojo-50 px-1 py-2.5"><dt className="text-[11px] font-semibold text-rojo-800">Vencido</dt><dd className="text-base font-semibold text-rojo-800">{pesosCompacto(resumen.vencido)}</dd></div>
          <div className="rounded-xl bg-verde-50 px-1 py-2.5"><dt className="text-[11px] font-semibold text-verde-800">Cobrado {mesLargo(Number(HOY.slice(5, 7))).slice(0, 3)}.</dt><dd className="text-base font-semibold">{pesosCompacto(resumen.cobradoMes)}</dd></div>
        </dl>

        <Tabs
          etiqueta="Vista de cobros"
          valor={vista}
          onCambiar={(v) => set('vista', v === 'listos' ? null : v)}
          tabs={[
            { valor: 'listos', texto: 'Listos para cobrar', cantidad: resumen.listos },
            { valor: 'seguimiento', texto: 'Seguimiento', cantidad: propias.filter((l) => l.estado !== 'cobrada').length },
            { valor: 'cuenta', texto: 'Cuenta corriente' },
          ]}
        />

        {vista === 'listos' ? <Listos c={c} partes={partes.filter((p) => p.contratistaId === c.id && listoParaCobrar(p))} /> : null}
        {vista === 'seguimiento' ? <Seguimiento propias={propias} /> : null}
        {vista === 'cuenta' ? <CuentaCorriente c={c} propias={propias} /> : null}

        <CobrarAlInstante />
        <NotaLegalCobranza />
      </div>
    </>
  )
}

function Listos({ c, partes: listos }: { c: Contratista; partes: ParteLabor[] }) {
  const cat = useCatalogo()
  const navigate = useNavigate()
  const [seleccion, setSeleccion] = useState<ID[]>([])
  const grupos = useMemo(() => {
    const m = new Map<ID, ParteLabor[]>()
    for (const p of [...listos].sort((a, b) => a.fecha.localeCompare(b.fecha))) m.set(p.productorId, [...(m.get(p.productorId) ?? []), p])
    return [...m.entries()]
  }, [listos])
  if (listos.length === 0) {
    return <EmptyState icono="billetera" titulo="Nada listo para cobrar" texto="Cuando el productor conforme tus partes, aparecen acá para armar la liquidación." />
  }
  const productorSel = listos.find((p) => p.id === seleccion[0])?.productorId
  return (
    <div className="space-y-4" data-tour="listos-para-cobrar">
      {grupos.map(([pid, lista]) => {
        const prod = cat.productor(pid)
        const deshabilitado = productorSel !== undefined && productorSel !== pid
        const todos = lista.every((p) => seleccion.includes(p.id))
        const estimado = lista.reduce((s, p) => {
          const t = tarifaPara(c, p.labor)
          return s + (t.unidad === 'ha' ? p.has : p.horas) * t.precio
        }, 0)
        return (
          <section key={pid} className={cx('rounded-2xl border bg-superficie', deshabilitado ? 'border-borde opacity-60' : 'border-borde-fuerte')}>
            <div className="flex items-center gap-2 border-b border-borde p-3">
              <input
                type="checkbox"
                aria-label={`Seleccionar todos los partes de ${prod?.razonSocial ?? ''}`}
                className="h-5 w-5 accent-[rgb(var(--accion))]"
                checked={todos}
                disabled={deshabilitado}
                onChange={(e) => setSeleccion(e.target.checked ? lista.map((p) => p.id) : [])}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{prod?.razonSocial}</p>
                <p className="num text-xs text-texto-suave">{lista.length} partes · estimado {pesos(estimado)} + IVA</p>
              </div>
            </div>
            <ul className="divide-y divide-borde">
              {lista.map((p) => (
                <li key={p.id}>
                  <label className={cx('flex min-h-tactil items-center gap-3 px-3 py-2.5', deshabilitado ? 'cursor-not-allowed' : 'cursor-pointer')}>
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[rgb(var(--accion))]"
                      checked={seleccion.includes(p.id)}
                      disabled={deshabilitado}
                      onChange={(e) => setSeleccion(e.target.checked ? [...seleccion, p.id] : seleccion.filter((x) => x !== p.id))}
                      data-tour={`listo-${p.numero}`}
                    />
                    <Icon nombre={ICONO_LABOR[p.labor]} tamano={18} className="shrink-0 text-verde-700" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{etiquetaLabor[p.labor]} · {cat.lote(p.loteId)?.nombre}</span>
                      <span className="num block text-xs text-texto-suave">{p.numero} · {fechaCorta(p.fecha)} · {num(p.has, 1)} has</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      <div className="sticky bottom-0 -mx-4 border-t border-borde bg-superficie/95 px-4 py-3 backdrop-blur">
        <Button
          bloque
          tamano="lg"
          icono="documento"
          disabled={seleccion.length === 0}
          onClick={() => navigate(`/contratista/cobros/nueva?partes=${seleccion.join(',')}`)}
          data-tour="armar-liquidacion"
        >
          {seleccion.length ? `Armar liquidación (${seleccion.length})` : 'Elegí partes de un productor'}
        </Button>
      </div>
    </div>
  )
}

function Seguimiento({ propias }: { propias: Liquidacion[] }) {
  const cat = useCatalogo()
  const [filtro, setFiltro] = useState<'todas' | EstadoCobro>('todas')
  const ordenadas = [...propias].sort((a, b) => {
    const peso = { vencido: 0, en_disputa: 1, a_vencer: 2, cobrado: 3 }
    return peso[estadoCobro(a)] - peso[estadoCobro(b)] || a.vencimiento.localeCompare(b.vencimiento)
  })
  const visibles = ordenadas.filter((l) => filtro === 'todas' || estadoCobro(l) === filtro)
  const vencidas = propias.filter((l) => estadoCobro(l) === 'vencido')
  const contar = (e: EstadoCobro) => propias.filter((l) => estadoCobro(l) === e).length
  return (
    <div className="space-y-3" data-tour="seguimiento-cobros">
      {vencidas.length ? (
        <div className="rounded-2xl bg-rojo-50 p-3 ring-1 ring-inset ring-rojo-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-rojo-800">Antigüedad de la deuda vencida</p>
          <ul className="mt-2 grid grid-cols-4 gap-1 text-center">
            {TRAMOS_MORA.map((t) => {
              const monto = vencidas.filter((l) => tramoMora(diasVencida(l)) === t).reduce((s, l) => s + saldo(l), 0)
              return (
                <li key={t} className={cx('rounded-lg px-1 py-1.5', monto ? 'bg-superficie' : 'opacity-50')}>
                  <p className="text-[10px] leading-tight text-texto-suave">{t}</p>
                  <p className="text-xs font-semibold">{monto ? pesosCompacto(monto) : '—'}</p>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      <Tabs
        etiqueta="Estado de cobro"
        valor={filtro}
        onCambiar={setFiltro}
        tabs={[
          { valor: 'todas', texto: 'Todas', cantidad: propias.length },
          { valor: 'a_vencer', texto: 'A vencer', cantidad: contar('a_vencer') },
          { valor: 'vencido', texto: 'Vencido', cantidad: contar('vencido') },
          { valor: 'cobrado', texto: 'Cobrado', cantidad: contar('cobrado') },
          { valor: 'en_disputa', texto: 'En disputa', cantidad: contar('en_disputa') },
        ]}
      />
      {visibles.length === 0 ? <EmptyState icono="billetera" titulo="No hay liquidaciones en este estado" /> : null}
      <ul className="space-y-2">
        {visibles.map((l) => {
          const e = estadoCobro(l)
          const dias = diasHasta(l.vencimiento)
          return (
            <li key={l.id}>
              <Link
                to={`/contratista/cobros/${l.id}`}
                className={cx('block rounded-2xl border bg-superficie p-3.5 shadow-tarjeta transition active:scale-[0.99]', l.estado === 'pago_informado' ? 'border-cielo-300 ring-1 ring-cielo-200' : e === 'vencido' ? 'border-rojo-200' : 'border-borde')}
                data-tour={`liquidacion-${l.numero}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{cat.productor(l.productorId)?.razonSocial}</p>
                    <p className="truncate text-xs text-texto-suave">{l.numero} · {l.periodo}</p>
                  </div>
                  <p className="num shrink-0 text-right font-semibold">
                    {pesos(e === 'cobrado' ? total(l) : saldo(l))}
                    <span className="block text-[11px] font-normal text-texto-suave">{e === 'cobrado' ? 'cobrado' : 'saldo'}</span>
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <EstadoCobroChip estado={e} />
                  {l.estado !== 'cobrada' && l.estado !== 'en_disputa' ? <EstadoLiquidacionChip estado={l.estado} /> : null}
                  <span className="num ml-auto text-xs text-texto-suave">
                    {e === 'cobrado' ? `Cobrada ${fechaCorta(l.cobros[l.cobros.length - 1]?.fecha ?? l.vencimiento)}` : e === 'vencido' ? `Vencida hace ${diasVencida(l)} días` : `Vence ${relativo(dias)}`}
                  </span>
                </div>
                {l.estado === 'pago_informado' ? <p className="mt-2 text-xs font-semibold text-cielo-800">El productor informó el pago · confirmá el cobro</p> : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CuentaCorriente({ c, propias }: { c: Contratista; propias: Liquidacion[] }) {
  const cat = useCatalogo()
  const productores = [...new Set(propias.map((l) => l.productorId))]
  const [pid, setPid] = useState(productores[0] ?? '')
  if (productores.length === 0) return <EmptyState icono="libro" titulo="Sin movimientos" />
  const movs = cuentaCorriente(propias.filter((l) => l.productorId === pid))
  const saldoFinal = movs[movs.length - 1]?.saldo ?? 0
  return (
    <div className="space-y-3" data-tour="cuenta-corriente">
      <Select label="Productor" value={pid} onChange={(e) => setPid(e.target.value)} opciones={productores.map((x) => ({ valor: x, texto: cat.productor(x)?.razonSocial ?? x }))} />
      <div className="flex items-baseline justify-between rounded-xl bg-paper-2 p-3">
        <span className="text-sm text-texto-suave">Saldo de la cuenta</span>
        <span className={cx('text-xl font-semibold', saldoFinal > 0 ? 'text-texto' : 'text-verde-800')}>{pesos(saldoFinal)}</span>
      </div>
      <ol className="divide-y divide-borde rounded-2xl border border-borde bg-superficie">
        {[...movs].reverse().map((m, i) => (
          <li key={i}>
            <Link to={`/contratista/cobros/${m.liquidacionId}`} className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-2.5 text-sm hover:bg-paper-2">
              <span>
                <span className="block font-medium">{m.concepto}</span>
                <span className="num block text-xs text-texto-suave">{fecha(m.fecha)}</span>
              </span>
              <span className="num text-right">
                <span className={cx('block font-semibold', m.haber ? 'text-verde-800' : '')}>{m.haber ? `− ${pesos(m.haber)}` : `+ ${pesos(m.debe)}`}</span>
                <span className="block text-xs text-texto-suave">saldo {pesos(m.saldo)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <ReputacionPago productorId={pid} contratistaId={c.id} />
    </div>
  )
}
