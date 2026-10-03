import { useNavigate, useParams, useSearchParams } from 'react-router'
import { completitudCuaderno, describirInsumos } from '@/domain/cuaderno'
import { campaniaDeSlug, etiquetaCultivo, etiquetaLabor, fecha, fechaLarga, num } from '@/domain/format'
import { CAMPANIA_ACTIVA, HOY } from '@/domain/reloj'
import { NOTA_VALIDACION_PROFESIONAL } from '@/domain/validacion'
import { useCatalogo } from '@/store/useCatalogo'
import { useDemo } from '@/store/useDemo'
import { Button } from '@/ui/Button'
import { EmptyState } from '@/ui/EmptyState'

/** Sello circular de validación profesional (SVG). */
function Sello({ nombre, matricula }: { nombre: string; matricula: string }) {
  return (
    <svg viewBox="0 0 160 160" className="h-32 w-32 -rotate-6" role="img" aria-label={`Sello: validado por Ing. Agr. ${nombre}, ${matricula}`}>
      <defs>
        <path id="sello-arco" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0" />
      </defs>
      <circle cx="80" cy="80" r="74" fill="none" stroke="#244720" strokeWidth="3" />
      <circle cx="80" cy="80" r="46" fill="none" stroke="#244720" strokeWidth="1.5" />
      <text fontSize="11" fontWeight="700" fill="#244720" letterSpacing="2" fontFamily="system-ui">
        <textPath href="#sello-arco">VALIDACIÓN PROFESIONAL · LIBERTAD II ·</textPath>
      </text>
      <text x="80" y="70" textAnchor="middle" fontSize="10" fill="#244720" fontFamily="system-ui" fontWeight="700">VALIDADO</text>
      <text x="80" y="84" textAnchor="middle" fontSize="8.5" fill="#244720" fontFamily="system-ui">Ing. Agr.</text>
      <text x="80" y="95" textAnchor="middle" fontSize="8.5" fill="#244720" fontFamily="system-ui" fontWeight="700">{nombre}</text>
      <text x="80" y="106" textAnchor="middle" fontSize="8" fill="#244720" fontFamily="system-ui">{matricula}</text>
    </svg>
  )
}

export function CuadernoImprimible() {
  const { establecimiento: estId, campania: slug } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const cat = useCatalogo()
  const partes = useDemo((s) => s.partes)
  const cuaderno = useDemo((s) => s.cuaderno)
  const ingenieros = useDemo((s) => s.ingenieros)
  const campania = campaniaDeSlug(slug)
  const loteId = params.get('lote')
  const est = cat.establecimiento(estId ?? '')
  const prod = est ? cat.productor(est.productorId) : undefined
  const lotes = cat.lotes.filter((l) => l.establecimientoId === est?.id && (!loteId || l.id === loteId))
  const ing = ingenieros.find((i) => i.id === prod?.ingenieroId)

  const porLote = (
      lotes.map((l) => ({
        lote: l,
        entradas: cuaderno.filter((e) => e.loteId === l.id && e.campania === campania).sort((a, b) => a.fecha.localeCompare(b.fecha)),
        completitud: completitudCuaderno(l, campania, partes, prod, campania !== CAMPANIA_ACTIVA),
      }))
  )

  if (!est || !prod) return <main id="contenido" className="mx-auto max-w-lg px-4 py-16"><EmptyState titulo="No encontramos el establecimiento" /></main>

  const aplicaciones = partes.filter((p) => p.establecimientoId === est.id && p.campania === campania && p.labor === 'pulverizacion' && p.estado === 'conformado' && lotes.some((l) => l.id === p.loteId))
  const validadas = aplicaciones.filter((p) => p.validacion?.estado === 'validada')
  const todoValidado = prod.validacionProfesional && aplicaciones.length > 0 && validadas.length === aplicaciones.length
  const codigo = `LII-${est.id.toUpperCase()}-${campania.replace('/', '')}-${HOY.replace(/-/g, '').slice(2)}`
  const totalHas = lotes.reduce((s, l) => s + l.has, 0)

  return (
    <main id="contenido" className="forzar-claro min-h-screen bg-paper-3 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 print:hidden">
        <Button variante="secundario" icono="flechaIzquierda" onClick={() => navigate(-1)}>Volver</Button>
        <p className="hidden text-sm text-texto-suave lg:block">Vista previa · elegí “Guardar como PDF” al imprimir</p>
        <Button icono="imprimir" onClick={() => window.print()} data-tour="imprimir">Imprimir / Guardar PDF</Button>
      </div>

      <div className="overflow-x-auto px-2 print:overflow-visible print:px-0">
      <article className="hoja mx-auto min-w-[640px] max-w-[210mm] print:min-w-0 bg-white px-[14mm] py-[12mm] text-[11px] leading-snug text-[#1f1510] shadow-elevada print:max-w-none print:p-0 print:shadow-none" data-tour="hoja-pdf">
        {/* Encabezado */}
        <header className="flex items-start justify-between gap-6 border-b-2 border-[#244720] pb-3">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-11 w-11" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4a3224]">Cuaderno del establecimiento</p>
              <h1 className="font-serif text-[22px] leading-tight text-[#1f1510]">{est.nombre} · Campaña {campania}</h1>
              <p className="text-[#4a3224]">{prod.razonSocial} · CUIT {prod.cuit} · {est.localidad}, Santa Fe</p>
            </div>
          </div>
          <dl className="shrink-0 text-right text-[10px] text-[#4a3224]">
            <dt>Emitido</dt>
            <dd className="font-semibold text-[#1f1510]">{fechaLarga(HOY)}</dd>
            <dt className="mt-1">Código de verificación</dt>
            <dd className="font-mono font-semibold text-[#1f1510]">{codigo}</dd>
          </dl>
        </header>

        {/* Resumen */}
        <section className="mt-3 grid grid-cols-4 gap-2">
          {[
            ['Lotes', String(lotes.length)],
            ['Superficie', `${num(totalHas, 1)} has`],
            ['Registros', String(porLote.reduce((s, x) => s + x.entradas.length, 0))],
            ['Aplicaciones validadas', prod.validacionProfesional ? `${validadas.length} de ${aplicaciones.length}` : 'No activa'],
          ].map(([k, v]) => (
            <div key={k} className="rounded border border-[#e2cdb3] px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wide text-[#64432d]">{k}</p>
              <p className="text-[13px] font-semibold">{v}</p>
            </div>
          ))}
        </section>

        {porLote.map(({ lote, entradas, completitud }) => (
          <section key={lote.id} className="mt-5 break-inside-avoid-page">
            <div className="mb-1.5 flex items-baseline justify-between border-b border-[#cdad88] pb-1">
              <h2 className="font-serif text-[15px]">{lote.nombre}</h2>
              <p className="text-[10px] text-[#64432d]">
                {num(lote.has, 1)} has · {lote.cultivos[campania] ? etiquetaCultivo[lote.cultivos[campania] ?? 'soja'] : '—'} · ambiente {lote.ambiente} · completitud {Math.round(completitud.porcentaje * 100)} %
              </p>
            </div>
            {entradas.length === 0 ? (
              <p className="py-2 italic text-[#64432d]">Sin registros en la campaña.</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f1e6d8] text-left text-[9px] uppercase tracking-wide text-[#4a3224]">
                    <th className="px-1.5 py-1 font-semibold">Fecha</th>
                    <th className="px-1.5 py-1 font-semibold">Labor</th>
                    <th className="px-1.5 py-1 font-semibold">Detalle</th>
                    <th className="px-1.5 py-1 font-semibold">Responsable</th>
                    <th className="px-1.5 py-1 font-semibold">Parte / receta</th>
                    <th className="px-1.5 py-1 font-semibold">Validación</th>
                  </tr>
                </thead>
                <tbody>
                  {entradas.map((e) => {
                    const p = e.parteId ? partes.find((x) => x.id === e.parteId) : undefined
                    const receta = cat.receta(p?.recetaId)
                    return (
                      <tr key={e.id} className="border-b border-[#f1e6d8] align-top">
                        <td className="whitespace-nowrap px-1.5 py-1">{fecha(e.fecha)}</td>
                        <td className="px-1.5 py-1 font-semibold">{e.tipo === 'recorrida' ? 'Recorrida' : e.tipo === 'analisis' ? 'Análisis' : etiquetaLabor[e.tipo]}</td>
                        <td className="px-1.5 py-1">{p ? [describirInsumos(p, cat.insumos), p.condiciones ? `caldo ${p.condiciones.caldo} l/ha, viento ${p.condiciones.viento} km/h ${p.condiciones.direccionViento}, ${p.condiciones.temperatura} °C, HR ${p.condiciones.humedad} %` : '', p.notas ?? ''].filter(Boolean).join(' · ') || `${num(p.has, 1)} has` : e.detalle}</td>
                        <td className="px-1.5 py-1">{e.autor}</td>
                        <td className="whitespace-nowrap px-1.5 py-1">{p?.numero ?? '—'}{receta ? <span className="block text-[#64432d]">{receta.numero}</span> : p?.labor === 'pulverizacion' ? <span className="block font-semibold text-[#862f22]">Sin receta</span> : null}</td>
                        <td className="px-1.5 py-1">{p?.labor === 'pulverizacion' ? (p.validacion?.estado === 'validada' ? '✓ Validada' : p.validacion?.estado === 'observada' ? 'Observada' : 'Pendiente') : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>
        ))}

        {/* Firmas */}
        <section className="mt-8 grid grid-cols-2 items-end gap-10 break-inside-avoid-page">
          <div>
            <div className="h-16 border-b border-[#1f1510]" />
            <p className="mt-1 font-semibold">{prod.contacto}</p>
            <p className="text-[#4a3224]">Por {prod.razonSocial} · Productor</p>
          </div>
          <div className="flex items-end gap-3">
            {prod.validacionProfesional && ing ? (
              <>
                {validadas.length > 0 ? <Sello nombre={ing.nombre} matricula={ing.matricula} /> : null}
                <div className="flex-1">
                  <div className="h-16 border-b border-[#1f1510]" />
                  <p className="mt-1 font-semibold">Ing. Agr. {ing.nombre} – {ing.matricula}</p>
                  <p className="text-[#4a3224]">
                    {todoValidado ? 'Validó todas las aplicaciones del período.' : `Validó ${validadas.length} de ${aplicaciones.length} aplicaciones del período.`}
                  </p>
                </div>
              </>
            ) : (
              <p className="italic text-[#64432d]">Sin validación profesional activa.</p>
            )}
          </div>
        </section>

        <footer className="mt-8 border-t border-[#cdad88] pt-2 text-[9px] text-[#64432d]">
          <p>{NOTA_VALIDACION_PROFESIONAL}.</p>
          <p className="mt-0.5">Documento generado a partir de partes de labor conformados por el productor. Demo ilustrativa de Proyecto Libertad II con datos ficticios · Código {codigo}.</p>
        </footer>
      </article>
      </div>
    </main>
  )
}
