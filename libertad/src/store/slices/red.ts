import { etiquetaDocumento, etiquetaLabor, etiquetaNivel } from '@/domain/format'
import { HOY } from '@/domain/reloj'
import type {
  EstadoDocumento,
  Establecimiento,
  ID,
  Lote,
  Notificacion,
  Presupuesto,
  TipoDocumento,
} from '@/domain/types'
import { verificacionDe } from '../derivados'
import { nuevoId, notificacion, reemplazar } from '../helpers'
import type { Slice } from '../tipos'

export interface AccionesRed {
  /** Admin: aprobar / pedir corrección / rechazar un documento. */
  revisarDocumento: (contratistaId: ID, documentoId: ID, estado: Exclude<EstadoDocumento, 'pendiente'>, nota?: string) => void
  /** Contratista: sube una versión nueva de un documento (queda pendiente de revisión). */
  cargarDocumento: (contratistaId: ID, tipo: TipoDocumento, archivo: string, vence?: string) => void
  solicitarPresupuesto: (p: Omit<Presupuesto, 'id' | 'fecha' | 'estado'>) => Presupuesto
  responderPresupuesto: (id: ID, respuesta: Omit<NonNullable<Presupuesto['respuesta']>, 'fecha'>) => void
  decidirPresupuesto: (id: ID, decision: 'aceptado' | 'rechazado') => void
  setValidacionProfesional: (productorId: ID, activa: boolean, ingenieroId?: ID) => void
  setConsentimiento: (productorId: ID, consiente: boolean) => void
  guardarLote: (lote: Lote) => void
  guardarEstablecimiento: (e: Establecimiento) => void
}

export const crearSliceRed: Slice<AccionesRed> = (set, get) => ({
  revisarDocumento: (contratistaId, documentoId, estado, nota) => {
    const antes = verificacionDe(get(), contratistaId)?.nivel ?? null
    set((s) => ({
      contratistas: reemplazar(s.contratistas, contratistaId, (c) => ({
        ...c,
        documentos: c.documentos.map((d) => {
          if (d.id !== documentoId) return d
          // Renovación: si se aprueba, reemplaza a la versión vigente; si no, se descarta y queda la anterior.
          if (d.renovacion) {
            return estado === 'aprobado'
              ? { ...d, ...d.renovacion, estado: 'aprobado' as const, nota: undefined, renovacion: undefined }
              : { ...d, nota, renovacion: undefined }
          }
          return { ...d, estado, nota }
        }),
      })),
    }))
    const s = get()
    const despues = verificacionDe(s, contratistaId)?.nivel ?? null
    const doc = s.contratistas.find((c) => c.id === contratistaId)?.documentos.find((d) => d.id === documentoId)
    const avisos: Notificacion[] = []
    if (doc && estado !== 'aprobado') {
      avisos.push(
        notificacion(
          'contratista',
          contratistaId,
          estado === 'rechazado' ? 'peligro' : 'alerta',
          `${etiquetaDocumento[doc.tipo]}: ${estado === 'rechazado' ? 'rechazado' : 'pedido de corrección'}`,
          nota ?? 'Revisá el documento y volvé a cargarlo.',
          '/contratista/perfil',
        ),
      )
    }
    if (despues !== antes && despues) {
      avisos.push(
        notificacion('contratista', contratistaId, 'ok', `¡Tu nivel ahora es ${etiquetaNivel[despues]}!`, 'El badge ya se muestra en tu perfil y en las búsquedas de productores.', '/contratista/perfil'),
      )
    }
    if (avisos.length) set((st) => ({ notificaciones: [...avisos, ...st.notificaciones] }))
  },

  cargarDocumento: (contratistaId, tipo, archivo, vence) =>
    set((s) => ({
      contratistas: reemplazar(s.contratistas, contratistaId, (c) => {
        const existente = c.documentos.find((d) => d.tipo === tipo)
        // Si el documento vigente está aprobado, la versión nueva queda como renovación en revisión.
        if (existente && existente.estado === 'aprobado') {
          return { ...c, documentos: c.documentos.map((d) => (d.tipo === tipo ? { ...d, renovacion: { archivo, cargado: HOY, vence } } : d)) }
        }
        const nuevo = { id: existente?.id ?? nuevoId('d'), tipo, estado: 'pendiente' as const, archivo, cargado: HOY, vence }
        return {
          ...c,
          documentos: existente ? c.documentos.map((d) => (d.tipo === tipo ? nuevo : d)) : [...c.documentos, nuevo],
        }
      }),
      notificaciones: [
        notificacion('admin', undefined, 'info', 'Documento para revisar', `${s.contratistas.find((c) => c.id === contratistaId)?.razonSocial ?? ''} · ${etiquetaDocumento[tipo]}.`, '/admin/verificaciones'),
        ...s.notificaciones,
      ],
    })),

  solicitarPresupuesto: (datos) => {
    const s = get()
    const p: Presupuesto = { ...datos, id: nuevoId('pr'), fecha: HOY, estado: 'solicitado' }
    const productor = s.productores.find((x) => x.id === datos.productorId)
    set((st) => ({
      presupuestos: [p, ...st.presupuestos],
      notificaciones: [
        notificacion(
          'contratista',
          datos.contratistaId,
          'info',
          datos.tipo === 'contratacion' ? 'Nuevo pedido de contratación' : 'Nuevo pedido de presupuesto',
          `${productor?.razonSocial ?? 'Un productor'} · ${etiquetaLabor[datos.labor]} · ${datos.has} has.`,
          '/contratista/trabajos',
        ),
        ...st.notificaciones,
      ],
    }))
    return p
  },

  responderPresupuesto: (id, respuesta) =>
    set((s) => {
      const p = s.presupuestos.find((x) => x.id === id)
      if (!p) return {}
      const c = s.contratistas.find((x) => x.id === p.contratistaId)
      return {
        presupuestos: reemplazar(s.presupuestos, id, (x) => ({ ...x, estado: 'respondido', respuesta: { ...respuesta, fecha: HOY } })),
        notificaciones: [
          notificacion('productor', p.productorId, 'ok', `${c?.razonSocial ?? 'El contratista'} respondió tu pedido`, respuesta.mensaje, '/productor/contratistas'),
          ...s.notificaciones,
        ],
      }
    }),

  decidirPresupuesto: (id, decision) =>
    set((s) => {
      const p = s.presupuestos.find((x) => x.id === id)
      if (!p) return {}
      const prod = s.productores.find((x) => x.id === p.productorId)
      return {
        presupuestos: reemplazar(s.presupuestos, id, (x) => ({ ...x, estado: decision })),
        notificaciones: [
          notificacion('contratista', p.contratistaId, decision === 'aceptado' ? 'ok' : 'info', decision === 'aceptado' ? '¡Presupuesto aceptado!' : 'Presupuesto no aceptado', `${prod?.razonSocial ?? 'El productor'} · ${etiquetaLabor[p.labor]} · ${p.has} has.`, '/contratista/trabajos'),
          ...s.notificaciones,
        ],
      }
    }),

  setValidacionProfesional: (productorId, activa, ingenieroId) =>
    set((s) => ({
      productores: reemplazar(s.productores, productorId, (p) => ({
        ...p,
        validacionProfesional: activa,
        ingenieroId: ingenieroId ?? p.ingenieroId,
      })),
    })),

  setConsentimiento: (productorId, consiente) =>
    set((s) => ({
      productores: reemplazar(s.productores, productorId, (p) => ({ ...p, consentimientoReputacionPago: consiente })),
    })),

  guardarLote: (lote) =>
    set((s) => ({
      lotes: s.lotes.some((l) => l.id === lote.id) ? reemplazar(s.lotes, lote.id, () => lote) : [...s.lotes, lote],
    })),

  guardarEstablecimiento: (e) =>
    set((s) => ({
      establecimientos: s.establecimientos.some((x) => x.id === e.id)
        ? reemplazar(s.establecimientos, e.id, () => e)
        : [...s.establecimientos, e],
    })),
})
