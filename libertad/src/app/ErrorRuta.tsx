import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { useDemo } from '@/store/useDemo'
import { ErrorState } from '@/ui/EmptyState'

/** Pantalla de error de ruta: algo falló al cargar o renderizar una sección. */
export function ErrorRuta() {
  const error = useRouteError()
  const reiniciar = useDemo((s) => s.reiniciar)
  const texto = isRouteErrorResponse(error) ? `${error.status} · ${error.statusText}` : error instanceof Error ? error.message : undefined
  return (
    <main id="contenido" className="mx-auto max-w-lg space-y-4 px-4 py-16">
      <ErrorState
        titulo="Algo no salió como esperábamos"
        texto={`No pudimos mostrar esta sección${texto ? ` (${texto})` : ''}. Probá de nuevo o reiniciá la demo.`}
        onReintentar={() => window.location.reload()}
      />
      <div className="flex justify-center gap-3 text-sm font-semibold">
        <Link to="/" className="text-verde-800 hover:underline">Volver al inicio</Link>
        <button type="button" onClick={() => { reiniciar(); window.location.assign(import.meta.env.BASE_URL) }} className="text-verde-800 hover:underline">Reiniciar demo</button>
      </div>
    </main>
  )
}
