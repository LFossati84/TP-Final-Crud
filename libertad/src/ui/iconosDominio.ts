import type { TipoLabor } from '@/domain/types'
import type { NombreIcono } from './Icon'

export const ICONO_LABOR: Record<TipoLabor, NombreIcono> = {
  siembra: 'brote',
  pulverizacion: 'gota',
  fertilizacion: 'capas',
  cosecha: 'trigo',
  laboreo: 'tractor',
}
