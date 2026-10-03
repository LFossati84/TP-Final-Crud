import { useMemo, useState } from 'react'
import { fecha, num } from '@/domain/format'
import { evaluarParte } from '@/domain/validacion'
import type { Contratista, Establecimiento, Lote } from '@/domain/types'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button, IconButton } from '@/ui/Button'
import { cx } from '@/ui/cx'
import { Input, Select } from '@/ui/FormField'
import { InputNumero } from '@/ui/InputNumero'
import { Icon } from '@/ui/Icon'
import { construirParte, type BorradorParte } from './modelo'

type Props = {
  b: BorradorParte
  c: Contratista
  lote: Lote
  est: Establecimiento
  cambiar: (p: Partial<BorradorParte>) => void
  errores: Partial<Record<string, string>>
}

const DIRECCIONES = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const

export function PasoInsumos({ b, c, lote, est, cambiar, errores }: Props) {
  const cat = useCatalogo()
  const online = useDemo((s) => s.online)
  const [consultando, setConsultando] = useState(false)
  const fitos = cat.insumos.filter((i) => ['herbicida', 'insecticida', 'fungicida', 'coadyuvante'].includes(i.tipo))
  const recetas = cat.recetas.filter((r) => r.loteIds.includes(lote.id) && r.vence >= b.fecha && r.fecha <= b.fecha)
  const receta = cat.receta(b.recetaId || undefined)

  const hallazgos = useMemo(() => evaluarParte(construirParte(b, c, lote, est), cat.insumos, lote, receta), [b, c, lote, est, cat.insumos, receta])

  const elegirReceta = (id: string) => {
    const r = cat.receta(id || undefined)
    cambiar({
      recetaId: id,
      ...(r ? { insumos: r.productos.map((p) => ({ ...p })), condiciones: { ...b.condiciones, caldo: b.condiciones.caldo || String(r.caldoMin) } } : {}),
    })
  }

  const tomarEstacion = () => {
    setConsultando(true)
    window.setTimeout(() => {
      cambiar({ condiciones: { ...b.condiciones, viento: '11', direccionViento: 'NE', temperatura: '19', humedad: '62' } })
      setConsultando(false)
    }, 900)
  }

  return (
    <div className="space-y-5">
      <div>
        <Select
          label="Receta agronómica"
          value={b.recetaId}
          onChange={(e) => elegirReceta(e.target.value)}
          placeholder="Sin receta"
          opciones={recetas.map((r) => ({ valor: r.id, texto: `${r.numero} · vence ${fecha(r.vence)}` }))}
          hint={receta ? receta.objetivo : recetas.length ? 'Elegila y se cargan los productos solos.' : 'No hay recetas vigentes para este lote.'}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-texto">Productos aplicados</legend>
        <ul className="space-y-2">
          {b.insumos.map((ia, i) => {
            const ins = cat.insumo(ia.insumoId)
            const fuera = ins?.dosisMax !== undefined && ins.dosisMin !== undefined && (ia.dosis > ins.dosisMax || (ia.dosis > 0 && ia.dosis < ins.dosisMin))
            return (
              <li key={i} className="rounded-xl border border-borde bg-superficie p-3">
                <div className="flex items-start gap-2">
                  <Select
                    className="flex-1"
                    label={`Producto ${i + 1}`}
                    value={ia.insumoId}
                    onChange={(e) => cambiar({ insumos: b.insumos.map((x, j) => (j === i ? { ...x, insumoId: e.target.value } : x)) })}
                    opciones={fitos.map((f) => ({ valor: f.id, texto: f.nombre }))}
                  />
                  <IconButton icono="basura" etiqueta={`Quitar producto ${i + 1}`} className="mt-7" onClick={() => cambiar({ insumos: b.insumos.filter((_, j) => j !== i) })} />
                </div>
                <InputNumero
                  className="mt-2"
                  label="Dosis"
                  valor={ia.dosis}
                  onValor={(n) => cambiar({ insumos: b.insumos.map((x, j) => (j === i ? { ...x, dosis: n } : x)) })}
                  sufijo={ins?.unidad}
                  hint={ins?.dosisMin !== undefined ? `Rango de referencia: ${num(ins.dosisMin)}–${num(ins.dosisMax ?? 0)} ${ins.unidad}` : undefined}
                  error={fuera ? `Fuera del rango de referencia (${num(ins?.dosisMin ?? 0)}–${num(ins?.dosisMax ?? 0)} ${ins?.unidad ?? ''})` : undefined}
                  data-tour={`dosis-${i}`}
                />
              </li>
            )
          })}
        </ul>
        <Button variante="secundario" tamano="sm" icono="mas" className="mt-2" onClick={() => cambiar({ insumos: [...b.insumos, { insumoId: fitos[0]?.id ?? '', dosis: 0 }] })}>
          Agregar producto
        </Button>
        {errores.insumos ? <p className="mt-1 text-sm font-medium text-rojo-700">{errores.insumos}</p> : null}
      </fieldset>

      <Input label="Caldo" inputMode="decimal" value={b.condiciones.caldo} onChange={(e) => cambiar({ condiciones: { ...b.condiciones, caldo: e.target.value } })} sufijo="l/ha" error={errores.caldo} />

      <fieldset className="rounded-2xl bg-paper-2 p-3">
        <legend className="sr-only">Condiciones al aplicar</legend>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-texto">Condiciones al aplicar</p>
          <Button variante="secundario" tamano="sm" icono={consultando ? undefined : 'viento'} cargando={consultando} onClick={tomarEstacion} disabled={!online}>
            {online ? 'Tomar de la estación' : 'Sin señal'}
          </Button>
        </div>
        {!online ? <p className="mb-2 text-xs text-texto-suave">Sin señal: cargalas a mano desde el anemómetro de la máquina.</p> : null}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Viento" inputMode="decimal" value={b.condiciones.viento} onChange={(e) => cambiar({ condiciones: { ...b.condiciones, viento: e.target.value } })} sufijo="km/h" />
          <Select
            label="Dirección"
            value={b.condiciones.direccionViento}
            onChange={(e) => cambiar({ condiciones: { ...b.condiciones, direccionViento: e.target.value as BorradorParte['condiciones']['direccionViento'] } })}
            opciones={DIRECCIONES.map((d) => ({ valor: d, texto: d }))}
          />
          <Input label="Temperatura" inputMode="decimal" value={b.condiciones.temperatura} onChange={(e) => cambiar({ condiciones: { ...b.condiciones, temperatura: e.target.value } })} sufijo="°C" />
          <Input label="Humedad" inputMode="decimal" value={b.condiciones.humedad} onChange={(e) => cambiar({ condiciones: { ...b.condiciones, humedad: e.target.value } })} sufijo="%" />
        </div>
        {errores.condiciones ? <p className="mt-2 text-sm font-medium text-rojo-700">{errores.condiciones}</p> : null}
      </fieldset>

      <div aria-live="polite">
        {hallazgos.filter((h) => h.codigo !== 'has_excedidas').length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-verde-50 p-3 text-sm font-medium text-verde-900 ring-1 ring-inset ring-verde-200">
            <Icon nombre="checkCirculo" tamano={18} /> Dosis, condiciones y receta dentro de lo indicado.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {hallazgos
              .filter((h) => h.codigo !== 'has_excedidas')
              .map((h) => (
                <li key={h.codigo + h.texto} className={cx('flex items-start gap-2 rounded-xl p-2.5 text-sm ring-1 ring-inset', h.severidad === 'peligro' ? 'bg-rojo-50 text-rojo-900 ring-rojo-200' : 'bg-trigo-50 text-trigo-900 ring-trigo-200')}>
                  <Icon nombre="alerta" tamano={16} className="mt-0.5 shrink-0" />
                  {h.texto}
                </li>
              ))}
            <li className="text-xs text-texto-suave">Podés enviar igual: el productor y el ingeniero verán estas alertas.</li>
          </ul>
        )}
      </div>
    </div>
  )
}
