import { etiquetaLabor, etiquetaMaquina } from '@/domain/format'
import type { Contratista, TipoLabor } from '@/domain/types'
import { OpcionesGrandes, Select } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { ICONO_LABOR } from '@/ui/iconosDominio'
import { maquinaPorDefecto, type BorradorParte } from './modelo'

type Props = { b: BorradorParte; c: Contratista; cambiar: (p: Partial<BorradorParte>) => void; errores: Partial<Record<string, string>> }

export function PasoLabor({ b, c, cambiar, errores }: Props) {
  const maquinas = c.flota.filter((m) => !b.labor || m.labores.includes(b.labor))
  return (
    <div className="space-y-5">
      <div>
        <OpcionesGrandes<TipoLabor>
          label="¿Qué labor hiciste?"
          valor={b.labor}
          onCambiar={(labor) => cambiar({ labor, maquinaId: maquinaPorDefecto(c, labor) })}
          opciones={c.servicios.map((l) => ({ valor: l, texto: etiquetaLabor[l], icono: <Icon nombre={ICONO_LABOR[l]} /> }))}
        />
        {errores.labor ? <p className="mt-1 text-sm font-medium text-rojo-700">{errores.labor}</p> : null}
      </div>
      {b.labor ? (
        <div>
          <OpcionesGrandes
            label="Máquina"
            columnas={1}
            valor={b.maquinaId}
            onCambiar={(maquinaId) => cambiar({ maquinaId })}
            opciones={maquinas.map((m) => ({ valor: m.id, texto: etiquetaMaquina[m.tipo], detalle: `${m.descripcion} · ${m.anio}`, icono: <Icon nombre="tractor" /> }))}
          />
          {errores.maquina ? <p className="mt-1 text-sm font-medium text-rojo-700">{errores.maquina}</p> : null}
        </div>
      ) : null}
      <Select label="Operario" value={b.operario} onChange={(e) => cambiar({ operario: e.target.value })} opciones={c.operarios.map((o) => ({ valor: o, texto: o }))} />
    </div>
  )
}
