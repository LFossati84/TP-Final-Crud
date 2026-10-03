import { num } from '@/domain/format'
import { HOY, horaActual } from '@/domain/reloj'
import type { Lote } from '@/domain/types'
import { useCatalogo } from '@/store/useCatalogo'
import { Button } from '@/ui/Button'
import { cx } from '@/ui/cx'
import { Input, Select, Textarea } from '@/ui/FormField'
import { InputNumero } from '@/ui/InputNumero'
import { Icon } from '@/ui/Icon'
import { aNumero, horasEntre, type BorradorParte } from './modelo'

type Props = { b: BorradorParte; lote: Lote | undefined; cambiar: (p: Partial<BorradorParte>) => void; errores: Partial<Record<string, string>> }

export function PasoSuperficie({ b, lote, cambiar, errores }: Props) {
  const cat = useCatalogo()
  const has = aNumero(b.has)
  const excede = lote && has > lote.has * 1.02
  const horas = horasEntre(b.horaInicio, b.horaFin)
  const insumosLabor = cat.insumos.filter((i) => (b.labor === 'siembra' ? i.tipo === 'semilla' || i.tipo === 'fertilizante' : i.tipo === 'fertilizante'))
  const insumo = b.insumos[0]

  return (
    <div className="space-y-5">
      <div>
        <Input
          label="Hectáreas trabajadas"
          inputMode="decimal"
          value={b.has}
          onChange={(e) => cambiar({ has: e.target.value })}
          sufijo="has"
          error={errores.has}
          data-tour="input-has"
        />
        {lote ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {[1, 0.5].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => cambiar({ has: String(Math.round(lote.has * f * 10) / 10) })}
                className="min-h-10 rounded-full bg-paper-2 px-3 text-sm font-semibold text-texto ring-1 ring-inset ring-borde hover:bg-paper-3"
              >
                {f === 1 ? `Lote completo · ${num(lote.has, 1)} has` : `Medio lote · ${num(lote.has / 2, 1)} has`}
              </button>
            ))}
          </div>
        ) : null}
        {excede ? (
          <p className="mt-2 flex items-start gap-2 rounded-xl bg-trigo-50 p-2.5 text-sm text-trigo-900 ring-1 ring-inset ring-trigo-200" role="status">
            <Icon nombre="alerta" tamano={16} className="mt-0.5 shrink-0" />
            Son más hectáreas que la superficie del lote ({num(lote.has, 1)} has). Revisalo antes de enviar: el productor lo va a ver.
          </p>
        ) : null}
      </div>

      <Input label="Fecha" type="date" max={HOY} value={b.fecha} onChange={(e) => cambiar({ fecha: e.target.value })} error={errores.fecha} />

      <div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Inicio" type="time" value={b.horaInicio} onChange={(e) => cambiar({ horaInicio: e.target.value })} />
          <Input label="Fin" type="time" value={b.horaFin} onChange={(e) => cambiar({ horaFin: e.target.value })} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className={cx('num text-sm', errores.horario ? 'font-medium text-rojo-700' : 'text-texto-suave')}>
            {errores.horario ?? `${num(horas, 1)} h de trabajo${horas > 0 && has > 0 ? ` · ${num(has / horas, 1)} has/h` : ''}`}
          </p>
          <Button variante="fantasma" tamano="sm" icono="reloj" onClick={() => cambiar({ horaFin: horaActual() })}>
            Terminé ahora
          </Button>
        </div>
      </div>

      {b.labor === 'siembra' || b.labor === 'fertilizacion' ? (
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Select
            label={b.labor === 'siembra' ? 'Semilla / fertilizante' : 'Fertilizante'}
            value={insumo?.insumoId ?? ''}
            placeholder="Elegí el producto"
            onChange={(e) => cambiar({ insumos: e.target.value ? [{ insumoId: e.target.value, dosis: insumo?.dosis ?? 0 }] : [] })}
            opciones={insumosLabor.map((i) => ({ valor: i.id, texto: i.nombre }))}
            opcional
          />
          <InputNumero
            label="Dosis"
            valor={insumo?.dosis ?? 0}
            onValor={(n) => insumo && cambiar({ insumos: [{ ...insumo, dosis: n }] })}
            sufijo={insumo ? cat.insumo(insumo.insumoId)?.unidad : undefined}
            disabled={!insumo}
          />
        </div>
      ) : null}

      <Textarea label="Observaciones" opcional value={b.notas} onChange={(e) => cambiar({ notas: e.target.value })} placeholder="Ej.: se cortó por lluvia, cabeceras sin aplicar…" rows={2} />
    </div>
  )
}
