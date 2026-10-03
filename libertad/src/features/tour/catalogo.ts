import type { Rol } from '@/domain/types'

export interface FlujoDemo {
  id: 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8'
  titulo: string
  resumen: string
  roles: Rol[]
  principal?: boolean
}

export const FLUJOS: FlujoDemo[] = [
  { id: 'F1', principal: true, titulo: 'Del lote al cobro', roles: ['contratista', 'productor'],
    resumen: 'El contratista carga un parte sin señal, sincroniza, el productor lo conforma, aparece en el cuaderno, suma reputación y termina cobrado y conciliado.' },
  { id: 'F2', titulo: 'Buscar un pulverizador verificado', roles: ['productor', 'contratista'],
    resumen: 'El productor filtra por Verificado y disponible, revisa perfil y reseñas, pide presupuesto y el contratista responde.' },
  { id: 'F3', titulo: 'Exportar el cuaderno a PDF', roles: ['productor'],
    resumen: 'Vista previa imprimible de la campaña con tabla de labores, firmas y sello de validación profesional.' },
  { id: 'F4', titulo: 'Verificar a un contratista nuevo', roles: ['admin', 'contratista'],
    resumen: 'El administrador revisa documentos y lo sube a Verificado: el badge cambia en vivo en toda la app.' },
  { id: 'F5', titulo: 'Parte observado por hectáreas', roles: ['productor', 'contratista'],
    resumen: 'El productor observa un parte con hectáreas de más; el contratista lo corrige y lo reenvía.' },
  { id: 'F6', titulo: 'Validación del ingeniero agrónomo', roles: ['ingeniero', 'contratista', 'productor'],
    resumen: 'El ingeniero observa una dosis fuera de rango, el contratista corrige y el cuaderno muestra el sello.' },
  { id: 'F7', titulo: 'Mora, recordatorios y disputa', roles: ['contratista', 'productor', 'admin'],
    resumen: 'Una liquidación vencida recibe recordatorios escalonados, se abre una disputa y el administrador interviene.' },
  { id: 'F8', titulo: 'ART por vencer', roles: ['contratista', 'productor'],
    resumen: 'El contratista recibe la alerta y el productor ve la advertencia en las búsquedas.' },
]
