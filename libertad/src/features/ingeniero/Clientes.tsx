import { Link } from 'react-router'
import { num } from '@/domain/format'
import { CAMPANIA_ACTIVA, HOY } from '@/domain/reloj'
import { NOTA_VALIDACION_PROFESIONAL } from '@/domain/validacion'
import { useCatalogo } from '@/store/useCatalogo'
import { Avatar } from '@/ui/Avatar'
import { ButtonLink } from '@/ui/Button'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Stat } from '@/ui/Stat'
import { useAgronomia } from './useAgronomia'

export function ClientesIngeniero() {
  const cat = useCatalogo()
  const { ing, clientes, aplicaciones, pendientes, observadas, sinReceta } = useAgronomia()
  if (!ing) return <EmptyState titulo="No encontramos el ingeniero" />
  const recetasVigentes = cat.recetas.filter((r) => r.ingenieroId === ing.id && r.vence >= HOY)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-trigo-700">Ing. Agr. {ing.nombre} · {ing.matricula}</p>
        <h1 className="text-3xl text-tierra-900">Mis clientes</h1>
        <p className="text-texto-suave">Productores que te habilitaron para validar las aplicaciones de su cuaderno.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/ingeniero/aplicaciones" className="rounded-2xl"><Stat etiqueta="Para validar" valor={pendientes.length} detalle="Aplicaciones conformadas" icono="sello" tono={pendientes.length ? 'cielo' : 'verde'} className="h-full hover:border-borde-fuerte" /></Link>
        <Stat etiqueta="Observadas" valor={observadas.length} detalle="Esperando corrección del contratista" icono="alerta" tono="trigo" />
        <Link to="/ingeniero/aplicaciones?vista=sin_receta" className="rounded-2xl"><Stat etiqueta="Sin receta" valor={sinReceta.length} detalle="Aplicaciones a regularizar" icono="receta" tono={sinReceta.length ? 'rojo' : 'verde'} className="h-full hover:border-borde-fuerte" /></Link>
        <Stat etiqueta="Recetas vigentes" valor={recetasVigentes.length} detalle={`${aplicaciones.length} aplicaciones en seguimiento`} icono="receta" tono="tierra" />
      </div>
      {clientes.length === 0 ? <EmptyState icono="usuarios" titulo="Todavía no tenés clientes" texto="Los productores te habilitan desde su Configuración." /> : null}
      <ul className="grid gap-4 lg:grid-cols-2">
        {clientes.map((p) => {
          const ests = cat.establecimientos.filter((e) => e.productorId === p.id)
          const has = cat.lotes.filter((l) => ests.some((e) => e.id === l.establecimientoId)).reduce((s, l) => s + l.has, 0)
          const activo = p.validacionProfesional && p.ingenieroId === ing.id
          const pend = pendientes.filter((x) => x.productorId === p.id).length
          const sin = sinReceta.filter((x) => x.productorId === p.id).length
          return (
            <li key={p.id}>
              <Card className="h-full">
                <div className="flex items-start gap-3">
                  <Avatar nombre={p.razonSocial} tamano="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-xl leading-tight text-tierra-900">{p.razonSocial}</p>
                    <p className="text-sm text-texto-suave">{p.contacto} · {p.localidad}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {activo ? <Chip tono="verde" icono="sello">Validación activa</Chip> : <Chip tono="neutro" icono="candado">Validación no activada</Chip>}
                      {pend ? <Chip tono="cielo">{pend} para validar</Chip> : null}
                      {sin ? <Chip tono="rojo" icono="receta">{sin} sin receta</Chip> : null}
                    </div>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-borde pt-3 text-center text-sm">
                  <div><dt className="text-xs text-texto-suave">Establecimientos</dt><dd className="font-semibold">{ests.length}</dd></div>
                  <div><dt className="text-xs text-texto-suave">Superficie</dt><dd className="font-semibold">{num(has, 0)} has</dd></div>
                  <div><dt className="text-xs text-texto-suave">Campaña</dt><dd className="font-semibold">{CAMPANIA_ACTIVA}</dd></div>
                </dl>
                {activo ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ButtonLink to={`/ingeniero/aplicaciones?cliente=${p.id}`} tamano="sm" icono="sello">Aplicaciones</ButtonLink>
                    <ButtonLink to={`/ingeniero/cuadernos?cliente=${p.id}`} variante="secundario" tamano="sm" icono="libro">Cuaderno</ButtonLink>
                  </div>
                ) : (
                  <p className="mt-3 flex items-start gap-2 text-sm text-texto-suave">
                    <Icon nombre="info" tamano={16} className="mt-0.5 shrink-0" /> {ests.length ? 'El productor todavía no activó la validación profesional en su cuenta.' : 'Todavía no cargó su cuaderno digital.'}
                  </p>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
      <p className="flex items-start gap-2 rounded-xl bg-paper-2 p-3 text-sm text-texto-suave"><Icon nombre="info" tamano={16} className="mt-0.5 shrink-0" />{NOTA_VALIDACION_PROFESIONAL}.</p>
    </div>
  )
}
