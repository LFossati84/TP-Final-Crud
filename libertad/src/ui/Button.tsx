import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { cx } from './cx'
import { estilosBoton, VARIANTES_BOTON, type TamanoBoton, type VarianteBoton } from './estilos'
import { Icon, type NombreIcono } from './Icon'

type Comunes = {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  icono?: NombreIcono
  iconoDerecha?: NombreIcono
  bloque?: boolean
  children?: ReactNode
}

type Props = Comunes & ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean }

export function Button({ variante, tamano, icono, iconoDerecha, bloque, cargando, children, className, disabled, type = 'button', ...resto }: Props) {
  const tamIcono = tamano === 'lg' ? 20 : 18
  return (
    <button type={type} className={cx(estilosBoton(variante, tamano, bloque), className)} disabled={disabled || cargando} aria-busy={cargando || undefined} {...resto}>
      {cargando ? <Icon nombre="sync" tamano={tamIcono} className="animate-spin" /> : icono ? <Icon nombre={icono} tamano={tamIcono} /> : null}
      {children}
      {iconoDerecha ? <Icon nombre={iconoDerecha} tamano={tamIcono} /> : null}
    </button>
  )
}

export function ButtonLink({ variante, tamano, icono, iconoDerecha, bloque, children, className, ...resto }: Comunes & LinkProps) {
  const tamIcono = tamano === 'lg' ? 20 : 18
  return (
    <Link className={cx(estilosBoton(variante, tamano, bloque), className)} {...resto}>
      {icono ? <Icon nombre={icono} tamano={tamIcono} /> : null}
      {children}
      {iconoDerecha ? <Icon nombre={iconoDerecha} tamano={tamIcono} /> : null}
    </Link>
  )
}

/** Botón cuadrado solo-ícono (siempre con aria-label). */
export function IconButton({ icono, etiqueta, className, variante = 'fantasma', ...resto }: { icono: NombreIcono; etiqueta: string; variante?: VarianteBoton } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      className={cx('inline-flex min-h-tactil min-w-tactil items-center justify-center rounded-xl transition', VARIANTES_BOTON[variante], className)}
      {...resto}
    >
      <Icon nombre={icono} />
    </button>
  )
}
