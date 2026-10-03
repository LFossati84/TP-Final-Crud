import { Chip } from './Chip'
import type { EstadoCobro, EstadoDocumento, EstadoLiquidacion, EstadoParte, EstadoValidacion } from '@/domain/types'
import type { Semaforo } from '@/domain/verificacion'
import { ESTADO_COBRO, ESTADO_DOCUMENTO, ESTADO_LIQUIDACION, ESTADO_PARTE, ESTADO_VALIDACION, SEMAFORO, type Def } from './estados'

function DefChip({ def, tamano }: { def: Def; tamano?: 'sm' | 'md' }) {
  return (
    <Chip tono={def.tono} icono={def.icono} tamano={tamano}>
      {def.texto}
    </Chip>
  )
}

export function EstadoParteChip({ estado, tamano }: { estado: EstadoParte; tamano?: 'sm' | 'md' }) {
  return <DefChip def={ESTADO_PARTE[estado]} tamano={tamano} />
}

export function EstadoLiquidacionChip({ estado, tamano }: { estado: EstadoLiquidacion; tamano?: 'sm' | 'md' }) {
  return <DefChip def={ESTADO_LIQUIDACION[estado]} tamano={tamano} />
}

export function EstadoCobroChip({ estado, tamano }: { estado: EstadoCobro; tamano?: 'sm' | 'md' }) {
  return <DefChip def={ESTADO_COBRO[estado]} tamano={tamano} />
}

export function EstadoDocumentoChip({ estado }: { estado: EstadoDocumento }) {
  return <DefChip def={ESTADO_DOCUMENTO[estado]} />
}

export function EstadoValidacionChip({ estado }: { estado: EstadoValidacion }) {
  return <DefChip def={ESTADO_VALIDACION[estado]} />
}

export function SemaforoChip({ semaforo, texto }: { semaforo: Semaforo; texto?: string }) {
  const def = SEMAFORO[semaforo]
  return <DefChip def={texto ? { ...def, texto } : def} />
}
