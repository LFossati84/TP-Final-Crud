import { useState } from 'react'
import { etiquetaDocumento, etiquetaNivel, fecha, relativo } from '@/domain/format'
import { diasHasta, HOY } from '@/domain/reloj'
import type { Contratista, Documento } from '@/domain/types'
import { evaluarVerificacion, NOTA_NORMATIVA, semaforoVencimiento } from '@/domain/verificacion'
import { contextoVerificacion } from '@/store/derivados'
import { useVerificacion } from '@/store/hooks'
import { useDemo } from '@/store/useDemo'
import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Textarea } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'
import { Stat } from '@/ui/Stat'
import { EstadoDocumentoChip, SemaforoChip } from '@/ui/StatusChip'
import { toast } from '@/ui/toast-store'
import { VerificationBadge } from '@/ui/VerificationBadge'

const enRevision = (d: Documento) => d.estado === 'pendiente' || Boolean(d.renovacion)

export function VerificacionesAdmin() {
  const contratistas = useDemo((s) => s.contratistas)
  const avisar = useDemo((s) => s.avisarVencimiento)
  const cola = contratistas.filter((c) => c.documentos.some(enRevision))
  const pendientes = contratistas.reduce((n, c) => n + c.documentos.filter(enRevision).length, 0)
  const porVencer = contratistas.flatMap((c) => c.documentos.filter((d) => d.estado === 'aprobado' && !d.renovacion && ['amarillo', 'rojo'].includes(semaforoVencimiento(d.vence))).map((d) => ({ c, d })))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl text-tierra-900">Verificaciones</h1>
        <p className="text-texto-suave">Cola de revisión documental. Cada aprobación recalcula el nivel del contratista al instante.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat etiqueta="Documentos en revisión" valor={pendientes} detalle={`${cola.length} contratistas`} icono="documento" tono={pendientes ? 'cielo' : 'verde'} />
        <Stat etiqueta="Vencen en 30 días" valor={porVencer.length} detalle="ART, seguros y habilitaciones" icono="reloj" tono={porVencer.length ? 'trigo' : 'verde'} />
        <Stat etiqueta="Contratistas en la red" valor={contratistas.length} detalle="Zona piloto sur de Santa Fe" icono="usuarios" tono="tierra" />
      </div>

      <section aria-labelledby="t-cola" className="space-y-4">
        <h2 id="t-cola" className="text-xl text-tierra-900">Cola de revisión</h2>
        {cola.length === 0 ? <EmptyState icono="checkCirculo" titulo="No hay documentos para revisar" texto="Cuando un contratista cargue o renueve documentación, aparece acá." /> : null}
        {cola.map((c) => <TarjetaRevision key={c.id} c={c} />)}
      </section>

      <section aria-labelledby="t-venc" className="space-y-3">
        <h2 id="t-venc" className="text-xl text-tierra-900">Vencimientos próximos</h2>
        {porVencer.length === 0 ? (
          <EmptyState icono="calendario" titulo="Nada por vencer en los próximos 30 días" />
        ) : (
          <Card relleno={false}>
            <ul className="divide-y divide-borde" data-tour="vencimientos-red">
              {porVencer.map(({ c, d }) => (
                <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar nombre={c.razonSocial} tamano="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{c.razonSocial}</span>
                    <span className="block text-sm text-texto-suave">{etiquetaDocumento[d.tipo]} · vence {fecha(d.vence ?? HOY)}</span>
                  </span>
                  <SemaforoChip semaforo={semaforoVencimiento(d.vence)} texto={`Vence ${relativo(diasHasta(d.vence ?? HOY))}`} />
                  <Button variante="secundario" tamano="sm" icono="campana" onClick={() => { avisar(c.id, d.id); toast.ok('Recordatorio enviado', `${c.razonSocial} recibió el aviso.`) }}>Recordar</Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
      <p className="flex items-start gap-2 text-xs italic text-texto-suave"><Icon nombre="info" tamano={14} className="mt-0.5 shrink-0" />{NOTA_NORMATIVA}.</p>
    </div>
  )
}

function TarjetaRevision({ c }: { c: Contratista }) {
  const ev = useVerificacion(c.id)
  const datos = useDemo((s) => s)
  const revisar = useDemo((s) => s.revisarDocumento)
  const [accion, setAccion] = useState<{ doc: Documento; tipo: 'observado' | 'rechazado' } | null>(null)
  const [ver, setVer] = useState<Documento | null>(null)
  const [nota, setNota] = useState('')
  const docs = c.documentos.filter(enRevision)

  // Nivel que tendría si se aprueban todos los documentos en revisión.
  const ctx = contextoVerificacion(datos, c.id)
  const hipotetico = ctx
    ? evaluarVerificacion({ ...c, documentos: c.documentos.map((d) => (enRevision(d) ? { ...d, ...(d.renovacion ?? {}), estado: 'aprobado' as const, renovacion: undefined } : d)) }, ctx).nivel
    : null

  const aprobar = (d: Documento) => {
    revisar(c.id, d.id, 'aprobado')
    toast.ok(`${etiquetaDocumento[d.tipo]} aprobado`, c.razonSocial)
  }

  return (
    <Card data-tour={`revision-${c.id}`}>
      <div className="flex flex-wrap items-start gap-4">
        <Avatar nombre={c.razonSocial} tamano="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-serif text-xl leading-tight text-tierra-900">{c.razonSocial}</p>
          <p className="text-sm text-texto-suave">{c.titular} · CUIT {c.cuit} · {c.localidad} · {c.servicios.length} servicios · {c.flota.length} equipos</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Nivel actual</span>
            <VerificationBadge nivel={ev?.nivel ?? null} />
            {hipotetico && hipotetico !== ev?.nivel ? (
              <span className="flex items-center gap-1 text-sm text-texto-suave"><Icon nombre="flechaDerecha" tamano={16} /> si aprobás todo: <strong className="text-verde-800">{etiquetaNivel[hipotetico]}</strong></span>
            ) : null}
          </div>
        </div>
        {docs.length > 1 ? (
          <Button variante="suave" icono="check" onClick={() => { docs.forEach((d) => revisar(c.id, d.id, 'aprobado')); toast.ok('Documentación aprobada', `${c.razonSocial} ya figura con su nuevo nivel en toda la red.`) }} data-tour="aprobar-todo">
            Aprobar todo
          </Button>
        ) : null}
      </div>
      <ul className="mt-4 divide-y divide-borde rounded-xl border border-borde">
        {docs.map((d) => {
          const vence = d.renovacion?.vence ?? d.vence
          return (
            <li key={d.id} className="flex flex-wrap items-center gap-3 px-3 py-3">
              <Icon nombre="documento" className="shrink-0 text-texto-suave" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{etiquetaDocumento[d.tipo]}{d.renovacion ? ' · renovación' : ''}</span>
                <span className="block text-xs text-texto-suave">{d.renovacion?.archivo ?? d.archivo} · cargado {fecha(d.renovacion?.cargado ?? d.cargado)}{vence ? ` · vence ${fecha(vence)}` : ''}</span>
              </span>
              {d.renovacion ? <Chip tono="cielo" icono="reloj">Renovación</Chip> : <EstadoDocumentoChip estado={d.estado} />}
              <div className="flex flex-wrap gap-1.5">
                <Button variante="fantasma" tamano="sm" icono="ojo" onClick={() => setVer(d)}>Ver</Button>
                <Button variante="secundario" tamano="sm" onClick={() => { setNota(''); setAccion({ doc: d, tipo: 'observado' }) }}>Pedir corrección</Button>
                <Button variante="fantasma" tamano="sm" className="text-rojo-700" onClick={() => { setNota(''); setAccion({ doc: d, tipo: 'rechazado' }) }}>Rechazar</Button>
                <Button tamano="sm" icono="check" onClick={() => aprobar(d)} data-tour={`aprobar-${d.tipo}`}>Aprobar</Button>
              </div>
            </li>
          )
        })}
      </ul>

      <Modal
        abierto={accion !== null}
        onCerrar={() => setAccion(null)}
        titulo={accion?.tipo === 'rechazado' ? 'Rechazar documento' : 'Pedir corrección'}
        descripcion={accion ? `${etiquetaDocumento[accion.doc.tipo]} · ${c.razonSocial}` : undefined}
        tamano="sm"
        pie={
          <>
            <Button variante="fantasma" onClick={() => setAccion(null)}>Cancelar</Button>
            <Button
              variante={accion?.tipo === 'rechazado' ? 'peligro' : 'primario'}
              disabled={!nota.trim()}
              onClick={() => {
                if (!accion) return
                revisar(c.id, accion.doc.id, accion.tipo, nota)
                toast.info(accion.tipo === 'rechazado' ? 'Documento rechazado' : 'Corrección pedida', 'Le avisamos al contratista.')
                setAccion(null)
              }}
            >
              Enviar
            </Button>
          </>
        }
      >
        <Textarea label="Motivo para el contratista" value={nota} onChange={(e) => setNota(e.target.value)} rows={3} placeholder="Ej.: la constancia está vencida; subí la emitida este mes." />
      </Modal>

      <Modal abierto={ver !== null} onCerrar={() => setVer(null)} titulo={ver ? etiquetaDocumento[ver.tipo] : ''} descripcion={ver?.renovacion?.archivo ?? ver?.archivo} tamano="md">
        <div className="forzar-claro rounded-xl border border-[#e2cdb3] bg-white p-5 text-sm text-[#1f1510]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64432d]">Documento simulado</p>
          <p className="mt-1 font-serif text-lg">{ver ? etiquetaDocumento[ver.tipo] : ''}</p>
          <p>Titular: {c.titular} · {c.razonSocial}</p>
          <p>CUIT: {c.cuit}</p>
          {ver?.renovacion?.vence ?? ver?.vence ? <p>Vigencia hasta: {fecha(ver?.renovacion?.vence ?? ver?.vence ?? HOY)}</p> : null}
          <div className="mt-4 space-y-1.5" aria-hidden>
            {[90, 70, 85, 60, 75].map((w, i) => <div key={i} className="h-2 rounded bg-[#efe6d8]" style={{ width: `${w}%` }} />)}
          </div>
        </div>
        <p className="mt-3 text-xs text-texto-suave">En la versión real se validan contra fuentes oficiales (padrón de CUIT, aseguradora, registro de aplicadores) cuando estén disponibles.</p>
      </Modal>
    </Card>
  )
}

