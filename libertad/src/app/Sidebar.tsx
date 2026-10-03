import { NavLink } from 'react-router'
import { etiquetaRol } from '@/domain/format'
import type { Rol } from '@/domain/types'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { ICONO_ROL, NAV } from './navegacion'
import { useContadores } from './useContadores'

type Props = { rol: Rol; persona: string; detalle?: string; enCajon?: boolean; onNavegar?: () => void }

/**
 * Menú lateral. En lg muestra íconos + texto; en md queda como riel de íconos
 * (con tooltip nativo); en mobile se usa dentro de un cajón (enCajon).
 */
export function Sidebar({ rol, persona, detalle, enCajon = false, onNavegar }: Props) {
  const contadores = useContadores(rol)
  const expandido = enCajon
  return (
    <nav aria-label={`Menú de ${etiquetaRol[rol]}`} className="flex h-full flex-col">
      <div className={cx('flex items-center gap-3 border-b border-borde px-4 py-4', !expandido && 'md:justify-center md:px-2 lg:justify-start lg:px-4')}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-verde-100 text-verde-800">
          <Icon nombre={ICONO_ROL[rol]} />
        </span>
        <div className={cx('min-w-0', !expandido && 'md:hidden lg:block')}>
          <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{etiquetaRol[rol]}</p>
          <p className="truncate font-serif text-base leading-tight text-tierra-900" title={persona}>{persona}</p>
          {detalle ? <p className="truncate text-xs text-texto-suave">{detalle}</p> : null}
        </div>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV[rol].map((item) => {
          const cantidad = contadores[item.clave]
          return (
            <li key={item.clave}>
              <NavLink
                to={item.ruta}
                end={item.fin}
                onClick={onNavegar}
                title={item.texto}
                data-tour={`nav-${item.clave}`}
                className={({ isActive }) =>
                  cx(
                    'group relative flex min-h-tactil items-center gap-3 rounded-xl px-3 text-sm font-semibold transition',
                    !expandido && 'md:justify-center md:px-0 lg:justify-start lg:px-3',
                    isActive ? 'bg-verde-100 text-verde-900' : 'text-texto-suave hover:bg-paper-2 hover:text-texto',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? <span className="absolute left-0 top-2 h-[calc(100%-1rem)] w-1 rounded-r-full bg-verde-600" aria-hidden /> : null}
                    <Icon nombre={item.icono} className="shrink-0" />
                    <span className={cx('flex-1 truncate', !expandido && 'md:sr-only lg:not-sr-only')}>{item.texto}</span>
                    {cantidad ? (
                      <span
                        className={cx(
                          'num flex h-5 min-w-5 items-center justify-center rounded-full bg-peligro px-1.5 text-[11px] font-bold text-sobre-peligro',
                          !expandido && 'md:absolute md:right-2 md:top-1.5 lg:static',
                        )}
                        aria-label={`${cantidad} pendientes`}
                      >
                        {cantidad}
                      </span>
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
      <div className={cx('border-t border-borde p-3 text-xs text-texto-suave', !expandido && 'md:hidden lg:block')}>
        <p className="flex items-center gap-1.5">
          <Icon nombre="info" tamano={14} /> Demo ilustrativa · datos ficticios
        </p>
      </div>
    </nav>
  )
}
