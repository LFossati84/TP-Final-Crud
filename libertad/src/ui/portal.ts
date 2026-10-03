import { createContext, useContext } from 'react'

/**
 * Contenedor donde se montan modales. Por defecto es <body>; el marco de
 * celular del contratista provee el suyo para que los diálogos queden adentro.
 */
export const PortalContext = createContext<HTMLElement | null>(null)

export function usePortal(): { destino: HTMLElement; enMarco: boolean } {
  const propio = useContext(PortalContext)
  return { destino: propio ?? document.body, enMarco: propio !== null }
}
