import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { etiquetaRol } from '@/domain/format'
import type { Rol } from '@/domain/types'
import { useDemo } from '@/store/useDemo'
import { cx } from '@/ui/cx'
import { Icon } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'
import { toast } from '@/ui/toast-store'
import { ICONO_ROL, RUTA_INICIO } from './navegacion'
import { RecorridosModal } from './RecorridosModal'

const ROLES: Rol[] = ['contratista', 'productor', 'ingeniero', 'admin']
const CORTO: Record<Rol, string> = { contratista: 'Contratista', productor: 'Productor', ingeniero: 'Ingeniero', admin: 'Admin' }

function useOpcionesPersona(rol: Rol) {
  const contratistas = useDemo((s) => s.contratistas)
  const productores = useDemo((s) => s.productores)
  const ingenieros = useDemo((s) => s.ingenieros)
  if (rol === 'contratista') return contratistas.map((c) => ({ id: c.id, nombre: c.razonSocial }))
  if (rol === 'productor') return productores.map((p) => ({ id: p.id, nombre: p.razonSocial }))
  if (rol === 'ingeniero') return ingenieros.map((i) => ({ id: i.id, nombre: `Ing. Agr. ${i.nombre}` }))
  return [{ id: 'admin', nombre: 'Mesa de ayuda Libertad' }]
}

/** Barra de la demo, siempre visible: rol, persona, recorrido guiado, señal, tema y reinicio. */
export function DemoBar() {
  const navigate = useNavigate()
  const rol = useDemo((s) => s.rol)
  const setRol = useDemo((s) => s.setRol)
  const online = useDemo((s) => s.online)
  const setOnline = useDemo((s) => s.setOnline)
  const tema = useDemo((s) => s.tema)
  const setTema = useDemo((s) => s.setTema)
  const reiniciar = useDemo((s) => s.reiniciar)
  const contratistaId = useDemo((s) => s.contratistaId)
  const productorId = useDemo((s) => s.productorId)
  const ingenieroId = useDemo((s) => s.ingenieroId)
  const setContratista = useDemo((s) => s.setContratista)
  const setProductor = useDemo((s) => s.setProductor)
  const setIngeniero = useDemo((s) => s.setIngeniero)
  const personas = useOpcionesPersona(rol)
  const [recorridos, setRecorridos] = useState(false)
  const [menu, setMenu] = useState(false)
  const [confirmarReinicio, setConfirmarReinicio] = useState(false)

  const personaActual = rol === 'contratista' ? contratistaId : rol === 'productor' ? productorId : rol === 'ingeniero' ? ingenieroId : 'admin'
  const cambiarPersona = (id: string) => {
    if (rol === 'contratista') setContratista(id)
    if (rol === 'productor') setProductor(id)
    if (rol === 'ingeniero') setIngeniero(id)
  }
  const irARol = (r: Rol) => {
    setRol(r)
    navigate(RUTA_INICIO[r])
    setMenu(false)
  }
  const alternarSenal = () => {
    setOnline(!online)
    if (online) toast.alerta('Modo sin señal activado', 'Los partes se guardan en el teléfono y se envían al recuperar señal.')
  }

  const botonBarra = 'inline-flex min-h-10 shrink-0 items-center whitespace-nowrap gap-2 rounded-lg px-3 text-sm font-semibold transition hover:bg-barra-2 [@media(pointer:coarse)]:min-h-tactil'

  return (
    <header className="sticky top-0 z-[60] bg-barra text-sobre-barra shadow-elevada print:hidden" data-tour="demobar">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 rounded-lg pr-2 focus-visible:ring-offset-barra" aria-label="Proyecto Libertad II · inicio de la demo">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-8 w-8" />
          <span className="hidden font-serif text-lg leading-none sm:inline">Libertad II</span>
          <span className="rounded bg-acento px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sobre-acento">Demo</span>
        </Link>

        {/* Selector de rol: segmentado en desktop, select en mobile */}
        <div role="radiogroup" aria-label="Rol activo" className="ml-2 hidden items-center gap-0.5 rounded-xl bg-barra-2 p-1 lg:flex" data-tour="selector-rol">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={rol === r}
              onClick={() => irARol(r)}
              className={cx(
                'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition',
                rol === r ? 'bg-sobre-barra text-barra shadow' : 'text-sobre-barra/80 hover:bg-barra hover:text-sobre-barra',
              )}
            >
              <Icon nombre={ICONO_ROL[r]} tamano={16} />
              {CORTO[r]}
            </button>
          ))}
        </div>
        <label className="ml-1 min-w-0 flex-1 sm:flex-none lg:hidden">
          <span className="sr-only">Rol activo</span>
          <select
            value={rol}
            onChange={(e) => irARol(e.target.value as Rol)}
            className="min-h-10 w-full max-w-[13rem] rounded-lg border-0 bg-barra-2 py-1 pl-3 pr-8 text-sm font-semibold text-sobre-barra [@media(pointer:coarse)]:min-h-tactil"
            data-tour="selector-rol-movil"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {etiquetaRol[r]}
              </option>
            ))}
          </select>
        </label>

        {personas.length > 1 ? (
          <label className="hidden items-center gap-2 whitespace-nowrap text-xs text-sobre-barra/70 xl:flex">
            <span className="hidden 2xl:inline">Ver como</span>
            <select
              aria-label="Ver como"
              value={personaActual}
              onChange={(e) => cambiarPersona(e.target.value)}
              className="max-w-[13rem] min-h-9 truncate rounded-lg border-0 bg-barra-2 py-1 pl-2.5 pr-8 text-sm font-medium text-sobre-barra"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {rol === 'contratista' ? (
            <button
              type="button"
              onClick={alternarSenal}
              aria-pressed={!online}
              className={cx(botonBarra, !online && 'bg-acento text-sobre-acento hover:bg-acento-hover')}
              data-tour="toggle-senal"
            >
              <Icon nombre={online ? 'senal' : 'senalOff'} tamano={18} />
              <span className="hidden xl:inline">{online ? 'Con señal' : 'Sin señal'}</span>
            </button>
          ) : null}
          <button type="button" onClick={() => setRecorridos(true)} className={cx(botonBarra, 'bg-acento text-sobre-acento hover:bg-acento-hover')} data-tour="boton-recorrido">
            <Icon nombre="play" tamano={18} />
            <span className="hidden sm:inline">Recorrido guiado</span>
          </button>
          <div className="hidden items-center gap-1 md:flex">
            <button type="button" onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')} className={botonBarra} aria-label={tema === 'oscuro' ? 'Pasar a modo claro' : 'Pasar a modo oscuro'} title="Cambiar tema">
              <Icon nombre={tema === 'oscuro' ? 'sol' : 'luna'} tamano={18} />
            </button>
            <button type="button" onClick={() => setConfirmarReinicio(true)} className={botonBarra} aria-label="Reiniciar demo" title="Reiniciar demo">
              <Icon nombre="reiniciar" tamano={18} />
            </button>
          </div>
          <button type="button" onClick={() => setMenu(true)} className={cx(botonBarra, 'md:hidden')} aria-label="Más opciones de la demo">
            <Icon nombre="menu" tamano={20} />
          </button>
        </div>
      </div>

      <RecorridosModal abierto={recorridos} onCerrar={() => setRecorridos(false)} />

      <Modal abierto={menu} onCerrar={() => setMenu(false)} titulo="Opciones de la demo" tamano="sm">
        <div className="space-y-4">
          {personas.length > 1 ? (
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">Ver como</span>
              <select value={personaActual} onChange={(e) => cambiarPersona(e.target.value)} className="block min-h-tactil w-full rounded-xl border border-borde-fuerte bg-superficie px-3 text-base">
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')} className="flex min-h-tactil items-center justify-center gap-2 rounded-xl border border-borde-fuerte font-semibold">
              <Icon nombre={tema === 'oscuro' ? 'sol' : 'luna'} /> {tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
            </button>
            <button type="button" onClick={() => { setMenu(false); setConfirmarReinicio(true) }} className="flex min-h-tactil items-center justify-center gap-2 rounded-xl border border-borde-fuerte font-semibold">
              <Icon nombre="reiniciar" /> Reiniciar
            </button>
          </div>
          <Link to="/kit" onClick={() => setMenu(false)} className="flex min-h-tactil items-center gap-2 rounded-xl px-1 font-semibold text-verde-800">
            <Icon nombre="grilla" /> Ver el sistema de diseño
          </Link>
        </div>
      </Modal>

      <Modal
        abierto={confirmarReinicio}
        onCerrar={() => setConfirmarReinicio(false)}
        titulo="¿Reiniciar la demo?"
        descripcion="Se descartan los cambios que hiciste (partes, liquidaciones, verificaciones) y vuelve el escenario inicial."
        tamano="sm"
        pie={
          <>
            <button type="button" onClick={() => setConfirmarReinicio(false)} className="min-h-tactil rounded-xl px-4 font-semibold hover:bg-paper-2">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                reiniciar()
                setConfirmarReinicio(false)
                toast.ok('Demo reiniciada', 'Volviste al escenario inicial.')
              }}
              className="min-h-tactil rounded-xl bg-accion px-4 font-semibold text-sobre-accion hover:bg-accion-hover"
              data-autofocus
            >
              Reiniciar demo
            </button>
          </>
        }
      >
        <p className="text-sm text-texto-suave">El rol activo y el tema se mantienen.</p>
      </Modal>
    </header>
  )
}
