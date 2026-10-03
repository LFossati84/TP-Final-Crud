import { Link } from 'react-router'
import { listoParaCobrar } from '@/domain/cobranza'
import { etiquetaLabor, fechaCorta, num } from '@/domain/format'
import type { ParteLabor } from '@/domain/types'
import { useCatalogo } from '@/store/useCatalogo'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { ICONO_LABOR } from '@/ui/iconosDominio'
import { EstadoParteChip } from '@/ui/StatusChip'

export function TarjetaParte({ parte, destacada }: { parte: ParteLabor; destacada?: boolean }) {
  const cat = useCatalogo()
  const lote = cat.lote(parte.loteId)
  const est = cat.establecimiento(parte.establecimientoId)
  const prod = cat.productor(parte.productorId)
  const observadoIng = parte.validacion?.estado === 'observada'
  return (
    <Link
      to={`/contratista/trabajos/${parte.id}`}
      className={cx(
        'flex gap-3 rounded-2xl border bg-superficie p-3.5 shadow-tarjeta transition active:scale-[0.99]',
        destacada ? 'border-trigo-300 ring-1 ring-trigo-200' : 'border-borde hover:border-borde-fuerte',
      )}
      data-tour={`parte-${parte.numero}`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-verde-100 text-verde-800">
        <Icon nombre={ICONO_LABOR[parte.labor]} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-texto">{etiquetaLabor[parte.labor]} · {lote?.nombre.split('·')[1]?.trim() ?? lote?.nombre}</span>
            <span className="block truncate text-xs text-texto-suave">{est?.nombre} · {prod?.razonSocial}</span>
          </span>
          <Icon nombre="chevronDerecha" tamano={18} className="mt-0.5 shrink-0 text-texto-suave" />
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <EstadoParteChip estado={parte.estado} />
          {observadoIng ? <Chip tono="trigo" icono="receta">Observado por el ingeniero</Chip> : null}
          {listoParaCobrar(parte) ? <Chip tono="verde" icono="billetera">Listo para cobrar</Chip> : null}
          <span className="num ml-auto text-xs text-texto-suave">{parte.numero} · {fechaCorta(parte.fecha)} · {num(parte.has, 1)} has</span>
        </span>
      </span>
    </Link>
  )
}
