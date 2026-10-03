import { useState, type ReactNode } from 'react'
import { Outlet, useMatches } from 'react-router'
import type { Rol } from '@/domain/types'
import { IconButton } from '@/ui/Button'
import { Modal } from '@/ui/Modal'
import { Avatar } from '@/ui/Avatar'
import { CampanaNotificaciones } from './Notificaciones'
import { Sidebar } from './Sidebar'

export interface HandleRuta {
  titulo?: string
}

function useTituloRuta(): string | undefined {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const h = matches[i]?.handle as HandleRuta | undefined
    if (h?.titulo) return h.titulo
  }
  return undefined
}

type Props = { rol: Rol; persona: string; detalle?: string; extraTopbar?: ReactNode }

/** Layout de escritorio (Productor, Ingeniero, Administrador). */
export function DeskLayout({ rol, persona, detalle, extraTopbar }: Props) {
  const [cajon, setCajon] = useState(false)
  const titulo = useTituloRuta()
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)]">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-20 shrink-0 border-r border-borde bg-superficie md:block lg:w-64 print:hidden">
        <Sidebar rol={rol} persona={persona} detalle={detalle} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-14 z-30 flex h-14 items-center gap-2 border-b border-borde bg-paper/90 px-2 backdrop-blur sm:px-4 print:hidden">
          <IconButton icono="menu" etiqueta="Abrir menú" onClick={() => setCajon(true)} className="md:hidden" />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-texto-suave">
            <span className="hidden sm:inline">{persona} · </span>
            <span className="text-texto">{titulo}</span>
          </p>
          {extraTopbar}
          <CampanaNotificaciones />
          <span className="hidden sm:block">
            <Avatar nombre={persona} tamano="sm" />
          </span>
        </div>
        <main id="contenido" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <Modal abierto={cajon} onCerrar={() => setCajon(false)} titulo="Menú" variante="lateral">
        <div className="-mx-5 -my-4 h-full">
          <Sidebar rol={rol} persona={persona} detalle={detalle} enCajon onNavegar={() => setCajon(false)} />
        </div>
      </Modal>
    </div>
  )
}
