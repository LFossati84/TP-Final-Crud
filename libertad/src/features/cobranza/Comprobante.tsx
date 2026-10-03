import { iva, LEYENDA_COMPROBANTE, NOTA_COBRANZA, subtotal, total } from '@/domain/cobranza'
import { etiquetaCondicionPago, fecha, num, pesos } from '@/domain/format'
import type { Contratista, Liquidacion, Productor } from '@/domain/types'
import { cx } from '@/ui/cx'

type Datos = Pick<Liquidacion, 'items' | 'alicuotaIva' | 'condicion' | 'vencimiento' | 'periodo'> & { numero?: string; fechaEmision: string }

/** Comprobante de liquidación (documento de gestión). Siempre en colores claros. */
export function Comprobante({ liq, c, p, borrador = false, className }: { liq: Datos; c: Contratista; p: Productor; borrador?: boolean; className?: string }) {
  const clave = c.razonSocial.replace(/S\.R\.L\.|S\.A\.|S\.H\./g, '').split(' ').filter((w) => w.length > 3).pop() ?? 'CONTRATISTA'
  const alias = `${clave.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()}.COBROS.DEMO`
  return (
    <article className={cx('forzar-claro relative overflow-hidden bg-white p-6 text-[12px] leading-snug text-[#1f1510]', className)} data-tour="comprobante">
      {borrador ? (
        <span className="pointer-events-none absolute right-[-48px] top-6 rotate-45 bg-[#EDC25A] px-14 py-1 text-[10px] font-bold uppercase tracking-widest text-[#33231a]">Vista previa</span>
      ) : null}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#244720] pb-3">
        <div>
          <p className="font-serif text-lg leading-tight">{c.razonSocial}</p>
          <p className="text-[#4a3224]">CUIT {c.cuit} · {c.localidad}, Santa Fe</p>
          <p className="text-[#4a3224]">{c.telefono} · {c.email}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4a3224]">Liquidación de servicios</p>
          <p className="font-mono text-base font-bold">{liq.numero ?? 'LQ-(a asignar)'}</p>
          <p className="text-[#4a3224]">Emitida el {fecha(liq.fechaEmision)}</p>
        </div>
      </header>
      <p className="mt-2 rounded border border-[#a63a28] bg-[#fdf2f0] px-2 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-[#862f22]">{LEYENDA_COMPROBANTE}</p>

      <section className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#64432d]">Productor</p>
          <p className="font-semibold">{p.razonSocial}</p>
          <p className="text-[#4a3224]">CUIT {p.cuit} · {p.localidad}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[#64432d]">Período</p>
          <p className="font-semibold">{liq.periodo}</p>
        </div>
      </section>

      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr className="bg-[#f1e6d8] text-left text-[10px] uppercase tracking-wide text-[#4a3224]">
            <th className="px-2 py-1 font-semibold">Descripción</th>
            <th className="px-2 py-1 text-right font-semibold">Cantidad</th>
            <th className="px-2 py-1 text-right font-semibold">Precio unit.</th>
            <th className="px-2 py-1 text-right font-semibold">Importe</th>
          </tr>
        </thead>
        <tbody>
          {liq.items.map((i) => (
            <tr key={i.id} className="border-b border-[#f1e6d8] align-top">
              <td className="px-2 py-1">{i.descripcion}</td>
              <td className="whitespace-nowrap px-2 py-1 text-right tabular-nums">{num(i.cantidad, 1)} {i.unidad === 'ha' ? 'ha' : 'h'}</td>
              <td className="whitespace-nowrap px-2 py-1 text-right tabular-nums">{pesos(i.precioUnitario)}</td>
              <td className="whitespace-nowrap px-2 py-1 text-right tabular-nums">{pesos(i.cantidad * i.precioUnitario)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="ml-auto mt-2 w-full max-w-60 space-y-0.5 tabular-nums">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{pesos(subtotal(liq))}</dd></div>
        <div className="flex justify-between"><dt>IVA {num(liq.alicuotaIva, 1)} %</dt><dd>{pesos(iva(liq))}</dd></div>
        <div className="flex justify-between border-t border-[#1f1510] pt-0.5 text-[14px] font-bold"><dt>Total</dt><dd>{pesos(total(liq))}</dd></div>
      </dl>

      <section className="mt-3 grid grid-cols-2 gap-3 rounded border border-[#e2cdb3] p-2">
        <div><p className="text-[10px] uppercase tracking-wide text-[#64432d]">Condición de pago</p><p className="font-semibold">{etiquetaCondicionPago[liq.condicion]}</p></div>
        <div><p className="text-[10px] uppercase tracking-wide text-[#64432d]">Vencimiento</p><p className="font-semibold">{fecha(liq.vencimiento)}</p></div>
        <div className="col-span-2"><p className="text-[10px] uppercase tracking-wide text-[#64432d]">Datos para el pago</p><p className="font-mono">Alias {alias} (ficticio)</p></div>
      </section>

      <footer className="mt-6 flex items-end justify-between gap-6">
        <p className="max-w-xs text-[9.5px] text-[#64432d]">{NOTA_COBRANZA}. Partes de labor conformados por el productor en la plataforma.</p>
        <div className="w-44 text-center">
          <div className="h-10 border-b border-[#1f1510]" />
          <p className="mt-1 text-[10px]">{c.titular} · {c.razonSocial}</p>
        </div>
      </footer>
    </article>
  )
}
