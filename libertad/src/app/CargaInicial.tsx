import { SkeletonLista } from '@/ui/EmptyState'

/** Pantalla mientras se descarga la primera sección (carga diferida por ruta). */
export function CargaInicial() {
  return (
    <div className="min-h-dvh bg-paper" role="status" aria-live="polite">
      <div className="h-14 bg-barra" />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-4 font-serif text-xl text-tierra-900">Cargando Proyecto Libertad II…</p>
        <SkeletonLista filas={4} />
      </div>
    </div>
  )
}
