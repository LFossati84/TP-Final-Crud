import { useEffect, useState, type ReactNode } from 'react'
import { horaActual } from '@/domain/reloj'
import { useDemo } from '@/store/useDemo'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { PortalContext } from '@/ui/portal'

function BarraEstado() {
  const online = useDemo((s) => s.online)
  const [hora, setHora] = useState(horaActual)
  useEffect(() => {
    const t = window.setInterval(() => setHora(horaActual()), 30_000)
    return () => window.clearInterval(t)
  }, [])
  return (
    <div className="hidden h-9 shrink-0 items-center justify-between bg-superficie px-7 text-xs font-semibold text-texto md:flex" aria-hidden>
      <span className="num">{hora}</span>
      <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-[#120c08]" />
      <span className="flex items-center gap-1.5">
        {online ? <Icon nombre="senal" tamano={14} /> : <span className="text-trigo-800">Sin señal</span>}
        <span className="inline-flex h-3 w-6 items-center rounded-[3px] border border-current p-px">
          <span className="h-full w-4/5 rounded-[1px] bg-current" />
        </span>
      </span>
    </div>
  )
}

/**
 * Marco de celular para la vista del contratista: en desktop se centra un
 * teléfono de ~390px; en mobile ocupa toda la pantalla.
 */
export function PhoneFrame({ children, lateral }: { children: ReactNode; lateral?: ReactNode }) {
  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null)
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] justify-center gap-10 md:items-center md:bg-[radial-gradient(circle_at_30%_20%,rgb(var(--trigo-100))_0,transparent_45%),radial-gradient(circle_at_80%_80%,rgb(var(--verde-100))_0,transparent_40%)] md:px-6 md:py-6">
      <div
        ref={setContenedor}
        className={cx(
          'relative flex h-[calc(100dvh-3.5rem)] w-full flex-col overflow-hidden bg-paper',
          'md:h-[min(844px,calc(100dvh-6.5rem))] md:w-[390px] md:rounded-[46px] md:border-[11px] md:border-[#1b130e] md:shadow-telefono',
        )}
        data-tour="telefono"
      >
        <BarraEstado />
        <PortalContext.Provider value={contenedor}>{children}</PortalContext.Provider>
      </div>
      {lateral ? <aside className="hidden w-72 shrink-0 xl:block">{lateral}</aside> : null}
    </div>
  )
}
