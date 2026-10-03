import { createBrowserRouter } from 'react-router'
import { AdminLayout, ContratistaLayout, IngenieroLayout, ProductorLayout } from '@/app/Layouts'
import { EnConstruccion } from '@/app/EnConstruccion'
import { NoEncontrada } from '@/app/NoEncontrada'
import { RootLayout } from '@/app/RootLayout'
import type { HandleRuta } from '@/app/DeskLayout'
import { Landing } from '@/features/inicio/Landing'
import { Kit } from '@/features/kit/Kit'

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
            { index: true, element: <EnConstruccion movil titulo="Inicio" fase={2} icono="inicio" descripcion="Tu día de trabajo de un vistazo." items={['Trabajos de hoy y partes pendientes de conformidad', 'Resumen de cobros: a cobrar, vencido y cobrado en el mes', 'Alertas de documentos por vencer (ART en 6 días)']} /> },
            { path: 'nuevo-parte', element: <EnConstruccion movil titulo="Nuevo parte" fase={2} icono="mas" descripcion="Carga en 5 pasos, en menos de un minuto." items={['Lote con mapa y "usar ubicación actual"', 'Labor y maquinaria', 'Hectáreas, horas y fecha autocompletadas', 'Insumos y condiciones (solo aplicaciones)', 'Fotos, firma en pantalla y envío, con o sin señal']} /> },
            { path: 'trabajos/*', element: <EnConstruccion movil titulo="Mis trabajos" fase={2} icono="lista" descripcion="Todos tus partes, filtrables por estado." items={['Borrador, Enviado, Observado, Conformado, En disputa', 'Detalle del parte con historial', 'Corregir y reenviar partes observados']} /> },
            { path: 'cobros/*', element: <EnConstruccion movil titulo="Cobros" fase={4} icono="billetera" descripcion="De parte conformado a cobro conciliado." items={['Partes listos para cobrar', 'Armar liquidación y comprobante', 'Seguimiento, recordatorios por WhatsApp y registro de cobros']} /> },
            { path: 'perfil', element: <EnConstruccion movil titulo="Perfil" fase={2} icono="usuario" descripcion="Tu empresa, flota y verificación." items={['Datos de la empresa, flota y zonas', 'Documentación con semáforo de vencimientos', 'Nivel de verificación, reputación y reseñas']} /> },
          ],
        },
        {
          path: 'productor',
          element: <ProductorLayout />,
          children: [
            { index: true, handle: h('Panel'), element: <EnConstruccion titulo="Panel" fase={3} icono="inicio" descripcion="La campaña activa de un vistazo." items={['Mapa de lotes con estado de labores', 'Partes por conformar y calendario', 'Saldo a pagar, vencimientos y alertas (aplicación sin receta)']} /> },
            { path: 'partes/*', handle: h('Partes de labor'), element: <EnConstruccion titulo="Partes de labor" fase={3} icono="documento" descripcion="Bandeja de conformidad." items={['Conformar, observar o rechazar con motivo', 'Detalle con fotos, firma, ubicación y datos de aplicación']} /> },
            { path: 'cuaderno', handle: h('Cuaderno'), element: <EnConstruccion titulo="Cuaderno" fase={3} icono="libro" descripcion="El libro del establecimiento, alimentado por los partes." items={['Vista por lote y campaña con timeline', 'Filtros, buscador e indicador de completitud', 'Exportar informe PDF con firmas y sello profesional']} /> },
            { path: 'contratistas/*', handle: h('Contratistas'), element: <EnConstruccion titulo="Contratistas" fase={3} icono="usuarios" descripcion="La red de contratistas verificados." items={['Filtros por servicio, zona, verificación, disponibilidad y calificación', 'Vista lista + mapa y perfil con reseñas', 'Solicitar presupuesto y contratar para una labor']} /> },
            { path: 'pagos/*', handle: h('Pagos'), element: <EnConstruccion titulo="Pagos" fase={4} icono="billetera" descripcion="Liquidaciones recibidas y vencimientos." items={['Aceptar u observar liquidaciones', 'Calendario de vencimientos', 'Marcar como pagado con comprobante e historial']} /> },
            { path: 'lotes', handle: h('Establecimientos y lotes'), element: <EnConstruccion titulo="Establecimientos y lotes" fase={3} icono="mapa" descripcion="Tus campos y lotes." items={['Alta y edición de establecimientos', 'Lotes con superficie, cultivo y mapa']} /> },
            { path: 'informes', handle: h('Informes'), element: <EnConstruccion titulo="Informes" fase={3} icono="grafico" descripcion="Números de la campaña." items={['Hectáreas por contratista', 'Costos por labor y por lote']} /> },
            { path: 'configuracion', handle: h('Configuración'), element: <EnConstruccion titulo="Configuración" fase={3} icono="engranaje" descripcion="Preferencias de la cuenta." items={['Activar validación profesional (ingeniero agrónomo)', 'Consentimiento para compartir la reputación de pago']} /> },
          ],
        },
        {
          path: 'ingeniero',
          element: <IngenieroLayout />,
          children: [
            { index: true, handle: h('Mis clientes'), element: <EnConstruccion titulo="Mis clientes" fase={5} icono="usuarios" descripcion="Productores que te habilitaron." items={['Estado de cuadernos y aplicaciones por cliente']} /> },
            { path: 'aplicaciones', handle: h('Aplicaciones a validar'), element: <EnConstruccion titulo="Aplicaciones a validar" fase={5} icono="sello" descripcion="Revisá y firmá las aplicaciones de fitosanitarios." items={['Controles automáticos de dosis, viento y receta', 'Validar y firmar u observar con motivo']} /> },
            { path: 'recetas', handle: h('Recetas'), element: <EnConstruccion titulo="Recetas" fase={5} icono="receta" descripcion="Recetas agronómicas digitales." items={['Emitir recetas vinculadas a lotes y partes']} /> },
            { path: 'cuadernos', handle: h('Cuadernos con validación'), element: <EnConstruccion titulo="Cuadernos con validación" fase={5} icono="libro" descripcion="Cuadernos de tus clientes con tu sello." items={['Sello "Validado por Ing. Agr." en cada aplicación']} /> },
          ],
        },
        {
          path: 'admin',
          element: <AdminLayout />,
          children: [
            { index: true, handle: h('Verificaciones'), element: <EnConstruccion titulo="Verificaciones" fase={5} icono="escudoCheck" descripcion="Cola de verificación documental." items={['Aprobar, pedir corrección o rechazar', 'El badge cambia en vivo en toda la app']} /> },
            { path: 'contratistas', handle: h('Contratistas'), element: <EnConstruccion titulo="Contratistas" fase={5} icono="usuarios" descripcion="La red completa." items={['Niveles, vencimientos y actividad']} /> },
            { path: 'disputas', handle: h('Disputas'), element: <EnConstruccion titulo="Disputas" fase={5} icono="balanza" descripcion="Mediación entre productores y contratistas." items={['Intervenir, mensajes y resolución']} /> },
            { path: 'cobranza', handle: h('Cobranza'), element: <EnConstruccion titulo="Cobranza" fase={5} icono="moneda" descripcion="Indicadores de cobranza gestionada." items={['Monto gestionado, mora por antigüedad y cobro en término']} /> },
            { path: 'metricas', handle: h('Métricas'), element: <EnConstruccion titulo="Métricas" fase={5} icono="tendencia" descripcion="Salud de la red." items={['Contratistas activos, partes por mes, tasa y tiempo de conformidad']} /> },
          ],
        },
        { path: '*', element: <NoEncontrada /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)
