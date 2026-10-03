import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cx } from './cx'
import { Icon } from './Icon'

type Base = { label: ReactNode; hint?: ReactNode; error?: ReactNode; className?: string; opcional?: boolean }

const CAMPO =
  'block w-full min-h-tactil rounded-xl border bg-superficie px-3.5 text-base text-texto placeholder:text-texto-suave/70 transition sm:text-sm ' +
  'focus:border-foco focus:outline-none focus:ring-2 focus:ring-foco/30 disabled:bg-paper-2 disabled:text-texto-suave'

function Envoltorio({ id, label, hint, error, opcional, className, children }: Base & { id: string; children: ReactNode }) {
  return (
    <div className={cx('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-semibold text-texto">
        <span>{label}</span>
        {opcional ? <span className="text-xs font-normal text-texto-suave">Opcional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1 text-sm font-medium text-rojo-700">
          <Icon nombre="alerta" tamano={14} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-texto-suave">{hint}</p>
      ) : null}
    </div>
  )
}

function describedBy(id: string, error?: ReactNode, hint?: ReactNode): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}

type InputProps = Base & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & { sufijo?: ReactNode; prefijo?: ReactNode }

export function Input({ label, hint, error, opcional, className, sufijo, prefijo, id: idProp, ...resto }: InputProps) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Envoltorio id={id} label={label} hint={hint} error={error} opcional={opcional} className={className}>
      <div className="relative">
        {prefijo ? <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-texto-suave">{prefijo}</span> : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cx(CAMPO, error ? 'border-rojo-500' : 'border-borde-fuerte', prefijo ? 'pl-8' : undefined, sufijo ? 'pr-14' : undefined)}
          {...resto}
        />
        {sufijo ? <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-texto-suave">{sufijo}</span> : null}
      </div>
    </Envoltorio>
  )
}

type SelectProps = Base & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & { opciones: { valor: string; texto: string }[]; placeholder?: string }

export function Select({ label, hint, error, opcional, className, opciones, placeholder, id: idProp, ...resto }: SelectProps) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Envoltorio id={id} label={label} hint={hint} error={error} opcional={opcional} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          className={cx(CAMPO, 'appearance-none pr-10', error ? 'border-rojo-500' : 'border-borde-fuerte')}
          {...resto}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
        <Icon nombre="chevronAbajo" tamano={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-texto-suave" />
      </div>
    </Envoltorio>
  )
}

type TextareaProps = Base & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>

export function Textarea({ label, hint, error, opcional, className, id: idProp, rows = 3, ...resto }: TextareaProps) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Envoltorio id={id} label={label} hint={hint} error={error} opcional={opcional} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={cx(CAMPO, 'py-2.5', error ? 'border-rojo-500' : 'border-borde-fuerte')}
        {...resto}
      />
    </Envoltorio>
  )
}

export function Checkbox({ label, descripcion, className, ...resto }: { label: ReactNode; descripcion?: ReactNode; className?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>) {
  const id = useId()
  return (
    <label htmlFor={id} className={cx('flex min-h-tactil cursor-pointer items-start gap-3 rounded-xl py-2', className)}>
      <input id={id} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-borde-fuerte accent-[rgb(var(--accion))]" {...resto} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-texto">{label}</span>
        {descripcion ? <span className="block text-sm text-texto-suave">{descripcion}</span> : null}
      </span>
    </label>
  )
}

type ToggleProps = { label: ReactNode; descripcion?: ReactNode; activo: boolean; onCambiar: (v: boolean) => void; className?: string; disabled?: boolean }

/** Interruptor accesible (role="switch"). */
export function Toggle({ label, descripcion, activo, onCambiar, className, disabled }: ToggleProps) {
  const id = useId()
  return (
    <div className={cx('flex min-h-tactil items-center justify-between gap-4', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer text-sm font-semibold text-texto">{label}</label>
        {descripcion ? <p className="text-sm text-texto-suave">{descripcion}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={activo}
        disabled={disabled}
        onClick={() => onCambiar(!activo)}
        className={cx(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
          'before:absolute before:-inset-2 before:content-[""]',
          activo ? 'bg-accion' : 'bg-paper-3 ring-1 ring-inset ring-borde-fuerte',
        )}
      >
        <span className={cx('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', activo ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  )
}

type OpcionSeg<T extends string> = { valor: T; texto: string; icono?: ReactNode; detalle?: string }

/** Grupo de opciones grandes (radio), cómodo para el pulgar. */
export function OpcionesGrandes<T extends string>({
  label,
  opciones,
  valor,
  onCambiar,
  columnas = 2,
}: {
  label: string
  opciones: OpcionSeg<T>[]
  valor: T | ''
  onCambiar: (v: T) => void
  columnas?: 1 | 2 | 3
}) {
  const nombre = useId()
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-texto">{label}</legend>
      <div className={cx('grid gap-2', columnas === 1 && 'grid-cols-1', columnas === 2 && 'grid-cols-2', columnas === 3 && 'grid-cols-2 sm:grid-cols-3')}>
        {opciones.map((o) => {
          const sel = o.valor === valor
          return (
            <label
              key={o.valor}
              className={cx(
                'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foco',
                sel ? 'border-verde-500 bg-verde-50' : 'border-borde bg-superficie hover:border-borde-fuerte',
              )}
            >
              <input type="radio" name={nombre} value={o.valor} checked={sel} onChange={() => onCambiar(o.valor)} className="sr-only" />
              {o.icono ? <span className={cx('shrink-0', sel ? 'text-verde-700' : 'text-texto-suave')}>{o.icono}</span> : null}
              <span className="min-w-0">
                <span className={cx('block text-sm font-semibold', sel ? 'text-verde-900' : 'text-texto')}>{o.texto}</span>
                {o.detalle ? <span className="block truncate text-xs text-texto-suave">{o.detalle}</span> : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
