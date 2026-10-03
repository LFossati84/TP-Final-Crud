import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { describirInsumos } from '@/domain/cuaderno'
import { fecha, fechaHora, num } from '@/domain/format'
import type { CodigoHallazgo, ParteLabor } from '@/domain/types'
import { evaluarParte, NOTA_VALIDACION_PROFESIONAL, UMBRALES } from '@/domain/validacion'
import { FotoIlustrada } from '@/features/contratista/FotoIlustrada'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, ButtonLink } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Checkbox, Select, Textarea } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'
import { EstadoParteChip, EstadoValidacionChip } from '@/ui/StatusChip'
import { Table, type Columna } from '@/ui/Table'
import { Tabs } from '@/ui/Tabs'
import { toast } from '@/ui/toast-store'
import { useAgronomia } from './useAgronomia'

type Vista = 'pendientes' | 'observadas' | 'validadas' | 'sin_receta'

const MOTIVOS_INGENIERO: { codigo: CodigoHallazgo; texto: string }[] = [
  { codigo: 'dosis_alta', texto: 'Dosis por encima del rango de la receta' },
  { codigo: 'dosis_baja', texto: 'Dosis por debajo del rango' },
  { codigo: 'viento_alto', texto: `Viento mayor a ${UMBRALES.vientoMax} km/h (riesgo de deriva)` },
  { codigo: 'humedad_baja', texto: `Humedad relativa menor a ${UMBRALES.humedadMin} %` },
  { codigo: 'temperatura_alta', texto: `Temperatura mayor a ${UMBRALES.temperaturaMax} °C` },
  { codigo: 'sin_receta', texto: 'Falta receta agronómica' },
  { codigo: 'producto_fuera_de_receta', texto: 'Producto fuera de la receta' },
]

export function AplicacionesIngeniero() {
  const cat = useCatalogo()
  const datos = useAgronomia()
  const navigate = useNavigate()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const vista = (params.get('vista') as Vista | null) ?? 'pendientes'
  const cliente = params.get('cliente') ?? ''
  const listas: Record<Vista, ParteLabor[]> = { pendientes: datos.pendientes, observadas: datos.observadas, validadas: datos.validadas, sin_receta: datos.sinReceta }
  const filas = listas[vista].filter((p) => !cliente || p.productorId === cliente).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const seleccion = id ? datos.aplicaciones.find((p) => p.id === id) : undefined
  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params)
    if (!v) n.delete(k)
    else n.set(k, v)
    setParams(n, { replace: true })
  }

  const columnas: Columna<ParteLabor>[] = [
    { clave: 'parte', titulo: 'Aplicación', render: (p) => <span><span className="block font-semibold">{p.numero}</span><span className="block text-xs text-texto-suave">{describirInsumos(p, cat.insumos)}</span></span> },
    { clave: 'cliente', titulo: 'Cliente / lote', render: (p) => <span>{cat.productor(p.productorId)?.razonSocial}<span className="block text-xs text-texto-suave">{cat.establecimiento(p.establecimientoId)?.nombre} · {cat.lote(p.loteId)?.nombre}</span></span> },
    { clave: 'fecha', titulo: 'Fecha', render: (p) => <span className="num">{fecha(p.fecha)}</span> },
    {
      clave: 'controles',
      titulo: 'Controles',
      render: (p) => {
        const h = evaluarParte(p, cat.insumos, cat.lote(p.loteId), cat.receta(p.recetaId)).filter((x) => x.codigo !== 'has_excedidas')
        return h.length ? <Chip tono={h.some((x) => x.severidad === 'peligro') ? 'rojo' : 'trigo'} icono="alerta">{h.length} {h.length === 1 ? 'alerta' : 'alertas'}</Chip> : <Chip tono="verde" icono="check">Sin alertas</Chip>
      },
    },
    { clave: 'estado', titulo: 'Estado', render: (p) => (p.validacion ? <EstadoValidacionChip estado={p.validacion.estado} /> : <EstadoParteChip estado={p.estado} />) },
  ]

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl text-tierra-900">Aplicaciones a validar</h1>
          <p className="text-texto-suave">Revisá las aplicaciones de fitosanitarios de tus clientes. Validá y firmá, u observá con motivo.</p>
        </div>
        <Select label="Cliente" className="w-64" value={cliente} placeholder="Todos" onChange={(e) => set('cliente', e.target.value)} opciones={datos.activos.map((p) => ({ valor: p.id, texto: p.razonSocial }))} />
      </header>
      <Card>
        <Tabs
          etiqueta="Estado de validación"
          className="mb-4"
          valor={vista}
          onCambiar={(v) => set('vista', v === 'pendientes' ? null : v)}
          tabs={[
            { valor: 'pendientes', texto: 'Para validar', cantidad: datos.pendientes.length },
            { valor: 'observadas', texto: 'Observadas', cantidad: datos.observadas.length },
            { valor: 'validadas', texto: 'Validadas', cantidad: datos.validadas.length },
            { valor: 'sin_receta', texto: 'Sin receta', cantidad: datos.sinReceta.length },
          ]}
        />
        <Table
          etiqueta="Aplicaciones"
          columnas={columnas}
          filas={filas}
          claveFila={(p) => p.id}
          filaActiva={id}
          onFila={(p) => navigate({ pathname: `/ingeniero/aplicaciones/${p.id}`, search: params.toString() })}
          vacio={<EmptyState icono="sello" titulo={vista === 'pendientes' ? 'No hay aplicaciones para validar' : 'Nada en esta bandeja'} texto="Cuando un cliente conforme una aplicación, te llega acá." />}
          tarjetaMovil={(p) => (
            <div className="rounded-xl border border-borde bg-superficie p-3">
              <p className="font-semibold">{p.numero} · {cat.lote(p.loteId)?.nombre}</p>
              <p className="text-xs text-texto-suave">{cat.productor(p.productorId)?.razonSocial} · {fecha(p.fecha)}</p>
            </div>
          )}
        />
      </Card>
      <p className="flex items-start gap-2 rounded-xl bg-paper-2 p-3 text-sm text-texto-suave"><Icon nombre="info" tamano={16} className="mt-0.5 shrink-0" />{NOTA_VALIDACION_PROFESIONAL}.</p>
      {seleccion ? <DetalleAplicacion parte={seleccion} onCerrar={() => navigate({ pathname: '/ingeniero/aplicaciones', search: params.toString() })} /> : null}
    </div>
  )
}

function DetalleAplicacion({ parte, onCerrar }: { parte: ParteLabor; onCerrar: () => void }) {
  const cat = useCatalogo()
  const { ing } = useAgronomia()
  const validar = useDemo((s) => s.validarAplicacion)
  const observar = useDemo((s) => s.observarAplicacion)
  const [modal, setModal] = useState<'validar' | 'observar' | null>(null)
  const lote = cat.lote(parte.loteId)
  const receta = cat.receta(parte.recetaId)
  const hallazgos = evaluarParte(parte, cat.insumos, lote, receta).filter((h) => h.codigo !== 'has_excedidas')
  const [motivos, setMotivos] = useState<CodigoHallazgo[]>(hallazgos.map((h) => h.codigo))
  const [nota, setNota] = useState(() => {
    const dosis = hallazgos.find((h) => h.codigo === 'dosis_alta')
    if (dosis) return `${dosis.texto} Revisá si es un error de carga; la receta ${receta?.numero ?? ''} indica ${receta?.productos.map((p) => `${num(p.dosis)} ${cat.insumo(p.insumoId)?.unidad ?? ''}`).join(' + ') ?? ''}.`
    return hallazgos.map((h) => h.texto).join(' ')
  })
  const [declaro, setDeclaro] = useState(false)
  const [notaValidacion, setNotaValidacion] = useState('')
  const estado = parte.validacion?.estado
  const contratista = cat.contratista(parte.contratistaId)

  const pie =
    estado === 'pendiente' ? (
      <>
        <Button variante="secundario" icono="alerta" onClick={() => setModal('observar')} data-tour="observar-aplicacion">Observar</Button>
        <Button icono="sello" onClick={() => setModal('validar')} data-tour="validar-aplicacion">Validar y firmar</Button>
      </>
    ) : !parte.recetaId ? (
      <ButtonLink to={`/ingeniero/recetas?nueva=1&parte=${parte.id}`} icono="receta" data-tour="emitir-receta-parte">Emitir receta para esta aplicación</ButtonLink>
    ) : undefined

  return (
    <>
      <Modal abierto onCerrar={onCerrar} variante="lateral" titulo={`Aplicación ${parte.numero}`} descripcion={`${cat.productor(parte.productorId)?.razonSocial ?? ''} · ${cat.establecimiento(parte.establecimientoId)?.nombre ?? ''} · ${lote?.nombre ?? ''}`} pie={pie}>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <EstadoParteChip estado={parte.estado} />
            {parte.validacion ? <EstadoValidacionChip estado={parte.validacion.estado} /> : null}
          </div>

          {parte.validacion?.estado === 'observada' ? (
            <p className="rounded-xl bg-trigo-50 p-3 text-sm ring-1 ring-inset ring-trigo-200"><strong>La observaste el {fechaHora(parte.validacion.fecha ?? '')}:</strong> {parte.validacion.nota} Esperando corrección de {contratista?.razonSocial}.</p>
          ) : null}
          {parte.validacion?.estado === 'validada' ? (
            <p className="flex items-center gap-2 rounded-xl bg-verde-50 p-3 text-sm text-verde-900 ring-1 ring-inset ring-verde-200"><Icon nombre="sello" tamano={18} /> Validada {parte.validacion.fecha ? `el ${fechaHora(parte.validacion.fecha)}` : ''}. El cuaderno muestra tu sello.</p>
          ) : null}
          {parte.historial.some((e) => e.actor === 'contratista' && e.nota?.startsWith('Corregí')) ? (
            <p className="rounded-xl bg-cielo-50 p-3 text-sm ring-1 ring-inset ring-cielo-200"><strong>Corrección del contratista:</strong> {[...parte.historial].reverse().find((e) => e.nota?.startsWith('Corregí'))?.nota}</p>
          ) : null}

          <section aria-labelledby="t-controles">
            <h3 id="t-controles" className="mb-1.5 font-sans text-sm font-semibold">Controles automáticos</h3>
            {hallazgos.length ? (
              <ul className="space-y-1.5">
                {hallazgos.map((h) => (
                  <li key={h.codigo + h.texto} className={cx('flex items-start gap-2 rounded-xl p-2.5 text-sm ring-1 ring-inset', h.severidad === 'peligro' ? 'bg-rojo-50 text-rojo-900 ring-rojo-200' : 'bg-trigo-50 text-trigo-900 ring-trigo-200')}>
                    <Icon nombre="alerta" tamano={16} className="mt-0.5 shrink-0" />{h.texto}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 rounded-xl bg-verde-50 p-2.5 text-sm text-verde-900"><Icon nombre="checkCirculo" tamano={16} /> Dosis, condiciones y receta dentro de lo indicado.</p>
            )}
            <p className="mt-1 text-xs text-texto-suave">Orientativos: no reemplazan tu criterio profesional.</p>
          </section>

          <section aria-labelledby="t-comparacion">
            <h3 id="t-comparacion" className="mb-1.5 font-sans text-sm font-semibold">Aplicado vs. receta {receta ? receta.numero : ''}</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borde text-left text-xs text-texto-suave">
                  <th className="py-1.5 font-semibold">Producto</th>
                  <th className="py-1.5 text-right font-semibold">Aplicado</th>
                  <th className="py-1.5 text-right font-semibold">Receta</th>
                  <th className="py-1.5 text-right font-semibold">Rango ref.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {parte.insumos.map((ia) => {
                  const ins = cat.insumo(ia.insumoId)
                  const enReceta = receta?.productos.find((r) => r.insumoId === ia.insumoId)
                  const fuera = ins?.dosisMax !== undefined && (ia.dosis > ins.dosisMax || ia.dosis < (ins.dosisMin ?? 0))
                  return (
                    <tr key={ia.insumoId}>
                      <td className="py-1.5">{ins?.nombre}</td>
                      <td className={cx('num py-1.5 text-right font-semibold', fuera && 'text-rojo-700')}>{num(ia.dosis)} {ins?.unidad}</td>
                      <td className="num py-1.5 text-right">{enReceta ? `${num(enReceta.dosis)} ${ins?.unidad ?? ''}` : '—'}</td>
                      <td className="num py-1.5 text-right text-texto-suave">{ins?.dosisMin !== undefined ? `${num(ins.dosisMin)}–${num(ins.dosisMax ?? 0)}` : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {receta ? <p className="mt-2 text-xs text-texto-suave">{receta.objetivo} · {receta.condiciones}</p> : <p className="mt-2 text-sm font-semibold text-rojo-700">Sin receta asociada.</p>}
          </section>

          {parte.condiciones ? (
            <dl className="grid grid-cols-4 gap-2 rounded-xl bg-paper-2 p-3 text-center text-sm">
              <div><dt className="text-xs text-texto-suave">Caldo</dt><dd className="num font-semibold">{parte.condiciones.caldo} l/ha</dd></div>
              <div><dt className="text-xs text-texto-suave">Viento</dt><dd className={cx('num font-semibold', parte.condiciones.viento > UMBRALES.vientoMax && 'text-rojo-700')}>{parte.condiciones.viento} km/h {parte.condiciones.direccionViento}</dd></div>
              <div><dt className="text-xs text-texto-suave">Temp.</dt><dd className="num font-semibold">{parte.condiciones.temperatura} °C</dd></div>
              <div><dt className="text-xs text-texto-suave">HR</dt><dd className={cx('num font-semibold', parte.condiciones.humedad < UMBRALES.humedadMin && 'text-rojo-700')}>{parte.condiciones.humedad} %</dd></div>
            </dl>
          ) : null}

          <section>
            <h3 className="mb-1.5 font-sans text-sm font-semibold">Registro del contratista</h3>
            <p className="text-sm">{contratista?.razonSocial} · {parte.operario} · {fecha(parte.fecha)} {parte.horaInicio}–{parte.horaFin} · {num(parte.has, 1)} has</p>
            {parte.fotos.length ? <div className="mt-2 grid grid-cols-3 gap-2">{parte.fotos.map((f) => <FotoIlustrada key={f.id} foto={f} pie={f.descripcion} />)}</div> : null}
          </section>
        </div>
      </Modal>

      <Modal
        abierto={modal === 'validar'}
        onCerrar={() => setModal(null)}
        titulo={`Validar ${parte.numero}`}
        descripcion="Tu validación queda registrada en el cuaderno del productor con tu nombre y matrícula."
        pie={
          <>
            <Button variante="fantasma" onClick={() => setModal(null)}>Cancelar</Button>
            <Button
              icono="sello"
              disabled={!declaro}
              onClick={() => {
                validar(parte.id, notaValidacion || undefined)
                setModal(null)
                toast.ok(`${parte.numero} validada`, 'El cuaderno del productor ya muestra tu sello.')
              }}
              data-tour="confirmar-validacion"
            >
              Firmar validación
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {hallazgos.length ? <p className="rounded-xl bg-trigo-50 p-3 text-sm text-trigo-900">Los controles marcan {hallazgos.length} {hallazgos.length === 1 ? 'alerta' : 'alertas'}. Si validás igual, dejá constancia en la nota.</p> : null}
          <Textarea label="Nota profesional" opcional value={notaValidacion} onChange={(e) => setNotaValidacion(e.target.value)} rows={2} placeholder="Ej.: dosis y condiciones conformes a la receta." />
          <Checkbox
            tour="declaro-validacion"
            checked={declaro}
            onChange={(e) => setDeclaro(e.target.checked)}
            label={`Firmo como Ing. Agr. ${ing?.nombre ?? ''} – ${ing?.matricula ?? ''}`}
            descripcion="Declaro haber revisado la aplicación. La validación profesional la ejerce el ingeniero matriculado; la plataforma solo la registra."
          />
        </div>
      </Modal>

      <Modal
        abierto={modal === 'observar'}
        onCerrar={() => setModal(null)}
        titulo={`Observar ${parte.numero}`}
        descripcion="El contratista y el productor reciben la observación. Al corregir, vuelve a tu bandeja."
        pie={
          <>
            <Button variante="fantasma" onClick={() => setModal(null)}>Cancelar</Button>
            <Button
              icono="alerta"
              disabled={motivos.length === 0 || !nota.trim()}
              onClick={() => {
                observar(parte.id, motivos, nota)
                setModal(null)
                toast.ok('Observación enviada', `${contratista?.razonSocial ?? 'El contratista'} recibió la alerta.`)
              }}
              data-tour="confirmar-observacion-ing"
            >
              Enviar observación
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Motivos</legend>
            {MOTIVOS_INGENIERO.map((m) => (
              <Checkbox key={m.codigo} label={m.texto} checked={motivos.includes(m.codigo)} onChange={(e) => setMotivos(e.target.checked ? [...motivos, m.codigo] : motivos.filter((x) => x !== m.codigo))} />
            ))}
          </fieldset>
          <Textarea label="Detalle para el contratista" value={nota} onChange={(e) => setNota(e.target.value)} rows={3} />
        </div>
      </Modal>
    </>
  )
}
