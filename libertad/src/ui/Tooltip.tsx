import { useId, type ReactNode } from 'react'
import { cx } from './cx'

/** Tooltip accesible por hover y foco (CSS puro). El disparador debe ser enfocable. */
export function Tooltip({ texto, children, lado = 'arriba', className }: { texto: ReactNode; children: ReactNode; lado?: 'arriba' | 'abajo'; className?: string }) {
  const id = useId()
  return (
    <span className={cx('group/tip relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cx(
          'pointer-events-none absolute left-1/2 z-50 hidden w-max max-w-[16rem] -translate-x-1/2 animate-aparecer rounded-lg bg-tierra-900 px-3 py-2 text-xs font-medium leading-snug text-tierra-50 shadow-elevada',
          'group-focus-within/tip:block group-hover/tip:block',
          lado === 'arriba' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {texto}
      </span>
    </span>
  )
}
