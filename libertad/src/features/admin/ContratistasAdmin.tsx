import { useMemo, useState } from 'react'
import { etiquetaDocumento, etiquetaLabor, etiquetaNivel, fecha, porcentaje } from '@/domain/format'
import type { NivelVerificacion } from '@/domain/types'
import { semaforoVencimiento, type Semaforo } from '@/domain/verificacion'
import { useRed, type FichaRed } from '@/features/productor/contratistas/useRed'
import { useDemo } from '@/store/useDemo'
import { Avatar } from '@/ui/Avatar'
import { Card } from '@/ui/Card'
import { Chip } from '@/ui/Chip'
import { EmptyState } from '@/ui/EmptyState'
import { Icon } from '@/ui/Icon'
import { Modal } from '@/ui/Modal'
import { EstadoDocumentoChip, SemaforoChip } from '@/ui/StatusChip'
import { Table, type Columna } from '@/ui/Table'
import { Tabs } from '@/ui/Tabs'
import { VerificationBadge } from '@/ui/VerificationBadge'

const ORDEN: Semaforo[] = ['rojo', 'amarillo', 'verde', 'gris']

function peorSemaforo(f: FichaRed): Semaforo {
  const s = f.c.documentos.filter((d) => d.estado === 'aprobado').map((d) => semaforoVencimiento(d.vence))
  return ORDEN.find((x) => s.includes(x)) ?? 'gris'
}

export function ContratistasAdmin() {
  const red = useRed()
  const disputas = useDemo((s) => s.disputas)
  const [filtro, setFiltro] = useState<'todos' | NivelVerificacion | 'revision'>('todos')
  const [sel, setSel] = useState<string | null>(null)
  const filas = useMemo(() => red.filter((f) => filtro === 'todos' || (filtro === 'revision' ? !f.ev?.nivel || f.c.documentos.some((d) => d.estado === 'pendiente') : f.ev?.nivel === filtro)), [red, filtro])
  const ficha = red.find((f) => f.c.id === sel)
  const contar = (n: NivelVerificacion) => red.filter((f) => f.ev?.nivel === n).length

  const columnas: Columna<FichaRed>[] = [
    { clave: 'c', titulo: 'Contratista', render: ({ c }) => <span className="flex items-center gap-2"><Avatar nombre={c.razonSocial} tamano="sm" /><span><span className="block font-semibold">{c.razonSocial}</span><span className="block text-xs text-texto-suave">{c.localidad} · desde {c.desde}</span></span></span> },
    { clave: 'nivel', titulo: 'Nivel', render: ({ ev }) => <VerificationBadge nivel={ev?.nivel ?? null} tamano="sm" /> },
    { clave: 'servicios', titulo: 'Servicios', ocultarEnMovil: true, render: ({ c }) => <span className="text-xs">{c.servicios.map((s) => etiquetaLabor[s]).join(', ')}</span> },
    { clave: 'docs', titulo: 'Documentos', render: (f) => <SemaforoChip semaforo={peorSemaforo(f)} texto={peorSemaforo(f) === 'amarillo' ? 'Por vencer' : undefined} /> },
    { clave: 'calif', titulo: 'Calif.', alinear: 'der', render: ({ rep }) => <span className="num">{rep.calificacion ? rep.calificacion.toFixed(1).replace('.', ',') : '—'}</span> },
    { clave: 'conf', titulo: 'Conformidad', alinear: 'der', render: ({ rep }) => <span className="num">{porcentaje(rep.tasaConformidad)}</span> },
    { clave: 'disp', titulo: 'Disputas', alinear: 'der', render: ({ c }) => { const n = disputas.filter((d) => d.contratistaId === c.id && d.estado !== 'resuelta').length; return n ? <Chip tono="rojo" icono="balanza">{n}</Chip> : <span className="text-texto-suave">—</span> } },
  ]

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl text-tierra-900">Contratistas de la red</h1>
        <p className="text-texto-suave">Niveles, vencimientos, reputación y disputas en una vista.</p>
      </header>
      <Card>
        <Tabs
          etiqueta="Nivel"
          className="mb-4"
          valor={filtro}
          onCambiar={setFiltro}
          tabs={[
            { valor: 'todos', texto: 'Todos', cantidad: red.length },
            { valor: 'destacado', texto: 'Destacados', cantidad: contar('destacado') },
            { valor: 'verificado', texto: 'Verificados', cantidad: contar('verificado') },
            { valor: 'basico', texto: 'Básicos', cantidad: contar('basico') },
            { valor: 'revision', texto: 'En revisión', cantidad: red.filter((f) => !f.ev?.nivel || f.c.documentos.some((d) => d.estado === 'pendiente')).length },
          ]}
        />
        <Table etiqueta="Contratistas" columnas={columnas} filas={filas} claveFila={(f) => f.c.id} onFila={(f) => setSel(f.c.id)} vacio={<EmptyState icono="usuarios" titulo="Sin contratistas en este nivel" />} />
      </Card>
      {ficha ? (
        <Modal abierto onCerrar={() => setSel(null)} variante="lateral" titulo={ficha.c.razonSocial} descripcion={`${ficha.c.titular} · CUIT ${ficha.c.cuit}`}>
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2"><VerificationBadge nivel={ficha.ev?.nivel ?? null} tamano="lg" /></div>
            <section>
              <h3 className="mb-2 font-sans text-sm font-semibold">Requisitos</h3>
              {(['basico', 'verificado', 'destacado'] as NivelVerificacion[]).map((n) => (
                <div key={n} className="mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-texto-suave">{etiquetaNivel[n]}</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {ficha.ev?.requisitos.filter((r) => r.nivel === n).map((r) => (
                      <li key={r.id} className="flex items-center gap-2"><Icon nombre={r.cumple ? 'checkCirculo' : 'xCirculo'} tamano={16} className={r.cumple ? 'text-verde-600' : 'text-texto-suave'} />{r.texto}{r.detalle ? <span className="text-texto-suave"> · {r.detalle}</span> : null}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
            <section>
              <h3 className="mb-2 font-sans text-sm font-semibold">Documentación</h3>
              <ul className="divide-y divide-borde rounded-xl border border-borde">
                {ficha.c.documentos.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1">{etiquetaDocumento[d.tipo]}{d.vence ? <span className="block text-xs text-texto-suave">vence {fecha(d.vence)}</span> : null}</span>
                    <EstadoDocumentoChip estado={d.estado} />
                    {d.estado === 'aprobado' && d.vence ? <SemaforoChip semaforo={semaforoVencimiento(d.vence)} /> : null}
                  </li>
                ))}
              </ul>
            </section>
            <dl className="grid grid-cols-3 gap-2 rounded-xl bg-paper-2 p-3 text-center text-sm">
              <div><dt className="text-xs text-texto-suave">Calificación</dt><dd className="font-semibold">{ficha.rep.calificacion?.toFixed(1).replace('.', ',') ?? '—'} ({ficha.rep.resenas})</dd></div>
              <div><dt className="text-xs text-texto-suave">Conformidad</dt><dd className="font-semibold">{porcentaje(ficha.rep.tasaConformidad)}</dd></div>
              <div><dt className="text-xs text-texto-suave">Trabajos</dt><dd className="font-semibold">{ficha.rep.trabajos}</dd></div>
            </dl>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
