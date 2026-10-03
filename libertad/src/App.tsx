const piezas = [
  { titulo: 'Parte de labor', texto: 'El contratista registra cada labor y el productor la conforma.' },
  { titulo: 'Cuaderno del establecimiento', texto: 'Libro cronológico por lote y campaña, alimentado por los partes conformados.' },
  { titulo: 'Red de contratistas verificados', texto: 'Verificación documental por niveles y reputación basada en trabajos reales.' },
  { titulo: 'Cobranza', texto: 'Cada parte conformado queda listo para cobrar y alimenta la liquidación.' },
]

/** Pantalla provisoria de Fase 0: se reemplaza por el router en Fase 1. */
export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-8 px-4 py-12">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-trigo-700">Demo interactiva · en construcción</p>
        <h1 className="text-4xl text-tierra-900 sm:text-5xl">Proyecto Libertad II</h1>
        <p className="text-lg text-texto-suave">
          Un solo dato —el parte conformado— alimenta el cuaderno del productor, la reputación del contratista y la cobranza.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {piezas.map((p) => (
          <li key={p.titulo} className="rounded-xl border border-borde bg-superficie p-4 shadow-tarjeta">
            <h2 className="text-lg text-verde-800">{p.titulo}</h2>
            <p className="mt-1 text-sm text-texto-suave">{p.texto}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
