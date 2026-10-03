import { useState } from 'react'
import { Link } from 'react-router'
import { porcentaje } from '@/domain/format'
import { NOTA_VALIDACION_PROFESIONAL } from '@/domain/validacion'
import { useProductor, useReputacionPago } from '@/store/hooks'
import { useDemo } from '@/store/useDemo'
import { Card, CardHeader } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Select, Toggle } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { toast } from '@/ui/toast-store'

export function ConfiguracionProductor() {
  const p = useProductor()
  const ingenieros = useDemo((s) => s.ingenieros)
  const setValidacion = useDemo((s) => s.setValidacionProfesional)
  const setConsentimiento = useDemo((s) => s.setConsentimiento)
  const rep = useReputacionPago(p?.id ?? '')
  const [whatsapp, setWhatsapp] = useState(true)
  const [resumen, setResumen] = useState(true)
  if (!p) return <EmptyState titulo="No encontramos el productor" />

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl text-tierra-900">Configuración</h1>
        <p className="text-texto-suave">{p.razonSocial} · CUIT {p.cuit}</p>
      </header>

      <Card>
        <CardHeader titulo="Validación profesional" subtitulo="Opcional · suma el sello de tu ingeniero agrónomo a las aplicaciones del cuaderno" acciones={<Chip tono="trigo" icono="estrella">Plan Pro</Chip>} />
        <Toggle
          label="Activar validación de aplicaciones"
          descripcion="Cada aplicación de fitosanitarios conformada pasa a la bandeja de tu ingeniero para validarla u observarla."
          activo={p.validacionProfesional}
          onCambiar={(v) => {
            setValidacion(p.id, v, p.ingenieroId ?? ingenieros[0]?.id)
            toast.ok(v ? 'Validación profesional activada' : 'Validación profesional desactivada')
          }}
        />
        {p.validacionProfesional ? (
          <Select
            className="mt-3 max-w-sm"
            label="Ingeniero agrónomo"
            value={p.ingenieroId ?? ''}
            onChange={(e) => setValidacion(p.id, true, e.target.value)}
            opciones={ingenieros.map((i) => ({ valor: i.id, texto: `Ing. Agr. ${i.nombre} · ${i.matricula}` }))}
          />
        ) : null}
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-paper-2 p-3 text-sm text-texto-suave">
          <Icon nombre="info" tamano={16} className="mt-0.5 shrink-0" />
          {NOTA_VALIDACION_PROFESIONAL}.
        </p>
      </Card>

      <Card>
        <CardHeader titulo="Reputación de pago" subtitulo="Tu historial de cumplimiento, visible solo para contratistas que ya trabajaron con vos" />
        <Toggle
          label="Compartir mi historial de pago"
          descripcion="Días promedio de pago y porcentaje en término. Podés desactivarlo cuando quieras."
          activo={p.consentimientoReputacionPago}
          onCambiar={(v) => {
            setConsentimiento(p.id, v)
            toast.ok(v ? 'Historial compartido' : 'Historial oculto', v ? 'Los contratistas con los que trabajaste lo ven en tu perfil.' : 'Ningún contratista lo ve.')
          }}
        />
        {rep ? (
          <dl className="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-paper-2 p-3 text-center">
            <div><dt className="text-xs text-texto-suave">Liquidaciones</dt><dd className="text-lg font-semibold">{rep.liquidaciones}</dd></div>
            <div><dt className="text-xs text-texto-suave">Pagadas en término</dt><dd className="text-lg font-semibold">{porcentaje(rep.enTermino)}</dd></div>
            <div><dt className="text-xs text-texto-suave">Días vs. vencimiento</dt><dd className="text-lg font-semibold">{rep.diasPromedio <= 0 ? `${Math.abs(rep.diasPromedio).toFixed(1).replace('.', ',')} antes` : `${rep.diasPromedio.toFixed(1).replace('.', ',')} después`}</dd></div>
          </dl>
        ) : null}
        <p className="mt-2 text-xs text-texto-suave">Tratamiento de datos personales según la Ley 25.326; el consentimiento es revocable. A validar con asesoría legal antes del lanzamiento.</p>
      </Card>

      <Card>
        <CardHeader titulo="Notificaciones" subtitulo="Simuladas en la demo" />
        <Toggle label="Avisos por WhatsApp" descripcion="Partes nuevos, liquidaciones y vencimientos." activo={whatsapp} onCambiar={setWhatsapp} />
        <Toggle label="Resumen semanal por correo" descripcion="Labores de la semana y saldo a pagar." activo={resumen} onCambiar={setResumen} className="mt-2" />
      </Card>

      <Card>
        <CardHeader titulo="Plan" subtitulo={p.plan === 'pro' ? 'Pro: varios establecimientos, informes y validación profesional' : 'Gratis: cuaderno básico'} />
        <Link to="/planes" className="inline-flex items-center gap-1 text-sm font-semibold text-verde-800 hover:underline">
          Ver planes <Icon nombre="chevronDerecha" tamano={16} />
        </Link>
      </Card>
    </div>
  )
}
