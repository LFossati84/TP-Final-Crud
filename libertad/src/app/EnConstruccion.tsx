import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { Icon, type NombreIcono } from '@/ui/Icon'
import { EncabezadoMovil } from './EncabezadoMovil'

type Props = { titulo: string; fase: number; icono: NombreIcono; descripcion: string; items: string[]; movil?: boolean }

/** Pantalla provisoria de una sección que se construye en una fase posterior. */
export function EnConstruccion({ titulo, fase, icono, descripcion, items, movil = false }: Props) {
  const cuerpo = (
    <Card className="mx-auto max-w-2xl">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-verde-100 text-verde-800">
          <Icon nombre={icono} tamano={24} />
        </span>
        <div className="min-w-0">
          <Chip tono="trigo" icono="reloj">Se construye en la Fase {fase}</Chip>
          <p className="mt-2 text-texto-suave">{descripcion}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2 border-t border-borde pt-4">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-sm">
            <Icon nombre="check" tamano={16} className="mt-0.5 shrink-0 text-verde-600" />
            {it}
          </li>
        ))}
      </ul>
    </Card>
  )
  if (movil) {
    return (
      <>
        <EncabezadoMovil titulo={titulo} />
        <div className="p-4">{cuerpo}</div>
      </>
    )
  }
  return (
    <>
      <h1 className="mb-6 text-3xl text-tierra-900">{titulo}</h1>
      {cuerpo}
    </>
  )
}
