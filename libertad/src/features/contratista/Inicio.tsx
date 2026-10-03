import { useMemo } from 'react'
import { Link } from 'react-router'
import { CampanaNotificaciones } from '@/app/Notificaciones'
import { resumenCobros } from '@/domain/cobranza'
import { etiquetaDocumentoCorta, etiquetaLabor, fechaConDia, num, pesosCompacto, relativo } from '@/domain/format'
import { HOY } from '@/domain/reloj'
import { useContratista, useVerificacion } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { ButtonLink } from '@/ui/Button'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { ICONO_LABOR } from '@/ui/iconosDominio'
import { VerificationBadge } from '@/ui/VerificationBadge'
import { TarjetaParte } from './TarjetaParte'

function saludo(): string {
  const h = new Date().getHours()
  if (h < 13) return 'Buen día'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function InicioContratista() {
  const c = useContratista()
  const cat = useCatalogo()
  const partes = useDemo((s) => s.partes)
  const liquidaciones = useDemo((s) => s.liquidaciones)
  const agenda = useDemo((s) => s.agenda)
  const presupuestos = useDemo((s) => s.presupuestos)
  const ev = useVerificacion(c?.id ?? '')

  const datos = useMemo(() => {
    if (!c) return null
    const propios = partes.filter((p) => p.contratistaId === c.id)
    const hoy = agenda.filter((a) => a.contratistaId === c.id && a.fecha === HOY).sort((a, b) => a.hora.localeCompare(b.hora))
    const proximos = agenda.filter((a) => a.contratistaId === c.id && a.fecha > HOY)
    const hechoHoy = (loteId: string, labor: string) =>
      propios.some((p) => p.loteId === loteId && p.labor === labor && p.fecha === HOY && p.estado !== 'borrador')
    return {
      hoy: hoy.map((a) => ({ ...a, hecho: hechoHoy(a.loteId, a.labor) })),
      proximos,
      esperando: propios.filter((p) => p.estado === 'enviado' || p.estado === 'pendiente_sync').sort((a, b) => b.fecha.localeCompare(a.fecha)),
      atencion: propios.filter((p) => p.estado === 'observado' || p.validacion?.estado === 'observada'),
      cobros: resumenCobros(liquidaciones, partes, c.id, HOY.slice(0, 7)),
      pedidos: presupuestos.filter((p) => p.contratistaId === c.id && p.estado === 'solicitado').length,
    }
  }, [c, partes, liquidaciones, agenda, presupuestos])

  if (!c || !datos) return <EmptyState titulo="No encontramos el contratista" />

  const nombre = c.titular.split(' ')[0]
  return (
    <div className="pb-6">
      <header className="bg-barra px-4 pb-14 pt-4 text-sobre-barra">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-sobre-barra/75">{saludo()}, {nombre}</p>
            <h1 className="truncate font-serif text-xl leading-tight">{c.razonSocial}</h1>
            <div className="mt-2">
              <VerificationBadge nivel={ev?.nivel ?? null} tamano="sm" />
            </div>
          </div>
          <CampanaNotificaciones tono="transparente" className="text-sobre-barra" />
        </div>
      </header>

      <div className="-mt-10 space-y-5 px-4">
        {/* Resumen de cobros */}
        <Link to="/contratista/cobros" className="block rounded-2xl border border-borde bg-superficie p-4 shadow-elevada" data-tour="resumen-cobros">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Tus cobros</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-verde-800">
              Ver cobros <Icon nombre="chevronDerecha" tamano={14} />
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-cielo-50 px-1 py-2">
              <dt className="text-[11px] font-semibold text-cielo-800">A cobrar</dt>
              <dd className="num font-serif text-lg font-semibold text-tierra-900">{pesosCompacto(datos.cobros.aCobrar)}</dd>
            </div>
            <div className="rounded-xl bg-rojo-50 px-1 py-2">
              <dt className="text-[11px] font-semibold text-rojo-800">Vencido</dt>
              <dd className="num font-serif text-lg font-semibold text-rojo-800">{pesosCompacto(datos.cobros.vencido)}</dd>
            </div>
            <div className="rounded-xl bg-verde-50 px-1 py-2">
              <dt className="text-[11px] font-semibold text-verde-800">Cobrado oct.</dt>
              <dd className="num font-serif text-lg font-semibold text-tierra-900">{pesosCompacto(datos.cobros.cobradoMes)}</dd>
            </div>
          </dl>
          {datos.cobros.listos > 0 || datos.cobros.pagosInformados > 0 ? (
            <p className="mt-3 flex items-center gap-1.5 border-t border-borde pt-2.5 text-xs font-medium text-texto-suave">
              <Icon nombre="billetera" tamano={14} className="text-verde-700" />
              {datos.cobros.listos} {datos.cobros.listos === 1 ? 'parte listo' : 'partes listos'} para cobrar
              {datos.cobros.pagosInformados ? ` · ${datos.cobros.pagosInformados} pago informado para confirmar` : ''}
            </p>
          ) : null}
        </Link>

        {/* Alertas */}
        {ev && ev.alertas.length > 0 ? (
          <div className="space-y-2" data-tour="alerta-documentos">
            {ev.alertas.map(({ documento, dias }) => (
              <Link
                key={documento.id}
                to="/contratista/perfil#documentacion"
                className={cx('flex items-center gap-3 rounded-2xl p-3.5 ring-1 ring-inset', dias < 0 ? 'bg-rojo-50 ring-rojo-200' : 'bg-trigo-50 ring-trigo-300')}
              >
                <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', dias < 0 ? 'bg-rojo-100 text-rojo-700' : 'bg-trigo-200 text-trigo-900')}>
                  <Icon nombre="alerta" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-texto">
                    Tu {etiquetaDocumentoCorta[documento.tipo]} {dias < 0 ? 'está vencida' : `vence ${relativo(dias)}`}
                  </span>
                  <span className="block text-xs text-texto-suave">
                    {documento.renovacion ? 'Renovación enviada: la red la está revisando.' : 'Renovala para mantener el nivel y seguir apareciendo sin advertencias.'}
                  </span>
                </span>
                <Icon nombre="chevronDerecha" tamano={18} className="text-texto-suave" />
              </Link>
            ))}
          </div>
        ) : null}

        {datos.atencion.length > 0 ? (
          <section aria-labelledby="t-atencion">
            <h2 id="t-atencion" className="mb-2 flex items-center gap-2 text-base text-tierra-900">
              <Icon nombre="alerta" tamano={18} className="text-trigo-700" /> Para corregir
            </h2>
            <div className="space-y-2">
              {datos.atencion.map((p) => <TarjetaParte key={p.id} parte={p} destacada />)}
            </div>
          </section>
        ) : null}

        {/* Trabajos de hoy */}
        <section aria-labelledby="t-hoy" data-tour="trabajos-hoy">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="t-hoy" className="text-base text-tierra-900">Trabajos de hoy</h2>
            <span className="text-xs capitalize text-texto-suave">{fechaConDia(HOY)}</span>
          </div>
          {datos.hoy.length === 0 ? (
            <EmptyState icono="calendario" titulo="Sin trabajos agendados" texto="Podés cargar un parte igual desde el botón +." />
          ) : (
            <ul className="space-y-2">
              {datos.hoy.map((a) => {
                const lote = cat.lote(a.loteId)
                const est = lote ? cat.establecimiento(lote.establecimientoId) : undefined
                const prod = est ? cat.productor(est.productorId) : undefined
                const destino = a.borradorId ? `/contratista/nuevo-parte?borrador=${a.borradorId}` : `/contratista/nuevo-parte?agenda=${a.id}`
                return (
                  <li key={a.id} className="rounded-2xl border border-borde bg-superficie p-3.5 shadow-tarjeta">
                    <div className="flex gap-3">
                      <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-paper-2 py-1.5">
                        <span className="num text-sm font-bold text-tierra-900">{a.hora}</span>
                        <Icon nombre={ICONO_LABOR[a.labor]} tamano={18} className="mt-0.5 text-verde-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-texto">{etiquetaLabor[a.labor]} · {num(a.has, 1)} has</p>
                        <p className="truncate text-sm text-texto-suave">{est?.nombre} · {lote?.nombre}</p>
                        <p className="truncate text-xs text-texto-suave">{prod?.razonSocial}</p>
                        <p className="mt-1.5 text-xs text-texto">{a.nota}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      {a.hecho ? (
                        <p className="flex min-h-tactil items-center justify-center gap-2 rounded-xl bg-verde-50 text-sm font-semibold text-verde-800">
                          <Icon nombre="checkCirculo" tamano={18} /> Parte cargado
                        </p>
                      ) : (
                        <ButtonLink to={destino} bloque icono={a.borradorId ? 'editar' : 'mas'} variante={a.borradorId ? 'secundario' : 'primario'} data-tour={`cargar-${a.id}`}>
                          {a.borradorId ? 'Seguir el borrador' : 'Cargar parte'}
                        </ButtonLink>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {datos.proximos.length > 0 ? (
            <p className="mt-2 text-xs text-texto-suave">
              Próximo: {datos.proximos.map((a) => `${fechaConDia(a.fecha)} · ${etiquetaLabor[a.labor]} en ${cat.lote(a.loteId)?.nombre ?? ''}`).join(' · ')}
            </p>
          ) : null}
        </section>

        {datos.pedidos > 0 ? (
          <Link to="/contratista/trabajos?vista=pedidos" className="flex items-center gap-3 rounded-2xl bg-cielo-50 p-3.5 ring-1 ring-inset ring-cielo-200">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cielo-100 text-cielo-800">
              <Icon nombre="chat" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-texto">
                {datos.pedidos} {datos.pedidos === 1 ? 'pedido de presupuesto nuevo' : 'pedidos de presupuesto nuevos'}
              </span>
              <span className="block text-xs text-texto-suave">Respondé rápido: suma a tu reputación.</span>
            </span>
            <Icon nombre="chevronDerecha" tamano={18} className="text-texto-suave" />
          </Link>
        ) : null}

        {/* Esperando conformidad */}
        <section aria-labelledby="t-espera">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="t-espera" className="text-base text-tierra-900">Esperando conformidad</h2>
            <Link to="/contratista/trabajos?estado=enviado" className="text-xs font-semibold text-verde-800">Ver todos</Link>
          </div>
          {datos.esperando.length === 0 ? (
            <EmptyState icono="checkCirculo" titulo="Todo conformado" texto="No tenés partes esperando respuesta del productor." />
          ) : (
            <div className="space-y-2">
              {datos.esperando.slice(0, 3).map((p) => <TarjetaParte key={p.id} parte={p} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
