import { Outlet, ScrollRestoration, useNavigation } from 'react-router'
import { TourOverlay } from '@/features/tour/TourOverlay'
import { ToastViewport } from '@/ui/Toast'
import { DemoBar } from './DemoBar'

function BarraCarga() {
  const cargando = useNavigation().state === 'loading'
  if (!cargando) return null
  return (
    <div className="fixed inset-x-0 top-0 z-[95] h-1 overflow-hidden bg-acento/30" role="progressbar" aria-label="Cargando sección">
      <div className="h-full w-1/3 animate-[carga_1s_ease-in-out_infinite] bg-acento" />
    </div>
  )
}

export function RootLayout() {
  return (
    <>
      <BarraCarga />
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:font-semibold">
        Saltar al contenido
      </a>
      <DemoBar />
      <Outlet />
      <TourOverlay />
      <ToastViewport />
      <ScrollRestoration />
    </>
  )
}
