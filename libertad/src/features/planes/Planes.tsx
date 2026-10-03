import { Link } from 'react-router'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'

interface Plan {
  nombre: string
  precio: string
  para: string
  destacado?: boolean
  incluye: string[]
}

const PRODUCTOR: Plan[] = [
  { nombre: 'Gratis', precio: '$ 0', para: 'Para empezar a ordenar el campo', incluye: ['Cuaderno básico de un establecimiento', 'Recepción y conformidad de partes', 'Red de contratistas verificados', 'Exportar el cuaderno a PDF'] },
  { nombre: 'Pro', precio: 'A definir', para: 'Para empresas con varios campos', destacado: true, incluye: ['Varios establecimientos y lotes', 'Informes de costos por labor y por lote', 'Validación profesional con sello del ingeniero', 'Pagos, vencimientos e historial', 'Usuarios para encargados y administración'] },
]

const CONTRATISTA: Plan[] = [
  { nombre: 'Básico', precio: '$ 0', para: 'Para cargar partes y cobrar', incluye: ['Parte de labor con o sin señal', 'Perfil con flota y zonas', 'Liquidaciones y seguimiento de cobros', 'Recordatorios manuales por WhatsApp'] },
  { nombre: 'Verificado', precio: 'A definir / mes', para: 'Para aparecer en las búsquedas', destacado: true, incluye: ['Badge Verificado tras la revisión documental', 'Visible en búsquedas filtradas por verificación', 'Recordatorios automáticos de cobranza', 'Alertas de vencimiento de documentos'] },
  { nombre: 'Destacado', precio: 'A definir / mes', para: 'Para los que ya demostraron', incluye: ['Todo lo de Verificado', 'Badge Destacado (antigüedad, trabajos y calificación)', 'Prioridad en resultados de búsqueda', 'Reportes de reputación para compartir'] },
]

function Grupo({ titulo, planes, nota }: { titulo: string; planes: Plan[]; nota?: string }) {
  return (
    <section aria-labelledby={`t-${titulo}`} className="space-y-4">
      <h2 id={`t-${titulo}`} className="text-2xl text-tierra-900">{titulo}</h2>
      <div className={cx('grid gap-4', planes.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {planes.map((p) => (
          <Card key={p.nombre} className={cx('flex flex-col', p.destacado && 'ring-2 ring-verde-400')}>
            <div className="flex items-center justify-between">
              <p className="font-serif text-2xl text-tierra-900">{p.nombre}</p>
              {p.destacado ? <Chip tono="verde">Recomendado</Chip> : null}
            </div>
            <p className="text-sm text-texto-suave">{p.para}</p>
            <p className="mt-3 text-2xl font-semibold text-tierra-900">{p.precio}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {p.incluye.map((i) => <li key={i} className="flex gap-2"><Icon nombre="check" tamano={16} className="mt-0.5 shrink-0 text-verde-600" />{i}</li>)}
            </ul>
          </Card>
        ))}
      </div>
      {nota ? <p className="text-sm text-texto-suave">{nota}</p> : null}
    </section>
  )
}

export function Planes() {
  return (
    <main id="contenido" className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-trigo-700">Planes ilustrativos</p>
        <h1 className="text-4xl text-tierra-900">Simple para empezar, completo para crecer</h1>
        <p className="mt-2 max-w-2xl text-texto-suave">El productor empieza gratis. El contratista paga cuando la red le trae trabajo y le ordena la cobranza. Precios a definir con los pilotos.</p>
      </header>
      <Grupo titulo="Productor" planes={PRODUCTOR} />
      <Grupo titulo="Contratista" planes={CONTRATISTA} nota="Comisión opcional sobre la cobranza gestionada a través de la plataforma: a definir. “Cobrar al instante” (adelanto de liquidaciones con una entidad asociada) estará disponible más adelante." />
      <div className="flex flex-wrap gap-3">
        <Link to="/onboarding?rol=productor" className="inline-flex min-h-tactil items-center gap-2 rounded-xl bg-accion px-4 font-semibold text-sobre-accion hover:bg-accion-hover">Crear cuenta de productor</Link>
        <Link to="/onboarding?rol=contratista" className="inline-flex min-h-tactil items-center gap-2 rounded-xl border border-borde-fuerte bg-superficie px-4 font-semibold hover:bg-paper-2">Crear cuenta de contratista</Link>
      </div>
      <p className="text-xs text-texto-suave">Demo ilustrativa: valores, alcances y condiciones a definir. No constituye oferta comercial.</p>
    </main>
  )
}
