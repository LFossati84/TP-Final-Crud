import { iva, LEYENDA_COMPROBANTE, NOTA_COBRANZA, subtotal, total } from '@/domain/cobranza'
import { etiquetaUnidad, num, pesos } from '@/domain/format'
import type { Liquidacion } from '@/domain/types'
import { cx } from '@/ui/cx'
import { Chip } from '@/ui/Chip'
import { Icon } from '@/ui/Icon'

/** Nota legal obligatoria del módulo de cobranza. */
export function NotaLegalCobranza({ className }: { className?: string }) {
  return (
    <p className={cx('flex items-start gap-2 rounded-xl bg-paper-2 p-3 text-xs text-texto-suave', className)} role="note">
      <Icon nombre="info" tamano={14} className="mt-0.5 shrink-0" />
      {NOTA_COBRANZA}.
    </p>
  )
}

export function LeyendaComprobante() {
  return <p className="text-xs font-semibold uppercase tracking-wide text-rojo-800">{LEYENDA_COMPROBANTE}</p>
}

/** Placeholder de producto futuro: adelanto de liquidación. */
export function CobrarAlInstante({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className={cx('flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-borde-fuerte bg-superficie p-3', compacto && 'p-2.5')} data-tour="cobrar-al-instante">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-trigo-100 text-trigo-800">
        <Icon nombre="rayo" />
      </span>
      <div className="min-w-[10rem] flex-1">
        <p className="text-sm font-semibold text-texto">Cobrar al instante</p>
        <p className="text-xs text-texto-suave">Adelanto de liquidaciones aceptadas, con una entidad asociada.</p>
      </div>
      <Chip tono="neutro" icono="reloj">Próximamente</Chip>
    </div>
  )
}

/** Detalle de ítems y totales de una liquidación. */
export function TablaLiquidacion({ liq, compacta = false }: { liq: Pick<Liquidacion, 'items' | 'alicuotaIva'>; compacta?: boolean }) {
  return (
    <div>
      <ul className="divide-y divide-borde">
        {liq.items.map((i) => (
          <li key={i.id} className="flex items-start justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="block">{i.descripcion}</span>
              <span className="num block text-xs text-texto-suave">
                {num(i.cantidad, 1)} {i.unidad === 'ha' ? 'has' : 'h'} × {pesos(i.precioUnitario)} {compacta ? '' : etiquetaUnidad(i.unidad)}
              </span>
            </span>
            <span className="num shrink-0 font-semibold">{pesos(i.cantidad * i.precioUnitario)}</span>
          </li>
        ))}
      </ul>
      <dl className="num mt-2 space-y-1 border-t border-borde-fuerte pt-2 text-sm">
        <div className="flex justify-between"><dt className="text-texto-suave">Subtotal</dt><dd>{pesos(subtotal(liq))}</dd></div>
        <div className="flex justify-between"><dt className="text-texto-suave">IVA {num(liq.alicuotaIva, 1)} %</dt><dd>{pesos(iva(liq))}</dd></div>
        <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{pesos(total(liq))}</dd></div>
      </dl>
    </div>
  )
}
