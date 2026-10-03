import { useEffect, useRef, useState } from 'react'
import { estadoCobro, plantillaRecordatorio } from '@/domain/cobranza'
import { fechaCorta, hora } from '@/domain/format'
import type { Liquidacion } from '@/domain/types'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Avatar } from '@/ui/Avatar'
import { Button } from '@/ui/Button'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { toast } from '@/ui/toast-store'

/**
 * Maqueta de chat de WhatsApp (simulada: no envía mensajes reales).
 * El contratista edita la plantilla y la "envía"; queda registrada en la liquidación.
 */
export function ChatWhatsApp({ liq, puedeEnviar = true, perspectiva = 'contratista' }: { liq: Liquidacion; puedeEnviar?: boolean; perspectiva?: 'contratista' | 'productor' }) {
  const cat = useCatalogo()
  const conversacion = useDemo((s) => s.conversaciones.find((c) => c.contratistaId === liq.contratistaId && c.productorId === liq.productorId))
  const enviar = useDemo((s) => s.enviarRecordatorio)
  const p = cat.productor(liq.productorId)
  const c = cat.contratista(liq.contratistaId)
  const tipo = estadoCobro(liq) === 'vencido' ? 'auto_7_despues' : 'auto_3_antes'
  const [texto, setTexto] = useState(() => (p && c ? plantillaRecordatorio(liq, p, c, tipo) : ''))
  const log = useRef<HTMLDivElement>(null)
  const mensajes = conversacion?.mensajes ?? []

  // Baja al último mensaje sin mover el resto de la página.
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight
  }, [mensajes.length])
  const contacto = perspectiva === 'contratista' ? { nombre: p?.contacto ?? 'Productor', tel: p?.telefono } : { nombre: c?.razonSocial ?? 'Contratista', tel: c?.telefono }

  return (
    <div className="overflow-hidden rounded-2xl border border-borde" data-tour="chat-whatsapp">
      <div className="flex items-center gap-3 bg-[#1f4e3d] px-3 py-2.5 text-white">
        <Avatar nombre={contacto.nombre} tamano="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{contacto.nombre}</p>
          <p className="truncate text-[11px] text-white/75">{contacto.tel} · vista simulada de WhatsApp</p>
        </div>
        <Icon nombre="telefono" tamano={18} className="opacity-80" />
      </div>
      <div ref={log} className="max-h-72 space-y-2 overflow-y-auto bg-[#ece3d4] p-3 dark:bg-paper-3" aria-label="Conversación" role="log">
        {mensajes.length === 0 ? <p className="py-6 text-center text-xs text-texto-suave">Todavía no hay mensajes con {contacto.nombre}.</p> : null}
        {mensajes.map((m) => {
          const propio = m.autor === perspectiva
          return (
            <div key={m.id} className={cx('flex', propio ? 'justify-end' : 'justify-start')}>
              <div className={cx('max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm', propio ? 'rounded-tr-sm bg-[#d8f0c8] text-[#1f1510]' : 'rounded-tl-sm bg-white text-[#1f1510]')}>
                {m.automatico ? <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#356f2d]">Recordatorio automático</p> : null}
                <p className="whitespace-pre-line">{m.texto}</p>
                <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#64432d]">
                  {fechaCorta(m.fecha)} {hora(m.fecha)}
                  {propio ? <span className={m.estado === 'leido' ? 'text-[#2f7ba6]' : ''} aria-label={m.estado === 'leido' ? 'Leído' : 'Entregado'}>✓✓</span> : null}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      {puedeEnviar ? (
        <div className="space-y-2 border-t border-borde bg-superficie p-3">
          <label htmlFor={`plantilla-${liq.id}`} className="block text-xs font-semibold text-texto-suave">Mensaje (plantilla editable)</label>
          <textarea
            id={`plantilla-${liq.id}`}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            className="block w-full rounded-xl border border-borde-fuerte bg-superficie px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap justify-between gap-2">
            <div className="flex gap-1">
              {(['auto_3_antes', 'auto_dia', 'auto_7_despues'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => p && c && setTexto(plantillaRecordatorio(liq, p, c, t))}
                  className="min-h-9 rounded-lg px-2 text-xs font-semibold text-texto-suave hover:bg-paper-2"
                >
                  {t === 'auto_3_antes' ? 'Antes' : t === 'auto_dia' ? 'Día' : 'Vencida'}
                </button>
              ))}
            </div>
            <Button
              icono="enviar"
              tamano="sm"
              disabled={!texto.trim()}
              onClick={() => {
                enviar(liq.id, texto)
                toast.ok('Recordatorio enviado', `Le llegó a ${p?.contacto ?? 'el productor'} (simulado).`)
              }}
              data-tour="enviar-recordatorio"
            >
              Enviar por WhatsApp
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
