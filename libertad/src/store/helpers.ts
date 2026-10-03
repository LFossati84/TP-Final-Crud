import { ahora } from '@/domain/reloj'
import type { ID, Notificacion, Rol, TipoNotificacion } from '@/domain/types'

let contador = 0

export function nuevoId(prefijo: string): ID {
  contador += 1
  return `${prefijo}-${Date.now().toString(36)}${contador}`
}

/** Siguiente número correlativo: PL-0660, LQ-0156, etc. */
export function siguienteNumero(existentes: string[], prefijo: string, ancho = 4): string {
  const max = existentes.reduce((m, n) => {
    const v = Number(n.replace(/\D/g, '').slice(-ancho))
    return Number.isFinite(v) && v > m ? v : m
  }, 0)
  return `${prefijo}-${String(max + 1).padStart(ancho, '0')}`
}

export function reemplazar<T extends { id: ID }>(lista: T[], id: ID, fn: (x: T) => T): T[] {
  return lista.map((x) => (x.id === id ? fn(x) : x))
}

export function notificacion(
  rol: Rol,
  usuarioId: ID | undefined,
  tipo: TipoNotificacion,
  titulo: string,
  texto: string,
  link?: string,
): Notificacion {
  return { id: nuevoId('n'), rol, usuarioId, fecha: ahora(), tipo, titulo, texto, link, leida: false }
}
