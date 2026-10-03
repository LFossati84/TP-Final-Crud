import { HOY } from '@/domain/reloj'
import type { DemoState } from '@/store/tipos'
import { t, type DefinicionFlujo } from './tipos'

/** Escenario limpio: reinicia la demo y vuelve a las personas por defecto. */
function escenarioBase(s: DemoState) {
  s.reiniciar()
  s.setContratista('c1')
  s.setProductor('p1')
  s.setIngeniero('i1')
}

const parteF1 = (s: DemoState) => s.partes.find((p) => p.contratistaId === 'c1' && p.cargadoSinConexion && p.fecha === HOY)
const liqF1 = (s: DemoState) => s.liquidaciones.find((l) => l.contratistaId === 'c1' && l.productorId === 'p1' && l.fechaEmision === HOY)

export const FLUJOS_TOUR: DefinicionFlujo[] = [
  {
    id: 'F1',
    preparar: escenarioBase,
    pasos: [
      { rol: 'contratista', ruta: '/contratista', objetivo: t('toggle-senal'), titulo: 'Estás en el lote, sin señal', texto: 'Cortá la señal del teléfono. La app sigue funcionando y guarda todo en el equipo.', avance: 'click' },
      { rol: 'contratista', objetivo: t('cargar-ag1'), titulo: 'Cargá el parte agendado', texto: 'El trabajo de hoy ya trae lote, labor, hectáreas y receta. Tocá “Cargar parte”.', avance: 'click' },
      { rol: 'contratista', objetivo: t('usar-ubicacion'), titulo: 'Ubicación por GPS', texto: 'El GPS no necesita datos: confirma que estás en el Lote 3 · Los Paraísos.', avance: 'click' },
      { rol: 'contratista', objetivo: t('siguiente-paso'), titulo: 'Paso 1 listo', texto: 'Lote confirmado. Seguí.', avance: 'click' },
      { rol: 'contratista', objetivo: t('siguiente-paso'), titulo: 'Labor y máquina', texto: 'Pulverización con la autopropulsada: ya vienen elegidas. Seguí.', avance: 'click' },
      { rol: 'contratista', objetivo: t('siguiente-paso'), titulo: 'Hectáreas y horario', texto: '84 has y el horario se autocompletaron. Seguí.', avance: 'click' },
      { rol: 'contratista', objetivo: t('leer-anemometro'), titulo: 'Condiciones de aplicación', texto: 'Los productos vienen de la receta. Sin señal, leé viento, temperatura y humedad del anemómetro de la máquina.', avance: 'click' },
      { rol: 'contratista', objetivo: t('siguiente-paso'), titulo: 'Controles en verde', texto: 'Dosis, viento y receta dentro de lo indicado. Seguí.', avance: 'aparece', cuando: t('paso-firma') },
      { rol: 'contratista', objetivo: t('firma'), titulo: 'Firma en pantalla', texto: 'Firmá con el dedo o el mouse dentro del recuadro.', avance: 'aparece', cuando: '[data-tour="firma"][data-firmado="true"]' },
      { rol: 'contratista', objetivo: t('enviar-parte'), titulo: 'Guardar sin señal', texto: 'El parte queda en la cola del teléfono. Mirá el contador: menos de un minuto.', avance: 'aparece', cuando: t('parte-enviado') },
      { rol: 'contratista', objetivo: t('toggle-senal'), titulo: 'Volvió la señal', texto: 'Al recuperar señal se sincroniza solo y el productor recibe la notificación.', avance: 'click' },
      {
        rol: 'productor',
        ruta: (s) => `/productor/partes/${parteF1(s)?.id ?? ''}`,
        objetivo: t('conformar-parte'),
        titulo: 'Llegó el parte al productor',
        texto: 'Mariela revisa fotos, firma, ubicación y controles automáticos. Todo en orden: conformalo.',
        avance: 'click',
      },
      { rol: 'productor', objetivo: t('confirmar-conformidad'), titulo: 'Un dato, tres destinos', texto: 'Podés dejar una reseña. Al conformar: entra al cuaderno, suma reputación y queda listo para cobrar.', avance: 'click' },
      { rol: 'productor', ruta: '/productor/cuaderno?lote=l3', objetivo: t('timeline-cuaderno'), titulo: 'Ya está en el cuaderno', texto: 'La pulverización aparece en el cuaderno del Lote 3 con receta, dosis y condiciones, sin tipear nada.', avance: 'siguiente' },
      { rol: 'contratista', ruta: '/contratista/perfil', objetivo: t('perfil-reputacion'), titulo: 'Sumó reputación', texto: 'Otro trabajo conformado sin observaciones: sube la conformidad y la calificación del contratista.', avance: 'siguiente' },
      { rol: 'contratista', ruta: '/contratista/cobros', objetivo: (s) => t(`listo-${parteF1(s)?.numero ?? ''}`), titulo: 'Listo para cobrar', texto: 'El parte conformado ya aparece para liquidar. Seleccionalo.', avance: 'click' },
      { rol: 'contratista', objetivo: t('armar-liquidacion'), titulo: 'Armá la liquidación', texto: 'Con uno o varios partes del mismo productor.', avance: 'click' },
      { rol: 'contratista', objetivo: t('totales-liquidacion'), titulo: 'Tarifa, IVA y condición', texto: 'La tarifa sale del perfil y es editable. El IVA es una línea editable; condición 30 días con vencimiento calculado.', avance: 'siguiente' },
      { rol: 'contratista', objetivo: t('vista-previa-comprobante'), titulo: 'Comprobante', texto: 'Mirá cómo lo recibe el productor.', avance: 'click' },
      { rol: 'contratista', objetivo: t('comprobante'), titulo: 'Documento de gestión', texto: 'Aclara que no reemplaza la factura electrónica ARCA. Seguí para cerrarlo.', avance: 'siguiente', cerrarDialogo: true },
      { rol: 'contratista', objetivo: t('enviar-liquidacion'), titulo: 'Enviala', texto: 'El productor la recibe para aceptarla.', avance: 'click' },
      { rol: 'productor', ruta: (s) => `/productor/pagos/${liqF1(s)?.id ?? ''}`, objetivo: t('aceptar-liquidacion'), titulo: 'El productor la acepta', texto: 'Ve el detalle, los partes vinculados y la conformidad del contratista.', avance: 'click' },
      { rol: 'contratista', ruta: (s) => `/contratista/cobros/${liqF1(s)?.id ?? ''}`, objetivo: t('abrir-whatsapp'), titulo: 'Recordatorio', texto: 'Además de los automáticos, podés mandar uno a mano por WhatsApp.', avance: 'click' },
      { rol: 'contratista', objetivo: t('enviar-recordatorio'), titulo: 'Plantilla editable', texto: 'El mensaje se arma solo con número, monto y vencimiento. Envialo (simulado).', avance: 'click', cerrarDialogo: true },
      { rol: 'productor', ruta: (s) => `/productor/pagos/${liqF1(s)?.id ?? ''}`, objetivo: t('marcar-pagado'), titulo: 'El productor paga', texto: 'Transfiere y lo marca como pagado.', avance: 'click' },
      { rol: 'productor', objetivo: t('usar-comprobante-ejemplo'), titulo: 'Comprobante de pago', texto: 'Adjuntá el comprobante (usamos uno de ejemplo).', avance: 'click' },
      { rol: 'productor', objetivo: t('confirmar-pago'), titulo: 'Informar pago', texto: 'El contratista recibe el aviso para conciliar.', avance: 'click' },
      { rol: 'contratista', ruta: (s) => `/contratista/cobros/${liqF1(s)?.id ?? ''}`, objetivo: `${t('pago-informado')} ${t('registrar-cobro')}`, titulo: 'Conciliar', texto: 'Verificá el ingreso y registrá el cobro.', avance: 'click' },
      { rol: 'contratista', objetivo: t('confirmar-cobro'), titulo: 'Cobro registrado', texto: 'Total o parcial, con medio y comprobante.', avance: 'click' },
      { rol: 'contratista', titulo: '¡Del lote al cobro, conciliado!', texto: 'Un solo parte alimentó el cuaderno del productor, la reputación del contratista y la cobranza, sin volver a tipear ningún dato.', avance: 'siguiente' },
    ],
  },
  {
    id: 'F2',
    preparar: escenarioBase,
    alTerminar: (s) => s.setContratista('c1'),
    pasos: [
      { rol: 'productor', ruta: '/productor/contratistas?servicio=pulverizacion&nivel=verificado&disponible=1', objetivo: t('filtros-red'), titulo: 'Buscá un pulverizador', texto: 'Filtramos por pulverización, Verificado o más y disponible.', avance: 'siguiente' },
      { rol: 'productor', objetivo: t('tarjeta-c1'), titulo: 'Advertencias a la vista', texto: 'Si un contratista tiene la ART por vencer, la búsqueda lo avisa (F8).', avance: 'siguiente' },
      { rol: 'productor', objetivo: `${t('tarjeta-c3')} a`, titulo: 'La Chacra: Destacada', texto: 'Calificación 4,8 con reseñas de trabajos reales. Abrí el perfil.', avance: 'click' },
      { rol: 'productor', objetivo: t('solicitar-presupuesto'), titulo: 'Perfil y reseñas', texto: 'Verificación, flota, tarifas y reseñas. Pedí presupuesto.', avance: 'click' },
      { rol: 'productor', objetivo: t('pedido-lotes'), titulo: 'Elegí los lotes', texto: 'Marcá el Lote 3 · Los Paraísos (o los que quieras).', avance: 'aparece', cuando: `${t('enviar-pedido')}:not([disabled])` },
      { rol: 'productor', objetivo: t('enviar-pedido'), titulo: 'Enviar pedido', texto: 'La Chacra recibe la notificación.', avance: 'click' },
      { rol: 'contratista', antes: (s) => s.setContratista('c3'), ruta: '/contratista/trabajos?vista=pedidos', objetivo: t('responder-pedido'), titulo: 'Ahora sos La Chacra', texto: 'El pedido llegó a “Mis trabajos › Pedidos”. Respondé.', avance: 'click' },
      { rol: 'contratista', objetivo: t('enviar-respuesta'), titulo: 'Precio y fecha', texto: 'La tarifa sale del perfil; el mensaje es editable.', avance: 'click' },
      { rol: 'productor', ruta: '/productor/contratistas?vista=pedidos', objetivo: t('aceptar-presupuesto'), titulo: 'Respuesta recibida', texto: 'El productor ve precio, total estimado y fecha. Aceptalo.', avance: 'click' },
      { rol: 'productor', titulo: 'Contratación cerrada', texto: 'Cuando La Chacra cargue el parte, empieza el circuito de conformidad, cuaderno y cobranza.', avance: 'siguiente' },
    ],
  },
  {
    id: 'F3',
    preparar: escenarioBase,
    pasos: [
      { rol: 'productor', ruta: '/productor/cuaderno?campania=2025%2F26', objetivo: t('timeline-cuaderno'), titulo: 'Cuaderno de la campaña 2025/26', texto: 'Todas las labores de La Esperanza, en orden cronológico, desde los partes conformados.', avance: 'siguiente' },
      { rol: 'productor', objetivo: t('exportar-pdf'), titulo: 'Exportar informe', texto: 'Generá la vista imprimible.', avance: 'click' },
      { rol: 'productor', objetivo: t('hoja-pdf'), titulo: 'Informe listo', texto: 'Encabezado con código de verificación, tabla por lote, firmas y el sello del ingeniero agrónomo.', avance: 'siguiente' },
      { rol: 'productor', objetivo: t('imprimir'), titulo: 'Guardar como PDF', texto: 'Desde el diálogo de impresión del navegador.', avance: 'siguiente' },
    ],
  },
  {
    id: 'F4',
    preparar: escenarioBase,
    alTerminar: (s) => s.setContratista('c1'),
    pasos: [
      { rol: 'admin', ruta: '/admin', objetivo: t('revision-c6'), titulo: 'Contratista nuevo', texto: 'Giuliani cargó situación fiscal, ART, seguro y habilitación de aplicador. Hoy figura como Básico.', avance: 'siguiente' },
      { rol: 'admin', objetivo: t('aprobar-todo'), titulo: 'Aprobar documentación', texto: 'Revisados los documentos, aprobalos.', avance: 'click' },
      { rol: 'contratista', antes: (s) => s.setContratista('c6'), ruta: '/contratista/perfil', objetivo: t('perfil-nivel'), titulo: 'El badge cambió en vivo', texto: 'Giuliani ya figura como Verificado en su perfil…', avance: 'siguiente' },
      { rol: 'productor', ruta: '/productor/contratistas?servicio=pulverizacion&nivel=verificado', objetivo: t('tarjeta-c6'), titulo: '…y en las búsquedas', texto: 'Ahora aparece cuando un productor filtra por Verificado.', avance: 'siguiente' },
    ],
  },
  {
    id: 'F5',
    preparar: escenarioBase,
    pasos: [
      { rol: 'productor', ruta: '/productor/partes/pt27', objetivo: t('observar-parte'), titulo: 'Hectáreas de más', texto: 'El parte declara 150 has y La Tranquera tiene 105. El control automático lo marca. Observalo.', avance: 'click' },
      { rol: 'productor', objetivo: t('enviar-observacion'), titulo: 'Motivo precargado', texto: 'El motivo y el detalle ya vienen armados. Enviá.', avance: 'click', cerrarDialogo: true },
      { rol: 'contratista', ruta: '/contratista/trabajos/pt27', objetivo: t('observacion-productor'), titulo: 'El contratista recibe la observación', texto: 'Con el motivo y el detalle del productor.', avance: 'siguiente' },
      { rol: 'contratista', objetivo: t('corregir-parte'), titulo: 'Corregir', texto: 'Abrí la corrección.', avance: 'click' },
      { rol: 'contratista', objetivo: t('corregir-has'), titulo: 'Hectáreas corregidas', texto: 'Ya propone las 105 has del lote. Revisá y seguí.', avance: 'siguiente' },
      { rol: 'contratista', objetivo: t('reenviar-parte'), titulo: 'Reenviar', texto: 'Vuelve al productor como “Enviado”.', avance: 'click' },
      { rol: 'productor', ruta: '/productor/partes/pt27', objetivo: t('conformar-parte'), titulo: 'Listo para conformar', texto: 'El historial muestra la observación y la corrección. Ya se puede conformar.', avance: 'siguiente' },
    ],
  },
  {
    id: 'F6',
    preparar: escenarioBase,
    pasos: [
      { rol: 'ingeniero', ruta: '/ingeniero/aplicaciones/pt20', objetivo: t('observar-aplicacion'), titulo: 'Dosis fuera de rango', texto: 'El fungicida figura a 0,9 l/ha y la receta indica 0,4. Observá la aplicación.', avance: 'click' },
      { rol: 'ingeniero', objetivo: t('confirmar-observacion-ing'), titulo: 'Motivos tipificados', texto: 'Los motivos salen de los controles; el detalle es editable.', avance: 'click', cerrarDialogo: true },
      { rol: 'contratista', ruta: '/contratista/trabajos/pt20', objetivo: t('observacion-ingeniero'), titulo: 'Alerta al contratista', texto: 'Recibe la observación del ingeniero en el parte.', avance: 'siguiente' },
      { rol: 'contratista', objetivo: t('corregir-parte'), titulo: 'Corregir la dosis', texto: 'Fue un error de tipeo.', avance: 'click' },
      { rol: 'contratista', objetivo: t('corregir-dosis-0'), titulo: 'Dosis de la receta', texto: 'Se propone la dosis indicada en la receta (0,4 l/ha).', avance: 'siguiente' },
      { rol: 'contratista', objetivo: t('reenviar-parte'), titulo: 'Reenviar al ingeniero', texto: 'Vuelve a su bandeja.', avance: 'click' },
      { rol: 'ingeniero', ruta: '/ingeniero/aplicaciones/pt20', objetivo: t('validar-aplicacion'), titulo: 'Validar', texto: 'Controles en verde. Validá y firmá.', avance: 'click' },
      { rol: 'ingeniero', objetivo: t('declaro-validacion'), titulo: 'Firma profesional', texto: 'La validación la ejerce el ingeniero matriculado; la plataforma solo la registra.', avance: 'click' },
      { rol: 'ingeniero', objetivo: t('confirmar-validacion'), titulo: 'Firmar', texto: 'Queda registrada con nombre y matrícula.', avance: 'click', cerrarDialogo: true },
      { rol: 'productor', ruta: '/productor/cuaderno?lote=l4', objetivo: t('timeline-cuaderno'), titulo: 'El cuaderno muestra el sello', texto: 'La aplicación del Lote 4 figura con la dosis corregida y “Validado”.', avance: 'siguiente' },
    ],
  },
  {
    id: 'F7',
    preparar: escenarioBase,
    pasos: [
      { rol: 'contratista', ruta: '/contratista/cobros?vista=seguimiento', objetivo: t('seguimiento-cobros'), titulo: 'Mora por antigüedad', texto: 'Estancia El Mirasol debe una liquidación vencida hace más de 30 días.', avance: 'siguiente' },
      { rol: 'contratista', objetivo: t('liquidacion-LQ-0127'), titulo: 'Abrí la liquidación', texto: 'LQ-0127 · $ 5,8 M.', avance: 'click' },
      { rol: 'contratista', objetivo: t('recordatorios-programados'), titulo: 'Recordatorios escalonados', texto: 'Ya salieron los automáticos: 3 días antes, el día y 7 días después, más uno a mano.', avance: 'siguiente' },
      { rol: 'contratista', objetivo: t('abrir-disputa'), titulo: 'Pedir intervención', texto: 'Sin respuesta, el contratista abre una disputa.', avance: 'click' },
      { rol: 'contratista', objetivo: t('confirmar-disputa'), titulo: 'Motivo', texto: 'El texto se arma con los datos de la mora.', avance: 'click' },
      { rol: 'admin', ruta: '/admin/disputas', objetivo: (s) => `${t(`disputa-${s.disputas[0]?.numero ?? ''}`)} button`, titulo: 'Llega a la mesa de ayuda', texto: 'El administrador ve la disputa nueva. Abrila.', avance: 'click' },
      { rol: 'admin', objetivo: t('intervenir-disputa'), titulo: 'Intervenir', texto: 'Toma la mediación y avisa a ambas partes.', avance: 'click' },
      { rol: 'admin', objetivo: t('confirmar-intervencion'), titulo: 'Mensaje a las partes', texto: 'Editable.', avance: 'click' },
      { rol: 'admin', objetivo: t('resolver-disputa'), titulo: 'Registrar acuerdo', texto: 'Cuando hay acuerdo, se registra.', avance: 'click' },
      { rol: 'admin', objetivo: t('confirmar-resolucion'), titulo: 'Cerrar disputa', texto: 'La liquidación vuelve a seguimiento normal.', avance: 'click' },
    ],
  },
  {
    id: 'F8',
    preparar: escenarioBase,
    pasos: [
      { rol: 'contratista', ruta: '/contratista', objetivo: t('alerta-documentos'), titulo: 'ART por vencer', texto: 'Seis días antes del vencimiento, el contratista recibe la alerta en el inicio y por notificación.', avance: 'siguiente' },
      { rol: 'contratista', ruta: '/contratista/perfil#documentacion', objetivo: t('perfil-documentos'), titulo: 'Semáforo de documentos', texto: 'Desde el perfil sube la versión renovada; la anterior sigue vigente mientras la red la revisa.', avance: 'siguiente' },
      { rol: 'productor', ruta: '/productor/contratistas?servicio=pulverizacion', objetivo: t('tarjeta-c1'), titulo: 'Advertencia en las búsquedas', texto: 'El productor ve “ART vence en 6 días” antes de contratarlo.', avance: 'siguiente' },
      { rol: 'productor', ruta: '/productor', objetivo: t('alertas-panel'), titulo: 'Y en su panel', texto: 'Porque El Ombú trabaja en sus lotes esta campaña.', avance: 'siguiente' },
      { rol: 'admin', ruta: '/admin', objetivo: t('vencimientos-red'), titulo: 'La red lo sigue', texto: 'El administrador ve los vencimientos próximos y puede enviar un recordatorio.', avance: 'siguiente' },
    ],
  },
]
