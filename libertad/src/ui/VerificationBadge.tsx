import { etiquetaNivel } from '@/domain/format'
import type { NivelVerificacion } from '@/domain/types'
import { NOTA_NORMATIVA } from '@/domain/verificacion'
import { cx } from './cx'
import { Icon, type NombreIcono } from './Icon'
import { Tooltip } from './Tooltip'

const NIVELES: Record<NivelVerificacion | 'pendiente', { clase: string; icono: NombreIcono; texto: string; descripcion: string }> = {
  pendiente: {
    clase: 'bg-paper-3 text-texto-suave ring-borde',
    icono: 'reloj',
    texto: 'En revisión',
    descripcion: 'Alta en revisión: falta validar identidad y CUIT.',
  },
  basico: {
    clase: 'bg-tierra-100 text-tierra-800 ring-tierra-300',
    icono: 'escudo',
    texto: etiquetaNivel.basico,
    descripcion: 'Básico: identidad y CUIT activo validados.',
  },
  verificado: {
    clase: 'bg-verde-100 text-verde-800 ring-verde-300',
    icono: 'escudoCheck',
    texto: etiquetaNivel.verificado,
    descripcion: 'Verificado: situación impositiva regular, ART vigente, seguro de maquinaria y habilitaciones de aplicador según corresponda.',
  },
  destacado: {
    clase: 'bg-trigo-200 text-trigo-900 ring-trigo-400',
    icono: 'medalla',
    texto: etiquetaNivel.destacado,
    descripcion: 'Destacado: además de Verificado, antigüedad, trabajos conformados, calificación alta y sin disputas abiertas.',
  },
}

type Props = { nivel: NivelVerificacion | null; tamano?: 'sm' | 'md' | 'lg'; conTooltip?: boolean; className?: string }

/**
 * Badge del nivel de verificación. Se re-monta al cambiar de nivel (key) y
 * dispara una animación breve: así el cambio "en vivo" se nota (F4).
 */
export function VerificationBadge({ nivel, tamano = 'md', conTooltip = true, className }: Props) {
  const def = NIVELES[nivel ?? 'pendiente']
  const badge = (
    <span
      key={nivel ?? 'pendiente'}
      tabIndex={conTooltip ? 0 : undefined}
      className={cx(
        'inline-flex animate-entrar-arriba items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset',
        tamano === 'sm' && 'px-2 py-0.5 text-[11px]',
        tamano === 'md' && 'px-2.5 py-1 text-xs',
        tamano === 'lg' && 'px-3.5 py-1.5 text-sm',
        def.clase,
        className,
      )}
    >
      <Icon nombre={def.icono} tamano={tamano === 'lg' ? 18 : 14} />
      {def.texto}
    </span>
  )
  if (!conTooltip) return badge
  return (
    <Tooltip
      texto={
        <>
          {def.descripcion}
          <span className="mt-1.5 block border-t border-tierra-700 pt-1.5 font-normal italic text-tierra-200">{NOTA_NORMATIVA}.</span>
        </>
      }
    >
      {badge}
    </Tooltip>
  )
}
