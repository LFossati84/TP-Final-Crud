import { createBrowserRouter } from 'react-router'
import { AdminLayout, ContratistaLayout, IngenieroLayout, ProductorLayout } from '@/app/Layouts'
import { EnConstruccion } from '@/app/EnConstruccion'
import { NoEncontrada } from '@/app/NoEncontrada'
import { RootLayout } from '@/app/RootLayout'
import type { HandleRuta } from '@/app/DeskLayout'
import { Landing } from '@/features/inicio/Landing'
import { CobranzaAdmin } from '@/features/admin/CobranzaAdmin'
import { ContratistasAdmin } from '@/features/admin/ContratistasAdmin'
import { DisputasAdmin } from '@/features/admin/Disputas'
import { MetricasAdmin } from '@/features/admin/Metricas'
import { VerificacionesAdmin } from '@/features/admin/Verificaciones'
import { AplicacionesIngeniero } from '@/features/ingeniero/Aplicaciones'
import { ClientesIngeniero } from '@/features/ingeniero/Clientes'
import { CuadernosIngeniero } from '@/features/ingeniero/Cuadernos'
import { RecetasIngeniero } from '@/features/ingeniero/Recetas'
import { ArmarLiquidacion } from '@/features/contratista/cobros/ArmarLiquidacion'
import { CobrosContratista } from '@/features/contratista/cobros/Cobros'
import { DetalleLiquidacion } from '@/features/contratista/cobros/DetalleLiquidacion'
import { DetalleParte } from '@/features/contratista/DetalleParte'
import { InicioContratista } from '@/features/contratista/Inicio'
import { MisTrabajos } from '@/features/contratista/MisTrabajos'
import { NuevoParteRuta } from '@/features/contratista/nuevo-parte/NuevoParte'
import { PerfilContratista } from '@/features/contratista/Perfil'
import { Kit } from '@/features/kit/Kit'
import { ConfiguracionProductor } from '@/features/productor/Configuracion'
import { DirectorioContratistas } from '@/features/productor/contratistas/Directorio'
import { PerfilRed } from '@/features/productor/contratistas/PerfilRed'
import { CuadernoProductor } from '@/features/productor/Cuaderno'
import { InformesProductor } from '@/features/productor/Informes'
import { LotesProductor } from '@/features/productor/Lotes'
import { PanelProductor } from '@/features/productor/Panel'
import { PagosProductor } from '@/features/productor/Pagos'
import { PartesProductor } from '@/features/productor/Partes'
import { CuadernoImprimible } from '@/print/CuadernoImprimible'
import { LiquidacionImprimible } from '@/print/LiquidacionImprimible'

const h = (titulo: string): HandleRuta => ({ titulo })

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <Landing /> },
        { path: 'kit', element: <Kit />, handle: h('Sistema de diseño') },
        {
          path: 'contratista',
          element: <ContratistaLayout />,
          children: [
            { index: true, element: <InicioContratista /> },
            { path: 'nuevo-parte', element: <NuevoParteRuta /> },
            { path: 'trabajos', element: <MisTrabajos /> },
            { path: 'trabajos/:id', element: <DetalleParte /> },
            { path: 'cobros', element: <CobrosContratista /> },
            { path: 'cobros/nueva', element: <ArmarLiquidacion /> },
            { path: 'cobros/:id', element: <DetalleLiquidacion /> },
            { path: 'perfil', element: <PerfilContratista /> },
          ],
        },
        {
          path: 'productor',
          element: <ProductorLayout />,
          children: [
            { index: true, handle: h('Panel'), element: <PanelProductor /> },
            { path: 'partes', handle: h('Partes de labor'), element: <PartesProductor /> },
            { path: 'partes/:id', handle: h('Partes de labor'), element: <PartesProductor /> },
            { path: 'cuaderno', handle: h('Cuaderno'), element: <CuadernoProductor /> },
            { path: 'contratistas', handle: h('Contratistas'), element: <DirectorioContratistas /> },
            { path: 'contratistas/:id', handle: h('Contratistas'), element: <PerfilRed /> },
            { path: 'pagos', handle: h('Pagos'), element: <PagosProductor /> },
            { path: 'pagos/:id', handle: h('Pagos'), element: <PagosProductor /> },
            { path: 'lotes', handle: h('Establecimientos y lotes'), element: <LotesProductor /> },
            { path: 'informes', handle: h('Informes'), element: <InformesProductor /> },
            { path: 'configuracion', handle: h('Configuración'), element: <ConfiguracionProductor /> },
          ],
        },
        {
          path: 'ingeniero',
          element: <IngenieroLayout />,
          children: [
            { index: true, handle: h('Mis clientes'), element: <ClientesIngeniero /> },
            { path: 'aplicaciones', handle: h('Aplicaciones a validar'), element: <AplicacionesIngeniero /> },
            { path: 'aplicaciones/:id', handle: h('Aplicaciones a validar'), element: <AplicacionesIngeniero /> },
            { path: 'recetas', handle: h('Recetas'), element: <RecetasIngeniero /> },
            { path: 'cuadernos', handle: h('Cuadernos con validación'), element: <CuadernosIngeniero /> },
          ],
        },
        {
          path: 'admin',
          element: <AdminLayout />,
          children: [
            { index: true, handle: h('Verificaciones'), element: <VerificacionesAdmin /> },
            { path: 'contratistas', handle: h('Contratistas'), element: <ContratistasAdmin /> },
            { path: 'disputas', handle: h('Disputas'), element: <DisputasAdmin /> },
            { path: 'cobranza', handle: h('Cobranza'), element: <CobranzaAdmin /> },
            { path: 'metricas', handle: h('Métricas'), element: <MetricasAdmin /> },
          ],
        },
        { path: 'imprimir/cuaderno/:establecimiento/:campania', element: <CuadernoImprimible /> },
        { path: 'imprimir/liquidacion/:id', element: <LiquidacionImprimible /> },
        { path: 'planes', element: <main id="contenido" className="mx-auto max-w-4xl px-4 py-10"><EnConstruccion titulo="Planes" fase={6} icono="estrella" descripcion="Planes ilustrativos para productores y contratistas." items={['Productor Gratis y Pro', 'Contratista Básico, Verificado y Destacado', 'Precios a definir']} /></main> },
        { path: '*', element: <NoEncontrada /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)
