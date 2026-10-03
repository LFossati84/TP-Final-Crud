import { useState } from 'react'
import { useNavigate } from 'react-router'
import { fechaHora } from '@/domain/format'
import type { TipoNotificacion } from '@/domain/types'
import { useMisNotificaciones } from '@/store/hooks'
import { useDemo } from '@/store/useDemo'
import { cx } from '@/ui/cx'
import { EmptyState } from '@/ui/EmptyState'
import { Icon, type NombreIcono } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'

const ICONO: Record<TipoNotificacion, { icono: NombreIcono; clase: string }> = {
  info: { icono: 'info', clase: 'bg-cielo-100 text-cielo-700' },
  ok: { icono: 'checkCirculo', clase: 'bg-verde-100 text-verde-700' },
  alerta: { icono: 'alerta', clase: 'bg-trigo-100 text-trigo-800' },
  peligro: { icono: 'alerta', clase: 'bg-rojo-100 text-rojo-700' },
}

/** Campana con contador + panel de notificaciones del usuario activo. */
export function CampanaNotificaciones({ className, tono = 'claro' }: { className?: string; tono?: 'claro' | 'transparente' }) {
  const [abierto, setAbierto] = useState(false)
  const { lista, usuarioId } = useMisNotificaciones()
  const rol = useDemo((s) => s.rol)
  const marcarLeida = useDemo((s) => s.marcarLeida)
  const marcarTodas = useDemo((s) => s.marcarTodasLeidas)
  const navigate = useNavigate()
  const sinLeer = lista.filter((n) => !n.leida).length

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={cx(
          'relative inline-flex min-h-tactil min-w-tactil items-center justify-center rounded-xl transition',
          tono === 'claro' ? 'text-texto hover:bg-paper-2' : 'text-current hover:bg-black/10',
          className,
        )}
        aria-label={sinLeer ? `Notificaciones, ${sinLeer} sin leer` : 'Notificaciones'}
        data-tour="campana"
      >
        <Icon nombre="campana" />
        {sinLeer ? (
          <span className="num absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-peligro px-1 text-[10px] font-bold text-sobre-peligro ring-2 ring-superficie">
            {sinLeer}
          </span>
        ) : null}
      </button>
      <Modal
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
        titulo="Notificaciones"
        variante={rol === 'contratista' ? 'centro' : 'lateral'}
        tamano="md"
        pie={
          sinLeer ? (
            <button type="button" onClick={() => marcarTodas(rol, usuarioId)} className="min-h-tactil rounded-xl px-3 text-sm font-semibold text-verde-800 hover:bg-paper-2">
              Marcar todas como leídas
            </button>
          ) : undefined
        }
      >
        {lista.length === 0 ? (
          <EmptyState icono="campana" titulo="Sin novedades" texto="Cuando haya partes, pagos o alertas, te avisamos acá." />
        ) : (
          <ul className="-mx-2 space-y-1">
            {lista.map((n) => {
              const i = ICONO[n.tipo]
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      marcarLeida(n.id)
                      setAbierto(false)
                      if (n.link) navigate(n.link)
                    }}
                    className={cx('flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-paper-2', !n.leida && 'bg-verde-50/60')}
                  >
                    <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', i.clase)}>
                      <Icon nombre={i.icono} tamano={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={cx('text-sm', n.leida ? 'font-medium text-texto' : 'font-bold text-texto')}>{n.titulo}</span>
                        {!n.leida ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-verde-500" aria-label="Sin leer" /> : null}
                      </span>
                      <span className="mt-0.5 block text-sm text-texto-suave">{n.texto}</span>
                      <span className="num mt-1 block text-xs text-texto-suave">{fechaHora(n.fecha)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Modal>
    </>
  )
}
