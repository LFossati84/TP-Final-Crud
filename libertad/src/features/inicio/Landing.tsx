import { Link, useNavigate } from 'react-router'
import { DESCRIPCION_ROL, ICONO_ROL, RUTA_INICIO } from '@/app/navegacion'
import { etiquetaRol } from '@/domain/format'
import type { Rol } from '@/domain/types'
import { FLUJOS } from '@/features/tour/catalogo'
import { useDemo } from '@/store/useDemo'
import { cx } from '@/ui/cx'
import { Icon, type NombreIcono } from '@/ui/Icon'

const ROLES: Rol[] = ['contratista', 'productor', 'ingeniero', 'admin']

const DESTINOS: { titulo: string; texto: string; icono: NombreIcono; clase: string }[] = [
  { titulo: 'Cuaderno del establecimiento', texto: 'La labor queda registrada por lote y campaña.', icono: 'libro', clase: 'bg-tierra-100 text-tierra-800' },
  { titulo: 'Reputación del contratista', texto: 'Cada conformidad suma a su historial real.', icono: 'estrella', clase: 'bg-trigo-100 text-trigo-800' },
  { titulo: 'Cobranza', texto: 'Queda lista para liquidar, seguir y cobrar.', icono: 'billetera', clase: 'bg-verde-100 text-verde-800' },
]

export function Landing() {
  const navigate = useNavigate()
  const rolActual = useDemo((s) => s.rol)
  const setRol = useDemo((s) => s.setRol)
  const entrar = (r: Rol) => {
    setRol(r)
    navigate(RUTA_INICIO[r])
  }

  return (
    <main id="contenido" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-trigo-700">Sur de Santa Fe · Campaña 2026/27</p>
          <h1 className="mt-3 text-4xl leading-[1.08] text-tierra-900 sm:text-5xl">
            Un solo parte.
            <br />
            Cuaderno, reputación y cobranza al día.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-texto-suave">
            Proyecto Libertad II conecta al contratista y al productor sobre el mismo dato: el parte de labor conformado. Lo que se carga en el lote termina en el cuaderno,
            en la reputación y en la cobranza, sin volver a tipearlo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => entrar(rolActual)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accion px-5 font-semibold text-sobre-accion shadow-tarjeta transition hover:bg-accion-hover">
              Continuar como {etiquetaRol[rolActual].toLowerCase()}
              <Icon nombre="flechaDerecha" />
            </button>
            <Link to="/kit" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-borde-fuerte bg-superficie px-5 font-semibold transition hover:bg-paper-2">
              <Icon nombre="grilla" /> Sistema de diseño
            </Link>
          </div>
        </div>

        {/* Diagrama de la idea fuerza */}
        <div className="rounded-3xl border border-borde bg-superficie p-5 shadow-tarjeta sm:p-6" aria-label="Un parte conformado alimenta el cuaderno, la reputación y la cobranza">
          <div className="flex items-center gap-3 rounded-2xl bg-verde-50 p-4 ring-1 ring-verde-200">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accion text-sobre-accion">
              <Icon nombre="documento" tamano={24} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-verde-700">PL-0631 · Conformado</p>
              <p className="font-serif text-lg text-tierra-900">Pulverización fungicida · 120 has</p>
              <p className="text-sm text-texto-suave">La Esperanza · Lote 2 La Loma</p>
            </div>
          </div>
          <div className="mx-auto my-1 flex h-8 w-px bg-borde-fuerte" aria-hidden />
          <ul className="grid gap-3 sm:grid-cols-3">
            {DESTINOS.map((d) => (
              <li key={d.titulo} className="rounded-2xl border border-borde p-3">
                <span className={cx('mb-2 flex h-9 w-9 items-center justify-center rounded-lg', d.clase)}>
                  <Icon nombre={d.icono} tamano={18} />
                </span>
                <p className="text-sm font-semibold leading-snug text-texto">{d.titulo}</p>
                <p className="mt-0.5 text-xs text-texto-suave">{d.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="titulo-roles">
        <h2 id="titulo-roles" className="text-2xl text-tierra-900">Elegí desde dónde mirar</h2>
        <p className="mt-1 text-texto-suave">Podés cambiar de rol en cualquier momento desde la barra superior.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => entrar(r)}
              className={cx(
                'group flex flex-col rounded-2xl border bg-superficie p-5 text-left shadow-tarjeta transition hover:-translate-y-0.5 hover:shadow-elevada',
                r === rolActual ? 'border-verde-400 ring-1 ring-verde-300' : 'border-borde hover:border-borde-fuerte',
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-verde-100 text-verde-800">
                <Icon nombre={ICONO_ROL[r]} tamano={24} />
              </span>
              <span className="mt-4 font-serif text-xl text-tierra-900">{etiquetaRol[r]}</span>
              <span className="mt-1 flex-1 text-sm text-texto-suave">{DESCRIPCION_ROL[r]}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-verde-800">
                {r === 'contratista' ? 'Abrir la app (celular)' : 'Entrar'}
                <Icon nombre="flechaDerecha" tamano={16} className="transition group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="titulo-flujos">
        <h2 id="titulo-flujos" className="text-2xl text-tierra-900">Flujos que podés recorrer</h2>
        <p className="mt-1 text-texto-suave">Cada uno se puede hacer con clics reales; el recorrido guiado te marca el camino.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {FLUJOS.map((f) => (
            <li key={f.id} className="flex gap-3 rounded-2xl border border-borde bg-superficie p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-acento font-serif font-bold text-sobre-acento">{f.id}</span>
              <div>
                <p className="font-semibold text-texto">{f.titulo}</p>
                <p className="mt-0.5 text-sm text-texto-suave">{f.resumen}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-14 border-t border-borde pt-6 text-sm text-texto-suave">
        Demo ilustrativa con datos ficticios. No procesa pagos ni emite comprobantes fiscales y no se conecta a ningún servicio real.
      </footer>
    </main>
  )
}
