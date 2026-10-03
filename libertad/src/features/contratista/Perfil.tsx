import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { EncabezadoMovil } from '@/app/EncabezadoMovil'
import { etiquetaDocumento, etiquetaLabor, etiquetaMaquina, etiquetaNivel, etiquetaUnidad, fecha, fechaCorta, pesos, porcentaje, relativo } from '@/domain/format'
import { diasHasta, sumarDias, HOY } from '@/domain/reloj'
import type { Documento, NivelVerificacion, TipoDocumento } from '@/domain/types'
import { documentosRequeridos, NOTA_NORMATIVA, semaforoVencimiento } from '@/domain/verificacion'
import { useContratista, useReputacion, useVerificacion } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Estrellas } from '@/ui/Estrellas'
import { Input } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'
import { EstadoDocumentoChip, SemaforoChip } from '@/ui/StatusChip'
import { toast } from '@/ui/toast-store'
import { VerificationBadge } from '@/ui/VerificationBadge'

const DISPONIBILIDAD = {
  disponible: { tono: 'verde', texto: 'Disponible' },
  agenda_limitada: { tono: 'trigo', texto: 'Agenda limitada' },
  sin_disponibilidad: { tono: 'rojo', texto: 'Sin disponibilidad' },
} as const

function Seccion({ id, titulo, children, accion }: { id?: string; titulo: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id ?? titulo}-t`} className="scroll-mt-16">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id={`${id ?? titulo}-t`} className="text-base text-tierra-900">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}

export function PerfilContratista() {
  const c = useContratista()
  const cat = useCatalogo()
  const ev = useVerificacion(c?.id ?? '')
  const rep = useReputacion(c?.id ?? '')
  const resenas = useDemo((s) => s.resenas)
  const [renovando, setRenovando] = useState<TipoDocumento | null>(null)
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const propias = useMemo(() => resenas.filter((r) => r.contratistaId === c?.id).sort((a, b) => b.fecha.localeCompare(a.fecha)), [resenas, c])

  if (!c || !ev || !rep) return <EmptyState titulo="No encontramos el contratista" />

  const req = documentosRequeridos(c)
  const tipos = [...req.basico, ...req.verificado]
  const disp = DISPONIBILIDAD[c.disponibilidad]
  const faltantes = ev.requisitos.filter((r) => r.nivel === ev.proximoNivel && !r.cumple)
  const niveles: NivelVerificacion[] = ['basico', 'verificado', 'destacado']

  return (
    <>
      <EncabezadoMovil titulo="Perfil" />
      <div className="space-y-6 px-4 py-4">
        {/* Encabezado */}
        <Card className="text-center">
          <Avatar nombre={c.razonSocial} tamano="xl" className="mx-auto" />
          <h1 className="mt-3 font-serif text-xl leading-tight text-tierra-900">{c.razonSocial}</h1>
          <p className="text-sm text-texto-suave">{c.titular} · CUIT {c.cuit}</p>
          <p className="text-sm text-texto-suave">{c.localidad} · en la actividad desde {c.desde}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2" data-tour="perfil-nivel">
            <VerificationBadge nivel={ev.nivel} tamano="lg" />
            <Chip tono={disp.tono} tamano="md">{disp.texto}{c.proximaFechaLibre && c.disponibilidad !== 'disponible' ? ` · desde ${fechaCorta(c.proximaFechaLibre)}` : ''}</Chip>
          </div>
          <p className="mt-3 text-sm text-texto-suave">{c.descripcion}</p>
        </Card>

        {/* Reputación */}
        <Seccion titulo="Reputación">
          <div className="grid grid-cols-3 gap-2" data-tour="perfil-reputacion">
            <div className="rounded-2xl border border-borde bg-superficie p-3 text-center">
              <p className="num font-serif text-2xl font-semibold text-tierra-900">{rep.calificacion ? rep.calificacion.toFixed(1).replace('.', ',') : '—'}</p>
              <Estrellas valor={rep.calificacion ?? 0} tamano={12} className="justify-center" />
              <p className="mt-0.5 text-[11px] text-texto-suave">{rep.resenas} reseñas</p>
            </div>
            <div className="rounded-2xl border border-borde bg-superficie p-3 text-center">
              <p className="num font-serif text-2xl font-semibold text-tierra-900">{porcentaje(rep.tasaConformidad)}</p>
              <p className="mt-1 text-[11px] leading-tight text-texto-suave">conformados sin observaciones</p>
            </div>
            <div className="rounded-2xl border border-borde bg-superficie p-3 text-center">
              <p className="num font-serif text-2xl font-semibold text-tierra-900">{rep.trabajos}</p>
              <p className="mt-1 text-[11px] leading-tight text-texto-suave">trabajos conformados</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-texto-suave">Se calcula solo con trabajos reales conformados por productores en la red.</p>
        </Seccion>

        {/* Verificación */}
        <Seccion titulo="Nivel de verificación">
          <Card relleno={false} className="divide-y divide-borde">
            {niveles.map((n) => {
              const items = ev.requisitos.filter((r) => r.nivel === n)
              const ok = items.every((r) => r.cumple)
              return (
                <div key={n} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-texto">{etiquetaNivel[n]}</p>
                    {ok ? <Chip tono="verde" icono="check">Cumplido</Chip> : n === ev.proximoNivel ? <Chip tono="trigo">Próximo nivel</Chip> : <Chip tono="neutro">Pendiente</Chip>}
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((r) => (
                      <li key={r.id} className="flex items-start gap-2 text-sm">
                        <Icon nombre={r.cumple ? 'checkCirculo' : 'xCirculo'} tamano={18} className={cx('mt-px shrink-0', r.cumple ? 'text-verde-600' : 'text-texto-suave')} />
                        <span className={r.cumple ? 'text-texto' : 'text-texto-suave'}>
                          {r.texto}
                          {r.detalle ? <span className="text-texto-suave"> · {r.detalle}</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </Card>
          {ev.proximoNivel && faltantes.length ? (
            <p className="mt-2 rounded-xl bg-trigo-50 p-3 text-sm text-trigo-900 ring-1 ring-inset ring-trigo-200">
              Para llegar a <strong>{etiquetaNivel[ev.proximoNivel]}</strong> te falta: {faltantes.map((f) => f.texto.toLowerCase()).join(', ')}.
            </p>
          ) : null}
          <p className="mt-2 flex items-start gap-1.5 text-xs italic text-texto-suave">
            <Icon nombre="info" tamano={14} className="mt-px shrink-0" />
            {NOTA_NORMATIVA}.
          </p>
        </Seccion>

        {/* Documentación */}
        <Seccion id="documentacion" titulo="Documentación">
          <ul className="space-y-2" data-tour="perfil-documentos">
            {tipos.map((t) => {
              const d = c.documentos.find((x) => x.tipo === t)
              return <FilaDocumento key={t} tipo={t} doc={d} onRenovar={() => setRenovando(t)} />
            })}
          </ul>
        </Seccion>

        {/* Flota */}
        <Seccion titulo={`Flota · ${c.flota.length} equipos`}>
          <ul className="space-y-2">
            {c.flota.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-borde bg-superficie p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tierra-100 text-tierra-800">
                  <Icon nombre="tractor" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{etiquetaMaquina[m.tipo]} · {m.anio}</span>
                  <span className="block text-xs text-texto-suave">{m.descripcion}{m.patente ? ` · ${m.patente}` : ''}</span>
                </span>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Servicios, zonas y tarifas">
          <Card className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {c.servicios.map((s) => <Chip key={s} tono="verde">{etiquetaLabor[s]}</Chip>)}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.zonas.map((z) => <Chip key={z} tono="tierra" icono="ubicacion">{z}</Chip>)}
            </div>
            <ul className="divide-y divide-borde border-t border-borde pt-1 text-sm">
              {c.tarifas.map((t) => (
                <li key={t.labor} className="flex justify-between py-2">
                  <span>{etiquetaLabor[t.labor]}</span>
                  <span className="num font-semibold">{pesos(t.precio)} {etiquetaUnidad(t.unidad)} + IVA</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-texto-suave">Tarifas de referencia (valores ilustrativos). Cada liquidación se puede ajustar.</p>
          </Card>
        </Seccion>

        <Seccion titulo={`Reseñas · ${propias.length}`}>
          {propias.length === 0 ? (
            <EmptyState icono="estrella" titulo="Todavía sin reseñas" texto="Los productores pueden calificarte al conformar un parte." />
          ) : (
            <ul className="space-y-2">
              {propias.slice(0, 6).map((r) => (
                <li key={r.id} className="rounded-2xl border border-borde bg-superficie p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <Estrellas valor={r.puntaje} tamano={14} />
                    <span className="text-xs text-texto-suave">{fechaCorta(r.fecha)} · {etiquetaLabor[r.labor]}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-texto">{r.texto}</p>
                  <p className="mt-1 text-xs font-semibold text-texto-suave">{cat.productor(r.productorId)?.razonSocial}</p>
                </li>
              ))}
            </ul>
          )}
        </Seccion>

        <Seccion titulo="Contacto">
          <Card className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Icon nombre="telefono" tamano={16} className="text-texto-suave" /> {c.telefono}</p>
            <p className="flex items-center gap-2"><Icon nombre="chat" tamano={16} className="text-texto-suave" /> {c.email}</p>
            <p className="flex items-center gap-2"><Icon nombre="usuarios" tamano={16} className="text-texto-suave" /> Operarios: {c.operarios.join(', ')}</p>
          </Card>
        </Seccion>
      </div>

      {renovando ? <RenovarDocumento tipo={renovando} onCerrar={() => setRenovando(null)} /> : null}
    </>
  )
}

function FilaDocumento({ tipo, doc, onRenovar }: { tipo: TipoDocumento; doc: Documento | undefined; onRenovar: () => void }) {
  const sem = semaforoVencimiento(doc?.vence)
  const dias = doc?.vence ? diasHasta(doc.vence) : undefined
  const accion = !doc || doc.estado === 'observado' || doc.estado === 'rechazado' || (doc.estado === 'aprobado' && (sem === 'amarillo' || sem === 'rojo') && !doc.renovacion)
  return (
    <li className={cx('rounded-2xl border bg-superficie p-3.5', sem === 'amarillo' && !doc?.renovacion ? 'border-trigo-300' : sem === 'rojo' ? 'border-rojo-300' : 'border-borde')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-texto">{etiquetaDocumento[tipo]}</p>
          <p className="truncate text-xs text-texto-suave">{doc ? `${doc.archivo} · cargado ${fecha(doc.cargado)}` : 'Sin cargar'}</p>
        </div>
        {doc ? <EstadoDocumentoChip estado={doc.estado} /> : <Chip tono="neutro">Falta</Chip>}
      </div>
      {doc?.vence ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <SemaforoChip semaforo={sem} texto={dias !== undefined && dias < 0 ? `Vencido ${relativo(dias)}` : sem === 'amarillo' && dias !== undefined ? `Vence ${relativo(dias)}` : undefined} />
          <span className="num text-xs text-texto-suave">Vence {fecha(doc.vence)}</span>
        </div>
      ) : null}
      {doc?.renovacion ? (
        <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-cielo-50 px-2.5 py-1.5 text-xs font-medium text-cielo-900">
          <Icon nombre="reloj" tamano={14} /> Renovación enviada ({doc.renovacion.archivo}), en revisión por la red.
        </p>
      ) : null}
      {doc?.nota && doc.estado !== 'aprobado' ? <p className="mt-2 text-xs text-trigo-900">Nota de la red: {doc.nota}</p> : null}
      {accion ? (
        <Button className="mt-3" tamano="sm" variante={sem === 'amarillo' || sem === 'rojo' ? 'primario' : 'secundario'} icono="subir" onClick={onRenovar} data-tour={`renovar-${tipo}`}>
          {doc ? 'Subir versión nueva' : 'Cargar documento'}
        </Button>
      ) : null}
    </li>
  )
}

function RenovarDocumento({ tipo, onCerrar }: { tipo: TipoDocumento; onCerrar: () => void }) {
  const c = useContratista()
  const cargar = useDemo((s) => s.cargarDocumento)
  const [archivo, setArchivo] = useState('')
  const [vence, setVence] = useState(sumarDias(HOY, 365))
  const conVencimiento = tipo !== 'identidad' && tipo !== 'cuit'
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={etiquetaDocumento[tipo]}
      descripcion="La red revisa el documento en menos de 48 h hábiles. Mientras tanto sigue vigente el anterior."
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button
            icono="subir"
            disabled={!archivo}
            onClick={() => {
              if (!c) return
              cargar(c.id, tipo, archivo, conVencimiento ? vence : undefined)
              toast.ok('Documento enviado a revisión', 'Te avisamos cuando la red lo apruebe.')
              onCerrar()
            }}
            data-tour="enviar-documento"
          >
            Enviar a revisión
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-borde-fuerte bg-paper-2 p-4 text-center text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foco">
          <Icon nombre={archivo ? 'documento' : 'subir'} className="text-texto-suave" />
          <span className="font-semibold">{archivo || 'Elegí el archivo (PDF o foto)'}</span>
          <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => setArchivo(e.target.files?.[0]?.name ?? '')} />
        </label>
        <Button variante="fantasma" tamano="sm" icono="imagen" onClick={() => setArchivo(`${tipo.replace(/_/g, '-')}-${HOY.slice(0, 4)}.pdf`)}>
          Usar un archivo de ejemplo
        </Button>
        {conVencimiento ? <Input label="Fecha de vencimiento" type="date" min={HOY} value={vence} onChange={(e) => setVence(e.target.value)} /> : null}
        <p className="text-xs text-texto-suave">Demo: el archivo no se sube a ningún servidor; nada sale de tu navegador.</p>
      </div>
    </Modal>
  )
}
