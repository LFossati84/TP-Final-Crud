import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Button } from '@/ui/Button'

/** Firma en pantalla con el dedo o el mouse. Devuelve un dataURL PNG (o undefined al borrar). */
export function FirmaPad({ valor, onCambiar, etiqueta = 'Firmá con el dedo dentro del recuadro' }: { valor?: string; onCambiar: (dataUrl: string | undefined) => void; etiqueta?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const dibujando = useRef(false)
  const [vacia, setVacia] = useState(!valor)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    c.width = c.offsetWidth * ratio
    c.height = c.offsetHeight * ratio
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1D3A1B'
    if (valor) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, c.offsetWidth, c.offsetHeight)
      img.src = valor
    }
    // Solo al montar: el valor inicial se dibuja una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const punto = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top] as const
  }

  const empezar = (e: PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dibujando.current = true
    const [x, y] = punto(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  const mover = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current) return
    const ctx = e.currentTarget.getContext('2d')
    if (!ctx) return
    const [x, y] = punto(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  const terminar = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando.current) return
    dibujando.current = false
    setVacia(false)
    onCambiar(e.currentTarget.toDataURL('image/png'))
  }
  const borrar = () => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    setVacia(true)
    onCambiar(undefined)
  }

  return (
    <div>
      <div className="relative">
        <canvas
          ref={ref}
          aria-label={etiqueta}
          role="img"
          className="h-36 w-full touch-none rounded-xl border-2 border-dashed border-borde-fuerte bg-white"
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerLeave={terminar}
          data-tour="firma"
          data-firmado={vacia ? undefined : 'true'}
        />
        {vacia ? <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-tierra-400">{etiqueta}</p> : null}
        <span className="pointer-events-none absolute bottom-8 left-6 right-6 border-b border-tierra-300" aria-hidden />
      </div>
      <div className="mt-2 flex justify-end">
        <Button variante="fantasma" tamano="sm" icono="basura" onClick={borrar} disabled={vacia}>
          Borrar firma
        </Button>
      </div>
    </div>
  )
}
