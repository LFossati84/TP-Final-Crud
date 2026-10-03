# Proyecto Libertad II — Demo interactiva

Prototipo clickeable (sin backend) de una plataforma para el agro argentino que integra, sobre un mismo dato:

1. **Parte de labor** — el contratista registra cada labor; el productor la conforma.
2. **Cuaderno del establecimiento** — libro cronológico por establecimiento, lote y campaña, exportable a PDF.
3. **Red de contratistas verificados** — verificación documental por niveles y reputación basada en trabajos reales.
4. **Cobranza** — cada parte conformado queda listo para cobrar y alimenta la liquidación y su seguimiento.

Zona piloto: sur de Santa Fe (Venado Tuerto, Rufino, Firmat, Murphy, Hughes, Villa Cañás). Todos los datos son ficticios.

> Demo ilustrativa: no procesa pagos ni emite comprobantes fiscales. No se conecta a ningún servicio real.

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

## Desplegar como sitio estático

`npm run build` genera `dist/` listo para cualquier hosting estático. El build incluye `404.html` (copia de `index.html`) y `_redirects` para que las rutas internas funcionen al recargar.

- **Netlify / Cloudflare Pages / Vercel**: directorio base `libertad`, comando `npm run build`, publicar `dist`.
- **GitHub Pages** (en un subdirectorio): `VITE_BASE=/<nombre-del-repo>/ npm run build` y publicar `dist/`.
- **Cualquier servidor** (nginx, S3, etc.): servir `dist/` con fallback a `index.html`.

## Recorrido rápido de lo que hay

- `/` — Landing de la demo: idea fuerza, elección de rol y flujos F1–F8.
- `/kit` — Sistema de diseño con datos reales del escenario (colores, componentes, mapas, badges calculados en vivo).
- `/contratista`, `/productor`, `/ingeniero`, `/admin` — Layouts por rol (celular para el contratista, escritorio con sidebar para el resto). Las pantallas se completan en las fases 2 a 5.
- Barra superior: selector de rol, "Ver como" (otra persona del mismo rol), señal on/off (contratista), recorrido guiado, tema y reinicio de la demo.

## Stack

Vite + React + TypeScript estricto + Tailwind CSS + React Router + Zustand. Sin otras dependencias de runtime: gráficos, mapas, íconos, firma y vista PDF son SVG/HTML propios. Detalle de convenciones, tokens y vocabulario en [`CLAUDE.md`](./CLAUDE.md).

## Estado por fase

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Plan, estructura, CLAUDE.md, README | ✅ |
| 1 | Design system, layout, selector de rol, datos mock | ✅ |
| 2 | Contratista + modo offline | ⏳ |
| 3 | Productor (panel, partes, cuaderno + PDF, contratistas, lotes) | ⏳ |
| 4 | Cobranza + reputación de pago | ⏳ |
| 5 | Ingeniero agrónomo + Administrador | ⏳ |
| 6 | Recorridos guiados F1–F8, onboarding, planes, pulido | ⏳ |
| 7 | Verificación final | ⏳ |

## Checklist final

_Se completa en la Fase 7: pantallas por rol, flujos probados y atajos de demo._
