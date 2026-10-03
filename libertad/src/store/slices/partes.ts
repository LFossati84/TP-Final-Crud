import { entradaDesdeParte } from '@/domain/cuaderno'
import { etiquetaLabor, etiquetaMotivoObservacion } from '@/domain/format'
import { ahora, HOY } from '@/domain/reloj'
import { esAplicacion } from '@/domain/validacion'
import type {
  CodigoHallazgo,
  ID,
  MotivoObservacion,
  Notificacion,
  ParteLabor,
  RecetaAgronomica,
  Resena,
} from '@/domain/types'
import { nuevoId, notificacion, reemplazar, siguienteNumero } from '../helpers'
import type { DemoState, Slice } from '../tipos'

export interface AccionesPartes {
  /** Crea o actualiza un borrador. */
  guardarBorrador: (p: ParteLabor) => void
  /** Envía el parte. Sin conexión queda en la cola local ("Sin sincronizar"). */
  enviarParte: (p: ParteLabor) => ParteLabor
  /** Sincroniza la cola local. Devuelve cuántos partes se enviaron. */
  sincronizar: () => number
  conformarParte: (id: ID, resena?: { puntaje: Resena['puntaje']; texto: string }) => void
  observarParte: (id: ID, motivo: MotivoObservacion, detalle: string) => void
  rechazarParte: (id: ID, motivo: string) => void
  /** El contratista corrige un parte observado (por el productor o por el ingeniero) y lo reenvía. */
  corregirParte: (id: ID, cambios: Partial<ParteLabor>, nota: string) => void
  validarAplicacion: (parteId: ID, nota?: string) => void
  observarAplicacion: (parteId: ID, motivos: CodigoHallazgo[], nota: string) => void
  emitirReceta: (r: Omit<RecetaAgronomica, 'id' | 'numero' | 'estado'>) => RecetaAgronomica
  asociarReceta: (parteId: ID, recetaId: ID) => void
}

function nombreLote(s: DemoState, loteId: ID): string {
  return s.lotes.find((l) => l.id === loteId)?.nombre ?? 'el lote'
}

function nombreContratista(s: DemoState, id: ID): string {
  return s.contratistas.find((c) => c.id === id)?.razonSocial ?? 'El contratista'
}

function nombreProductor(s: DemoState, id: ID): string {
  return s.productores.find((p) => p.id === id)?.razonSocial ?? 'El productor'
}

/** Notificaciones que dispara un parte recién llegado al productor. */
function avisosDeEnvio(s: DemoState, p: ParteLabor): Notificacion[] {
  const avisos = [
    notificacion(
      'productor',
      p.productorId,
      'info',
      `Nuevo parte para conformar: ${p.numero}`,
      `${nombreContratista(s, p.contratistaId)} · ${etiquetaLabor[p.labor]} en ${nombreLote(s, p.loteId)} · ${p.has} has.`,
      `/productor/partes/${p.id}`,
    ),
  ]
  if (esAplicacion(p) && !p.recetaId) {
    avisos.push(
      notificacion('productor', p.productorId, 'peligro', 'Aplicación sin receta asociada', `${p.numero} en ${nombreLote(s, p.loteId)} no tiene receta agronómica.`, `/productor/partes/${p.id}`),
    )
  }
  return avisos
}

export const crearSlicePartes: Slice<AccionesPartes> = (set, get) => ({
  guardarBorrador: (p) =>
    set((s) => {
      const existe = s.partes.some((x) => x.id === p.id)
      const numero = p.numero || siguienteNumero(s.partes.map((x) => x.numero), 'PL')
      const borrador: ParteLabor = { ...p, numero, estado: 'borrador', historial: [{ fecha: ahora(), estado: 'borrador', actor: 'contratista' }] }
      return { partes: existe ? reemplazar(s.partes, p.id, () => borrador) : [borrador, ...s.partes] }
    }),

  enviarParte: (p) => {
    const s = get()
    const numero = p.numero || siguienteNumero(s.partes.map((x) => x.numero), 'PL')
    const online = s.online
    const enviado: ParteLabor = {
      ...p,
      numero,
      estado: online ? 'enviado' : 'pendiente_sync',
      cargadoSinConexion: !online || p.cargadoSinConexion,
      historial: [
        ...p.historial.filter((e) => e.estado !== 'borrador'),
        { fecha: ahora(), estado: online ? 'enviado' : 'pendiente_sync', actor: 'contratista', nota: online ? undefined : 'Guardado en el teléfono sin conexión' },
      ],
    }
    set((st) => {
      const existe = st.partes.some((x) => x.id === p.id)
      return {
        partes: existe ? reemplazar(st.partes, p.id, () => enviado) : [enviado, ...st.partes],
        notificaciones: online ? [...avisosDeEnvio(st, enviado), ...st.notificaciones] : st.notificaciones,
      }
    })
    return enviado
  },

  sincronizar: () => {
    const pendientes = get().partes.filter((p) => p.estado === 'pendiente_sync')
    if (pendientes.length === 0) return 0
    set((s) => {
      const partes = s.partes.map((p) =>
        p.estado === 'pendiente_sync'
          ? { ...p, estado: 'enviado' as const, historial: [...p.historial, { fecha: ahora(), estado: 'enviado' as const, actor: 'sistema' as const, nota: 'Sincronizado al recuperar señal' }] }
          : p,
      )
      const avisos = partes.filter((p) => pendientes.some((x) => x.id === p.id)).flatMap((p) => avisosDeEnvio(s, p))
      return { partes, notificaciones: [...avisos, ...s.notificaciones] }
    })
    return pendientes.length
  },

  conformarParte: (id, resena) =>
    set((s) => {
      const p = s.partes.find((x) => x.id === id)
      if (!p) return {}
      const productor = s.productores.find((x) => x.id === p.productorId)
      const requiereValidacion =
        esAplicacion(p) && Boolean(productor?.validacionProfesional && productor.ingenieroId) && !p.validacion
      const actualizado: ParteLabor = {
        ...p,
        estado: 'conformado',
        observacion: undefined,
        historial: [...p.historial, { fecha: ahora(), estado: 'conformado', actor: 'productor' }],
        validacion: requiereValidacion && productor?.ingenieroId ? { estado: 'pendiente', ingenieroId: productor.ingenieroId } : p.validacion,
      }
      // 1) Cuaderno · 2) reputación (derivada de partes + reseñas) · 3) listo para cobrar (derivado)
      const entrada = entradaDesdeParte(
        actualizado,
        s.lotes.find((l) => l.id === p.loteId),
        s.contratistas.find((c) => c.id === p.contratistaId),
        s.insumos,
      )
      const avisos: Notificacion[] = [
        notificacion(
          'contratista',
          p.contratistaId,
          'ok',
          `${p.numero} conformado · listo para cobrar`,
          `${nombreProductor(s, p.productorId)} conformó ${etiquetaLabor[p.labor].toLowerCase()} en ${nombreLote(s, p.loteId)}. Ya suma a tu reputación.`,
          '/contratista/cobros',
        ),
      ]
      if (requiereValidacion && productor?.ingenieroId) {
        avisos.push(
          notificacion('ingeniero', productor.ingenieroId, 'alerta', `Aplicación para validar: ${p.numero}`, `${productor.razonSocial} · ${nombreLote(s, p.loteId)}.`, '/ingeniero/aplicaciones'),
        )
      }
      const nuevaResena: Resena[] = resena
        ? [{ id: nuevoId('rs'), contratistaId: p.contratistaId, productorId: p.productorId, fecha: HOY, puntaje: resena.puntaje, texto: resena.texto, labor: p.labor }]
        : []
      return {
        partes: reemplazar(s.partes, id, () => actualizado),
        cuaderno: [entrada, ...s.cuaderno.filter((e) => e.parteId !== id)],
        resenas: [...nuevaResena, ...s.resenas],
        notificaciones: [...avisos, ...s.notificaciones],
      }
    }),

  observarParte: (id, motivo, detalle) =>
    set((s) => {
      const p = s.partes.find((x) => x.id === id)
      if (!p) return {}
      return {
        partes: reemplazar(s.partes, id, (x) => ({
          ...x,
          estado: 'observado',
          observacion: { motivo, detalle, fecha: ahora(), por: 'productor' },
          historial: [...x.historial, { fecha: ahora(), estado: 'observado', actor: 'productor', nota: detalle }],
        })),
        notificaciones: [
          notificacion('contratista', p.contratistaId, 'alerta', `${p.numero} observado`, `${etiquetaMotivoObservacion[motivo]}: ${detalle}`, `/contratista/trabajos/${p.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  rechazarParte: (id, motivo) =>
    set((s) => {
      const p = s.partes.find((x) => x.id === id)
      if (!p) return {}
      return {
        partes: reemplazar(s.partes, id, (x) => ({
          ...x,
          estado: 'rechazado',
          rechazo: { motivo, fecha: ahora() },
          historial: [...x.historial, { fecha: ahora(), estado: 'rechazado', actor: 'productor', nota: motivo }],
        })),
        notificaciones: [
          notificacion('contratista', p.contratistaId, 'peligro', `${p.numero} rechazado`, motivo, `/contratista/trabajos/${p.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  corregirParte: (id, cambios, nota) =>
    set((s) => {
      const p = s.partes.find((x) => x.id === id)
      if (!p) return {}
      const corregido: ParteLabor = { ...p, ...cambios }
      // Observado por el productor → vuelve a "Enviado" para una nueva conformidad.
      if (p.estado === 'observado') {
        const reenviado: ParteLabor = {
          ...corregido,
          estado: 'enviado',
          observacion: undefined,
          historial: [...p.historial, { fecha: ahora(), estado: 'enviado', actor: 'contratista', nota }],
        }
        return {
          partes: reemplazar(s.partes, id, () => reenviado),
          notificaciones: [
            notificacion('productor', p.productorId, 'info', `${p.numero} corregido y reenviado`, `${nombreContratista(s, p.contratistaId)}: ${nota}`, `/productor/partes/${p.id}`),
            ...s.notificaciones,
          ],
        }
      }
      // Observado por el ingeniero → la validación vuelve a quedar pendiente.
      if (p.validacion?.estado === 'observada') {
        const conValidacion: ParteLabor = {
          ...corregido,
          validacion: { estado: 'pendiente', ingenieroId: p.validacion.ingenieroId },
          historial: [...p.historial, { fecha: ahora(), estado: p.estado, actor: 'contratista', nota }],
        }
        const entrada = entradaDesdeParte(conValidacion, s.lotes.find((l) => l.id === p.loteId), s.contratistas.find((c) => c.id === p.contratistaId), s.insumos)
        return {
          partes: reemplazar(s.partes, id, () => conValidacion),
          cuaderno: p.estado === 'conformado' ? [entrada, ...s.cuaderno.filter((e) => e.parteId !== id)] : s.cuaderno,
          notificaciones: [
            notificacion('ingeniero', p.validacion.ingenieroId, 'info', `${p.numero} corregido`, `${nombreContratista(s, p.contratistaId)}: ${nota}`, '/ingeniero/aplicaciones'),
            ...s.notificaciones,
          ],
        }
      }
      return { partes: reemplazar(s.partes, id, () => corregido) }
    }),

  validarAplicacion: (parteId, nota) =>
    set((s) => {
      const p = s.partes.find((x) => x.id === parteId)
      if (!p) return {}
      const ingenieroId = p.validacion?.ingenieroId ?? s.ingenieroId
      return {
        partes: reemplazar(s.partes, parteId, (x) => ({ ...x, validacion: { estado: 'validada', ingenieroId, fecha: ahora(), nota } })),
        notificaciones: [
          notificacion('productor', p.productorId, 'ok', `Aplicación validada: ${p.numero}`, `El cuaderno de ${nombreLote(s, p.loteId)} ya muestra el sello profesional.`, '/productor/cuaderno'),
          notificacion('contratista', p.contratistaId, 'ok', `${p.numero} validado por el ingeniero`, 'La aplicación quedó validada en el cuaderno del productor.', `/contratista/trabajos/${p.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  observarAplicacion: (parteId, motivos, nota) =>
    set((s) => {
      const p = s.partes.find((x) => x.id === parteId)
      if (!p) return {}
      const ingenieroId = p.validacion?.ingenieroId ?? s.ingenieroId
      return {
        partes: reemplazar(s.partes, parteId, (x) => ({ ...x, validacion: { estado: 'observada', ingenieroId, fecha: ahora(), nota, motivos } })),
        notificaciones: [
          notificacion('contratista', p.contratistaId, 'alerta', `El ingeniero observó ${p.numero}`, nota, `/contratista/trabajos/${p.id}`),
          notificacion('productor', p.productorId, 'alerta', `Aplicación observada: ${p.numero}`, nota, `/productor/partes/${p.id}`),
          ...s.notificaciones,
        ],
      }
    }),

  emitirReceta: (r) => {
    const s = get()
    const receta: RecetaAgronomica = {
      ...r,
      id: nuevoId('r'),
      numero: siguienteNumero(s.recetas.map((x) => x.numero).filter((n) => n.startsWith(`RA-${HOY.slice(0, 4)}`)), `RA-${HOY.slice(0, 4)}`),
      estado: 'emitida',
    }
    set((st) => ({
      recetas: [receta, ...st.recetas],
      notificaciones: [
        notificacion('productor', r.productorId, 'info', `Nueva receta ${receta.numero}`, r.objetivo, '/productor/cuaderno'),
        ...st.notificaciones,
      ],
    }))
    return receta
  },

  asociarReceta: (parteId, recetaId) =>
    set((s) => ({ partes: reemplazar(s.partes, parteId, (x) => ({ ...x, recetaId })) })),
})
