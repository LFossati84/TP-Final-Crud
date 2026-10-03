import { ETIQUETA_RECORDATORIO } from '@/domain/cobranza'
import { fechaCorta } from '@/domain/format'
import type { Liquidacion } from '@/domain/types'
import { useDemo } from '@/store/useDemo'
import { Toggle } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'

/** Programación de recordatorios automáticos (3 días antes, el día y 7 días después). */
export function RecordatoriosProgramados({ liq }: { liq: Liquidacion }) {
  const set = useDemo((s) => s.setRecordatoriosAutomaticos)
  const lista = [...liq.recordatorios].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return (
    <div data-tour="recordatorios-programados">
      <Toggle label="Recordatorios automáticos por WhatsApp" descripcion="3 días antes, el día del vencimiento y 7 días después." activo={liq.recordatoriosAutomaticos} onCambiar={(v) => set(liq.id, v)} disabled={liq.estado === 'cobrada'} />
      {lista.length ? (
        <ol className="mt-2 space-y-1.5">
          {lista.map((r) => (
            <li key={r.id} className="flex items-center gap-2 text-sm">
              <Icon nombre={r.estado === 'enviado' ? 'checkCirculo' : 'reloj'} tamano={16} className={r.estado === 'enviado' ? 'text-verde-600' : 'text-cielo-600'} />
              <span className="num w-14 shrink-0 text-texto-suave">{fechaCorta(r.fecha)}</span>
              <span className="min-w-0 flex-1 truncate">{ETIQUETA_RECORDATORIO[r.tipo]}</span>
              <span className="text-xs text-texto-suave">{r.estado === 'enviado' ? 'Enviado' : 'Programado'}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-1 text-sm text-texto-suave">Sin recordatorios.</p>
      )}
    </div>
  )
}
