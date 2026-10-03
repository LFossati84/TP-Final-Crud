/**
 * Versión publicada (build con VITE_DESTINO=artifact): la demo corre dentro de
 * un visor sin barra de direcciones ni diálogo de impresión. Navega con un
 * router en memoria y acepta atajos por ancla (#mora) para abrir escenarios.
 */
export const PUBLICADO = import.meta.env.VITE_DESTINO === 'artifact'

export const ATAJOS: Record<string, string> = {
  'parte-observado': '/contratista/trabajos/pt33',
  'dosis-fuera-de-receta': '/productor/partes/pt20',
  mora: '/contratista/cobros/lq4',
  'cuaderno-pdf': '/imprimir/cuaderno/e1/2025-26',
  contratista: '/contratista',
  productor: '/productor',
  ingeniero: '/ingeniero',
  admin: '/admin',
  planes: '/planes',
}

export function rutaInicial(): string {
  const ancla = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '')
  return ATAJOS[ancla] ?? '/'
}

export const AVISO_IMPRESION = {
  titulo: 'La versión publicada no puede abrir el diálogo de impresión',
  detalle: 'Para guardar el PDF, corré la demo en tu compu (npm run dev).',
}
