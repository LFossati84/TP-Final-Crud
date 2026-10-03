import { etiquetaLabor } from '@/domain/format'
import type { ParteLabor } from '@/domain/types'
import { useCatalogo } from '@/store/useCatalogo'
import { ButtonLink } from '@/ui/Button'
import { Icon } from '@/ui/Icon'

export function Exito({ parte, segundos }: { parte: ParteLabor; segundos: number }) {
  const cat = useCatalogo()
  const enCola = parte.estado === 'pendiente_sync'
  const productor = cat.productor(parte.productorId)
  const m = Math.floor(segundos / 60)
  const s = String(segundos % 60).padStart(2, '0')
  return (
    <div className="flex min-h-full flex-col items-center px-6 py-10 text-center" data-tour="parte-enviado">
      <span className={`flex h-20 w-20 animate-entrar-arriba items-center justify-center rounded-full ${enCola ? 'bg-trigo-200 text-trigo-900' : 'bg-verde-100 text-verde-700'}`}>
        <Icon nombre={enCola ? 'nubeOff' : 'checkCirculo'} tamano={44} />
      </span>
      <h1 className="mt-5 font-serif text-2xl text-tierra-900">{enCola ? 'Guardado en el teléfono' : 'Parte enviado'}</h1>
      <p className="mt-1 font-semibold text-texto">
        {parte.numero} · {etiquetaLabor[parte.labor]} · {cat.lote(parte.loteId)?.nombre}
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1 text-sm font-semibold text-texto">
        <Icon nombre="reloj" tamano={16} /> Lo cargaste en <span className="num">{m}:{s}</span>
      </p>
      <p className="mt-5 max-w-xs text-sm text-texto-suave">
        {enCola
          ? 'No hay señal. Apenas vuelva, el parte se envía solo y le avisamos al productor.'
          : `${productor?.razonSocial ?? 'El productor'} ya recibió el aviso. Cuando lo conforme, pasa a su cuaderno, suma a tu reputación y queda listo para cobrar.`}
      </p>
      <div className="mt-8 w-full max-w-xs space-y-2">
        <ButtonLink to={`/contratista/trabajos/${parte.id}`} bloque variante="secundario" icono="documento">
          Ver el parte
        </ButtonLink>
        <ButtonLink to="/contratista" bloque icono="inicio">
          Volver al inicio
        </ButtonLink>
      </div>
    </div>
  )
}
