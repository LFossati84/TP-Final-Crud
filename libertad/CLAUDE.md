# CLAUDE.md — Proyecto Libertad II (demo interactiva)

Prototipo clickeable **sin backend** de una plataforma para el agro argentino: Parte de labor → Cuaderno del establecimiento → Red de contratistas verificados → Cobranza. Se muestra a socios, productores y contratistas piloto del sur de Santa Fe: tiene que parecer producto real.

> Idea fuerza: **un solo dato (el parte conformado)** alimenta el cuaderno del productor, la reputación del contratista y la cobranza. Si una pantalla no respeta esa cadena, está mal.

Todo vive en `/libertad`. Los archivos de la raíz del repo son un TP viejo (Flask/CRUD) que **no se toca**.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint       # ESLint (flat config)
npm run typecheck  # tsc -b
npm run build      # tsc -b && vite build → dist/ (incluye 404.html para SPA)
npm run preview    # sirve dist/
npm run verify     # lint + build + Playwright (F1–F8 y barrido de pantallas 390/768/1440)
npm run build:publicada  # dist-artifact/: versión para el visor (router en memoria, sin window.print)
```

Antes de cada commit: `npm run lint && npm run build` sin errores. Antes de un release: `npm run verify`.

Si agregás un paso a un recorrido o una pantalla nueva, sumala a `e2e/` (los recorridos leen `data-objetivo`/`data-avance` del tooltip, así que cualquier objetivo nuevo necesita su `data-tour`).

## Stack

- Vite 8 + React 19 + TypeScript estricto (`strict`, `noUncheckedIndexedAccess`). Prohibido `any`; si hace falta, `unknown` + narrowing.
- Tailwind CSS 3.4 (`tailwind.config.ts` define los tokens). Sin CSS-in-JS.
- React Router 7 (modo librería, `createBrowserRouter`, `basename = import.meta.env.BASE_URL`). Con `VITE_DESTINO=artifact` usa `createMemoryRouter` (ver `src/app/publicado.ts`): no uses `window.location` ni `window.print()` directo.
- Zustand para el store en memoria. Dependencias de runtime permitidas: `react`, `react-dom`, `react-router`, `zustand`. **No agregar otras** sin justificarlo.
- Gráficos, mapas, íconos, firma y "PDF" son **SVG/HTML propios**.
- Alias `@/` → `src/`.

## Estructura

```
src/
  app/        shells: DemoBar (rol, recorrido, offline, tema, reiniciar), PhoneFrame/BottomNav, DeskLayout/Sidebar
  ui/         design system (Button, Card, StatusChip, VerificationBadge, Timeline, Table, Modal, Toast, Stepper, FormField, EmptyState, Icon…)
  charts/     BarChart, Donut, Sparkline, AgingBars (SVG)
  maps/       MapaLotes, MapaZona (SVG)
  domain/     tipos + reglas puras (verificación, reputación, cobranza, cuaderno, validación agronómica, formato, reloj)
  data/       datos mock tipados (seed del escenario inicial)
  store/      store Zustand por slices + escenarios para los recorridos F1–F8
  features/   pantallas por rol: contratista/ productor/ ingeniero/ admin/ cobranza/ tour/ onboarding/ planes/ inicio/
  print/      vistas imprimibles (cuaderno, liquidación)
```

- Reglas de negocio **solo** en `domain/` (funciones puras). Los slices del store orquestan; los componentes no calculan reglas.
- Componentes genéricos de UI con nombre en inglés (`Button`, `Card`); todo lo del dominio en español (`ParteLabor`, `conformarParte`, `Liquidacion`).
- Un componente por archivo; props tipadas con `type`, sin `React.FC`.
- Cada pantalla contempla estados **vacío / carga / error**.
- Campos numéricos con coma decimal: usar `InputNumero` (ui/), no `Input` con `Number()` en cada tecla.
- Resolver nombres de lotes/productores/insumos con `useCatalogo()`; no filtrar listas completas dentro de cada render.

## Reglas de la demo

1. **Sin backend ni servicios reales.** Mapas, GPS, WhatsApp, pagos, PDF, notificaciones y sincronización son simulaciones.
2. **localStorage solo para preferencias de UI**: rol activo (`libertad:rol`) y tema (`libertad:tema`). Nunca datos de negocio. Refrescar = volver al escenario inicial (también hay botón "Reiniciar demo").
3. **Reloj de demo fijo**: `HOY = 2026-10-15` (en `domain/reloj.ts`). Nunca usar `new Date()` directo para lógica de negocio.
4. **Datos ficticios**: sin nombres reales de empresas, personas, marcas comerciales de fitosanitarios ni CUIT reales. Productos por principio activo genérico. Montos en ARS "ilustrativos".
5. **Sin lorem ipsum.** Todo texto en español rioplatense, con voseo ("Cargá el parte", "Conformás", "Tocá para firmar").
6. **Selector de rol y "Recorrido guiado" siempre visibles.**
7. Elementos que participan de un recorrido llevan `data-tour="<flujo>-<paso>"` (ej. `data-tour="f1-enviar"`).

### Textos legales obligatorios (copiarlos literal)

- Comprobante de liquidación: **"Documento de gestión – no reemplaza la factura electrónica ARCA"**.
- Módulo de cobranza: **"Demo ilustrativa: no procesa pagos ni emite comprobantes fiscales. Los tratamientos impositivos deben validarse con un contador"**.
- Rol ingeniero / sello: **"La validación profesional la ejerce un ingeniero agrónomo matriculado; la plataforma solo la registra"**.
- Tooltip de verificación: **"Los requisitos de habilitación deben validarse con la normativa vigente de cada jurisdicción antes del lanzamiento"**.
- "Cobrar al instante / adelanto de liquidación" siempre marcado **Próximamente**.

## Design tokens (`tailwind.config.ts`)

Los colores son variables CSS en canales RGB, emitidas por un plugin del config.

| Token | Uso |
|---|---|
| `tierra-50…950` | marrones cálidos: texto de marca, bordes cálidos, ilustraciones |
| `verde-50…950` | primario: acciones, estados OK, conformado |
| `trigo-50…950` | acento dorado: alertas suaves, "por vencer", destacados |
| `rojo-50…950` | peligro: vencido, rechazado, disputa |
| `cielo-50…950` | información: enviado, sincronizando |
| `paper`, `paper-2`, `paper-3` | fondos crema (app, secciones, hundidos) |
| `superficie` | tarjetas, modales |
| `borde`, `borde-fuerte` | divisores e inputs |
| `texto`, `texto-suave` | texto principal y secundario (ambos AA sobre `paper` y `superficie`) |
| `accion`, `accion-hover`, `sobre-accion` | relleno sólido del botón primario y su texto |
| `acento`, `acento-hover`, `sobre-acento` | relleno dorado (Recorrido guiado, destacados) |
| `peligro`, `peligro-hover`, `sobre-peligro` | relleno de acciones destructivas (Rechazar) |
| `foco` | anillo de foco |
| `barra`, `barra-2`, `sobre-barra` | barra de demo (oscura en ambos modos) |

- En **modo oscuro** (`.dark` en `<html>`) las escalas se espejan (50↔950…) y los semánticos se redefinen. Por eso:
  - Tintes: `bg-verde-100 text-verde-800` ✔︎ (funciona en ambos modos).
  - Rellenos sólidos con texto: `bg-accion text-sobre-accion`, `bg-acento text-sobre-acento`, `bg-peligro text-sobre-peligro` ✔︎ — **nunca** `bg-verde-700 text-white` ✘.
- Sombras: `shadow-tarjeta`, `shadow-elevada`, `shadow-telefono`.
- Tipografía: `font-serif` (títulos, cálida, sin fuentes externas) y `font-sans` (UI). Importes y hectáreas con `.num` (tabular).
- Animaciones: `animate-entrar-arriba`, `animate-entrar-derecha`, `animate-aparecer`, `animate-pulso` (respetan `prefers-reduced-motion`).

## Accesibilidad (no negociable)

- Contraste AA. Objetivos táctiles ≥ 44px (`min-h-tactil`, `min-w-tactil`).
- Foco visible (anillo `foco`); nunca `outline-none` sin reemplazo.
- Todo input con `<label>` asociado (usar `FormField`). Íconos decorativos con `aria-hidden`; botones solo-ícono con `aria-label`.
- Toasts y cambios de estado con `aria-live`. Modales con foco atrapado y cierre con Esc.

## Layout por rol

- **Contratista**: mobile-first. En desktop se muestra dentro de un marco de celular centrado (~390px). Navegación inferior: Inicio · Nuevo parte · Mis trabajos · Cobros · Perfil.
- **Productor / Ingeniero / Administrador**: desktop con sidebar; en tablet el sidebar colapsa a íconos y en mobile pasa a menú desplegable.

## Vocabulario del dominio

| Término | Significado en la demo |
|---|---|
| Establecimiento | Campo/estancia de un productor; contiene lotes. |
| Lote | Unidad productiva con superficie (has), cultivo y polígono en el mapa. |
| Campaña | Ciclo agrícola, ej. 2026/27 (trigo invierno 2026 + gruesa 2026/27). |
| Labor | Siembra, pulverización, fertilización, cosecha, laboreo. |
| Parte de labor | Registro de una labor hecha por un contratista en un lote. Estados: Borrador, Pendiente de sincronizar, Enviado, Observado, Conformado, Rechazado, En disputa. |
| Conformar | El productor da por buena la labor. Dispara cuaderno + reputación + "listo para cobrar". |
| Observar | Devolver el parte con un motivo para que el contratista corrija y reenvíe. |
| Cuaderno | Libro digital cronológico por establecimiento, lote y campaña. |
| Receta agronómica | Prescripción del ingeniero agrónomo para una aplicación de fitosanitarios. |
| Caldo | Volumen de mezcla aplicado (l/ha). |
| Deriva | Desplazamiento del producto fuera del blanco; ligado a viento, humedad y temperatura. |
| Recorrida | Monitoreo a campo del lote. |
| has | Hectáreas (abreviatura usada en toda la UI). |
| ART | Aseguradora de Riesgos del Trabajo; su vigencia es requisito de verificación. |
| Liquidación | Documento de gestión que agrupa partes conformados con tarifas, IVA y condición de pago. |
| e-cheq / cheque a fecha | Medios de pago habituales; se registran, no se procesan. |
| Niveles de verificación | Básico (identidad + CUIT activo) · Verificado (+ situación impositiva, ART, seguro de maquinaria, habilitación de aplicador) · Destacado (+ antigüedad, trabajos conformados, calificación, sin disputas). |

## Flujos que la demo debe permitir recorrer (F1–F8)

F1 parte offline → sync → conformidad → cuaderno → reputación → liquidación → recordatorio → pago → cobro conciliado ·
F2 búsqueda de pulverizador verificado y presupuesto · F3 exportar cuaderno a PDF con sello ·
F4 admin sube a Verificado (badge en vivo) · F5 parte observado por hectáreas, corrección y reenvío ·
F6 ingeniero observa aplicación, corrección y validación con sello · F7 mora, recordatorios escalonados, disputa e intervención ·
F8 ART por vencer: alerta al contratista y advertencia en búsquedas.

## Commits

Un commit por fase, mensaje en español: `Fase N: <resumen>`. Rama de trabajo: `claude/proyecto-libertad-demo-gc7aif`.
