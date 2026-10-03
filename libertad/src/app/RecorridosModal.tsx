import { etiquetaRol } from '@/domain/format'
import { FLUJOS } from '@/features/tour/catalogo'
import { useTour } from '@/features/tour/store'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { Icon } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'

/** Catálogo de recorridos guiados F1–F8. */
export function RecorridosModal({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const iniciar = useTour((s) => s.iniciar)
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Recorridos guiados" descripcion="Elegí un flujo y la demo te lleva paso a paso, cambiando de rol cuando haga falta. Cada recorrido arranca desde el escenario inicial." tamano="lg">
      <ol className="space-y-2">
        {FLUJOS.map((f) => (
          <li key={f.id} className="flex gap-3 rounded-xl border border-borde bg-paper-2/40 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-acento font-serif font-bold text-sobre-acento">{f.id}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-texto">{f.titulo}</p>
                {f.principal ? <Chip tono="verde">Principal</Chip> : null}
              </div>
              <p className="mt-0.5 text-sm text-texto-suave">{f.resumen}</p>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-texto-suave">
                <Icon nombre="usuarios" tamano={14} /> {f.roles.map((r) => etiquetaRol[r]).join(' → ')}
              </p>
            </div>
            <Button
              tamano="sm"
              variante={f.principal ? 'primario' : 'secundario'}
              icono="play"
              className="shrink-0 self-center"
              onClick={() => {
                onCerrar()
                window.setTimeout(() => iniciar(f.id), 50)
              }}
              data-tour={`iniciar-${f.id}`}
              aria-label={`Empezar recorrido ${f.id}: ${f.titulo}`}
            >
              Empezar
            </Button>
          </li>
        ))}
      </ol>
    </Modal>
  )
}
