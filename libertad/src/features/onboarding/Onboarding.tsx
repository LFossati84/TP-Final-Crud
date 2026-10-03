import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { DESCRIPCION_ROL, ICONO_ROL, RUTA_INICIO } from '@/app/navegacion'
import { LOCALIDADES_PILOTO } from '@/data/geo'
import { etiquetaLabor, etiquetaRol } from '@/domain/format'
import type { Localidad, Rol, TipoLabor } from '@/domain/types'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { cx } from '@/ui/cx'
import { Checkbox, Input, OpcionesGrandes, Select } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { Stepper } from '@/ui/Stepper'
import { toast } from '@/ui/toast-store'

type RolAlta = Exclude<Rol, 'admin'>
const ROLES: RolAlta[] = ['contratista', 'productor', 'ingeniero']
const SERVICIOS: TipoLabor[] = ['pulverizacion', 'siembra', 'fertilizacion', 'cosecha', 'laboreo']

const formatoCuit = /^\d{2}-\d{8}-\d$/

function mascaraCuit(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

const SIGUIENTE: Record<RolAlta, { titulo: string; items: string[] }> = {
  contratista: { titulo: 'Quedaste como Básico, pendiente de verificación', items: ['Subí situación fiscal, ART, seguro y habilitación de aplicador para pasar a Verificado.', 'Cargá tu flota y tus tarifas de referencia.', 'Invitá a los productores con los que ya trabajás.'] },
  productor: { titulo: 'Tu cuaderno está listo', items: ['Dibujá o importá tus lotes.', 'Invitá a tus contratistas: sus partes llegan para que los conformes.', 'Si querés el sello profesional, habilitá a tu ingeniero agrónomo.'] },
  ingeniero: { titulo: 'Tu cuenta profesional está creada', items: ['La red valida tu matrícula antes de habilitar la firma.', 'Tus clientes te habilitan desde su configuración.', 'Desde ahí recibís las aplicaciones para validar y emitís recetas.'] },
}

export function Onboarding() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setRol = useDemo((s) => s.setRol)
  const inicial = ROLES.find((r) => r === params.get('rol')) ?? 'contratista'
  const [paso, setPaso] = useState(0)
  const [rol, setRolAlta] = useState<RolAlta>(inicial)
  const [zonas, setZonas] = useState<Localidad[]>(['Venado Tuerto'])
  const [radio, setRadio] = useState('60')
  const [superficie, setSuperficie] = useState('500-1500')
  const [nombre, setNombre] = useState('')
  const [cuit, setCuit] = useState('')
  const [telefono, setTelefono] = useState('')
  const [extra, setExtra] = useState('')
  const [servicios, setServicios] = useState<TipoLabor[]>(['pulverizacion'])
  const [intentado, setIntentado] = useState(false)
  const [listo, setListo] = useState(false)

  const errores: Record<string, string> = {}
  if (paso === 1 && zonas.length === 0) errores.zonas = 'Elegí al menos una localidad.'
  if (paso === 2) {
    if (!nombre.trim()) errores.nombre = rol === 'ingeniero' ? 'Ingresá tu nombre.' : 'Ingresá la razón social o tu nombre.'
    if (rol !== 'ingeniero' && !formatoCuit.test(cuit)) errores.cuit = 'Formato 00-00000000-0.'
    if (rol === 'ingeniero' && !extra.trim()) errores.extra = 'Ingresá tu matrícula.'
    if (rol === 'contratista' && servicios.length === 0) errores.servicios = 'Elegí al menos un servicio.'
    if (telefono.replace(/\D/g, '').length < 10) errores.telefono = 'Ingresá un celular con característica.'
  }
  const e = intentado ? errores : {}

  const avanzar = () => {
    setIntentado(true)
    if (Object.keys(errores).length) return
    setIntentado(false)
    if (paso < 2) setPaso(paso + 1)
    else {
      setListo(true)
      toast.ok('Cuenta creada (simulada)', 'En la demo seguís con un perfil de ejemplo.')
    }
  }

  return (
    <main id="contenido" className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-trigo-700">Crear cuenta · demo</p>
      <h1 className="text-3xl text-tierra-900">Empezá en tres pasos</h1>
      <p className="mt-1 text-texto-suave">Sin papeles: después completás lo que falte desde la app.</p>

      {listo ? (
        <Card className="mt-6 text-center" data-tour="onboarding-listo">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-verde-100 text-verde-700"><Icon nombre="checkCirculo" tamano={36} /></span>
          <h2 className="mt-3 text-2xl text-tierra-900">{SIGUIENTE[rol].titulo}</h2>
          <ul className="mx-auto mt-4 max-w-md space-y-2 text-left text-sm">
            {SIGUIENTE[rol].items.map((i) => <li key={i} className="flex gap-2"><Icon nombre="check" tamano={16} className="mt-0.5 shrink-0 text-verde-600" />{i}</li>)}
          </ul>
          <Button className="mt-6" iconoDerecha="flechaDerecha" onClick={() => { setRol(rol); navigate(RUTA_INICIO[rol]) }}>Entrar a la demo como {etiquetaRol[rol].toLowerCase()}</Button>
        </Card>
      ) : (
        <Card className="mt-6">
          <Stepper pasos={['Rol', 'Zona', 'Perfil']} actual={paso} onIr={setPaso} />
          <div className="mt-6 min-h-[18rem]">
            {paso === 0 ? (
              <fieldset>
                <legend className="mb-3 font-serif text-xl text-tierra-900">¿Cómo vas a usar Libertad?</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {ROLES.map((r) => (
                    <button key={r} type="button" aria-pressed={rol === r} onClick={() => setRolAlta(r)} className={cx('flex flex-col rounded-2xl border-2 p-4 text-left transition', rol === r ? 'border-verde-500 bg-verde-50' : 'border-borde hover:border-borde-fuerte')}>
                      <Icon nombre={ICONO_ROL[r]} tamano={26} className="text-verde-700" />
                      <span className="mt-2 font-semibold">{etiquetaRol[r]}</span>
                      <span className="mt-1 text-sm text-texto-suave">{DESCRIPCION_ROL[r]}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}
            {paso === 1 ? (
              <div className="space-y-5">
                <fieldset>
                  <legend className="mb-2 font-serif text-xl text-tierra-900">{rol === 'productor' ? '¿Dónde están tus campos?' : '¿En qué zona trabajás?'}</legend>
                  <div className="flex flex-wrap gap-2">
                    {LOCALIDADES_PILOTO.map((l) => {
                      const sel = zonas.includes(l)
                      return (
                        <button key={l} type="button" aria-pressed={sel} onClick={() => setZonas(sel ? zonas.filter((x) => x !== l) : [...zonas, l])} className={cx('inline-flex min-h-tactil items-center gap-1.5 rounded-full px-4 text-sm font-semibold ring-1 ring-inset transition', sel ? 'bg-verde-100 text-verde-900 ring-verde-300' : 'bg-superficie text-texto-suave ring-borde hover:ring-borde-fuerte')}>
                          {sel ? <Icon nombre="check" tamano={16} /> : null}{l}
                        </button>
                      )
                    })}
                  </div>
                  {e.zonas ? <p className="mt-1 text-sm font-medium text-rojo-700">{e.zonas}</p> : null}
                  <p className="mt-2 text-xs text-texto-suave">Zona piloto: sur de Santa Fe. Pronto, más localidades.</p>
                </fieldset>
                {rol === 'contratista' ? <Select label="Hasta qué distancia viajás" value={radio} onChange={(ev) => setRadio(ev.target.value)} opciones={[{ valor: '30', texto: '30 km' }, { valor: '60', texto: '60 km' }, { valor: '100', texto: '100 km' }, { valor: '150', texto: 'Más de 100 km' }]} /> : null}
                {rol === 'productor' ? <OpcionesGrandes label="Superficie que trabajás" valor={superficie} onCambiar={setSuperficie} columnas={2} opciones={[{ valor: '0-500', texto: 'Hasta 500 has' }, { valor: '500-1500', texto: '500 a 1.500 has' }, { valor: '1500-5000', texto: '1.500 a 5.000 has' }, { valor: '5000+', texto: 'Más de 5.000 has' }]} /> : null}
              </div>
            ) : null}
            {paso === 2 ? (
              <div className="space-y-4">
                <h2 className="font-serif text-xl text-tierra-900">Perfil mínimo</h2>
                <Input label={rol === 'ingeniero' ? 'Nombre y apellido' : 'Razón social o nombre'} value={nombre} onChange={(ev) => setNombre(ev.target.value)} error={e.nombre} autoComplete="organization" />
                {rol !== 'ingeniero' ? <Input label="CUIT" inputMode="numeric" value={cuit} onChange={(ev) => setCuit(mascaraCuit(ev.target.value))} placeholder="30-12345678-9" error={e.cuit} hint="Se valida contra el padrón en la versión real." /> : <Input label="Matrícula profesional" value={extra} onChange={(ev) => setExtra(ev.target.value)} placeholder="Ej.: 2-1234" error={e.extra} />}
                {rol === 'productor' ? <Input label="Nombre de tu primer establecimiento" value={extra} onChange={(ev) => setExtra(ev.target.value)} placeholder="Ej.: La Celina" opcional /> : null}
                {rol === 'contratista' ? (
                  <fieldset>
                    <legend className="mb-1 text-sm font-semibold">Servicios</legend>
                    <div className="grid gap-x-3 sm:grid-cols-2">
                      {SERVICIOS.map((s) => <Checkbox key={s} label={etiquetaLabor[s]} checked={servicios.includes(s)} onChange={(ev) => setServicios(ev.target.checked ? [...servicios, s] : servicios.filter((x) => x !== s))} />)}
                    </div>
                    {e.servicios ? <p className="text-sm font-medium text-rojo-700">{e.servicios}</p> : null}
                  </fieldset>
                ) : null}
                <Input label="Celular (WhatsApp)" type="tel" inputMode="tel" value={telefono} onChange={(ev) => setTelefono(ev.target.value)} placeholder="+54 9 3462 00-0000" error={e.telefono} autoComplete="tel" />
                <p className="text-xs text-texto-suave">Demo: los datos no se guardan ni se envían.</p>
              </div>
            ) : null}
          </div>
          <div className="mt-6 flex justify-between gap-2 border-t border-borde pt-4">
            <Button variante="fantasma" icono="chevronIzquierda" onClick={() => (paso === 0 ? navigate('/') : setPaso(paso - 1))}>{paso === 0 ? 'Cancelar' : 'Atrás'}</Button>
            <Button iconoDerecha={paso === 2 ? 'check' : 'flechaDerecha'} onClick={avanzar} data-tour="onboarding-siguiente">{paso === 2 ? 'Crear cuenta' : 'Siguiente'}</Button>
          </div>
        </Card>
      )}
    </main>
  )
}
