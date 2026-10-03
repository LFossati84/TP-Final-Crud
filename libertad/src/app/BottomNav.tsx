import { NavLink } from 'react-router'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { NAV } from './navegacion'
import { useContadores } from './useContadores'

export function BottomNav() {
  const contadores = useContadores('contratista')
  return (
    <nav aria-label="Navegación principal" className="shrink-0 border-t border-borde bg-superficie/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="grid grid-cols-5">
        {NAV.contratista.map((item) => {
          const destacado = item.clave === 'nuevo'
          const cantidad = contadores[item.clave]
          return (
            <li key={item.clave}>
              <NavLink
                to={item.ruta}
                end={item.fin}
                data-tour={`nav-${item.clave}`}
                className={({ isActive }) =>
                  cx(
                    'relative flex min-h-16 flex-col items-center justify-end gap-0.5 px-0.5 pb-2 text-[11px] font-semibold tracking-tight transition',
                    isActive ? 'text-verde-800' : 'text-texto-suave hover:text-texto',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {destacado ? (
                      <span className={cx('-mt-6 mb-0.5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-elevada ring-4 ring-superficie transition', isActive ? 'bg-accion-hover text-sobre-accion' : 'bg-accion text-sobre-accion')}>
                        <Icon nombre="mas" tamano={26} />
                      </span>
                    ) : (
                      <span className={cx('flex h-8 w-12 items-center justify-center rounded-full transition', isActive && 'bg-verde-100')}>
                        <Icon nombre={item.icono} tamano={22} />
                      </span>
                    )}
                    <span className="whitespace-nowrap leading-tight">{item.texto}</span>
                    {cantidad ? (
                      <span className="num absolute right-[18%] top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-peligro px-1 text-[10px] font-bold text-sobre-peligro">
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
    </nav>
  )
}
