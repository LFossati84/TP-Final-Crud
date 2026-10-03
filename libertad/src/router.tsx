import type { ComponentType } from 'react'
import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router'
import { CargaInicial } from '@/app/CargaInicial'
import { ErrorRuta } from '@/app/ErrorRuta'
import { AdminLayout, ContratistaLayout, IngenieroLayout, ProductorLayout } from '@/app/Layouts'
import { NoEncontrada } from '@/app/NoEncontrada'
import { PUBLICADO, rutaInicial } from '@/app/publicado'
import { RootLayout } from '@/app/RootLayout'
import type { HandleRuta } from '@/app/DeskLayout'

const h = (titulo: string): HandleRuta => ({ titulo })

/** Carga diferida por pantalla: cada sección se descarga recién cuando se visita. */
function pagina<M, K extends keyof M>(cargar: () => Promise<M>, nombre: K) {
  return async () => ({ Component: (await cargar())[nombre] as ComponentType })
}

const rutas: RouteObject[] = [
    {
      element: <RootLayout />,
      errorElement: <ErrorRuta />,
      HydrateFallback: CargaInicial,
      children: [
        { index: true, lazy: pagina(() => import('@/features/inicio/Landing'), 'Landing') },
        { path: 'kit', lazy: pagina(() => import('@/features/kit/Kit'), 'Kit'), handle: h('Sistema de diseño') },
        {
          path: 'contratista',
          element: <ContratistaLayout />,
          children: [
            { index: true, lazy: pagina(() => import('@/features/contratista/Inicio'), 'InicioContratista') },
            { path: 'nuevo-parte', lazy: pagina(() => import('@/features/contratista/nuevo-parte/NuevoParte'), 'NuevoParteRuta') },
            { path: 'trabajos', lazy: pagina(() => import('@/features/contratista/MisTrabajos'), 'MisTrabajos') },
            { path: 'trabajos/:id', lazy: pagina(() => import('@/features/contratista/DetalleParte'), 'DetalleParte') },
            { path: 'cobros', lazy: pagina(() => import('@/features/contratista/cobros/Cobros'), 'CobrosContratista') },
            { path: 'cobros/nueva', lazy: pagina(() => import('@/features/contratista/cobros/ArmarLiquidacion'), 'ArmarLiquidacion') },
            { path: 'cobros/:id', lazy: pagina(() => import('@/features/contratista/cobros/DetalleLiquidacion'), 'DetalleLiquidacion') },
            { path: 'perfil', lazy: pagina(() => import('@/features/contratista/Perfil'), 'PerfilContratista') },
          ],
        },
        {
          path: 'productor',
          element: <ProductorLayout />,
          children: [
            { index: true, handle: h('Panel'), lazy: pagina(() => import('@/features/productor/Panel'), 'PanelProductor') },
            { path: 'partes', handle: h('Partes de labor'), lazy: pagina(() => import('@/features/productor/Partes'), 'PartesProductor') },
            { path: 'partes/:id', handle: h('Partes de labor'), lazy: pagina(() => import('@/features/productor/Partes'), 'PartesProductor') },
            { path: 'cuaderno', handle: h('Cuaderno'), lazy: pagina(() => import('@/features/productor/Cuaderno'), 'CuadernoProductor') },
            { path: 'contratistas', handle: h('Contratistas'), lazy: pagina(() => import('@/features/productor/contratistas/Directorio'), 'DirectorioContratistas') },
            { path: 'contratistas/:id', handle: h('Contratistas'), lazy: pagina(() => import('@/features/productor/contratistas/PerfilRed'), 'PerfilRed') },
            { path: 'pagos', handle: h('Pagos'), lazy: pagina(() => import('@/features/productor/Pagos'), 'PagosProductor') },
            { path: 'pagos/:id', handle: h('Pagos'), lazy: pagina(() => import('@/features/productor/Pagos'), 'PagosProductor') },
            { path: 'lotes', handle: h('Establecimientos y lotes'), lazy: pagina(() => import('@/features/productor/Lotes'), 'LotesProductor') },
            { path: 'informes', handle: h('Informes'), lazy: pagina(() => import('@/features/productor/Informes'), 'InformesProductor') },
            { path: 'configuracion', handle: h('Configuración'), lazy: pagina(() => import('@/features/productor/Configuracion'), 'ConfiguracionProductor') },
          ],
        },
        {
          path: 'ingeniero',
          element: <IngenieroLayout />,
          children: [
            { index: true, handle: h('Mis clientes'), lazy: pagina(() => import('@/features/ingeniero/Clientes'), 'ClientesIngeniero') },
            { path: 'aplicaciones', handle: h('Aplicaciones a validar'), lazy: pagina(() => import('@/features/ingeniero/Aplicaciones'), 'AplicacionesIngeniero') },
            { path: 'aplicaciones/:id', handle: h('Aplicaciones a validar'), lazy: pagina(() => import('@/features/ingeniero/Aplicaciones'), 'AplicacionesIngeniero') },
            { path: 'recetas', handle: h('Recetas'), lazy: pagina(() => import('@/features/ingeniero/Recetas'), 'RecetasIngeniero') },
            { path: 'cuadernos', handle: h('Cuadernos con validación'), lazy: pagina(() => import('@/features/ingeniero/Cuadernos'), 'CuadernosIngeniero') },
          ],
        },
        {
          path: 'admin',
          element: <AdminLayout />,
          children: [
            { index: true, handle: h('Verificaciones'), lazy: pagina(() => import('@/features/admin/Verificaciones'), 'VerificacionesAdmin') },
            { path: 'contratistas', handle: h('Contratistas'), lazy: pagina(() => import('@/features/admin/ContratistasAdmin'), 'ContratistasAdmin') },
            { path: 'disputas', handle: h('Disputas'), lazy: pagina(() => import('@/features/admin/Disputas'), 'DisputasAdmin') },
            { path: 'cobranza', handle: h('Cobranza'), lazy: pagina(() => import('@/features/admin/CobranzaAdmin'), 'CobranzaAdmin') },
            { path: 'metricas', handle: h('Métricas'), lazy: pagina(() => import('@/features/admin/Metricas'), 'MetricasAdmin') },
          ],
        },
        { path: 'imprimir/cuaderno/:establecimiento/:campania', lazy: pagina(() => import('@/print/CuadernoImprimible'), 'CuadernoImprimible') },
        { path: 'imprimir/liquidacion/:id', lazy: pagina(() => import('@/print/LiquidacionImprimible'), 'LiquidacionImprimible') },
        { path: 'planes', lazy: pagina(() => import('@/features/planes/Planes'), 'Planes') },
        { path: 'onboarding', lazy: pagina(() => import('@/features/onboarding/Onboarding'), 'Onboarding') },
        { path: '*', element: <NoEncontrada /> },
      ],
    },
]

export const router = PUBLICADO
  ? createMemoryRouter(rutas, { initialEntries: [rutaInicial()] })
  : createBrowserRouter(rutas, { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' })
