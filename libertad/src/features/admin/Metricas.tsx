import { BarrasHorizontales } from '@/charts/BarrasHorizontales'
import { etiquetaEstadoParte, etiquetaNivel, mesLargo, num, porcentaje } from '@/domain/format'
import { partesPorMes, promedio, tasaConformidadRed, tiemposConformidad } from '@/domain/metricas'
import { diasEntre, HOY } from '@/domain/reloj'
import type { EstadoParte, NivelVerificacion } from '@/domain/types'
import { useRed } from '@/features/productor/contratistas/useRed'
import { useDemo } from '@/store/useDemo'
import { Card, CardHeader } from '@/ui/Card'
import { Stat } from '@/ui/Stat'

export function MetricasAdmin() {
  const partes = useDemo((s) => s.partes)
  const productores = useDemo((s) => s.productores)
  const red = useRed()
  const activos = new Set(partes.filter((p) => p.estado !== 'borrador' && diasEntre(p.fecha, HOY) <= 60).map((p) => p.contratistaId))
  const prodActivos = new Set(partes.filter((p) => diasEntre(p.fecha, HOY) <= 60).map((p) => p.productorId))
  const tiempos = tiemposConformidad(partes.filter((p) => p.campania === '2026/27'))
  const porMes = [...partesPorMes(partes.filter((p) => p.fecha >= '2026-05-01')).entries()]
  const ultimoMes = porMes[porMes.length - 1]?.[1] ?? 0
  const niveles: NivelVerificacion[] = ['destacado', 'verificado', 'basico']
  const estados: EstadoParte[] = ['conformado', 'enviado', 'observado', 'en_disputa', 'rechazado', 'pendiente_sync', 'borrador']

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl text-tierra-900">Métricas de la red</h1>
        <p className="text-texto-suave">Zona piloto sur de Santa Fe · campaña 2026/27 · datos de la demo.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat etiqueta="Contratistas activos" valor={activos.size} detalle={`de ${red.length} en la red · ${prodActivos.size} productores activos`} icono="usuarios" tono="verde" />
        <Stat etiqueta="Partes este mes" valor={ultimoMes} detalle={`${partes.filter((p) => p.estado !== 'borrador').length} en total`} icono="documento" tono="cielo" />
        <Stat etiqueta="Tasa de conformidad" valor={porcentaje(tasaConformidadRed(partes))} detalle="Conformados sin observaciones" icono="checkCirculo" tono="verde" />
        <Stat etiqueta="Tiempo medio de conformidad" valor={`${num(promedio(tiempos), 1)} días`} detalle={`Sobre ${tiempos.length} partes de la campaña`} icono="reloj" tono="trigo" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader titulo="Partes por mes" subtitulo="Cargados en la plataforma desde mayo" />
          <BarrasHorizontales ordenar={false} titulo="Partes por mes" columnaValor="Partes" formato={(v) => `${v}`} datos={porMes.map(([m, n]) => ({ clave: m, etiqueta: `${mesLargo(Number(m.slice(5, 7))).replace(/^./, (x) => x.toUpperCase())} ${m.slice(0, 4)}`, valor: n }))} />
        </Card>
        <Card>
          <CardHeader titulo="Contratistas por nivel" subtitulo="Calculado en vivo desde la verificación" />
          <BarrasHorizontales titulo="Contratistas por nivel" columnaValor="Contratistas" formato={(v) => `${v}`} datos={[...niveles.map((n) => ({ clave: n, etiqueta: etiquetaNivel[n], valor: red.filter((f) => f.ev?.nivel === n).length })), { clave: 'revision', etiqueta: 'En revisión', valor: red.filter((f) => !f.ev?.nivel).length }]} />
        </Card>
        <Card>
          <CardHeader titulo="Partes por estado" subtitulo="Toda la red" />
          <BarrasHorizontales titulo="Partes por estado" columnaValor="Partes" formato={(v) => `${v}`} datos={estados.map((e) => ({ clave: e, etiqueta: etiquetaEstadoParte[e], valor: partes.filter((p) => p.estado === e).length }))} />
        </Card>
        <Card>
          <CardHeader titulo="Adopción" subtitulo="Productores y validación profesional" />
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-texto-suave">Productores registrados</dt><dd className="text-2xl font-semibold">{productores.length}</dd></div>
            <div><dt className="text-texto-suave">Plan Pro</dt><dd className="text-2xl font-semibold">{productores.filter((p) => p.plan === 'pro').length}</dd></div>
            <div><dt className="text-texto-suave">Con validación profesional</dt><dd className="text-2xl font-semibold">{productores.filter((p) => p.validacionProfesional).length}</dd></div>
            <div><dt className="text-texto-suave">Comparten reputación de pago</dt><dd className="text-2xl font-semibold">{productores.filter((p) => p.consentimientoReputacionPago).length}</dd></div>
          </dl>
        </Card>
      </div>
    </div>
  )
}
