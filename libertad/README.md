# Proyecto Libertad II — Demo interactiva

Prototipo clickeable (sin backend) de una plataforma para el agro argentino que integra, sobre un mismo dato:

1. **Parte de labor** — el contratista registra cada labor; el productor la conforma.
2. **Cuaderno del establecimiento** — libro cronológico por establecimiento, lote y campaña, exportable a PDF.
3. **Red de contratistas verificados** — verificación documental por niveles y reputación basada en trabajos reales.
4. **Cobranza** — cada parte conformado queda listo para cobrar y alimenta la liquidación y su seguimiento.

Zona piloto: sur de Santa Fe (Venado Tuerto, Rufino, Firmat, Murphy, Hughes, Villa Cañás). Todos los datos son ficticios.

> Demo ilustrativa: no procesa pagos ni emite comprobantes fiscales. No se conecta a ningún servicio real.

**Demo publicada:** https://claude.ai/artifact/Gk1nyQR3GpZhzMQNtGdL29 (privada: se comparte desde el menú Compartir de la página).

## Cómo correrla

Requisitos: Node 20.19+ (probado con Node 22) y npm.

```bash
cd libertad
npm install
npm run dev          # abre http://localhost:5173
```

Otros scripts:

| Script | Qué hace |
|---|---|
| `npm run build` | Chequea tipos y genera el sitio estático en `dist/` |
| `npm run preview` | Sirve `dist/` localmente (http://localhost:4173) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run build:publicada` | Genera `dist-artifact/`: la versión para publicar en un visor sin barra de direcciones (router en memoria, rutas relativas, `index.html` como fragmento) |
| `npm run verify` | Lint + build + Playwright: recorre F1–F8 con clics reales y barre todas las pantallas en 390/768/1440 (claro y oscuro). Falla ante cualquier error de consola o desborde horizontal. Capturas en `capturas/` |

> `npm run verify` usa Chromium de Playwright. Si tu máquina no lo tiene: `npx playwright install chromium` (una sola vez).

## Desplegar como sitio estático

### Versión publicada (link de claude.ai)

`npm run build:publicada` arma `dist-artifact/` y la lista de archivos en `dist-artifact/archivos.json`. Diferencias con el build normal:

- Navega con un router en memoria: la barra de direcciones no cambia. Se puede abrir un escenario con un ancla: `#parte-observado`, `#dosis-fuera-de-receta`, `#mora`, `#cuaderno-pdf`, `#contratista`, `#productor`, `#ingeniero`, `#admin`, `#planes`.
- El visor no deja abrir el diálogo de impresión: el botón "Imprimir / Guardar PDF" muestra un aviso. Para guardar el PDF, usá la demo local.
- Para probarla igual que en el visor: servir `dist-artifact/` y correr `DEMO_URL=http://localhost:<puerto> npx playwright test e2e/recorridos.spec.ts`.

### Hosting propio

`npm run build` genera `dist/` listo para cualquier hosting estático. El build incluye `404.html` (copia de `index.html`) y `_redirects` para que las rutas internas funcionen al recargar.

- **Netlify / Cloudflare Pages / Vercel**: directorio base `libertad`, comando `npm run build`, publicar `dist`.
- **GitHub Pages** (en un subdirectorio): `VITE_BASE=/<nombre-del-repo>/ npm run build` y publicar `dist/`.
- **Cualquier servidor** (nginx, S3, etc.): servir `dist/` con fallback a `index.html`.

## Recorrido rápido de lo que hay

- `/` — Landing de la demo: idea fuerza, elección de rol y flujos F1–F8.
- `/kit` — Sistema de diseño con datos reales del escenario (colores, componentes, mapas, badges calculados en vivo).
- `/contratista` — App del contratista (celular): Inicio con trabajos del día, cobros y alertas; **Nuevo parte** en 5 pasos con GPS simulado, receta, controles de dosis/viento, fotos y firma; **Mis trabajos** con filtros, detalle, corrección y respuesta a pedidos de presupuesto; **Perfil** con verificación, documentación y reseñas.
- **Modo sin señal**: botón "Con señal / Sin señal" en la barra (rol contratista). Los partes quedan en cola y al volver la señal se sincronizan con animación y aviso al productor.
- `/productor` — Panel (KPIs, mapa con estado de lotes, alertas, calendario), **Partes** (conformar con reseña / observar / rechazar, controles automáticos), **Cuaderno** (filtros, completitud, validación) con **Exportar informe PDF** (`/imprimir/cuaderno/...`), **Contratistas** (filtros, lista, mapa, perfil, presupuesto, contratación, mis pedidos), **Establecimientos y lotes**, **Informes** y **Configuración** (validación profesional y consentimiento de reputación de pago).
- **Cobranza** — Contratista (`/contratista/cobros`): listos para cobrar agrupados por productor, armado de liquidación (tarifas, IVA editable, condición y vencimiento), comprobante imprimible (`/imprimir/liquidacion/:id`), seguimiento con antigüedad de deuda, cuenta corriente, recordatorios por WhatsApp (maqueta) y automáticos, registro de cobro total o parcial, disputa. Productor (`/productor/pagos`): aceptar u observar, calendario de vencimientos, marcar como pagado con comprobante, historial. Reputación de pago con consentimiento.
- `/ingeniero` — Mis clientes, **Aplicaciones a validar** (controles automáticos, aplicado vs. receta, validar y firmar u observar con motivos), **Recetas** (emitir y vincular a partes, incluso para regularizar aplicaciones sin receta) y **Cuadernos con validación** con sello.
- `/admin` — **Verificaciones** (aprobar / pedir corrección / rechazar, "si aprobás todo" y badge en vivo; vencimientos próximos con recordatorio), **Contratistas**, **Disputas** (intervenir y registrar resolución), **Cobranza** (gestionado, cobro en término, mora por antigüedad) y **Métricas** de red.
- Barra superior: selector de rol, "Ver como" (otra persona del mismo rol), señal on/off (contratista), recorrido guiado, tema y reinicio de la demo.
- **Recorrido guiado** — botón dorado de la barra. Elegís un flujo (F1–F8) y la demo prepara el escenario, resalta cada paso con un tooltip numerado y avanza cuando hacés el clic real. Cuando el flujo pasa a otro usuario muestra "Ahora sos el productor…" y cambia de rol solo. Podés salir en cualquier paso.

  | Flujo | Qué muestra | Pasos |
  |---|---|---|
  | F1 | Parte sin señal → sincronización → conformidad → cuaderno → reputación → liquidación → recordatorio → pago informado → cobro conciliado | 30 |
  | F2 | Buscar pulverizador verificado y pedir presupuesto; el contratista responde y el productor acepta | 10 |
  | F3 | Exportar el cuaderno a PDF con sello de validación | 4 |
  | F4 | El administrador revisa documentos y el contratista pasa a Verificado (badge en vivo) | 4 |
  | F5 | Parte observado por hectáreas, corrección y reenvío, conformidad | 7 |
  | F6 | El ingeniero observa una dosis fuera de receta, el contratista corrige y el ingeniero valida con sello | 10 |
  | F7 | Liquidación en mora, recordatorios escalonados, disputa e intervención del administrador | 10 |
  | F8 | ART por vencer: alerta al contratista y advertencia en el directorio del productor | 5 |

- `/onboarding` — Alta en 3 pasos (rol, zona, perfil con CUIT enmascarado); al terminar entra a la demo con ese rol. No crea cuentas reales.
- `/planes` — Planes ilustrativos para productor y contratista, con precios "A definir".

## Stack

Vite + React + TypeScript estricto + Tailwind CSS + React Router + Zustand. Sin otras dependencias de runtime: gráficos, mapas, íconos, firma y vista PDF son SVG/HTML propios. Detalle de convenciones, tokens y vocabulario en [`CLAUDE.md`](./CLAUDE.md).

## Estado por fase

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Plan, estructura, CLAUDE.md, README | ✅ |
| 1 | Design system, layout, selector de rol, datos mock | ✅ |
| 2 | Contratista + modo offline | ✅ |
| 3 | Productor (panel, partes, cuaderno + PDF, contratistas, lotes) | ✅ |
| 4 | Cobranza + reputación de pago | ✅ |
| 5 | Ingeniero agrónomo + Administrador | ✅ |
| 6 | Recorridos guiados F1–F8, onboarding, planes, pulido | ✅ |
| 7 | Verificación final | ✅ |

## Checklist final

### Calidad
- [x] `npm run lint` sin errores ni avisos.
- [x] `npm run typecheck` / `npm run build` sin errores; TypeScript estricto, sin `any`.
- [x] Dependencias de runtime: solo `react`, `react-dom`, `react-router`, `zustand`.
- [x] Sin datos de negocio en `localStorage` (solo `libertad:rol` y `libertad:tema`).
- [x] `npm run verify`: F1–F8 completos con clics reales en escritorio (1440) y celular (390), cero errores de consola.
- [x] Todas las pantallas sin errores ni avisos de consola y sin desborde horizontal en 390, 768 y 1440 px, en modo claro y oscuro.
- [x] Landmarks (`main`), enlace "Saltar al contenido", foco visible, objetivos táctiles ≥ 44 px, modales con foco atrapado y Esc, toasts con `aria-live`.

### Pantallas por rol

| Rol | Pantallas |
|---|---|
| Contratista (celular) | Inicio · Nuevo parte (5 pasos, sin señal) · Mis trabajos (filtros, pedidos) · Detalle y corrección de parte · Cobros (listos para cobrar, seguimiento, cuenta corriente) · Armar liquidación · Detalle de liquidación (WhatsApp, cobro, disputa) · Perfil (verificación, documentos, reseñas) |
| Productor | Panel · Partes (conformar / observar / rechazar) · Cuaderno + PDF · Contratistas (directorio, mapa, perfil, presupuestos) · Pagos (aceptar / observar, calendario, marcar pagado) · Establecimientos y lotes · Informes · Configuración |
| Ingeniero agrónomo | Mis clientes · Aplicaciones a validar · Recetas · Cuadernos con validación |
| Administrador | Verificaciones · Contratistas · Disputas · Cobranza · Métricas |
| Comunes | Landing · Onboarding (3 pasos) · Planes · Sistema de diseño (`/kit`) · Comprobante y cuaderno imprimibles · 404 |

### Flujos probados (recorrido guiado y a mano)

- [x] F1 Parte sin señal → sincronización → conformidad → cuaderno → reputación → liquidación → recordatorio → pago → cobro conciliado
- [x] F2 Búsqueda de pulverizador verificado y presupuesto aceptado
- [x] F3 Cuaderno exportado a PDF con sello del ingeniero
- [x] F4 Administrador sube a Verificado (badge en vivo en toda la app)
- [x] F5 Parte observado por hectáreas, corrección y reenvío
- [x] F6 Ingeniero observa dosis, el contratista corrige y se valida con sello
- [x] F7 Mora, recordatorios escalonados, disputa e intervención
- [x] F8 ART por vencer: alerta al contratista y advertencia en búsquedas

### Atajos para mostrar la demo

- **Recorrido guiado** (botón dorado): el camino más corto para mostrar cada flujo; prepara el escenario solo.
- **Reiniciar demo** (ícono ↺) o recargar la página: vuelve al escenario inicial (15/10/2026).
- **Ver como**: cambia de productor, contratista o ingeniero dentro del mismo rol.
- **Señal on/off** (rol contratista): simula trabajar en el lote sin cobertura.
- Escenarios listos para mostrar sin recorrido:
  - `/contratista/trabajos/pt33` — parte observado para corregir.
  - `/productor/partes/pt20` — aplicación con dosis fuera de receta.
  - `/contratista/cobros/lq4` — liquidación en mora (WhatsApp, disputa).
  - `/admin` — Giuliani Servicios Agropecuarios con documentos esperando revisión.
  - `/contratista/perfil` — ART de El Ombú por vencer en 6 días.
  - `/imprimir/cuaderno/e1/2025-26` — cuaderno completo con sello.
- Tema claro/oscuro desde la barra (se recuerda entre visitas).
