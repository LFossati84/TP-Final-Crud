import { useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { EncabezadoMovil } from '@/app/EncabezadoMovil'
import { listoParaCobrar } from '@/domain/cobranza'
import {
  etiquetaEstadoParte,
  etiquetaLabor,
  etiquetaMaquina,
  etiquetaMotivoObservacion,
  fecha,
  fechaHora,
  num,
} from '@/domain/format'
import { CAMPANIA_ACTIVA } from '@/domain/reloj'
import type { CodigoHallazgo, EstadoParte, ParteLabor } from '@/domain/types'
import { evaluarParte } from '@/domain/validacion'
import { MapaLotes } from '@/maps/MapaLotes'
import { useContratista } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, ButtonLink } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Input, Textarea } from '@/ui/FormField'
import { Icon, type NombreIcono } from '@/ui/Icon'
import { InputNumero } from '@/ui/InputNumero'
import { Modal } from '@/ui/Modal'
import { EstadoParteChip, EstadoValidacionChip } from '@/ui/StatusChip'
import { Timeline } from '@/ui/Timeline'
import type { Tono } from '@/ui/tonos'
import { toast } from '@/ui/toast-store'
import { FotoIlustrada } from './FotoIlustrada'

const MOTIVOS_ING: Partial<Record<CodigoHallazgo, string>> = {
  dosis_alta: 'Dosis por encima del rango',
  dosis_baja: 'Dosis por debajo del rango',
  viento_alto: 'Viento alto',
  viento_bajo: 'Viento bajo',
  temperatura_alta: 'Temperatura alta',
  humedad_baja: 'Humedad baja',
  sin_receta: 'Falta receta',
  producto_fuera_de_receta: 'Producto fuera de receta',
}

const EVENTO: Record<EstadoParte, { icono: NombreIcono; tono: Tono }> = {
  borrador: { icono: 'editar', tono: 'neutro' },
  pendiente_sync: { icono: 'nubeOff', tono: 'trigo' },
  enviado: { icono: 'enviar', tono: 'cielo' },
  observado: { icono: 'alerta', tono: 'trigo' },
  conformado: { icono: 'checkCirculo', tono: 'verde' },
  rechazado: { icono: 'xCirculo', tono: 'rojo' },
  en_disputa: { icono: 'balanza', tono: 'rojo' },
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{etiqueta}</dt>
      <dd className="num mt-0.5 text-sm font-medium text-texto">{children}</dd>
    </div>
  )
}

export function DetalleParte() {
  const { id } = useParams()
  const c = useContratista()
  const cat = useCatalogo()
  const parte = useDemo((s) => s.partes.find((p) => p.id === id))
  const online = useDemo((s) => s.online)
  const ingenieros = useDemo((s) => s.ingenieros)
  const reconectar = useDemo((s) => s.reconectar)
  const [corrigiendo, setCorrigiendo] = useState(false)

  const hallazgos = useMemo(
    () => (parte ? evaluarParte(parte, cat.insumos, cat.lote(parte.loteId), cat.receta(parte.recetaId)) : []),
    [parte, cat],
  )

  if (!parte || !c || parte.contratistaId !== c.id) {
    return (
      <>
        <EncabezadoMovil titulo="Parte" volver="/contratista/trabajos" />
        <div className="p-4">
          <EmptyState icono="documento" titulo="No encontramos este parte" texto="Puede ser de otro contratista. Volvé a Mis trabajos." />
        </div>
      </>
    )
  }

  const lote = cat.lote(parte.loteId)
  const est = cat.establecimiento(parte.establecimientoId)
  const prod = cat.productor(parte.productorId)
  const maquina = c.flota.find((m) => m.id === parte.maquinaId)
  const receta = cat.receta(parte.recetaId)
  const obsIng = parte.validacion?.estado === 'observada' ? parte.validacion : undefined
  const ingeniero = obsIng ? ingenieros.find((i) => i.id === obsIng.ingenieroId) : undefined
  const ing = ingeniero ? `Ing. Agr. ${ingeniero.nombre}` : undefined
  const puedeCorregir = parte.estado === 'observado' || Boolean(obsIng)

  return (
    <>
      <EncabezadoMovil titulo={`Parte ${parte.numero}`} subtitulo={`${etiquetaLabor[parte.labor]} · ${lote?.nombre ?? ''}`} volver="/contratista/trabajos" />
      <div className="space-y-4 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <EstadoParteChip estado={parte.estado} tamano="md" />
          {parte.validacion ? <EstadoValidacionChip estado={parte.validacion.estado} /> : null}
          {listoParaCobrar(parte) ? <Chip tono="verde" icono="billetera" tamano="md">Listo para cobrar</Chip> : null}
          {parte.cargadoSinConexion ? <Chip tono="neutro" icono="nubeOff">Cargado sin señal</Chip> : null}
        </div>

        {/* Avisos accionables */}
        {parte.estado === 'observado' && parte.observacion ? (
          <div className="rounded-2xl bg-trigo-50 p-4 ring-1 ring-inset ring-trigo-300" role="alert" data-tour="observacion-productor">
            <p className="flex items-start gap-2 font-semibold text-trigo-900">
              <Icon nombre="alerta" tamano={18} className="mt-0.5 shrink-0" />
              <span>
                {prod?.razonSocial} observó el parte
                <span className="block text-sm font-medium">Motivo: {etiquetaMotivoObservacion[parte.observacion.motivo]}</span>
              </span>
            </p>
            <p className="mt-1.5 text-sm text-texto">“{parte.observacion.detalle}”</p>
          </div>
        ) : null}
        {obsIng ? (
          <div className="rounded-2xl bg-trigo-50 p-4 ring-1 ring-inset ring-trigo-300" role="alert" data-tour="observacion-ingeniero">
            <p className="flex items-start gap-2 font-semibold text-trigo-900">
              <Icon nombre="receta" tamano={18} className="mt-0.5 shrink-0" /> {ing ?? 'El ingeniero agrónomo'} observó la aplicación
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(obsIng.motivos ?? []).map((m) => (
                <Chip key={m} tono="trigo">{MOTIVOS_ING[m] ?? m}</Chip>
              ))}
            </div>
            {obsIng.nota ? <p className="mt-2 text-sm text-texto">“{obsIng.nota}”</p> : null}
          </div>
        ) : null}
        {parte.estado === 'rechazado' && parte.rechazo ? (
          <div className="rounded-2xl bg-rojo-50 p-4 ring-1 ring-inset ring-rojo-200" role="alert">
            <p className="font-semibold text-rojo-900">Rechazado por {prod?.razonSocial}</p>
            <p className="mt-1 text-sm text-texto">“{parte.rechazo.motivo}”</p>
          </div>
        ) : null}
        {parte.estado === 'en_disputa' ? (
          <div className="rounded-2xl bg-rojo-50 p-4 ring-1 ring-inset ring-rojo-200">
            <p className="font-semibold text-rojo-900">Parte en disputa</p>
            <p className="mt-1 text-sm text-texto">La mesa de ayuda de la red está mediando. Seguí la conversación desde Cobros.</p>
          </div>
        ) : null}

        {puedeCorregir ? (
          <Button bloque tamano="lg" icono="editar" onClick={() => setCorrigiendo(true)} data-tour="corregir-parte">
            Corregir y reenviar
          </Button>
        ) : null}
        {parte.estado === 'borrador' ? (
          <ButtonLink to={`/contratista/nuevo-parte?borrador=${parte.id}`} bloque tamano="lg" icono="editar">
            Seguir cargando
          </ButtonLink>
        ) : null}
        {parte.estado === 'pendiente_sync' ? (
          <div className="rounded-2xl bg-trigo-50 p-4 text-sm ring-1 ring-inset ring-trigo-200">
            <p className="font-semibold text-trigo-900">Guardado en el teléfono</p>
            <p className="mt-1 text-texto">Se envía solo cuando vuelva la señal.</p>
            {online ? (
              <Button className="mt-3" tamano="sm" icono="sync" onClick={() => void reconectar().then((n) => n && toast.ok('Parte sincronizado'))}>
                Sincronizar ahora
              </Button>
            ) : null}
          </div>
        ) : null}

        {/* Lote */}
        {est ? (
          <Card relleno={false} className="overflow-hidden">
            <MapaLotes establecimiento={est} lotes={cat.lotes} campania={CAMPANIA_ACTIVA} seleccionado={parte.loteId} compacto className="rounded-none border-0" />
            <div className="flex items-center gap-2 p-3 text-sm">
              <Icon nombre="ubicacion" tamano={18} className="shrink-0 text-verde-700" />
              <span className="min-w-0">
                <span className="block font-semibold">{est.nombre} · {lote?.nombre}</span>
                <span className="num block text-xs text-texto-suave">
                  {prod?.razonSocial} · GPS {parte.ubicacion.lat}, {parte.ubicacion.lng} (±{parte.ubicacion.precision} m)
                </span>
              </span>
            </div>
          </Card>
        ) : null}

        <Card>
          <h2 className="mb-3 font-serif text-lg text-tierra-900">Labor</h2>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-3">
            <Dato etiqueta="Labor">{etiquetaLabor[parte.labor]}</Dato>
            <Dato etiqueta="Superficie">{num(parte.has, 1)} has</Dato>
            <Dato etiqueta="Fecha">{fecha(parte.fecha)}</Dato>
            <Dato etiqueta="Horario">{parte.horaInicio}–{parte.horaFin} · {num(parte.horas, 1)} h</Dato>
            <Dato etiqueta="Máquina">{maquina ? etiquetaMaquina[maquina.tipo] : '—'}</Dato>
            <Dato etiqueta="Operario">{parte.operario}</Dato>
          </dl>
          {parte.notas ? <p className="mt-3 rounded-xl bg-paper-2 p-2.5 text-sm text-texto-suave">{parte.notas}</p> : null}
        </Card>

        {parte.insumos.length ? (
          <Card>
            <h2 className="mb-3 font-serif text-lg text-tierra-900">Insumos{parte.condiciones ? ' y condiciones' : ''}</h2>
            <ul className="divide-y divide-borde">
              {parte.insumos.map((ia) => {
                const ins = cat.insumo(ia.insumoId)
                return (
                  <li key={ia.insumoId} className="flex justify-between gap-3 py-2 text-sm">
                    <span>{ins?.nombre}</span>
                    <span className="num shrink-0 font-semibold">{num(ia.dosis)} {ins?.unidad}</span>
                  </li>
                )
              })}
            </ul>
            {parte.condiciones ? (
              <dl className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-paper-2 p-3 text-center">
                <Dato etiqueta="Caldo">{parte.condiciones.caldo} l/ha</Dato>
                <Dato etiqueta="Viento">{parte.condiciones.viento} {parte.condiciones.direccionViento}</Dato>
                <Dato etiqueta="Temp.">{parte.condiciones.temperatura} °C</Dato>
                <Dato etiqueta="HR">{parte.condiciones.humedad} %</Dato>
              </dl>
            ) : null}
            {parte.labor === 'pulverizacion' ? (
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Icon nombre="receta" tamano={16} className="text-texto-suave" />
                {receta ? <>Receta {receta.numero}</> : <span className="font-semibold text-rojo-700">Sin receta asociada</span>}
              </p>
            ) : null}
            {hallazgos.length ? (
              <ul className="mt-3 space-y-1.5">
                {hallazgos.map((h) => (
                  <li key={h.codigo + h.texto} className={cx('flex items-start gap-2 rounded-xl p-2 text-xs ring-1 ring-inset', h.severidad === 'peligro' ? 'bg-rojo-50 text-rojo-900 ring-rojo-200' : 'bg-trigo-50 text-trigo-900 ring-trigo-200')}>
                    <Icon nombre="alerta" tamano={14} className="mt-0.5 shrink-0" />
                    {h.texto}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ) : null}

        {parte.fotos.length || parte.firma ? (
          <Card>
            <h2 className="mb-3 font-serif text-lg text-tierra-900">Fotos y firma</h2>
            {parte.fotos.length ? (
              <div className="grid grid-cols-3 gap-2">
                {parte.fotos.map((f) => (
                  <FotoIlustrada key={f.id} foto={f} pie={fechaCortaHora(parte)} />
                ))}
              </div>
            ) : null}
            {parte.firma ? (
              <div className="mt-3 rounded-xl border border-borde bg-white p-2">
                {parte.firma.trazo ? (
                  <img src={parte.firma.trazo} alt={`Firma de ${parte.firma.nombre}`} className="h-20 w-full object-contain" />
                ) : (
                  <p className="py-4 text-center font-serif text-2xl italic text-verde-900">{parte.firma.nombre}</p>
                )}
                <p className="border-t border-tierra-200 pt-1 text-center text-xs text-tierra-600">
                  {parte.firma.nombre} · {fechaHora(parte.firma.fecha)}
                </p>
              </div>
            ) : null}
          </Card>
        ) : null}

        <Card>
          <h2 className="mb-4 font-serif text-lg text-tierra-900">Historial</h2>
          <Timeline
            compacta
            items={[...parte.historial].reverse().map((e, i) => ({
              id: `${i}-${e.fecha}`,
              fecha: fechaHora(e.fecha),
              titulo: etiquetaEstadoParte[e.estado],
              detalle: e.nota ?? (e.actor === 'productor' ? prod?.razonSocial : e.actor === 'sistema' ? 'Automático' : parte.operario),
              icono: EVENTO[e.estado].icono,
              tono: EVENTO[e.estado].tono,
            }))}
          />
        </Card>

        {parte.liquidacionId && parte.liquidacionId !== 'fuera-de-plataforma' ? (
          <Link to={`/contratista/cobros/${parte.liquidacionId}`} className="flex items-center justify-between rounded-2xl bg-verde-50 p-4 text-sm font-semibold text-verde-900 ring-1 ring-inset ring-verde-200">
            Ver la liquidación de este parte <Icon nombre="chevronDerecha" />
          </Link>
        ) : null}
      </div>

      {corrigiendo ? <CorregirParte parte={parte} onCerrar={() => setCorrigiendo(false)} /> : null}
    </>
  )
}

function fechaCortaHora(p: ParteLabor): string {
  return `${fecha(p.fecha).slice(0, 5)} ${p.horaFin} · ${p.ubicacion.lat}, ${p.ubicacion.lng}`
}

/** Corrección de un parte observado: solo los campos que suelen observarse. */
function CorregirParte({ parte, onCerrar }: { parte: ParteLabor; onCerrar: () => void }) {
  const cat = useCatalogo()
  const corregir = useDemo((s) => s.corregirParte)
  const lote = cat.lote(parte.loteId)
  const [has, setHas] = useState(parte.has)
  const [fechaP, setFechaP] = useState(parte.fecha)
  const [insumos, setInsumos] = useState(parte.insumos.map((i) => ({ ...i })))
  const [nota, setNota] = useState(() => {
    if (parte.observacion?.motivo === 'hectareas' && lote) return `Corregí las hectáreas: son ${num(lote.has, 1)} has, cargué mal el número.`
    if (parte.observacion?.motivo === 'fecha') return 'Corregí la fecha de aplicación.'
    if (parte.validacion?.motivos?.includes('dosis_alta')) return 'Corregí la dosis: fue un error de tipeo al cargar.'
    return 'Corregí los datos observados.'
  })
  const excede = lote ? has > lote.has * 1.02 : false

  const guardar = () => {
    corregir(parte.id, { has, fecha: fechaP, insumos }, nota)
    toast.ok(`${parte.numero} corregido y reenviado`, parte.estado === 'observado' ? 'El productor lo vuelve a revisar.' : 'El ingeniero lo vuelve a revisar.')
    onCerrar()
  }

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Corregir ${parte.numero}`}
      descripcion="Cambiá lo que te observaron y contá qué corregiste."
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button icono="enviar" onClick={guardar} disabled={!nota.trim() || has <= 0} data-tour="reenviar-parte">
            Reenviar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <InputNumero
          label="Hectáreas"
          valor={has}
          onValor={setHas}
          sufijo="has"
          hint={lote ? `El lote tiene ${num(lote.has, 1)} has.` : undefined}
          error={excede && lote ? `Supera la superficie del lote (${num(lote.has, 1)} has).` : undefined}
          data-tour="corregir-has"
        />
        <Input label="Fecha" type="date" value={fechaP} onChange={(e) => setFechaP(e.target.value)} />
        {insumos.map((ia, i) => {
          const ins = cat.insumo(ia.insumoId)
          return (
            <InputNumero
              key={ia.insumoId}
              label={`Dosis · ${ins?.nombre ?? ''}`}
              valor={ia.dosis}
              onValor={(n) => setInsumos(insumos.map((x, j) => (j === i ? { ...x, dosis: n } : x)))}
              sufijo={ins?.unidad}
              hint={ins?.dosisMin !== undefined ? `Rango de referencia: ${num(ins.dosisMin)}–${num(ins.dosisMax ?? 0)} ${ins.unidad}` : undefined}
              data-tour={`corregir-dosis-${i}`}
            />
          )
        })}
        <Textarea label="¿Qué corregiste?" value={nota} onChange={(e) => setNota(e.target.value)} rows={3} />
      </div>
    </Modal>
  )
}
