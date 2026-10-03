# Plan — Demo interactiva "Proyecto Libertad II"

## Contexto
El repo `TP-Final-Crud` hoy tiene un TP viejo (Flask + HTML/JS de vehículos) en la raíz. Hay que construir, **en la subcarpeta `/libertad`** (decisión confirmada; el TP viejo queda intacto), un prototipo clickeable sin backend de una plataforma AgTech para el sur de Santa Fe: Parte de labor → Cuaderno → Red de contratistas → Cobranza, con 4 roles, 8 flujos guiados (F1–F8), modo offline simulado, mapas SVG, PDF imprimible y maquetas de WhatsApp/pagos. Se muestra a socios y pilotos: tiene que parecer producto real y ser realista de construir con un equipo chico.

Rama: `claude/proyecto-libertad-demo-gc7aif`. Un commit + push por fase; me detengo al final de cada fase para tu revisión.

---

## 1. Decisiones técnicas

| Tema | Decisión | Por qué |
|---|---|---|
| Base | Vite 8 + React 19 + TypeScript `strict` (+ `noUncheckedIndexedAccess`) | Pedido; build estático liviano. |
| Estilos | **Tailwind 3.4** con `tailwind.config.ts`, `darkMode: 'class'` | Pediste tokens en `tailwind.config`; v4 los mueve a CSS. Los colores se definen como variables CSS (canales RGB) en `index.css` y el config las referencia → un solo set de clases (`bg-paper`, `text-tierra-900`) que cambia en modo oscuro sin duplicar `dark:` en todos lados. |
| Ruteo | React Router 7 (modo librería, `createBrowserRouter`, `basename = import.meta.env.BASE_URL`) | URLs “de producto real”. Para hosting estático: `base` configurable por env y copia `index.html → 404.html` en el build (GitHub Pages) + `_redirects` (Netlify). |
| Estado | **Zustand** (~1 KB), un store con *slices* por dominio | Menos boilerplate que Context para un modelo con muchas acciones cruzadas; selectores evitan rerenders. Sin `persist` para datos de negocio: un refresh vuelve al escenario inicial (es una feature para demos). `localStorage` solo para **rol activo** y **tema claro/oscuro** (preferencia de UI, no dato de negocio). |
| Gráficos | **SVG propio** (Barras, Donut, Sparkline, Barras de antigüedad de deuda) | Son 4 tipos simples; una lib (Recharts ~100 KB) no se justifica. |
| Íconos | Componente `<Icon name>` con ~50 paths SVG inline dibujados para el proyecto (trazo 1.75, estilo lineal) | Sin dependencias ni imágenes remotas. |
| Mapas | `MapaLotes` SVG: polígonos en coordenadas locales por establecimiento, coloreados por cultivo/estado de labor; `MapaZona` con localidades del sur santafesino como puntos | Sin Leaflet/tiles. "Usar ubicación actual" simula GPS y preselecciona el lote más cercano. |
| PDF | Rutas `/imprimir/...` con layout A4 + `@media print` + `window.print()` | Vista previa HTML imprimible ("Guardar como PDF"), cero libs. |
| Firma | `<canvas>` propio con pointer events | 60 líneas, sin lib. |
| Fotos | Input file → `URL.createObjectURL` + fotos de ejemplo como ilustraciones SVG generadas (lote, máquina, caldo) | Sin imágenes remotas. |
| Fechas/moneda | `Intl` nativo (`es-AR`, ARS); **reloj de demo fijo** (`HOY = 2026-10-15`) | Los datos no “se pudren”: vencimientos, mora y semáforos siempre coherentes. |
| Recorrido guiado | Motor propio: pasos `{rol, ruta, target: data-tour, título, texto, avance: 'click'|'siguiente'}` con overlay + spotlight + tooltip numerado. Cambia de rol automáticamente con pantalla de transición (“Ahora sos el productor”). Cada flujo arranca con `prepararEscenario(Fx)` | Las librerías de tours no manejan bien cambios de ruta/rol; propio es ~250 líneas. |
| Lint | ESLint flat config (typescript-eslint + react-hooks + react-refresh) | Viene con la plantilla. |
| Verificación | `@playwright/test` como **devDependency** + `scripts/verify` (usa el Chromium ya instalado) | Única dep extra; sirve para smoke de F1–F8 sin errores de consola y capturas 390/768/1440. No se incluye en el bundle. |

Dependencias de runtime finales: `react`, `react-dom`, `react-router`, `zustand`. Nada más.

---

## 2. Estructura de carpetas

```
libertad/
├─ CLAUDE.md                 # convenciones: stack, tokens, vocabulario, reglas de la demo
├─ README.md                 # correr, desplegar, checklist final, atajos de demo
├─ index.html  package.json  vite.config.ts  tailwind.config.ts  postcss.config.js
├─ tsconfig*.json  eslint.config.js
├─ public/                   # favicon.svg, _redirects
├─ scripts/verify.ts         # Playwright: flujos + capturas
└─ src/
   ├─ main.tsx  router.tsx  index.css (tokens CSS, print, fuentes de sistema)
   ├─ app/                   # shells y chrome de la demo
   │  ├─ DemoBar.tsx         # selector de rol, Recorrido guiado, offline, tema, reiniciar
   │  ├─ PhoneFrame.tsx  BottomNav.tsx          # Contratista (mobile-first, marco 390px en desktop)
   │  ├─ DeskLayout.tsx  Sidebar.tsx  Topbar.tsx # Productor/Ingeniero/Admin (sidebar colapsable)
   │  └─ NotificationsPanel.tsx
   ├─ ui/                    # design system
   │  Button Card StatusChip VerificationBadge Timeline Table Modal Drawer Toast Stepper
   │  FormField (Input/Select/Textarea/Checkbox/Toggle) EmptyState Skeleton ErrorState Tabs
   │  Tooltip Avatar Stat ProgressBar Semaforo Icon
   ├─ charts/                # BarChart Donut Sparkline AgingBars (SVG)
   ├─ maps/                  # MapaLotes MapaZona
   ├─ domain/                # tipos + reglas puras (testeables)
   │  types.ts  verificacion.ts  reputacion.ts  cobranza.ts  cuaderno.ts  validacion.ts  format.ts  reloj.ts
   ├─ data/                  # mock tipado (ver §5)
   ├─ store/                 # useDemo.ts + slices/ (sesion, partes, cuaderno, red, cobranza, agronomia, admin, notificaciones, offline) + escenarios.ts
   ├─ features/
   │  ├─ contratista/        # Inicio, NuevoParte/(5 pasos), MisTrabajos, DetalleParte, Cobros/, Perfil
   │  ├─ productor/          # Panel, Partes, Cuaderno, Contratistas, PerfilContratista, Pagos, Lotes, Informes, Configuracion
   │  ├─ ingeniero/          # Clientes, Aplicaciones, Recetas, Cuadernos
   │  ├─ admin/              # Verificaciones, Contratistas, Disputas, Cobranza, Metricas
   │  ├─ cobranza/           # compartido: ArmarLiquidacion, ComprobantePreview, ChatWhatsApp, RegistrarCobro, CuentaCorriente
   │  ├─ tour/               # TourProvider, Spotlight, flujos.ts (F1–F8)
   │  ├─ onboarding/  planes/  inicio/ (landing con selección de rol)
   └─ print/                 # PrintLayout, CuadernoImprimible, LiquidacionImprimible
```

Rutas: `/` (landing + elegir rol) · `/contratista/*` · `/productor/*` · `/ingeniero/*` · `/admin/*` · `/onboarding/:rol` · `/planes` · `/imprimir/cuaderno/:establecimiento/:campania` · `/imprimir/liquidacion/:id`.

---

## 3. Modelo de dominio y regla central

Entidades: `Contratista`, `Productor`, `IngenieroAgronomo`, `Establecimiento`, `Lote` (polígono, cultivo, campaña), `ParteLabor` (tipo, maquinaria, has, horas, insumos[], condiciones {viento, temp, humedad}, fotos, firma, ubicación, estado, historial[]), `EntradaCuaderno`, `RecetaAgronomica`, `ValidacionProfesional`, `Liquidacion` (partes, tarifas, IVA editable, condición, vencimiento, cobros[], recordatorios[]), `Cobro`, `Disputa`, `DocumentoVerificacion` (tipo, vence, estado), `Resena`, `Presupuesto`, `Notificacion`, `MensajeWhatsApp`.

Estados del parte: `borrador → (pendiente_sync) → enviado → observado ↔ enviado → conformado | rechazado | en_disputa`.
Estados de liquidación: `emitida → aceptada | observada → a_vencer → vencida → cobrada_parcial → cobrada | en_disputa`.

**La acción `conformarParte(id)`** es la idea fuerza hecha código: en una sola transición (1) crea la entrada del Cuaderno, (2) recalcula reputación/% de conformidad del contratista, (3) lo marca “listo para cobrar”, (4) notifica al contratista y, si es aplicación sin validar y el productor tiene ingeniero activo, (5) lo encola en “Aplicaciones a validar”. Las reglas viven en `domain/` como funciones puras; los slices solo las orquestan.

Validación agronómica (`domain/validacion.ts`): rangos de dosis por principio activo (catálogo genérico: glifosato, 2,4-D, atrazina, etc., sin marcas), viento > 15 km/h, delta T / humedad baja, aplicación sin receta → genera alertas en Panel del productor y bandeja del ingeniero.

Verificación: Básico / Verificado / Destacado calculado desde documentos + métricas; semáforo de vencimiento (verde > 30 días, trigo ≤ 30, rojo vencido). Tooltip normativo según pediste.

---

## 4. Sistema de diseño

- Tokens (CSS vars → `tailwind.config.ts`): `tierra` 50–950 (marrones cálidos), `verde` 50–950 (primario/acción), `trigo` 50–950 (acento/alertas suaves), `paper` (fondos crema: `paper`, `paper-2`, `paper-3`), semánticos `ok / alerta / peligro / info`, `superficie`, `borde`, `texto`, `texto-suave`. Modo oscuro: tierra muy oscura de fondo, paper invertido, verdes más luminosos; contraste AA verificado para cada par texto/fondo usado.
- Tipografía sin fuentes externas: títulos `ui-serif, Georgia, "Iowan Old Style", "Palatino Linotype", serif`; UI `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`; números tabulares para importes y has.
- Reglas: objetivos táctiles ≥ 44px, `focus-visible` con anillo verde de 2px + offset, labels siempre asociados, `prefers-reduced-motion` respetado, transiciones 150–200 ms, toasts con `aria-live`.

---

## 5. Datos mock (ficticios y coherentes, `src/data`)

- **Reloj**: hoy = 15/10/2026. Campaña activa **2026/27** (trigo implantado en junio con fertilización y aplicaciones; maíz temprano sembrándose; barbechos para soja). Campaña **2025/26** completa (siembra → cosecha) para que el PDF de F3 tenga un cuaderno lleno y validado.
- **7 contratistas** con empresas inventadas, flotas variadas (pulverizadora autopropulsada, sembradora neumática, cosechadora, fertilizadora, tolva, rastra), bases en Venado Tuerto, Rufino, Firmat, Murphy, Hughes, Villa Cañás. Preparados: uno **Destacado**, varios **Verificado**, uno **nuevo en Básico con documentos cargados** (F4), uno con **ART por vencer en 6 días** (F8), uno con **disputa abierta** (F7).
- **5 productores**: el productor principal de la demo con 2 establecimientos; otro con el tercero; los otros 3 aparecen como clientes de contratistas (cuenta corriente, mora) con datos resumidos.
- **3 establecimientos, 11 lotes** (soja, maíz, trigo) con polígonos y has que cierran.
- **28 partes** en todos los estados; **9 liquidaciones** en todos los estados de cobro (incluye la de **mora > 30 días** para F7 y la **en disputa**).
- **2 ingenieros agrónomos** ficticios con matrícula ficticia; recetas emitidas y una aplicación con dosis/viento fuera de rango (F6).
- Reseñas, presupuestos, notificaciones y plantillas de WhatsApp coherentes con lo anterior. Montos en ARS marcados como “valores ilustrativos”.

---

## 6. Fases (commit + push al final de cada una, y me detengo)

**Fase 0 — Plan y cimientos** · scaffold Vite en `/libertad`, Tailwind, ESLint, TS estricto; `CLAUDE.md` (stack, tokens, vocabulario de campo, reglas de la demo: sin backend, sin localStorage de negocio, voseo, sin nombres reales, notas legales obligatorias); `README.md` (correr, build, deploy estático). Build y lint verdes con una página placeholder.

**Fase 1 — Design system + shell + datos** · tokens claro/oscuro, componentes base (Button, Card, StatusChip, VerificationBadge, Timeline, Table, Modal, Toast, Stepper, FormField, EmptyState, MapaLotes + resto de `ui/`), `DemoBar` con selector de rol siempre visible, `PhoneFrame`+`BottomNav`, `DeskLayout`+`Sidebar` colapsable, rutas con pantallas esqueleto, **todos los datos mock tipados** y el store con acciones de dominio. Página interna `/kit` con el catálogo de componentes para revisar.

**Fase 2 — Contratista** · Inicio, Nuevo parte en 5 pasos (< 60 s: autocompletado de fecha/hora, máquina y tarifa por defecto, paso 4 solo si es aplicación), firma y fotos, Mis trabajos con filtros por estado + detalle + corrección de observados (F5 lado contratista), Perfil (empresa, flota, zonas, documentación con semáforo, nivel, reputación, reseñas). **Modo offline**: toggle, banner, cola local visible, sincronización animada al reconectar.

**Fase 3 — Productor** · Panel (campaña, mapa con estado de labores, por conformar, calendario, saldo, alertas), Partes (bandeja + Conformar/Observar/Rechazar con motivo + detalle con fotos/firma/ubicación/aplicación), Cuaderno (por lote y campaña, timeline, filtros, buscador, completitud, export PDF con firmas y sello), Contratistas (filtros, lista + mapa, perfil, Solicitar presupuesto, Contratar para una labor, advertencia de ART por vencer), Establecimientos y lotes (alta/edición simulada), Informes (gráficos SVG), Configuración (activar ingeniero, consentimiento de reputación de pago).

**Fase 4 — Cobranza** · Contratista: listos para cobrar agrupables, Armar liquidación (tarifas por ha/hora, IVA editable, condiciones de pago, vencimiento), comprobante imprimible con la leyenda ARCA, seguimiento A vencer/Vencido/Cobrado/En disputa con antigüedad y cuenta corriente, recordatorio WhatsApp con plantilla editable + programación escalonada, Registrar cobro total/parcial, “Cobrar al instante — Próximamente”. Productor: liquidaciones recibidas, aceptar/observar, calendario de vencimientos, Marcar como pagado, historial. Reputación de pago con consentimiento. Notas legales visibles.

**Fase 5 — Ingeniero + Administrador** · Ingeniero: clientes, aplicaciones a validar (validar/firmar u observar con motivos tipificados), recetas digitales vinculadas a lote/parte, cuadernos con sello; nota “la validación la ejerce un ingeniero agrónomo matriculado…”. Admin: cola de verificación (aprobar / pedir corrección / rechazar, badge cambia en vivo en toda la app), contratistas, disputas (intervenir, resolver), cobranza (monto gestionado, mora por antigüedad, cobro en término), métricas de red.

**Fase 6 — Recorridos, onboarding, planes, pulido** · Motor de recorrido + F1–F8 con tooltips numerados y cambios de rol; onboarding 3 pasos por rol; pantalla Planes (“A definir”); estados vacíos/carga/error en todas las vistas; modo oscuro revisado; microinteracciones.

**Fase 7 — Verificación final** · `npm run build`, `npm run lint`, `tsc` sin errores ni `any`; script Playwright que recorre F1–F8 con clics reales y falla ante errores de consola; capturas en 390/768/1440 y corrección de desbordes; checklist final en README. Entrega de los puntos (a)–(e) que pediste (correr/desplegar, supuestos, costos de MVP, recortes para piloto, 5 riesgos).

---

## 7. Verificación (por fase y al final)
- Cada fase: `npm run lint && npm run build` en `/libertad` antes del commit.
- Desde Fase 2: levantar `npm run preview` y revisar con Playwright (Chromium de `/opt/pw-browsers`) las pantallas nuevas en 390/768/1440; capturas en el scratchpad y las más representativas te las paso.
- Fase 7: `npm run verify` ejecuta F1–F8 de punta a punta y verifica cero errores de consola.

## 8. Supuestos que tomo salvo que me digas otra cosa
- Demo en `/libertad`, sin tocar el TP viejo.
- Reloj de demo fijo (15/10/2026) y refresh = escenario inicial (más un botón “Reiniciar demo”).
- Productos fitosanitarios por principio activo genérico, sin marcas comerciales.
- Precios en ARS ilustrativos; planes con precio “A definir”.
