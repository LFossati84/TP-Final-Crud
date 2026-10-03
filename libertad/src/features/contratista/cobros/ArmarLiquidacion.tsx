import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { EncabezadoMovil } from '@/app/EncabezadoMovil'
import { IVA_SUGERIDO, iva, subtotal, tarifaPara, total, vencimientoSugerido } from '@/domain/cobranza'
import { etiquetaCondicionPago, etiquetaLabor, fecha, mesLargo, num, pesos } from '@/domain/format'
import { HOY } from '@/domain/reloj'
import type { CondicionPago, ItemLiquidacion, UnidadTarifa } from '@/domain/types'
import { nuevoId } from '@/store/helpers'
import { useContratista } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { EmptyState } from '@/ui/EmptyState'
import { Input, Select, Toggle } from '@/ui/FormField'
import { InputNumero } from '@/ui/InputNumero'
import { Modal } from '@/ui/Modal'
import { toast } from '@/ui/toast-store'
import { Comprobante } from '../../cobranza/Comprobante'
import { NotaLegalCobranza } from '../../cobranza/piezas'
import { ReputacionPago } from '../../cobranza/ReputacionPago'

const CONDICIONES: CondicionPago[] = ['contado', 'transferencia', '15_dias', '30_dias', '60_dias', 'cheque_a_fecha', 'echeq']

export function ArmarLiquidacion() {
  const c = useContratista()
  const cat = useCatalogo()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const todas = useDemo((s) => s.partes)
  const crear = useDemo((s) => s.crearLiquidacion)
  const ids = (params.get('partes') ?? '').split(',').filter(Boolean)
  const partes = todas.filter((p) => ids.includes(p.id) && p.contratistaId === c?.id && p.estado === 'conformado' && !p.liquidacionId)
  const productor = partes[0] ? cat.productor(partes[0].productorId) : undefined

  const [items, setItems] = useState<ItemLiquidacion[]>(() =>
    partes.map((p) => {
      const t = c ? tarifaPara(c, p.labor) : { precio: 0, unidad: 'ha' as UnidadTarifa }
      return {
        id: nuevoId('it'),
        parteId: p.id,
        descripcion: `${etiquetaLabor[p.labor]} · ${cat.lote(p.loteId)?.nombre ?? ''} (${p.numero})`,
        unidad: t.unidad,
        cantidad: t.unidad === 'ha' ? p.has : p.horas,
        precioUnitario: t.precio,
      }
    }),
  )
  const [alicuota, setAlicuota] = useState(IVA_SUGERIDO)
  const [condicion, setCondicion] = useState<CondicionPago>('30_dias')
  const [vencimiento, setVencimiento] = useState(vencimientoSugerido(HOY, '30_dias'))
  const [recordatorios, setRecordatorios] = useState(true)
  const establecimientos = [...new Set(partes.map((p) => cat.establecimiento(p.establecimientoId)?.nombre))].join(' y ')
  const [periodo, setPeriodo] = useState(`${mesLargo(Number(HOY.slice(5, 7))).replace(/^./, (x) => x.toUpperCase())} ${HOY.slice(0, 4)} · ${establecimientos}`)
  const [vistaPrevia, setVistaPrevia] = useState(false)

  if (!c || !productor || partes.length === 0) {
    return (
      <>
        <EncabezadoMovil titulo="Nueva liquidación" volver="/contratista/cobros" />
        <div className="p-4">
          <EmptyState icono="billetera" titulo="No hay partes seleccionados" texto="Elegí partes conformados de un mismo productor en Cobros." />
        </div>
      </>
    )
  }

  const liqParcial = { items, alicuotaIva: alicuota }
  const cambiarItem = (id: string, cambios: Partial<ItemLiquidacion>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...cambios } : x)))

  const enviar = () => {
    const liq = crear({ contratistaId: c.id, productorId: productor.id, periodo, items, alicuotaIva: alicuota, condicion, vencimiento, recordatoriosAutomaticos: recordatorios })
    toast.ok(`Liquidación ${liq.numero} enviada`, `${productor.razonSocial} la recibe para aceptarla.`)
    navigate(`/contratista/cobros/${liq.id}`, { replace: true })
  }

  return (
    <>
      <EncabezadoMovil titulo="Nueva liquidación" subtitulo={productor.razonSocial} volver="/contratista/cobros" />
      <div className="space-y-5 px-4 py-4">
        <section aria-labelledby="t-items">
          <h2 id="t-items" className="mb-2 font-sans text-sm font-semibold">Partes conformados ({items.length})</h2>
          <ul className="space-y-2">
            {items.map((i) => {
              const parte = partes.find((p) => p.id === i.parteId)
              return (
                <li key={i.id} className="rounded-2xl border border-borde bg-superficie p-3">
                  <p className="text-sm font-semibold">{i.descripcion}</p>
                  <div className="mt-2 grid grid-cols-[1fr_7.5rem] gap-2">
                    <InputNumero label="Tarifa (sin IVA)" valor={i.precioUnitario} onValor={(n) => cambiarItem(i.id, { precioUnitario: n })} prefijo="$" />
                    <Select
                      label="Unidad"
                      value={i.unidad}
                      onChange={(e) => {
                        const unidad = e.target.value === 'hora' ? 'hora' : 'ha'
                        cambiarItem(i.id, { unidad, cantidad: unidad === 'ha' ? (parte?.has ?? i.cantidad) : (parte?.horas ?? i.cantidad) })
                      }}
                      opciones={[{ valor: 'ha', texto: 'por ha' }, { valor: 'hora', texto: 'por hora' }]}
                    />
                  </div>
                  <p className="num mt-2 flex justify-between text-sm">
                    <span className="text-texto-suave">{num(i.cantidad, 1)} {i.unidad === 'ha' ? 'has' : 'h'} × {pesos(i.precioUnitario)}</span>
                    <span className="font-semibold">{pesos(i.cantidad * i.precioUnitario)}</span>
                  </p>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-borde-fuerte bg-superficie p-4" aria-label="Totales" data-tour="totales-liquidacion">
          <dl className="num space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-texto-suave">Subtotal</dt><dd>{pesos(subtotal(liqParcial))}</dd></div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-texto-suave">
                IVA
                <InputNumero label={<span className="sr-only">Alícuota de IVA</span>} valor={alicuota} onValor={setAlicuota} sufijo="%" className="w-24 [&_input]:min-h-9 [&_input]:py-1" />
              </dt>
              <dd>{pesos(iva(liqParcial))}</dd>
            </div>
            <div className="flex justify-between border-t border-borde pt-2 text-lg font-semibold"><dt>Total</dt><dd>{pesos(total(liqParcial))}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-texto-suave">La alícuota es editable. Validá el tratamiento impositivo con tu contador.</p>
        </section>

        <section className="space-y-3">
          <Select
            label="Condición de pago"
            value={condicion}
            onChange={(e) => {
              const v = e.target.value as CondicionPago
              setCondicion(v)
              setVencimiento(vencimientoSugerido(HOY, v))
            }}
            opciones={CONDICIONES.map((x) => ({ valor: x, texto: etiquetaCondicionPago[x] }))}
          />
          <Input label="Vencimiento" type="date" min={HOY} value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} hint={`Vence el ${fecha(vencimiento)}`} />
          <Input label="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
          <Toggle label="Recordatorios automáticos" descripcion="WhatsApp 3 días antes, el día del vencimiento y 7 días después." activo={recordatorios} onCambiar={setRecordatorios} />
        </section>

        <ReputacionPago productorId={productor.id} contratistaId={c.id} />
        <NotaLegalCobranza />

        <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-borde bg-superficie/95 px-4 py-3 backdrop-blur">
          <Button variante="secundario" icono="ojo" onClick={() => setVistaPrevia(true)} data-tour="vista-previa-comprobante">Vista previa</Button>
          <Button className="flex-1" icono="enviar" onClick={enviar} disabled={items.some((i) => !(i.precioUnitario > 0))} data-tour="enviar-liquidacion">Enviar liquidación</Button>
        </div>
      </div>

      <Modal abierto={vistaPrevia} onCerrar={() => setVistaPrevia(false)} titulo="Comprobante de liquidación" descripcion="Así lo va a ver el productor." tamano="lg">
        <div className="-mx-5 -my-4">
          <Comprobante borrador liq={{ items, alicuotaIva: alicuota, condicion, vencimiento, periodo, fechaEmision: HOY }} c={c} p={productor} className="!p-4 !text-[11px]" />
        </div>
      </Modal>
    </>
  )
}
