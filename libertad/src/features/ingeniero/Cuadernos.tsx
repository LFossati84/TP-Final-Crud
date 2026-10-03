import { useSearchParams } from 'react-router'
import { describirInsumos } from '@/domain/cuaderno'
import { fecha, slugCampania } from '@/domain/format'
import { CAMPANIA_ACTIVA } from '@/domain/reloj'
import type { Campania } from '@/domain/types'
import { NOTA_VALIDACION_PROFESIONAL } from '@/domain/validacion'
import { useCatalogo } from '@/store/useCatalogo'
import { ButtonLink } from '@/ui/Button'
import { Card, CardHeader } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Select } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { ProgressBar } from '@/ui/ProgressBar'
import { EstadoValidacionChip } from '@/ui/StatusChip'
import { useAgronomia } from './useAgronomia'

export function CuadernosIngeniero() {
  const cat = useCatalogo()
  const { ing, activos, aplicaciones } = useAgronomia()
  const [params, setParams] = useSearchParams()
  const cliente = params.get('cliente') ?? activos[0]?.id ?? ''
  const campania = (params.get('campania') as Campania | null) ?? CAMPANIA_ACTIVA
  const ests = cat.establecimientos.filter((e) => e.productorId === cliente)
  if (!ing) return <EmptyState titulo="No encontramos el ingeniero" />
  if (activos.length === 0) return <EmptyState icono="libro" titulo="Ningún cliente activó la validación" texto="Cuando un productor te habilite, vas a ver sus cuadernos acá." />

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl text-tierra-900">Cuadernos con validación</h1>
        <p className="text-texto-suave">Las aplicaciones que validás llevan tu sello en el cuaderno y en el informe PDF.</p>
      </header>
      <div className="flex flex-wrap items-end gap-3">
        <Select label="Cliente" className="w-64" value={cliente} onChange={(e) => setParams({ cliente: e.target.value, campania })} opciones={activos.map((p) => ({ valor: p.id, texto: p.razonSocial }))} />
        <Select label="Campaña" className="w-36" value={campania} onChange={(e) => setParams({ cliente, campania: e.target.value })} opciones={[{ valor: '2026/27', texto: '2026/27' }, { valor: '2025/26', texto: '2025/26' }]} />
      </div>
      {ests.map((e) => {
        const apps = aplicaciones.filter((p) => p.establecimientoId === e.id && p.campania === campania && p.estado !== 'enviado').sort((a, b) => a.fecha.localeCompare(b.fecha))
        const val = apps.filter((p) => p.validacion?.estado === 'validada').length
        return (
          <Card key={e.id}>
            <CardHeader
              titulo={e.nombre}
              subtitulo={`${e.localidad} · ${apps.length} aplicaciones conformadas`}
              acciones={<ButtonLink to={`/imprimir/cuaderno/${e.id}/${slugCampania(campania)}`} variante="secundario" tamano="sm" icono="descargar">Informe PDF</ButtonLink>}
            />
            <ProgressBar valor={apps.length ? val / apps.length : 0} etiqueta={`${val} de ${apps.length} aplicaciones validadas`} />
            {apps.length === 0 ? (
              <EmptyState className="mt-4" icono="gota" titulo="Sin aplicaciones en esta campaña" />
            ) : (
              <ul className="mt-4 divide-y divide-borde">
                {apps.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
                    <span className="num w-24 shrink-0 text-sm text-texto-suave">{fecha(p.fecha)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{cat.lote(p.loteId)?.nombre} · {p.numero}</span>
                      <span className="block truncate text-xs text-texto-suave">{describirInsumos(p, cat.insumos)}</span>
                    </span>
                    {p.validacion?.estado === 'validada' ? <Chip tono="verde" icono="sello">Validado por Ing. Agr. {ing.nombre} – {ing.matricula}</Chip> : p.validacion ? <EstadoValidacionChip estado={p.validacion.estado} /> : <Chip tono="neutro">Sin validar</Chip>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )
      })}
      <p className="flex items-start gap-2 rounded-xl bg-paper-2 p-3 text-sm text-texto-suave"><Icon nombre="info" tamano={16} className="mt-0.5 shrink-0" />{NOTA_VALIDACION_PROFESIONAL}.</p>
    </div>
  )
}
