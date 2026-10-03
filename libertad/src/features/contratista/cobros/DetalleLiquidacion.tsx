import { useState } from 'react'
import { useParams } from 'react-router'
import { EncabezadoMovil } from '@/app/EncabezadoMovil'
import { cobrado, diasVencida, estadoCobro, saldo, total } from '@/domain/cobranza'
import { etiquetaCondicionPago, etiquetaMedioPago, fecha, pesos, relativo } from '@/domain/format'
import { diasHasta } from '@/domain/reloj'
import type { ItemLiquidacion } from '@/domain/types'
import { useContratista } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, ButtonLink } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { InputNumero } from '@/ui/InputNumero'
import { Modal } from '@/ui/Modal'
import { EstadoCobroChip, EstadoLiquidacionChip } from '@/ui/StatusChip'
import { toast } from '@/ui/toast-store'
import { ChatWhatsApp } from '../../cobranza/ChatWhatsApp'
import { HiloDisputa } from '../../cobranza/HiloDisputa'
import { AbrirDisputaModal, RegistrarCobroModal } from '../../cobranza/Modales'
import { CobrarAlInstante, NotaLegalCobranza, TablaLiquidacion } from '../../cobranza/piezas'
import { RecordatoriosProgramados } from '../../cobranza/Recordatorios'
import { ReputacionPago } from '../../cobranza/ReputacionPago'

export function DetalleLiquidacion() {
  const { id } = useParams()
  const c = useContratista()
  const cat = useCatalogo()
  const liq = useDemo((s) => s.liquidaciones.find((l) => l.id === id))
  const disputa = useDemo((s) => s.disputas.find((d) => d.liquidacionId === id))
  const [modal, setModal] = useState<'cobro' | 'whatsapp' | 'disputa' | 'corregir' | null>(null)

  if (!liq || !c || liq.contratistaId !== c.id) {
    return (
      <>
        <EncabezadoMovil titulo="Liquidación" volver="/contratista/cobros?vista=seguimiento" />
        <div className="p-4"><EmptyState icono="billetera" titulo="No encontramos esta liquidación" /></div>
      </>
    )
  }
  const p = cat.productor(liq.productorId)
  const e = estadoCobro(liq)
  const dias = diasHasta(liq.vencimiento)
  const restante = saldo(liq)
  const abierta = liq.estado !== 'cobrada' && liq.estado !== 'en_disputa'

  return (
    <>
      <EncabezadoMovil titulo={liq.numero} subtitulo={p?.razonSocial} volver="/contratista/cobros?vista=seguimiento" />
      <div className="space-y-4 px-4 py-4">
        <Card className={cx(e === 'vencido' && 'ring-2 ring-rojo-200')}>
          <div className="flex flex-wrap gap-1.5">
            <EstadoCobroChip estado={e} tamano="md" />
            <EstadoLiquidacionChip estado={liq.estado} />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-texto-suave">{e === 'cobrado' ? 'Total cobrado' : 'Saldo a cobrar'}</p>
          <p className="text-3xl font-semibold text-tierra-900">{pesos(e === 'cobrado' ? total(liq) : restante)}</p>
          <p className="num mt-1 text-sm text-texto-suave">
            Total {pesos(total(liq))}{cobrado(liq) ? ` · cobrado ${pesos(cobrado(liq))}` : ''}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-borde pt-3 text-sm">
            <div><dt className="text-xs text-texto-suave">Condición</dt><dd className="font-semibold">{etiquetaCondicionPago[liq.condicion]}</dd></div>
            <div>
              <dt className="text-xs text-texto-suave">Vencimiento</dt>
              <dd className={cx('font-semibold', e === 'vencido' && 'text-rojo-700')}>{fecha(liq.vencimiento)} · {e === 'vencido' ? `hace ${diasVencida(liq)} días` : e === 'cobrado' ? 'cobrada' : relativo(dias)}</dd>
            </div>
            <div><dt className="text-xs text-texto-suave">Emitida</dt><dd className="font-semibold">{fecha(liq.fechaEmision)}</dd></div>
            <div><dt className="text-xs text-texto-suave">Período</dt><dd className="font-semibold">{liq.periodo}</dd></div>
          </dl>
        </Card>

        {liq.estado === 'pago_informado' && liq.pagoInformado ? (
          <div className="rounded-2xl bg-cielo-50 p-4 ring-1 ring-inset ring-cielo-200" role="status" data-tour="pago-informado">
            <p className="font-semibold text-cielo-900">{p?.razonSocial} informó el pago</p>
            <p className="num mt-1 text-sm">{pesos(liq.pagoInformado.monto)} por {etiquetaMedioPago[liq.pagoInformado.medio]} el {fecha(liq.pagoInformado.fecha)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-texto-suave"><Icon nombre="clip" tamano={14} /> {liq.pagoInformado.comprobante}</p>
            <Button className="mt-3" bloque icono="check" onClick={() => setModal('cobro')} data-tour="registrar-cobro">Confirmar y registrar cobro</Button>
          </div>
        ) : null}

        {liq.estado === 'observada' ? (
          <div className="rounded-2xl bg-trigo-50 p-4 ring-1 ring-inset ring-trigo-300" role="alert">
            <p className="font-semibold text-trigo-900">{p?.razonSocial} observó la liquidación</p>
            <p className="mt-1 text-sm">“{liq.observacion}”</p>
            <Button className="mt-3" bloque icono="editar" onClick={() => setModal('corregir')}>Corregir y reenviar</Button>
          </div>
        ) : null}
        {liq.estado === 'emitida' ? <p className="rounded-xl bg-cielo-50 p-3 text-sm text-cielo-900">Esperando que {p?.razonSocial} la acepte.</p> : null}

        {abierta && liq.estado !== 'pago_informado' ? (
          <div className="grid gap-2">
            <Button variante="secundario" icono="chat" onClick={() => setModal('whatsapp')} data-tour="abrir-whatsapp">Enviar recordatorio por WhatsApp</Button>
            <Button icono="check" onClick={() => setModal('cobro')} data-tour="registrar-cobro">Registrar cobro</Button>
          </div>
        ) : null}

        {disputa ? <HiloDisputa disputa={disputa} rol="contratista" nombre={c.titular} /> : null}
        {e === 'vencido' && !disputa ? (
          <Button variante="fantasma" bloque icono="balanza" onClick={() => setModal('disputa')} data-tour="abrir-disputa">
            Pedir intervención de la red (abrir disputa)
          </Button>
        ) : null}

        <Card>
          <h2 className="mb-2 font-serif text-lg text-tierra-900">Detalle</h2>
          <TablaLiquidacion liq={liq} compacta />
          <ButtonLink to={`/imprimir/liquidacion/${liq.id}`} variante="suave" tamano="sm" icono="documento" className="mt-3">Ver comprobante</ButtonLink>
        </Card>

        {liq.cobros.length ? (
          <Card>
            <h2 className="mb-2 font-serif text-lg text-tierra-900">Cobros registrados</h2>
            <ul className="divide-y divide-borde text-sm">
              {liq.cobros.map((cb) => (
                <li key={cb.id} className="flex justify-between gap-3 py-2">
                  <span>{fecha(cb.fecha)} · {etiquetaMedioPago[cb.medio]}{cb.comprobante ? <span className="block text-xs text-texto-suave">{cb.comprobante}</span> : null}</span>
                  <span className="num font-semibold text-verde-800">{pesos(cb.monto)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <Card>
          <RecordatoriosProgramados liq={liq} />
        </Card>

        <ReputacionPago productorId={liq.productorId} contratistaId={c.id} />
        {liq.estado === 'aceptada' ? <CobrarAlInstante compacto /> : null}
        <NotaLegalCobranza />
      </div>

      {modal === 'cobro' ? <RegistrarCobroModal liq={liq} onCerrar={() => setModal(null)} /> : null}
      {modal === 'disputa' ? <AbrirDisputaModal liq={liq} por="contratista" onCerrar={() => setModal(null)} /> : null}
      {modal === 'corregir' ? <CorregirLiquidacion items={liq.items} alicuota={liq.alicuotaIva} id={liq.id} onCerrar={() => setModal(null)} /> : null}
      <Modal abierto={modal === 'whatsapp'} onCerrar={() => setModal(null)} titulo="Recordatorio de pago" descripcion="Simulación: no se envían mensajes reales.">
        <div className="-mx-2">
          <ChatWhatsApp liq={liq} />
        </div>
      </Modal>
    </>
  )
}

function CorregirLiquidacion({ id, items: iniciales, alicuota, onCerrar }: { id: string; items: ItemLiquidacion[]; alicuota: number; onCerrar: () => void }) {
  const corregir = useDemo((s) => s.corregirLiquidacion)
  const [items, setItems] = useState(iniciales.map((i) => ({ ...i })))
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo="Corregir liquidación"
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button icono="enviar" onClick={() => { corregir(id, items, alicuota); toast.ok('Liquidación corregida y reenviada'); onCerrar() }}>Reenviar</Button>
        </>
      }
    >
      <div className="space-y-3">
        {items.map((i) => (
          <InputNumero key={i.id} label={i.descripcion} valor={i.precioUnitario} onValor={(n) => setItems(items.map((x) => (x.id === i.id ? { ...x, precioUnitario: n } : x)))} prefijo="$" sufijo={`/${i.unidad}`} />
        ))}
      </div>
    </Modal>
  )
}
