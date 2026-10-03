import { cx } from './cx'

type Tab<T extends string> = { valor: T; texto: string; cantidad?: number }

/** Pestañas/segmentos con scroll horizontal en mobile. */
export function Tabs<T extends string>({ tabs, valor, onCambiar, etiqueta, className }: { tabs: Tab<T>[]; valor: T; onCambiar: (v: T) => void; etiqueta: string; className?: string }) {
  return (
    <div role="tablist" aria-label={etiqueta} className={cx('-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]', className)}>
      {tabs.map((t) => {
        const activo = t.valor === valor
        return (
          <button
            key={t.valor}
            role="tab"
            type="button"
            aria-selected={activo}
            onClick={() => onCambiar(t.valor)}
            className={cx(
              'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition [@media(pointer:coarse)]:min-h-tactil',
              activo ? 'bg-tierra-800 text-tierra-50' : 'bg-paper-2 text-texto-suave hover:bg-paper-3 hover:text-texto',
            )}
          >
            {t.texto}
            {t.cantidad !== undefined ? (
              <span className={cx('num rounded-full px-1.5 text-xs', activo ? 'bg-tierra-50/20 text-tierra-50' : 'bg-paper-3 text-texto-suave')}>{t.cantidad}</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
