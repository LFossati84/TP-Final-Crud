import { useState } from 'react'
import { saldo } from '@/domain/cobranza'
import { etiquetaMedioPago, pesos } from '@/domain/format'
import type { Liquidacion, MedioPago } from '@/domain/types'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { Select, Textarea } from '@/ui/FormField'
import { Icon } from '@/ui/Icon'
import { InputNumero } from '@/ui/InputNumero'
import { Modal } from '@/ui/Modal'
import { toast } from '@/ui/toast-store'

const MEDIOS: MedioPago[] = ['transferencia', 'echeq', 'cheque', 'efectivo', 'canje_granos']

function AdjuntoSimulado({ archivo, onCambiar, etiqueta }: { archivo: string; onCambiar: (a: string) => void; etiqueta: string }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">{etiqueta}</p>
      <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-borde-fuerte bg-paper-2 px-3 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foco">
        <Icon nombre={archivo ? 'documento' : 'clip'} className="text-texto-suave" />
        <span className="min-w-0 flex-1 truncate">{archivo || 'Adjuntá el comprobante (PDF o foto)'}</span>
        <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => onCambiar(e.target.files?.[0]?.name ?? '')} />
      </label>
      {!archivo ? (
        <button type="button" onClick={() => onCambiar('comprobante-transferencia-151026.pdf')} className="mt-1 min-h-9 text-xs font-semibold text-verde-800 hover:underline" data-tour="usar-comprobante-ejemplo">
          Usar un comprobante de ejemplo
        </button>
      ) : null}
    </div>
  )
}

/** Contratista: registra un cobro total o parcial. */
export function RegistrarCobroModal({ liq, onCerrar }: { liq: Liquidacion; onCerrar: () => void }) {
  const registrar = useDemo((s) => s.registrarCobro)
  const restante = saldo(liq)
  const [monto, setMonto] = useState(Math.round(liq.pagoInformado?.monto ?? restante))
  const [medio, setMedio] = useState<MedioPago>(liq.pagoInformado?.medio ?? 'transferencia')
  const [comprobante, setComprobante] = useState(liq.pagoInformado?.comprobante ?? '')
  const [nota, setNota] = useState('')
  const parcial = monto < restante - 0.5
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Registrar cobro · ${liq.numero}`}
      descripcion={`Saldo pendiente: ${pesos(restante)}`}
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button
            icono="check"
            disabled={!(monto > 0) || monto > restante + 0.5}
            onClick={() => {
              registrar(liq.id, { monto, medio, comprobante: comprobante || undefined, nota: nota || undefined })
              toast.ok(parcial ? 'Cobro parcial registrado' : `${liq.numero} cobrada y conciliada`, parcial ? `Queda un saldo de ${pesos(restante - monto)}.` : 'Se lo avisamos al productor.')
              onCerrar()
            }}
            data-tour="confirmar-cobro"
          >
            {parcial ? 'Registrar cobro parcial' : 'Registrar cobro total'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {liq.pagoInformado ? (
          <p className="rounded-xl bg-cielo-50 p-3 text-sm text-cielo-900 ring-1 ring-inset ring-cielo-200">
            El productor informó un pago de {pesos(liq.pagoInformado.monto)} por {etiquetaMedioPago[liq.pagoInformado.medio]}. Verificalo en tu cuenta antes de confirmarlo.
          </p>
        ) : null}
        <InputNumero label="Monto cobrado" valor={monto} onValor={setMonto} prefijo="$" error={monto > restante + 0.5 ? 'Supera el saldo pendiente.' : undefined} hint={parcial ? 'Pago parcial: la liquidación queda con saldo.' : 'Cancela la liquidación.'} />
        <Select label="Medio de pago" value={medio} onChange={(e) => setMedio(e.target.value as MedioPago)} opciones={MEDIOS.map((m) => ({ valor: m, texto: etiquetaMedioPago[m] }))} />
        <AdjuntoSimulado archivo={comprobante} onCambiar={setComprobante} etiqueta="Comprobante" />
        <Textarea label="Nota" opcional value={nota} onChange={(e) => setNota(e.target.value)} rows={2} placeholder="Ej.: e-cheq a 30 días, número 0045…" />
      </div>
    </Modal>
  )
}

/** Productor: informa que pagó (queda pendiente de que el contratista concilie). */
export function MarcarPagadoModal({ liq, onCerrar }: { liq: Liquidacion; onCerrar: () => void }) {
  const informar = useDemo((s) => s.informarPago)
  const restante = saldo(liq)
  const [monto, setMonto] = useState(Math.round(restante))
  const [medio, setMedio] = useState<MedioPago>('transferencia')
  const [comprobante, setComprobante] = useState('')
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Marcar como pagado · ${liq.numero}`}
      descripcion="El contratista recibe el aviso con tu comprobante y confirma el cobro."
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button
            icono="check"
            disabled={!(monto > 0) || !comprobante}
            onClick={() => {
              informar(liq.id, { monto, medio, comprobante })
              toast.ok('Pago informado', 'Le avisamos al contratista para que lo confirme.')
              onCerrar()
            }}
            data-tour="confirmar-pago"
          >
            Informar pago
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <InputNumero label="Monto pagado" valor={monto} onValor={setMonto} prefijo="$" hint={`Saldo de la liquidación: ${pesos(restante)}`} />
        <Select label="Medio de pago" value={medio} onChange={(e) => setMedio(e.target.value as MedioPago)} opciones={MEDIOS.map((m) => ({ valor: m, texto: etiquetaMedioPago[m] }))} />
        <AdjuntoSimulado archivo={comprobante} onCambiar={setComprobante} etiqueta="Comprobante de pago" />
        <p className="text-xs text-texto-suave">Demo: no se procesa ningún pago ni se sube el archivo.</p>
      </div>
    </Modal>
  )
}

/** Abrir disputa sobre una liquidación (contratista o productor). */
export function AbrirDisputaModal({ liq, por, onCerrar }: { liq: Liquidacion; por: 'contratista' | 'productor'; onCerrar: () => void }) {
  const abrir = useDemo((s) => s.abrirDisputa)
  const [motivo, setMotivo] = useState(
    por === 'contratista'
      ? `La liquidación ${liq.numero} lleva más de 30 días vencida y no hubo respuesta a los recordatorios. Pido la intervención de la red.`
      : '',
  )
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Abrir disputa · ${liq.numero}`}
      descripcion="La mesa de ayuda de la red media entre las partes. Mientras tanto, la liquidación queda en disputa."
      pie={
        <>
          <Button variante="fantasma" onClick={onCerrar}>Cancelar</Button>
          <Button
            variante="peligro"
            icono="balanza"
            disabled={!motivo.trim()}
            onClick={() => {
              const d = abrir(liq.id, por, motivo)
              if (d) toast.alerta(`Disputa ${d.numero} abierta`, 'La mesa de ayuda ya fue notificada.')
              onCerrar()
            }}
            data-tour="confirmar-disputa"
          >
            Abrir disputa
          </Button>
        </>
      }
    >
      <Textarea label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} placeholder="Contá qué pasó y qué proponés." />
    </Modal>
  )
}
