import { Link } from 'react-router'
import { EmptyState } from '@/ui/EmptyState'

export function NoEncontrada() {
  return (
    <main id="contenido" className="mx-auto max-w-lg px-4 py-16">
      <EmptyState
        icono="mapa"
        titulo="Este potrero no está en el mapa"
        texto="La página que buscás no existe en la demo."
        accion={
          <Link to="/" className="inline-flex min-h-tactil items-center rounded-xl bg-accion px-4 font-semibold text-sobre-accion">
            Volver al inicio
          </Link>
        }
      />
    </main>
  )
}
