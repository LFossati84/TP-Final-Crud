import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { EncabezadoMovil } from '@/app/EncabezadoMovil'
import type { ParteLabor } from '@/domain/types'
import { useContratista } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { EmptyState } from '@/ui/EmptyState'
import { Stepper } from '@/ui/Stepper'
import { toast } from '@/ui/toast-store'
import { Exito } from './Exito'
import {
  borradorDesdeAgenda,
  borradorDesdeParte,
  borradorVacio,
  construirParte,
  erroresPaso,
  pasosPara,
  TITULOS_PASO,
  type BorradorParte,
} from './modelo'
import { PasoFirma } from './PasoFirma'
import { PasoInsumos } from './PasoInsumos'
import { PasoLabor } from './PasoLabor'
import { PasoLote } from './PasoLote'
import { PasoSuperficie } from './PasoSuperficie'

/** Ruta: se re-monta el asistente si cambia la query (agenda / borrador). */
export function NuevoParteRuta() {
  const { search } = useLocation()
  return <NuevoParte key={search} />
}

function NuevoParte() {
  const c = useContratista()
  const cat = useCatalogo()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const agenda = useDemo((s) => s.agenda)
  const partes = useDemo((s) => s.partes)
  const online = useDemo((s) => s.online)
  const guardarBorrador = useDemo((s) => s.guardarBorrador)
  const enviarParte = useDemo((s) => s.enviarParte)
  const [inicio] = useState(() => Date.now())

  const [b, setB] = useState<BorradorParte | null>(() => {
    if (!c) return null
    const idBorrador = params.get('borrador')
    const existente = idBorrador ? partes.find((p) => p.id === idBorrador) : undefined
    if (existente) return borradorDesdeParte(existente)
    const ag = agenda.find((a) => a.id === params.get('agenda'))
    if (ag) {
      const lote = cat.lote(ag.loteId)
      return borradorDesdeAgenda(c, ag, lote, cat.receta(ag.recetaId))
    }
    return borradorVacio(c)
  })
  const [paso, setPaso] = useState(0)
  const [mostrarErrores, setMostrarErrores] = useState(false)
  const [enviado, setEnviado] = useState<{ parte: ParteLabor; segundos: number } | null>(null)

  if (!c || !b) return <EmptyState titulo="No encontramos el contratista" />
  if (enviado) return <Exito parte={enviado.parte} segundos={enviado.segundos} />

  const pasos = pasosPara(b.labor)
  const clave = pasos[Math.min(paso, pasos.length - 1)] ?? 'lote'
  const errores = erroresPaso(clave, b)
  const lote = b.loteId ? cat.lote(b.loteId) : undefined
  const est = lote ? cat.establecimiento(lote.establecimientoId) : undefined
  const loteSugerido = agenda.find((a) => a.id === params.get('agenda'))?.loteId
  const ultimo = paso >= pasos.length - 1

  const cambiar = (p: Partial<BorradorParte>) => setB((prev) => (prev ? { ...prev, ...p } : prev))

  const siguiente = () => {
    if (Object.keys(errores).length > 0) {
      setMostrarErrores(true)
      return
    }
    setMostrarErrores(false)
    setPaso((p) => p + 1)
    document.getElementById('contenido')?.scrollTo({ top: 0 })
  }

  const enviar = () => {
    if (Object.keys(errores).length > 0 || !lote || !est) {
      setMostrarErrores(true)
      return
    }
    const parte = enviarParte(construirParte(b, c, lote, est))
    setEnviado({ parte, segundos: Math.max(1, Math.round((Date.now() - inicio) / 1000)) })
  }

  const guardar = () => {
    if (!lote || !est) {
      toast.alerta('Elegí el lote primero', 'Para guardar un borrador necesitamos saber dónde trabajaste.')
      return
    }
    guardarBorrador(construirParte(b, c, lote, est))
    toast.ok('Borrador guardado', 'Lo encontrás en Mis trabajos para terminarlo después.')
    navigate('/contratista/trabajos?estado=borrador')
  }

  const err = mostrarErrores ? errores : {}

  return (
    <div className="flex min-h-full flex-col">
      <EncabezadoMovil
        titulo={b.numero ? `Parte ${b.numero}` : 'Nuevo parte'}
        subtitulo={TITULOS_PASO[clave]}
        volver={paso > 0 ? undefined : '/contratista'}
        acciones={
          <Button variante="fantasma" tamano="sm" onClick={guardar} data-tour="guardar-borrador">
            Guardar
          </Button>
        }
      />
      <div className="border-b border-borde bg-superficie px-4 pb-3 pt-2">
        <Stepper compacto pasos={pasos.map((p) => TITULOS_PASO[p])} actual={paso} onIr={setPaso} />
      </div>

      <div className="flex-1 px-4 py-4" data-tour={`paso-${clave}`}>
        {clave === 'lote' ? <PasoLote b={b} cambiar={cambiar} error={err.lote} loteSugerido={loteSugerido} /> : null}
        {clave === 'labor' ? <PasoLabor b={b} c={c} cambiar={cambiar} errores={err} /> : null}
        {clave === 'superficie' ? <PasoSuperficie b={b} lote={lote} cambiar={cambiar} errores={err} /> : null}
        {clave === 'insumos' && lote && est ? <PasoInsumos b={b} c={c} lote={lote} est={est} cambiar={cambiar} errores={err} /> : null}
        {clave === 'firma' && lote && est ? <PasoFirma b={b} c={c} lote={lote} est={est} cambiar={cambiar} errores={err} /> : null}
      </div>

      <div className="sticky bottom-0 z-10 flex gap-2 border-t border-borde bg-superficie/95 px-4 py-3 backdrop-blur">
        {paso > 0 ? (
          <Button variante="secundario" icono="chevronIzquierda" onClick={() => setPaso((p) => p - 1)} aria-label="Paso anterior">
            Atrás
          </Button>
        ) : null}
        {ultimo ? (
          <Button bloque tamano="lg" icono={online ? 'enviar' : 'nubeOff'} onClick={enviar} className="flex-1" data-tour="enviar-parte">
            {online ? 'Enviar parte' : 'Guardar sin señal'}
          </Button>
        ) : (
          <Button bloque tamano="lg" iconoDerecha="flechaDerecha" onClick={siguiente} className="flex-1" data-tour="siguiente-paso">
            Siguiente
          </Button>
        )}
      </div>
    </div>
  )
}
