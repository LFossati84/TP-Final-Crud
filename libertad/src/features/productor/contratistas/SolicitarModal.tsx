import { useState } from 'react'
import { etiquetaLabor, num } from '@/domain/format'
import { HOY, sumarDias } from '@/domain/reloj'
import type { Contratista, ID, TipoLabor } from '@/domain/types'
import { useProductor } from '@/store/hooks'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { Checkbox, Input, Select, Textarea } from '@/ui/FormField'
import { Modal } from '@/ui/Modal'
import { toast } from '@/ui/toast-store'

type Props = { contratista: Contratista; tipo: 'presupuesto' | 'contratacion'; onCerrar: () => void; laborInicial?: TipoLabor }

/** Pedido de presupuesto o contratación directa para una labor. */
export function SolicitarModal({ contratista, tipo, onCerrar, laborInicial }: Props) {
  const p = useProductor()
  const cat = useCatalogo()
  const solicitar = useDemo((s) => s.solicitarPresupuesto)
  const ests = cat.establecimientos.filter((e) => e.productorId === p?.id)
  const [labor, setLabor] = useState<TipoLabor>(laborInicial && contratista.servicios.includes(laborInicial) ? laborInicial : (contratista.servicios[0] ?? 'pulverizacion'))
  const [estId, setEstId] = useState<ID>(ests[0]?.id ?? '')
  const lotes = cat.lotes.filter((l) => l.establecimientoId === estId)
  const [loteIds, setLoteIds] = useState<ID[]>([])
  const [fecha, setFecha] = useState(sumarDias(HOY, 5))
  const [comentario, setComentario] = useState(tipo === 'contratacion' ? 'Confirmamos el trabajo. Tenemos receta cargada en la plataforma.' : '')
  const has = lotes.filter((l) => loteIds.includes(l.id)).reduce((s, l) => s + l.has, 0)

  const enviar = () => {
    if (!p) return
    solicitar({ tipo, productorId: p.id, contratistaId: contratista.id, labor, establecimientoId: estId, loteIds, has, fechaDeseada: fecha, comentario: comentario || `${etiquetaLabor[labor]} en ${num(has, 1)} has.` })
    toast.ok(tipo === 'contratacion' ? 'Pedido de contratación enviado' : 'Pedido de presupuesto enviado', `${contratista.razonSocial} recibe la notificación. Te avisamos cuando responda.`)
    onCerrar()
  }

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={tipo === 'contratacion' ? 'Contratar para una labor' : 'Solicitar presupuesto'}
      descripcion={contratista.razonSocial}
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button icono="enviar" onClick={enviar} disabled={!estId || loteIds.length === 0} data-tour="enviar-pedido">
            {tipo === 'contratacion' ? 'Enviar contratación' : 'Pedir presupuesto'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Labor" value={labor} onChange={(e) => setLabor(e.target.value as TipoLabor)} opciones={contratista.servicios.map((s) => ({ valor: s, texto: etiquetaLabor[s] }))} />
          <Select label="Establecimiento" value={estId} onChange={(e) => { setEstId(e.target.value); setLoteIds([]) }} opciones={ests.map((e) => ({ valor: e.id, texto: e.nombre }))} />
        </div>
        <fieldset data-tour="pedido-lotes">
          <legend className="mb-1 text-sm font-semibold">Lotes</legend>
          <div className="grid gap-x-3 sm:grid-cols-2">
            {lotes.map((l) => (
              <Checkbox
                key={l.id}
                label={l.nombre}
                descripcion={`${num(l.has, 1)} has`}
                checked={loteIds.includes(l.id)}
                onChange={(e) => setLoteIds(e.target.checked ? [...loteIds, l.id] : loteIds.filter((x) => x !== l.id))}
              />
            ))}
          </div>
          <p className="num mt-1 text-sm text-texto-suave">Total: {num(has, 1)} has</p>
        </fieldset>
        <Input label="Fecha deseada" type="date" min={HOY} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <Textarea label="Comentario" opcional value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} placeholder="Ej.: barbecho previo a soja, tenemos receta. Ojo con la casa del puesto." />
      </div>
    </Modal>
  )
}
