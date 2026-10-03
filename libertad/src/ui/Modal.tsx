import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './cx'
import { IconButton } from './Button'
import { usePortal } from './portal'

type Props = {
  abierto: boolean
  onCerrar: () => void
  titulo: ReactNode
  descripcion?: ReactNode
  children: ReactNode
  pie?: ReactNode
  tamano?: 'sm' | 'md' | 'lg' | 'xl'
  /** 'lateral' = panel que entra desde la derecha (detalles). */
  variante?: 'centro' | 'lateral'
}

const ANCHOS = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

const ENFOCABLES = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/** Diálogo accesible: foco atrapado, Esc para cerrar, devuelve el foco al disparador. */
export function Modal({ abierto, onCerrar, titulo, descripcion, children, pie, tamano = 'md', variante = 'centro' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const idTitulo = useId()
  const idDesc = useId()
  const { destino, enMarco } = usePortal()
  const cerrarRef = useRef(onCerrar)
  useEffect(() => {
    cerrarRef.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement as HTMLElement | null
    const nodo = ref.current
    const primero = nodo?.querySelector<HTMLElement>('[data-autofocus]') ?? nodo?.querySelector<HTMLElement>(ENFOCABLES)
    primero?.focus()
    const overflow = document.body.style.overflow
    if (!enMarco) document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        cerrarRef.current()
      }
      if (e.key === 'Tab' && nodo) {
        const items = Array.from(nodo.querySelectorAll<HTMLElement>(ENFOCABLES)).filter((el) => el.offsetParent !== null)
        const first = items[0]
        const last = items[items.length - 1]
        if (!first || !last) return
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previo?.focus?.()
    }
  }, [abierto, enMarco])

  if (!abierto) return null

  const lateral = variante === 'lateral'
  return createPortal(
    <div className={cx(enMarco ? 'absolute' : 'fixed', 'inset-0 z-[70] flex', lateral ? 'justify-end' : enMarco ? 'items-end justify-center' : 'items-end justify-center sm:items-center sm:p-4')}>
      <div className="absolute inset-0 animate-aparecer bg-tierra-950/50 backdrop-blur-[2px] dark:bg-black/60" onClick={onCerrar} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={descripcion ? idDesc : undefined}
        className={cx(
          cx('relative flex w-full', enMarco ? 'max-h-[92%]' : 'max-h-[92dvh]'),
          'flex-col bg-superficie shadow-elevada',
          lateral ? 'h-full max-h-none max-w-xl animate-entrar-derecha' : cx('animate-entrar-arriba rounded-t-2xl', !enMarco && 'sm:rounded-2xl', ANCHOS[tamano]),
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-borde px-5 py-4">
          <div className="min-w-0">
            <h2 id={idTitulo} className="text-xl leading-tight text-tierra-900">{titulo}</h2>
            {descripcion ? <p id={idDesc} className="mt-1 text-sm text-texto-suave">{descripcion}</p> : null}
          </div>
          <IconButton icono="x" etiqueta="Cerrar" onClick={onCerrar} className="-mr-2 -mt-1" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {pie ? <div className="flex flex-wrap justify-end gap-2 border-t border-borde bg-paper-2/60 px-5 py-3">{pie}</div> : null}
      </div>
    </div>,
    destino,
  )
}
