import { useState, type ComponentProps } from 'react'
import { Input } from './FormField'

function aTexto(n: number): string {
  return n ? String(n).replace('.', ',') : ''
}

function aNumero(t: string): number {
  const n = Number(t.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> & { valor: number; onValor: (n: number) => void }

/** Campo numérico que acepta coma decimal mientras se escribe ("0," → 0,4). */
export function InputNumero({ valor, onValor, ...resto }: Props) {
  const [texto, setTexto] = useState(aTexto(valor))
  const [previo, setPrevio] = useState(valor)
  // Si el valor cambia desde afuera (ej. se cargó una receta), se resincroniza el texto.
  if (valor !== previo) {
    setPrevio(valor)
    if (aNumero(texto) !== valor) setTexto(aTexto(valor))
  }
  return (
    <Input
      inputMode="decimal"
      value={texto}
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d,.]/g, '')
        setTexto(t)
        const n = aNumero(t)
        setPrevio(n)
        onValor(n)
      }}
      {...resto}
    />
  )
}
