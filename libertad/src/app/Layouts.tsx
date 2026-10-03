import { Outlet } from 'react-router'
import { useIngeniero, useProductor } from '@/store/hooks'
import { useDemo } from '@/store/useDemo'
import { Icon } from '@/ui/Icon'
import { BottomNav } from './BottomNav'
import { DeskLayout } from './DeskLayout'
import { PhoneFrame } from './PhoneFrame'
import { useSincronizarRol } from './useSincronizarRol'

function BannerSinSenal() {
  const online = useDemo((s) => s.online)
  const sincronizando = useDemo((s) => s.sincronizando)
  const pendientes = useDemo((s) => s.partes.filter((p) => p.estado === 'pendiente_sync').length)
  if (sincronizando) {
    return (
      <div role="status" className="flex shrink-0 items-center gap-2 bg-cielo-100 px-4 py-2 text-xs font-semibold text-cielo-900" data-tour="banner-sync">
        <Icon nombre="sync" tamano={16} className="animate-spin" />
        <span className="flex-1">Señal recuperada · sincronizando {pendientes} {pendientes === 1 ? 'parte' : 'partes'}…</span>
      </div>
    )
  }
  if (online) return null
  return (
    <div role="status" className="flex shrink-0 items-center gap-2 bg-trigo-200 px-4 py-2 text-xs font-semibold text-trigo-950" data-tour="banner-offline">
      <Icon nombre="nubeOff" tamano={16} />
      <span className="flex-1">Sin señal · trabajás en modo local</span>
      <span className="num rounded-full bg-trigo-100 px-2 py-0.5">{pendientes} en cola</span>
    </div>
  )
}

function LateralContratista() {
  return (
    <div className="space-y-3 text-sm text-texto-suave">
      <p className="font-serif text-xl text-tierra-900">Vista del contratista</p>
      <p>La app del contratista es mobile-first: se usa en el lote, con guantes y poca señal. Botones grandes, cinco pasos y carga en menos de un minuto.</p>
      <p className="flex items-start gap-2 rounded-xl bg-superficie p-3 shadow-tarjeta">
        <Icon nombre="senalOff" className="mt-0.5 shrink-0 text-trigo-700" />
        Probá cortar la señal desde la barra superior: los partes quedan en cola y se sincronizan al volver.
      </p>
    </div>
  )
}

export function ContratistaLayout() {
  useSincronizarRol('contratista')
  return (
    <PhoneFrame lateral={<LateralContratista />}>
      <BannerSinSenal />
      <main className="relative flex-1 overflow-y-auto overscroll-contain" id="contenido">
        <Outlet />
      </main>
      <BottomNav />
    </PhoneFrame>
  )
}

export function ProductorLayout() {
  useSincronizarRol('productor')
  const p = useProductor()
  return <DeskLayout rol="productor" persona={p?.razonSocial ?? 'Productor'} detalle={p ? `${p.contacto} · Plan ${p.plan === 'pro' ? 'Pro' : 'Gratis'}` : undefined} />
}

export function IngenieroLayout() {
  useSincronizarRol('ingeniero')
  const i = useIngeniero()
  return <DeskLayout rol="ingeniero" persona={i ? `Ing. Agr. ${i.nombre}` : 'Ingeniero agrónomo'} detalle={i?.matricula} />
}

export function AdminLayout() {
  useSincronizarRol('admin')
  return <DeskLayout rol="admin" persona="Mesa de ayuda Libertad" detalle="Administración de la red" />
}
