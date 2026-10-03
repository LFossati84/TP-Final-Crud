import { useEffect } from 'react'
import type { Rol } from '@/domain/types'
import { useDemo } from '@/store/useDemo'

/** La URL manda: si entrás a /productor/... el rol activo pasa a Productor. */
export function useSincronizarRol(rol: Rol) {
  const actual = useDemo((s) => s.rol)
  const setRol = useDemo((s) => s.setRol)
  useEffect(() => {
    if (actual !== rol) setRol(rol)
  }, [actual, rol, setRol])
}
