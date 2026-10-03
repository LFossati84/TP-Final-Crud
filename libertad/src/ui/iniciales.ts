export function iniciales(nombre: string): string {
  const palabras = nombre
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(p))
  return ((palabras[0]?.[0] ?? '') + (palabras[1]?.[0] ?? '')).toUpperCase() || '··'
}

