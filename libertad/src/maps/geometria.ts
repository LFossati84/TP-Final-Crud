type Punto = [number, number]

/** Centroide de un polígono simple (fórmula del área con signo). */
export function centroide(pts: Punto[]): Punto {
  let a = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i] ?? [0, 0]
    const [x1, y1] = pts[(i + 1) % pts.length] ?? [0, 0]
    const f = x0 * y1 - x1 * y0
    a += f
    cx += (x0 + x1) * f
    cy += (y0 + y1) * f
  }
  a /= 2
  if (Math.abs(a) < 1e-6) return pts[0] ?? [0, 0]
  return [cx / (6 * a), cy / (6 * a)]
}

export function puntosSvg(pts: Punto[]): string {
  return pts.map(([x, y]) => `${x},${y}`).join(' ')
}

/** Índice del polígono más cercano a un punto (para "usar ubicación actual"). */
export function masCercano(punto: Punto, poligonos: Punto[][]): number {
  let mejor = 0
  let dist = Infinity
  poligonos.forEach((p, i) => {
    const [x, y] = centroide(p)
    const d = (x - punto[0]) ** 2 + (y - punto[1]) ** 2
    if (d < dist) {
      dist = d
      mejor = i
    }
  })
  return mejor
}
