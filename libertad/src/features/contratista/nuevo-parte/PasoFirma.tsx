import type { ChangeEvent } from 'react'
import { describirInsumos } from '@/domain/cuaderno'
import { etiquetaLabor, fecha, num } from '@/domain/format'
import type { Contratista, Establecimiento, Foto, Lote } from '@/domain/types'
import { nuevoId } from '@/store/helpers'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { IconButton } from '@/ui/Button'
import { Icon } from '@/ui/Icon'
import { FirmaPad } from '../FirmaPad'
import { FotoIlustrada } from '../FotoIlustrada'
import { construirParte, horasEntre, type BorradorParte } from './modelo'

type Props = { b: BorradorParte; c: Contratista; lote: Lote; est: Establecimiento; cambiar: (p: Partial<BorradorParte>) => void; errores: Partial<Record<string, string>> }

const EJEMPLOS: { tipo: Foto['tipo']; descripcion: string }[] = [
  { tipo: 'lote', descripcion: 'Vista del lote al terminar' },
  { tipo: 'maquina', descripcion: 'Equipo trabajando' },
  { tipo: 'caldo', descripcion: 'Preparación del caldo' },
  { tipo: 'remito', descripcion: 'Remito de insumos' },
]

export function PasoFirma({ b, c, lote, est, cambiar, errores }: Props) {
  const cat = useCatalogo()
  const online = useDemo((s) => s.online)
  const parte = construirParte(b, c, lote, est)
  const maquina = c.flota.find((m) => m.id === b.maquinaId)

  const agregarEjemplo = () => {
    const ej = EJEMPLOS.filter((e) => b.labor === 'pulverizacion' || e.tipo !== 'caldo')[b.fotos.length % 3] ?? EJEMPLOS[0]
    if (!ej) return
    cambiar({ fotos: [...b.fotos, { id: nuevoId('f'), tipo: ej.tipo, descripcion: ej.descripcion }] })
  }
  const subir = (e: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files ?? [])
    cambiar({ fotos: [...b.fotos, ...archivos.map((f) => ({ id: nuevoId('f'), tipo: 'otro' as const, descripcion: f.name, url: URL.createObjectURL(f) }))] })
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <section aria-labelledby="t-fotos">
        <h2 id="t-fotos" className="mb-2 font-sans text-sm font-semibold text-texto">Fotos <span className="font-normal text-texto-suave">· opcional, recomendadas</span></h2>
        <div className="grid grid-cols-3 gap-2">
          {b.fotos.map((f) => (
            <div key={f.id} className="relative">
              <FotoIlustrada foto={f} />
              <IconButton
                icono="x"
                etiqueta={`Quitar foto: ${f.descripcion}`}
                variante="secundario"
                className="absolute -right-1.5 -top-1.5 !min-h-8 !min-w-8 rounded-full shadow"
                onClick={() => cambiar({ fotos: b.fotos.filter((x) => x.id !== f.id) })}
              />
            </div>
          ))}
          <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-borde-fuerte bg-paper-2 text-xs font-semibold text-texto-suave transition hover:bg-paper-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foco">
            <Icon nombre="camara" />
            Sacar foto
            <input type="file" accept="image/*" capture="environment" multiple className="sr-only" onChange={subir} />
          </label>
          <button
            type="button"
            onClick={agregarEjemplo}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-borde-fuerte bg-paper-2 text-xs font-semibold text-texto-suave transition hover:bg-paper-3"
            data-tour="foto-ejemplo"
          >
            <Icon nombre="imagen" />
            Foto de ejemplo
          </button>
        </div>
      </section>

      <section aria-labelledby="t-firma">
        <h2 id="t-firma" className="mb-2 font-sans text-sm font-semibold text-texto">Firma de {b.operario}</h2>
        <FirmaPad valor={b.firma} onCambiar={(firma) => cambiar({ firma })} />
        {errores.firma ? <p className="text-sm font-medium text-rojo-700">{errores.firma}</p> : null}
      </section>

      <section aria-labelledby="t-resumen" className="rounded-2xl border border-borde bg-superficie p-4">
        <h2 id="t-resumen" className="mb-2 font-serif text-lg text-tierra-900">Resumen del parte</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-texto-suave">Lote</dt>
          <dd className="font-medium">{est.nombre} · {lote.nombre}</dd>
          <dt className="text-texto-suave">Productor</dt>
          <dd className="font-medium">{cat.productor(est.productorId)?.razonSocial}</dd>
          <dt className="text-texto-suave">Labor</dt>
          <dd className="font-medium">{b.labor ? etiquetaLabor[b.labor] : '—'} · {maquina?.descripcion.split('·')[0]}</dd>
          <dt className="text-texto-suave">Superficie</dt>
          <dd className="num font-medium">{num(parte.has, 1)} has · {num(horasEntre(b.horaInicio, b.horaFin), 1)} h</dd>
          <dt className="text-texto-suave">Fecha</dt>
          <dd className="num font-medium">{fecha(b.fecha)} · {b.horaInicio}–{b.horaFin}</dd>
          {parte.insumos.length ? (
            <>
              <dt className="text-texto-suave">Insumos</dt>
              <dd className="font-medium">{describirInsumos(parte, cat.insumos)}</dd>
            </>
          ) : null}
          {parte.condiciones ? (
            <>
              <dt className="text-texto-suave">Condiciones</dt>
              <dd className="font-medium">
                Caldo {parte.condiciones.caldo} l/ha · viento {parte.condiciones.viento} km/h {parte.condiciones.direccionViento} · {parte.condiciones.temperatura} °C · HR {parte.condiciones.humedad} %
              </dd>
            </>
          ) : null}
        </dl>
      </section>

      {!online ? (
        <p className="flex items-start gap-2 rounded-xl bg-trigo-50 p-3 text-sm text-trigo-900 ring-1 ring-inset ring-trigo-200">
          <Icon nombre="nubeOff" tamano={18} className="mt-0.5 shrink-0" />
          Estás sin señal. El parte se guarda en el teléfono y se envía solo cuando vuelva la conexión.
        </p>
      ) : null}
    </div>
  )
}
