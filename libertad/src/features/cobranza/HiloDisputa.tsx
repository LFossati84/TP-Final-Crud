import { useState } from 'react'
import { etiquetaRol, fechaHora, pesos } from '@/domain/format'
import type { Disputa, Rol } from '@/domain/types'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { cx } from '@/ui/cx'

const ESTADO = { abierta: { tono: 'rojo', texto: 'Abierta' }, en_mediacion: { tono: 'trigo', texto: 'En mediación' }, resuelta: { tono: 'verde', texto: 'Resuelta' } } as const

/** Conversación de una disputa entre contratista, productor y la red. */
export function HiloDisputa({ disputa, rol, nombre }: { disputa: Disputa; rol: Rol; nombre: string }) {
  const escribir = useDemo((s) => s.mensajeDisputa)
  const [texto, setTexto] = useState('')
  const e = ESTADO[disputa.estado]
  return (
    <section className="rounded-2xl border border-rojo-200 bg-superficie" aria-labelledby={`disputa-${disputa.id}`} data-tour="hilo-disputa">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borde p-3">
        <h3 id={`disputa-${disputa.id}`} className="font-sans text-sm font-semibold">Disputa {disputa.numero}{disputa.monto ? ` · ${pesos(disputa.monto)}` : ''}</h3>
        <Chip tono={e.tono} icono="balanza">{e.texto}</Chip>
      </div>
      <ol className="space-y-2 p-3">
        {disputa.mensajes.map((m, i) => (
          <li key={i} className={cx('rounded-xl p-2.5 text-sm', m.autor === 'admin' ? 'bg-cielo-50 ring-1 ring-inset ring-cielo-200' : m.autor === rol ? 'ml-6 bg-verde-50' : 'mr-6 bg-paper-2')}>
            <p className="text-xs font-semibold text-texto-suave">{m.nombre} · {m.autor === 'admin' ? 'Red Libertad' : etiquetaRol[m.autor]} · {fechaHora(m.fecha)}</p>
            <p className="mt-0.5">{m.texto}</p>
          </li>
        ))}
      </ol>
      {disputa.resolucion ? <p className="mx-3 mb-3 rounded-xl bg-verde-50 p-2.5 text-sm text-verde-900">Resolución: {disputa.resolucion}</p> : null}
      {disputa.estado !== 'resuelta' ? (
        <form
          className="flex gap-2 border-t border-borde p-3"
          onSubmit={(ev) => {
            ev.preventDefault()
            if (!texto.trim()) return
            escribir(disputa.id, rol, nombre, texto)
            setTexto('')
          }}
        >
          <label className="sr-only" htmlFor={`msg-${disputa.id}`}>Mensaje</label>
          <input id={`msg-${disputa.id}`} value={texto} onChange={(ev) => setTexto(ev.target.value)} placeholder="Escribí un mensaje para la mesa de ayuda" className="min-h-tactil min-w-0 flex-1 rounded-xl border border-borde-fuerte bg-superficie px-3 text-sm" />
          <Button type="submit" icono="enviar" disabled={!texto.trim()} aria-label="Enviar mensaje" />
        </form>
      ) : null}
    </section>
  )
}
