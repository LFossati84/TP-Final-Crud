import { cx } from './cx'
import { Icon } from './Icon'

/** Calificación de 1 a 5 (solo lectura o interactiva). */
export function Estrellas({ valor, onCambiar, tamano = 16, className }: { valor: number; onCambiar?: (v: 1 | 2 | 3 | 4 | 5) => void; tamano?: number; className?: string }) {
  const lista = [1, 2, 3, 4, 5] as const
  if (!onCambiar) {
    return (
      <span className={cx('inline-flex items-center gap-0.5 text-trigo-500', className)} role="img" aria-label={`${valor.toFixed(1).replace('.', ',')} de 5 estrellas`}>
        {lista.map((n) => (
          <Icon key={n} nombre="estrella" tamano={tamano} relleno={valor >= n - 0.25} className={valor >= n - 0.25 ? '' : 'text-borde-fuerte'} />
        ))}
      </span>
    )
  }
  return (
    <div className={cx('flex gap-1', className)} role="radiogroup" aria-label="Calificación">
      {lista.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          onClick={() => onCambiar(n)}
          className="flex min-h-tactil min-w-tactil items-center justify-center rounded-xl text-trigo-500 transition hover:scale-110"
        >
          <Icon nombre="estrella" tamano={28} relleno={valor >= n} className={valor >= n ? '' : 'text-borde-fuerte'} />
        </button>
      ))}
    </div>
  )
}
