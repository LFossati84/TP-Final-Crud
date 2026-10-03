import { useState } from 'react'
import { etiquetaRol, fecha, pesos } from '@/domain/format'
import type { Disputa } from '@/domain/types'
import { HiloDisputa } from '@/features/cobranza/HiloDisputa'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { OpcionesGrandes, Textarea } from '@/ui/FormField'
import { Modal } from '@/ui/Modal'
import { Tabs } from '@/ui/Tabs'
import { toast } from '@/ui/toast-store'

const ESTADO = { abierta: { tono: 'rojo', texto: 'Abierta' }, en_mediacion: { tono: 'trigo', texto: 'En mediación' }, resuelta: { tono: 'verde', texto: 'Resuelta' } } as const

export function DisputasAdmin() {
  const disputas = useDemo((s) => s.disputas)
  const cat = useCatalogo()
  const [filtro, setFiltro] = useState<'activas' | 'resueltas'>('activas')
  const [sel, setSel] = useState<string | null>(null)
  const lista = disputas.filter((d) => (filtro === 'activas' ? d.estado !== 'resuelta' : d.estado === 'resuelta')).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const actual = disputas.find((d) => d.id === sel)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl text-tierra-900">Disputas</h1>
        <p className="text-texto-suave">La mesa de ayuda de la red media entre productores y contratistas sobre partes y liquidaciones.</p>
      </header>
      <Tabs etiqueta="Estado" valor={filtro} onCambiar={setFiltro} tabs={[{ valor: 'activas', texto: 'Activas', cantidad: disputas.filter((d) => d.estado !== 'resuelta').length }, { valor: 'resueltas', texto: 'Resueltas', cantidad: disputas.filter((d) => d.estado === 'resuelta').length }]} />
      {lista.length === 0 ? <EmptyState icono="balanza" titulo={filtro === 'activas' ? 'No hay disputas activas' : 'Todavía no se resolvió ninguna'} /> : null}
      <ul className="grid gap-4 lg:grid-cols-2">
        {lista.map((d) => {
          const e = ESTADO[d.estado]
          return (
            <li key={d.id}>
              <Card interactiva className="relative h-full" data-tour={`disputa-${d.numero}`}>
                <div className="flex items-start justify-between gap-2">
                  <button type="button" onClick={() => setSel(d.id)} className="text-left after:absolute after:inset-0">
                    <span className="block font-serif text-xl text-tierra-900">{d.numero}{d.monto ? ` · ${pesos(d.monto)}` : ''}</span>
                    <span className="block text-sm text-texto-suave">{cat.contratista(d.contratistaId)?.razonSocial} ↔ {cat.productor(d.productorId)?.razonSocial}</span>
                  </button>
                  <Chip tono={e.tono} icono="balanza">{e.texto}</Chip>
                </div>
                <p className="mt-2 line-clamp-2 text-sm">{d.motivo}</p>
                <p className="mt-2 text-xs text-texto-suave">Abierta por {etiquetaRol[d.abiertaPor].toLowerCase()} el {fecha(d.fecha)} · {d.mensajes.length} mensajes</p>
              </Card>
            </li>
          )
        })}
      </ul>
      {actual ? <DetalleDisputa d={actual} onCerrar={() => setSel(null)} /> : null}
    </div>
  )
}

const RESOLUCIONES = [
  { valor: 'pago', texto: 'Pago total acordado', detalle: 'El productor paga el saldo en una fecha cierta' },
  { valor: 'descuento', texto: 'Descuento acordado', detalle: 'Se ajusta el monto por el daño o diferencia' },
  { valor: 'plan', texto: 'Plan de pagos', detalle: 'Se divide el saldo en cuotas' },
  { valor: 'sin_acuerdo', texto: 'Sin acuerdo', detalle: 'Se cierra la mediación y cada parte sigue por su vía' },
] as const

function DetalleDisputa({ d, onCerrar }: { d: Disputa; onCerrar: () => void }) {
  const cat = useCatalogo()
  const intervenir = useDemo((s) => s.intervenirDisputa)
  const resolver = useDemo((s) => s.resolverDisputa)
  const liq = useDemo((s) => s.liquidaciones.find((l) => l.id === d.liquidacionId))
  const parte = useDemo((s) => s.partes.find((p) => p.id === d.parteId))
  const [modal, setModal] = useState<'intervenir' | 'resolver' | null>(null)
  const [texto, setTexto] = useState('Tomamos la mediación. En 48 h hábiles proponemos un acuerdo; mientras tanto les pedimos que compartan acá la documentación que respalde cada posición.')
  const [tipo, setTipo] = useState<(typeof RESOLUCIONES)[number]['valor']>('pago')
  const [detalle, setDetalle] = useState('El productor abona el saldo total el 22/10/2026 por transferencia; el contratista retira la disputa.')
  const c = cat.contratista(d.contratistaId)
  const p = cat.productor(d.productorId)

  return (
    <>
      <Modal
        abierto
        onCerrar={onCerrar}
        variante="lateral"
        titulo={`Disputa ${d.numero}`}
        descripcion={`${c?.razonSocial ?? ''} ↔ ${p?.razonSocial ?? ''}`}
        pie={
          d.estado !== 'resuelta' ? (
            <>
              {d.estado === 'abierta' ? <Button variante="secundario" icono="balanza" onClick={() => setModal('intervenir')} data-tour="intervenir-disputa">Intervenir</Button> : null}
              <Button icono="check" onClick={() => setModal('resolver')} data-tour="resolver-disputa">Registrar resolución</Button>
            </>
          ) : undefined
        }
      >
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-paper-2 p-3 text-sm">
            <div><dt className="text-xs text-texto-suave">Monto en discusión</dt><dd className="font-semibold">{d.monto ? pesos(d.monto) : '—'}</dd></div>
            <div><dt className="text-xs text-texto-suave">Abierta</dt><dd className="font-semibold">{fecha(d.fecha)} por {etiquetaRol[d.abiertaPor].toLowerCase()}</dd></div>
            {liq ? <div><dt className="text-xs text-texto-suave">Liquidación</dt><dd className="font-semibold">{liq.numero} · vence {fecha(liq.vencimiento)}</dd></div> : null}
            {parte ? <div><dt className="text-xs text-texto-suave">Parte</dt><dd className="font-semibold">{parte.numero} · {cat.lote(parte.loteId)?.nombre}</dd></div> : null}
          </dl>
          {parte?.condiciones ? <p className="text-sm text-texto-suave">Condiciones registradas en el parte: viento {parte.condiciones.viento} km/h {parte.condiciones.direccionViento}, HR {parte.condiciones.humedad} %.{parte.validacion?.estado === 'observada' ? ` El ingeniero la había observado: ${parte.validacion.nota}` : ''}</p> : null}
          <HiloDisputa disputa={d} rol="admin" nombre="Mesa de ayuda Libertad" />
          <p className="text-xs text-texto-suave">La red facilita el acuerdo; no reemplaza instancias legales ni pericias técnicas.</p>
        </div>
      </Modal>

      <Modal
        abierto={modal === 'intervenir'}
        onCerrar={() => setModal(null)}
        titulo="Tomar la mediación"
        tamano="sm"
        pie={
          <>
            <Button variante="fantasma" onClick={() => setModal(null)}>Cancelar</Button>
            <Button icono="enviar" onClick={() => { intervenir(d.id, texto); setModal(null); toast.ok('Mediación iniciada', 'Avisamos a ambas partes.') }} data-tour="confirmar-intervencion">Enviar a las partes</Button>
          </>
        }
      >
        <Textarea label="Mensaje a ambas partes" value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} />
      </Modal>

      <Modal
        abierto={modal === 'resolver'}
        onCerrar={() => setModal(null)}
        titulo="Registrar resolución"
        pie={
          <>
            <Button variante="fantasma" onClick={() => setModal(null)}>Cancelar</Button>
            <Button
              icono="check"
              disabled={!detalle.trim()}
              onClick={() => {
                resolver(d.id, `${RESOLUCIONES.find((r) => r.valor === tipo)?.texto ?? ''}. ${detalle}`)
                setModal(null)
                toast.ok(`${d.numero} resuelta`, 'La liquidación vuelve a seguimiento normal.')
              }}
              data-tour="confirmar-resolucion"
            >
              Cerrar disputa
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <OpcionesGrandes label="Resultado" columnas={1} valor={tipo} onCambiar={setTipo} opciones={RESOLUCIONES.map((r) => ({ valor: r.valor, texto: r.texto, detalle: r.detalle }))} />
          <Textarea label="Detalle del acuerdo" value={detalle} onChange={(e) => setDetalle(e.target.value)} rows={3} />
        </div>
      </Modal>
    </>
  )
}
