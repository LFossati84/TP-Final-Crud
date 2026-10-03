import { cx } from './cx'
import { Icon, type NombreIcono } from './Icon'
import { useToasts, type TipoToast } from './toast-store'

const ESTILO: Record<TipoToast, { icono: NombreIcono; clase: string }> = {
  ok: { icono: 'checkCirculo', clase: 'text-verde-700' },
  info: { icono: 'info', clase: 'text-cielo-700' },
  alerta: { icono: 'alerta', clase: 'text-trigo-700' },
  error: { icono: 'xCirculo', clase: 'text-rojo-700' },
}

/** Región de toasts (aria-live). Se monta una sola vez en la raíz. */
export function ToastViewport() {
  const toasts = useToasts((s) => s.toasts)
  const quitar = useToasts((s) => s.quitar)
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] print:hidden flex flex-col items-center gap-2 px-4 sm:bottom-4 sm:right-auto sm:items-start"
    >
      {toasts.map((t) => {
        const e = ESTILO[t.tipo]
        return (
          <div
            key={t.id}
            role={t.tipo === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-entrar-arriba items-start gap-3 rounded-2xl border border-borde bg-superficie p-3.5 shadow-elevada"
          >
            <Icon nombre={e.icono} className={cx('mt-0.5 shrink-0', e.clase)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-texto">{t.titulo}</p>
              {t.detalle ? <p className="mt-0.5 text-sm text-texto-suave">{t.detalle}</p> : null}
            </div>
            <button type="button" onClick={() => quitar(t.id)} className="-m-1 rounded-lg p-1 text-texto-suave hover:bg-paper-2" aria-label="Cerrar aviso">
              <Icon nombre="x" tamano={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
