import { etiquetaDocumentoCorta, relativo } from '@/domain/format'
import type { EvaluacionVerificacion } from '@/domain/verificacion'
import { Chip } from '@/ui/Chip'

/** F8: advertencia visible en búsquedas cuando un documento clave vence pronto o venció. */
export function AvisoDocumentacion({ ev }: { ev: EvaluacionVerificacion | null }) {
  if (!ev || ev.alertas.length === 0) return null
  return (
    <>
      {ev.alertas.map(({ documento, dias }) => (
        <Chip key={documento.id} tono={dias < 0 ? 'rojo' : 'trigo'} icono="alerta">
          {etiquetaDocumentoCorta[documento.tipo]} {dias < 0 ? 'vencida' : `vence ${relativo(dias)}`}
        </Chip>
      ))}
    </>
  )
}
