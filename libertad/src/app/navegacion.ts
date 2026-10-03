import type { Rol } from '@/domain/types'
import type { NombreIcono } from '@/ui/Icon'

export interface ItemNav {
  ruta: string
  texto: string
  icono: NombreIcono
  /** Coincidencia exacta (para la ruta índice del rol). */
  fin?: boolean
  clave: string
}

export const RUTA_INICIO: Record<Rol, string> = {
  contratista: '/contratista',
  productor: '/productor',
  ingeniero: '/ingeniero',
  admin: '/admin',
}

export const NAV: Record<Rol, ItemNav[]> = {
  contratista: [
    { clave: 'inicio', ruta: '/contratista', texto: 'Inicio', icono: 'inicio', fin: true },
    { clave: 'nuevo', ruta: '/contratista/nuevo-parte', texto: 'Nuevo parte', icono: 'mas' },
    { clave: 'trabajos', ruta: '/contratista/trabajos', texto: 'Mis trabajos', icono: 'lista' },
    { clave: 'cobros', ruta: '/contratista/cobros', texto: 'Cobros', icono: 'billetera' },
    { clave: 'perfil', ruta: '/contratista/perfil', texto: 'Perfil', icono: 'usuario' },
  ],
  productor: [
    { clave: 'panel', ruta: '/productor', texto: 'Panel', icono: 'inicio', fin: true },
    { clave: 'partes', ruta: '/productor/partes', texto: 'Partes de labor', icono: 'documento' },
    { clave: 'cuaderno', ruta: '/productor/cuaderno', texto: 'Cuaderno', icono: 'libro' },
    { clave: 'contratistas', ruta: '/productor/contratistas', texto: 'Contratistas', icono: 'usuarios' },
    { clave: 'pagos', ruta: '/productor/pagos', texto: 'Pagos', icono: 'billetera' },
    { clave: 'lotes', ruta: '/productor/lotes', texto: 'Establecimientos y lotes', icono: 'mapa' },
    { clave: 'informes', ruta: '/productor/informes', texto: 'Informes', icono: 'grafico' },
    { clave: 'configuracion', ruta: '/productor/configuracion', texto: 'Configuración', icono: 'engranaje' },
  ],
  ingeniero: [
    { clave: 'clientes', ruta: '/ingeniero', texto: 'Mis clientes', icono: 'usuarios', fin: true },
    { clave: 'aplicaciones', ruta: '/ingeniero/aplicaciones', texto: 'Aplicaciones a validar', icono: 'sello' },
    { clave: 'recetas', ruta: '/ingeniero/recetas', texto: 'Recetas', icono: 'receta' },
    { clave: 'cuadernos', ruta: '/ingeniero/cuadernos', texto: 'Cuadernos con validación', icono: 'libro' },
  ],
  admin: [
    { clave: 'verificaciones', ruta: '/admin', texto: 'Verificaciones', icono: 'escudoCheck', fin: true },
    { clave: 'contratistas', ruta: '/admin/contratistas', texto: 'Contratistas', icono: 'usuarios' },
    { clave: 'disputas', ruta: '/admin/disputas', texto: 'Disputas', icono: 'balanza' },
    { clave: 'cobranza', ruta: '/admin/cobranza', texto: 'Cobranza', icono: 'moneda' },
    { clave: 'metricas', ruta: '/admin/metricas', texto: 'Métricas', icono: 'tendencia' },
  ],
}

export const ICONO_ROL: Record<Rol, NombreIcono> = {
  contratista: 'tractor',
  productor: 'brote',
  ingeniero: 'receta',
  admin: 'escudoCheck',
}

export const DESCRIPCION_ROL: Record<Rol, string> = {
  contratista: 'Carga partes desde el lote, sigue sus trabajos y cobra.',
  productor: 'Conforma labores, lleva el cuaderno y paga a sus contratistas.',
  ingeniero: 'Valida aplicaciones y emite recetas para sus clientes.',
  admin: 'Verifica contratistas, media disputas y sigue la red.',
}
