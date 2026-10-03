import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { RUTA_INICIO, ICONO_ROL } from '@/app/navegacion'
import { etiquetaRol } from '@/domain/format'
import type { Rol } from '@/domain/types'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { FLUJOS } from './catalogo'
import { FLUJOS_TOUR } from './flujos'
import { useTour } from './store'
import { resolver, type DefinicionFlujo } from './tipos'

type Rect = { top: number; left: number; width: number; height: number }
const MARGEN = 6

function rectDe(el: Element): Rect {
  const r = el.getBoundingClientRect()
  return { top: r.top - MARGEN, left: r.left - MARGEN, width: r.width + MARGEN * 2, height: r.height + MARGEN * 2 }
}

/**
 * Recorrido guiado: resalta el elemento del paso (spotlight), muestra un
 * tooltip numerado y avanza al hacer clic en el objetivo, cuando aparece un
 * elemento esperado o con el botón "Siguiente". Cambia de rol con una
 * transición breve cuando el flujo pasa a otro usuario.
 */
export function TourOverlay() {
  const { flujo, paso } = useTour()
  const def = FLUJOS_TOUR.find((f) => f.id === flujo)
  const preparado = useRef<string | null>(null)

  // Preparar el escenario al iniciar un flujo.
  useEffect(() => {
    if (!def) {
      preparado.current = null
      return
    }
    if (preparado.current === def.id) return
    preparado.current = def.id
    def.preparar(useDemo.getState())
  }, [def])

  if (!def || !def.pasos[paso]) return null
  return <PasoActivo key={`${def.id}-${paso}`} def={def} paso={paso} />
}

function PasoActivo({ def, paso }: { def: DefinicionFlujo; paso: number }) {
  const { ir, salir } = useTour()
  const navigate = useNavigate()
  const location = useLocation()
  const meta = FLUJOS.find((f) => f.id === def.id)
  const actual = def.pasos[paso]
  const [rect, setRect] = useState<Rect | null>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)
  const [transicion, setTransicion] = useState<Rol | null>(() => (actual && useDemo.getState().rol !== actual.rol ? actual.rol : null))
  const [listo, setListo] = useState(false)
  const pasoRef = useRef(paso)

  // Entrar al paso: rol, ruta y acciones previas.
  useEffect(() => {
    if (!actual) return
    let cancelado = false
    const s = useDemo.getState()
    actual.antes?.(s)
    const ruta = resolver(actual.ruta, useDemo.getState())
    const destino = ruta ?? (s.rol !== actual.rol ? RUTA_INICIO[actual.rol] : undefined)
    const entrar = () => {
      if (cancelado) return
      if (destino && `${location.pathname}${location.search}${location.hash}` !== destino) navigate(destino)
      setListo(true)
    }
    const espera = s.rol !== actual.rol ? 1300 : 60
    const timer = window.setTimeout(() => {
      if (cancelado) return
      if (useDemo.getState().rol !== actual.rol) useDemo.getState().setRol(actual.rol)
      setTransicion(null)
      entrar()
    }, espera)
    return () => {
      cancelado = true
      window.clearTimeout(timer)
    }
    // Solo al montar el paso: la navegación interna del usuario no debe reiniciarlo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Seguir la posición del objetivo y detectar avances.
  useEffect(() => {
    if (!actual || !listo) return
    const selector = resolver(actual.objetivo, useDemo.getState())
    const cuando = resolver(actual.cuando, useDemo.getState())
    let intentos = 0
    let desplazado = false
    const avanzar = () => {
      if (pasoRef.current !== paso) return
      pasoRef.current = -1
      if (actual.cerrarDialogo) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      window.setTimeout(() => ir(paso + 1), actual.cerrarDialogo ? 250 : 150)
    }
    const tick = () => {
      if (actual.avance === 'aparece' && cuando && document.querySelector(cuando)) {
        avanzar()
        return
      }
      if (!selector) return
      const el = document.querySelector(selector)
      if (el) {
        if (!desplazado) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
          desplazado = true
        }
        setRect(rectDe(el))
        setNoEncontrado(false)
      } else {
        intentos += 1
        if (intentos > 25) setNoEncontrado(true)
      }
    }
    const id = window.setInterval(tick, 160)
    const primero = window.setTimeout(tick, 0)
    const onClick = (e: MouseEvent) => {
      if (actual.avance !== 'click' || !selector) return
      const objetivo = e.target instanceof Element ? e.target.closest(selector) : null
      if (objetivo) avanzar()
    }
    document.addEventListener('click', onClick, true)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(primero)
      document.removeEventListener('click', onClick, true)
    }
  }, [actual, listo, paso, ir])

  if (!actual || !meta) return null

  const terminar = () => {
    def.alTerminar?.(useDemo.getState())
    salir()
  }
  const ultimo = paso >= def.pasos.length - 1
  const sinObjetivo = !actual.objetivo || noEncontrado
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const anchoTip = Math.min(360, vw - 24)
  let tipStyle: CSSProperties = { left: (vw - anchoTip) / 2, top: vh / 2 - 110, width: anchoTip }
  if (rect && !sinObjetivo) {
    const abajo = rect.top + rect.height + 12
    const espacioAbajo = vh - abajo - 12
    const espacioArriba = rect.top - 24
    const left = Math.max(12, Math.min(vw - anchoTip - 12, rect.left + rect.width / 2 - anchoTip / 2))
    // Arriba se ancla por el borde inferior: el cartel nunca tapa el objetivo, mida lo que mida.
    // Si el objetivo es más grande que la pantalla, el cartel se fija abajo, dentro de la ventana.
    if (espacioAbajo >= 240 || (espacioAbajo >= 160 && espacioAbajo >= espacioArriba)) {
      tipStyle = { left, top: Math.max(12, abajo), width: anchoTip, maxHeight: espacioAbajo, overflowY: 'auto' }
    } else if (espacioArriba >= 160) {
      tipStyle = { left, bottom: Math.max(12, vh - rect.top + 12), width: anchoTip, maxHeight: espacioArriba, overflowY: 'auto' }
    } else {
      tipStyle = { left: vw - anchoTip - 12, bottom: 12, width: anchoTip }
    }
  }

  return (
    <div className="print:hidden">
      {/* Spotlight: cuatro paneles alrededor del objetivo (el hueco queda clickeable). */}
      {rect && !sinObjetivo && !transicion ? (
        <>
          <div className="fixed left-0 right-0 top-0 z-[80] bg-black/45" style={{ height: Math.max(0, rect.top) }} />
          <div className="fixed left-0 right-0 z-[80] bg-black/45" style={{ top: rect.top + rect.height, bottom: 0 }} />
          <div className="fixed left-0 z-[80] bg-black/45" style={{ top: rect.top, height: rect.height, width: Math.max(0, rect.left) }} />
          <div className="fixed right-0 z-[80] bg-black/45" style={{ top: rect.top, height: rect.height, left: rect.left + rect.width }} />
          <div className="pointer-events-none fixed z-[81] animate-pulso rounded-xl ring-4 ring-acento" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
        </>
      ) : (
        <div className="fixed inset-0 z-[80] bg-black/45" />
      )}

      {transicion ? (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-6" role="status" aria-live="assertive">
          <div className="animate-entrar-arriba rounded-3xl bg-superficie px-8 py-7 text-center shadow-elevada">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-verde-100 text-verde-800">
              <Icon nombre={ICONO_ROL[transicion]} tamano={32} />
            </span>
            <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-texto-suave">Cambio de rol</p>
            <p className="font-serif text-2xl text-tierra-900">Ahora sos {transicion === 'admin' ? 'el administrador' : `el ${etiquetaRol[transicion].toLowerCase()}`}</p>
          </div>
        </div>
      ) : listo ? (
        <div role="dialog" aria-live="polite" aria-label={`Recorrido ${meta.id}: ${actual.titulo}`} className="fixed z-[85] animate-entrar-arriba rounded-2xl bg-superficie p-4 shadow-elevada ring-1 ring-borde" style={tipStyle} data-tour-tooltip data-objetivo={resolver(actual.objetivo, useDemo.getState()) ?? ''} data-avance={actual.avance}>
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-acento font-serif text-sm font-bold text-sobre-acento">{paso + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-texto-suave">{meta.id} · {meta.titulo} · {paso + 1}/{def.pasos.length}</p>
              <p className="font-semibold text-texto">{actual.titulo}</p>
              <p className="mt-1 text-sm text-texto-suave">{actual.texto}</p>
              {noEncontrado ? <p className="mt-1 text-xs text-trigo-800">No encontramos el elemento en pantalla; podés seguir con “Siguiente”.</p> : null}
              {actual.avance === 'click' && !noEncontrado ? <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-verde-800"><Icon nombre="flechaDerecha" tamano={14} /> Tocá el elemento resaltado</p> : null}
              {actual.avance === 'aparece' && !noEncontrado ? <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-verde-800"><Icon nombre="flechaDerecha" tamano={14} /> Hacelo en la pantalla para seguir</p> : null}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button type="button" onClick={terminar} className="min-h-9 rounded-lg px-2 text-sm font-semibold text-texto-suave hover:bg-paper-2">Salir</button>
            <div className="flex gap-1.5">
              {paso > 0 ? <Button variante="fantasma" tamano="sm" onClick={() => ir(paso - 1)}>Atrás</Button> : null}
              {ultimo ? (
                <Button tamano="sm" icono="check" onClick={terminar}>Terminar</Button>
              ) : actual.avance === 'siguiente' || noEncontrado ? (
                <Button tamano="sm" iconoDerecha="flechaDerecha" onClick={() => { if (actual.cerrarDialogo) document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); window.setTimeout(() => ir(paso + 1), actual.cerrarDialogo ? 250 : 0) }} data-tour="tour-siguiente">
                  Siguiente
                </Button>
              ) : null}
            </div>
          </div>
          <div className="mt-3 flex gap-1" aria-hidden>
            {def.pasos.map((_, i) => <span key={i} className={cx('h-1 flex-1 rounded-full', i <= paso ? 'bg-acento' : 'bg-paper-3')} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}
