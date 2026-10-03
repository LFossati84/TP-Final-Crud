import { porcentaje } from '@/domain/format'
import type { ID } from '@/domain/types'
import { useProductor, useReputacionPago } from '@/store/hooks'
import { useDemo } from '@/store/useDemo'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'

/**
 * Historial de pago de un productor. Solo se muestra si el productor dio su
 * consentimiento y el contratista ya trabajó con él.
 */
export function ReputacionPago({ productorId, contratistaId, className }: { productorId: ID; contratistaId: ID; className?: string }) {
  const p = useProductor(productorId)
  const rep = useReputacionPago(productorId)
  const trabajaron = useDemo((s) => s.liquidaciones.some((l) => l.productorId === productorId && l.contratistaId === contratistaId) || s.partes.some((x) => x.productorId === productorId && x.contratistaId === contratistaId))
  if (!p || !rep) return null
  if (!p.consentimientoReputacionPago || !trabajaron) {
    return (
      <p className={cx('flex items-start gap-2 rounded-xl bg-paper-2 p-3 text-xs text-texto-suave', className)}>
        <Icon nombre="candado" tamano={14} className="mt-0.5 shrink-0" />
        {p.razonSocial} no comparte su historial de pago{!trabajaron ? ' con contratistas con los que no trabajó' : ''}.
      </p>
    )
  }
  const bueno = rep.enTermino >= 0.85
  return (
    <div className={cx('rounded-xl p-3 ring-1 ring-inset', bueno ? 'bg-verde-50 ring-verde-200' : 'bg-trigo-50 ring-trigo-200', className)} data-tour="reputacion-pago">
      <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">Comportamiento de pago de {p.razonSocial}</p>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div><dt className="text-[11px] text-texto-suave">En término</dt><dd className="text-lg font-semibold">{porcentaje(rep.enTermino)}</dd></div>
        <div>
          <dt className="text-[11px] text-texto-suave">Días vs. venc.</dt>
          <dd className="text-lg font-semibold">{rep.diasPromedio <= 0 ? `−${Math.abs(rep.diasPromedio).toFixed(0)}` : `+${rep.diasPromedio.toFixed(0)}`}</dd>
        </div>
        <div><dt className="text-[11px] text-texto-suave">Liquidaciones</dt><dd className="text-lg font-semibold">{rep.liquidaciones}</dd></div>
      </dl>
      <p className="mt-1 text-[11px] text-texto-suave">Compartido con consentimiento del productor. Visible solo para contratistas que trabajaron con él.</p>
    </div>
  )
}
