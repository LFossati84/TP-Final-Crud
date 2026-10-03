import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { etiquetaDocumento, etiquetaLabor, etiquetaMaquina, etiquetaNivel, etiquetaUnidad, fecha, fechaCorta, pesos, porcentaje, relativo } from '@/domain/format'
import { diasHasta } from '@/domain/reloj'
import { documentosRequeridos, NOTA_NORMATIVA, semaforoVencimiento } from '@/domain/verificacion'
import { useReputacion, useVerificacion } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Avatar } from '@/ui/Avatar'
import { Button, ButtonLink } from '@/ui/Button'
import { Card, CardHeader } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Estrellas } from '@/ui/Estrellas'
import { Icon } from '@/ui/Icon'
import { SemaforoChip } from '@/ui/StatusChip'
import { VerificationBadge } from '@/ui/VerificationBadge'
import { AvisoDocumentacion } from './AvisoDocumentacion'
import { SolicitarModal } from './SolicitarModal'

export function PerfilRed() {
  const { id = '' } = useParams()
  const cat = useCatalogo()
  const c = useDemo((s) => s.contratistas.find((x) => x.id === id))
  const resenas = useDemo((s) => s.resenas)
  const partes = useDemo((s) => s.partes)
  const productorId = useDemo((s) => s.productorId)
  const ev = useVerificacion(id)
  const rep = useReputacion(id)
  const [modal, setModal] = useState<'presupuesto' | 'contratacion' | null>(null)
  const propias = useMemo(() => resenas.filter((r) => r.contratistaId === id).sort((a, b) => b.fecha.localeCompare(a.fecha)), [resenas, id])
  const conmigo = partes.filter((p) => p.contratistaId === id && p.productorId === productorId && p.estado === 'conformado').length

  if (!c || !ev || !rep) {
    return <EmptyState icono="usuarios" titulo="No encontramos este contratista" accion={<ButtonLink to="/productor/contratistas">Volver a la red</ButtonLink>} />
  }
  const req = documentosRequeridos(c)
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, cant: propias.filter((r) => r.puntaje === n).length }))

  return (
    <div className="space-y-6">
      <ButtonLink to="/productor/contratistas" variante="fantasma" tamano="sm" icono="chevronIzquierda">Red de contratistas</ButtonLink>
      <Card>
        <div className="flex flex-wrap items-start gap-5">
          <Avatar nombre={c.razonSocial} tamano="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl leading-tight text-tierra-900">{c.razonSocial}</h1>
            <p className="text-texto-suave">{c.titular} · {c.localidad} · en la actividad desde {c.desde}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <VerificationBadge nivel={ev.nivel} tamano="lg" />
              <AvisoDocumentacion ev={ev} />
              {conmigo ? <Chip tono="cielo" icono="check" tamano="md">{conmigo} trabajos con vos</Chip> : null}
            </div>
            <p className="mt-3 max-w-2xl text-sm">{c.descripcion}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Button icono="chat" onClick={() => setModal('presupuesto')} data-tour="solicitar-presupuesto">Solicitar presupuesto</Button>
            <Button variante="secundario" icono="calendario" onClick={() => setModal('contratacion')} data-tour="contratar-labor">Contratar para una labor</Button>
          </div>
        </div>
        {ev.alertas.some((a) => a.documento.tipo === 'art') ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-trigo-50 p-3 text-sm text-trigo-900 ring-1 ring-inset ring-trigo-200" role="note">
            <Icon nombre="alerta" tamano={18} className="mt-0.5 shrink-0" />
            La ART de este contratista vence pronto. Si lo contratás después de esa fecha, pedile la renovación antes de que entre al campo.
          </p>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader titulo="Reputación" subtitulo="Solo trabajos reales conformados" />
          <div className="flex items-center gap-4">
            <p className="text-5xl font-semibold text-tierra-900">{rep.calificacion ? rep.calificacion.toFixed(1).replace('.', ',') : '—'}</p>
            <div>
              <Estrellas valor={rep.calificacion ?? 0} />
              <p className="text-sm text-texto-suave">{rep.resenas} reseñas</p>
            </div>
          </div>
          <ul className="mt-3 space-y-1">
            {dist.map((d) => (
              <li key={d.n} className="grid grid-cols-[1.5rem_1fr_1.5rem] items-center gap-2 text-xs">
                <span className="text-texto-suave">{d.n}★</span>
                <span className="h-2 rounded-full bg-paper-3"><span className="block h-2 rounded-full bg-trigo-500" style={{ width: `${propias.length ? (d.cant / propias.length) * 100 : 0}%` }} /></span>
                <span className="num text-right text-texto-suave">{d.cant}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-borde pt-3">
            <div><dt className="text-xs text-texto-suave">Conformados sin observaciones</dt><dd className="text-xl font-semibold">{porcentaje(rep.tasaConformidad)}</dd></div>
            <div><dt className="text-xs text-texto-suave">Trabajos conformados</dt><dd className="text-xl font-semibold">{rep.trabajos}</dd></div>
          </dl>
        </Card>

        <Card>
          <CardHeader titulo={`Verificación · ${ev.nivel ? etiquetaNivel[ev.nivel] : 'en revisión'}`} subtitulo="Documentación revisada por la red" />
          <ul className="space-y-2">
            {[...req.basico, ...req.verificado].map((t) => {
              const d = c.documentos.find((x) => x.tipo === t)
              const ok = d?.estado === 'aprobado'
              const sem = semaforoVencimiento(d?.vence)
              return (
                <li key={t} className="flex items-start justify-between gap-2 text-sm">
                  <span className="flex items-start gap-2">
                    <Icon nombre={ok ? 'checkCirculo' : 'reloj'} tamano={16} className={ok ? 'mt-0.5 text-verde-600' : 'mt-0.5 text-texto-suave'} />
                    <span>{etiquetaDocumento[t]}{d?.vence && ok ? <span className="block text-xs text-texto-suave">vence {fecha(d.vence)}</span> : null}</span>
                  </span>
                  {ok && d?.vence ? <SemaforoChip semaforo={sem} texto={sem === 'amarillo' ? `Vence ${relativo(diasHasta(d.vence))}` : undefined} /> : !ok ? <Chip tono="cielo">En revisión</Chip> : null}
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-xs italic text-texto-suave">{NOTA_NORMATIVA}.</p>
        </Card>

        <Card>
          <CardHeader titulo="Servicios y tarifas" subtitulo="Valores de referencia + IVA" />
          <ul className="divide-y divide-borde text-sm">
            {c.tarifas.map((t) => (
              <li key={t.labor} className="flex justify-between py-2"><span>{etiquetaLabor[t.labor]}</span><span className="num font-semibold">{pesos(t.precio)} {etiquetaUnidad(t.unidad)}</span></li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-texto-suave">Zonas</p>
          <div className="mt-1 flex flex-wrap gap-1">{c.zonas.map((z) => <Chip key={z} tono="tierra" icono="ubicacion">{z}</Chip>)}</div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-texto-suave">Flota</p>
          <ul className="mt-1 space-y-1 text-sm">{c.flota.map((m) => <li key={m.id}>{etiquetaMaquina[m.tipo]} {m.anio} · <span className="text-texto-suave">{m.descripcion}</span></li>)}</ul>
        </Card>
      </div>

      <Card>
        <CardHeader titulo="Reseñas de productores" subtitulo="Escritas al conformar trabajos" />
        {propias.length === 0 ? (
          <EmptyState icono="estrella" titulo="Todavía sin reseñas" texto="Es nuevo en la red. Mirá su verificación y pedile referencias." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {propias.map((r) => (
              <li key={r.id} className="rounded-xl border border-borde p-3">
                <div className="flex items-center justify-between"><Estrellas valor={r.puntaje} tamano={14} /><span className="text-xs text-texto-suave">{fechaCorta(r.fecha)} · {etiquetaLabor[r.labor]}</span></div>
                <p className="mt-1 text-sm">{r.texto}</p>
                <p className="mt-1 text-xs font-semibold text-texto-suave">{cat.productor(r.productorId)?.razonSocial}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {modal ? <SolicitarModal contratista={c} tipo={modal} onCerrar={() => setModal(null)} /> : null}
    </div>
  )
}
