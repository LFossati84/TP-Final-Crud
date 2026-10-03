import { useNavigate, useParams } from 'react-router'
import { Comprobante } from '@/features/cobranza/Comprobante'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { EmptyState } from '@/ui/EmptyState'

export function LiquidacionImprimible() {
  const { id } = useParams()
  const navigate = useNavigate()
  const cat = useCatalogo()
  const liq = useDemo((s) => s.liquidaciones.find((l) => l.id === id))
  const c = liq ? cat.contratista(liq.contratistaId) : undefined
  const p = liq ? cat.productor(liq.productorId) : undefined
  if (!liq || !c || !p) return <main id="contenido" className="mx-auto max-w-lg px-4 py-16"><EmptyState titulo="No encontramos la liquidación" /></main>
  return (
    <main id="contenido" className="forzar-claro min-h-screen bg-paper-3 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-2 px-4 print:hidden">
        <Button variante="secundario" icono="flechaIzquierda" onClick={() => navigate(-1)}>Volver</Button>
        <Button icono="imprimir" onClick={() => window.print()}>Imprimir / Guardar PDF</Button>
      </div>
      <div className="overflow-x-auto px-2 print:overflow-visible print:px-0">
        <Comprobante liq={liq} c={c} p={p} className="mx-auto min-w-[600px] max-w-[210mm] px-[14mm] py-[12mm] shadow-elevada print:min-w-0 print:p-0 print:shadow-none" />
      </div>
    </main>
  )
}
