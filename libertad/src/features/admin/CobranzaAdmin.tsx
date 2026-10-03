import { BarrasHorizontales } from '@/charts/BarrasHorizontales'
import { diasVencida, estadoCobro, saldo, tramoMora, TRAMOS_MORA } from '@/domain/cobranza'
import { fecha, pesos, pesosCompacto, porcentaje } from '@/domain/format'
import { resumenCobranzaRed } from '@/domain/metricas'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Card, CardHeader } from '@/ui/Card'
import { EmptyState } from '@/ui/EmptyState'
import { Stat } from '@/ui/Stat'
import { EstadoCobroChip } from '@/ui/StatusChip'
import { NotaLegalCobranza } from '../cobranza/piezas'

export function CobranzaAdmin() {
  const liquidaciones = useDemo((s) => s.liquidaciones)
  const cat = useCatalogo()
  const r = resumenCobranzaRed(liquidaciones)
  const enMora = liquidaciones.filter((l) => estadoCobro(l) === 'vencido' || estadoCobro(l) === 'en_disputa').sort((a, b) => diasVencida(b) - diasVencida(a))
  const tramos = TRAMOS_MORA.map((t) => ({
    clave: t,
    etiqueta: t,
    valor: liquidaciones.filter((l) => estadoCobro(l) === 'vencido' && tramoMora(diasVencida(l)) === t).reduce((s, l) => s + saldo(l), 0),
    detalle: `${liquidaciones.filter((l) => estadoCobro(l) === 'vencido' && tramoMora(diasVencida(l)) === t).length} liquidaciones`,
  }))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl text-tierra-900">Cobranza gestionada</h1>
        <p className="text-texto-suave">Liquidaciones armadas en la red sobre partes conformados. Montos con IVA.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat etiqueta="Monto gestionado" valor={pesosCompacto(r.gestionado)} detalle={`${liquidaciones.length} liquidaciones`} icono="moneda" tono="tierra" />
        <Stat etiqueta="Cobrado" valor={pesosCompacto(r.cobrado)} detalle={`${porcentaje(r.gestionado ? r.cobrado / r.gestionado : 0)} del gestionado`} icono="checkCirculo" tono="verde" />
        <Stat etiqueta="Cobro en término" valor={porcentaje(r.cobroEnTermino)} detalle="Cobradas al vencimiento, sobre las ya exigibles" icono="reloj" tono="cielo" />
        <Stat etiqueta="En mora o disputa" valor={pesosCompacto(r.vencido + r.enDisputa)} detalle={`${pesos(r.vencido)} vencido · ${pesos(r.enDisputa)} en disputa`} icono="alerta" tono="rojo" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader titulo="Mora por antigüedad" subtitulo="Saldo vencido según días de atraso" />
          <BarrasHorizontales ordenar={false} titulo="Mora por antigüedad" columnaValor="Saldo vencido" formato={pesos} datos={tramos} />
        </Card>
        <Card>
          <CardHeader titulo="Liquidaciones en mora o disputa" />
          {enMora.length === 0 ? (
            <EmptyState icono="checkCirculo" titulo="Sin mora en la red" />
          ) : (
            <ul className="divide-y divide-borde">
              {enMora.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{l.numero} · {cat.contratista(l.contratistaId)?.razonSocial}</span>
                    <span className="block text-xs text-texto-suave">{cat.productor(l.productorId)?.razonSocial} · venció {fecha(l.vencimiento)}{diasVencida(l) ? ` (hace ${diasVencida(l)} días)` : ''} · {l.recordatorios.filter((x) => x.estado === 'enviado').length} recordatorios</span>
                  </span>
                  <EstadoCobroChip estado={estadoCobro(l)} />
                  <span className="num w-28 text-right font-semibold">{pesos(saldo(l))}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <NotaLegalCobranza />
    </div>
  )
}
