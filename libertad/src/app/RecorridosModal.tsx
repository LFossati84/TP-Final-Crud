import { etiquetaRol } from '@/domain/format'
import { FLUJOS } from '@/features/tour/catalogo'
import { Chip } from '@/ui/Chip'
import { Icon } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'

/** Catálogo de recorridos guiados. El motor paso a paso se habilita en la Fase 6. */
export function RecorridosModal({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Recorridos guiados" descripcion="Elegí un flujo y la demo te lleva paso a paso, cambiando de rol cuando haga falta." tamano="lg">
      <ol className="space-y-2">
        {FLUJOS.map((f) => (
          <li key={f.id} className="flex gap-3 rounded-xl border border-borde bg-paper-2/40 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-acento font-serif font-bold text-sobre-acento">{f.id}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-texto">{f.titulo}</p>
                {f.principal ? <Chip tono="verde">Principal</Chip> : null}
                <Chip tono="neutro" icono="reloj">Próximamente</Chip>
              </div>
              <p className="mt-0.5 text-sm text-texto-suave">{f.resumen}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-texto-suave">
                <Icon nombre="usuarios" tamano={14} /> {f.roles.map((r) => etiquetaRol[r]).join(' → ')}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  )
}
