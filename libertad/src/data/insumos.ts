import type { Insumo } from '@/domain/types'

/**
 * Catálogo genérico por principio activo (sin marcas comerciales).
 * Los rangos de dosis son orientativos para la demo y no constituyen recomendación técnica.
 */
export const INSUMOS: Insumo[] = [
  { id: 'i-gli', nombre: 'Glifosato 66,2 % SL', tipo: 'herbicida', unidad: 'l/ha', dosisMin: 1.5, dosisMax: 3, banda: 'IV' },
  { id: 'i-24d', nombre: '2,4-D éster 97 %', tipo: 'herbicida', unidad: 'l/ha', dosisMin: 0.3, dosisMax: 0.8, banda: 'II' },
  { id: 'i-dic', nombre: 'Dicamba 57,8 % SL', tipo: 'herbicida', unidad: 'l/ha', dosisMin: 0.1, dosisMax: 0.2, banda: 'III' },
  { id: 'i-atr', nombre: 'Atrazina 90 % WG', tipo: 'herbicida', unidad: 'kg/ha', dosisMin: 1, dosisMax: 2, banda: 'IV' },
  { id: 'i-sme', nombre: 'S-metolacloro 96 % EC', tipo: 'herbicida', unidad: 'l/ha', dosisMin: 0.8, dosisMax: 1.5, banda: 'III' },
  { id: 'i-met', nombre: 'Metsulfurón metil 60 % WG', tipo: 'herbicida', unidad: 'g/ha', dosisMin: 5, dosisMax: 8, banda: 'IV' },
  { id: 'i-lam', nombre: 'Lambdacialotrina 25 % CS', tipo: 'insecticida', unidad: 'cc/ha', dosisMin: 20, dosisMax: 40, banda: 'II' },
  { id: 'i-azo', nombre: 'Azoxistrobina 20 % + Ciproconazol 8 % SC', tipo: 'fungicida', unidad: 'l/ha', dosisMin: 0.3, dosisMax: 0.5, banda: 'III' },
  { id: 'i-ace', nombre: 'Aceite metilado de soja', tipo: 'coadyuvante', unidad: 'l/ha' },
  { id: 'i-ure', nombre: 'Urea granulada 46-0-0', tipo: 'fertilizante', unidad: 'kg/ha' },
  { id: 'i-map', nombre: 'Fosfato monoamónico 11-52-0', tipo: 'fertilizante', unidad: 'kg/ha' },
  { id: 'i-ssoja', nombre: 'Semilla de soja GM IV largo', tipo: 'semilla', unidad: 'kg/ha' },
  { id: 'i-smaiz', nombre: 'Semilla de maíz híbrido', tipo: 'semilla', unidad: 'pl/ha' },
  { id: 'i-strigo', nombre: 'Semilla de trigo ciclo intermedio', tipo: 'semilla', unidad: 'kg/ha' },
]
