import { Outlet, ScrollRestoration } from 'react-router'
import { ToastViewport } from '@/ui/Toast'
import { DemoBar } from './DemoBar'

export function RootLayout() {
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-superficie focus:px-4 focus:py-2 focus:font-semibold">
        Saltar al contenido
      </a>
      <DemoBar />
      <Outlet />
      <ToastViewport />
      <ScrollRestoration />
    </>
  )
}
