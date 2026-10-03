import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { IconButton } from '@/ui/Button'
import { CampanaNotificaciones } from './Notificaciones'

/** Encabezado de pantalla del contratista: volver (opcional), título y campana. */
export function EncabezadoMovil({ titulo, subtitulo, volver, acciones }: { titulo: ReactNode; subtitulo?: ReactNode; volver?: string | true; acciones?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 flex min-h-14 items-center gap-1 border-b border-borde bg-superficie/95 px-2 backdrop-blur">
      {volver ? (
        <IconButton icono="chevronIzquierda" etiqueta="Volver" onClick={() => (volver === true ? navigate(-1) : navigate(volver))} />
      ) : (
        <span className="w-2" />
      )}
      <div className="min-w-0 flex-1 py-2">
        <h1 className="truncate font-serif text-lg leading-tight text-tierra-900">{titulo}</h1>
        {subtitulo ? <p className="truncate text-xs text-texto-suave">{subtitulo}</p> : null}
      </div>
      {acciones}
      <CampanaNotificaciones />
    </header>
  )
}
