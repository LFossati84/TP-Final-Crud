import { useSvgId } from '@/ui/useSvgId'
import type { Foto } from '@/domain/types'
import { cx } from '@/ui/cx'

/**
 * "Foto" de ejemplo dibujada en SVG (la demo no usa imágenes remotas).
 * Si el usuario subió una imagen real (objectURL), se muestra esa.
 */
export function FotoIlustrada({ foto, pie, className }: { foto: Foto; pie?: string; className?: string }) {
  const id = useSvgId('foto')
  return (
    <figure className={cx('relative overflow-hidden rounded-xl bg-[#c9d8c0] ring-1 ring-borde', className)}>
      {foto.url ? (
        <img src={foto.url} alt={foto.descripcion} className="aspect-[4/3] h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 160 120" className="block aspect-[4/3] h-full w-full" role="img" aria-label={foto.descripcion}>
          <Escena tipo={foto.tipo} gradId={`${id}-cielo`} />
        </svg>
      )}
      {pie ? (
        <figcaption className="num absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-[10px] font-medium text-white">
          {pie}
        </figcaption>
      ) : null}
    </figure>
  )
}

function Escena({ tipo, gradId }: { tipo: Foto['tipo']; gradId: string }) {
  const cielo = (
    <>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9cc3dd" />
          <stop offset="1" stopColor="#e8eef0" />
        </linearGradient>
      </defs>
      <rect width="160" height="58" fill={`url(#${gradId})`} />
      <circle cx="128" cy="18" r="8" fill="#fbe7a6" />
    </>
  )
  const surcos = (color: string, fondo: string) => (
    <>
      <rect y="56" width="160" height="64" fill={fondo} />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={80} y1={56} x2={-60 + i * 23} y2={120} stroke={color} strokeWidth="2.2" />
      ))}
      <rect y="54" width="160" height="4" fill="#6f8f5a" />
    </>
  )
  switch (tipo) {
    case 'lote':
      return (
        <>
          {cielo}
          {surcos('#7aa35f', '#a9875f')}
          <path d="M0 56 Q20 48 34 54 T70 52 T110 55 T160 50 V58 H0Z" fill="#4d6b3c" />
        </>
      )
    case 'maquina':
      return (
        <>
          {cielo}
          {surcos('#8bb06f', '#b19470')}
          {/* Pulverizadora autopropulsada con botalón */}
          <g transform="translate(46 50)">
            <rect x="-40" y="22" width="148" height="2.5" fill="#3a3a3a" />
            {Array.from({ length: 15 }, (_, i) => (
              <path key={i} d={`M${-38 + i * 10} 24.5 l-3 7 h6 z`} fill="#d7e6ef" opacity="0.7" />
            ))}
            <rect x="18" y="4" width="36" height="20" rx="3" fill="#2f6b2a" />
            <rect x="48" y="0" width="14" height="14" rx="2" fill="#cfe3ea" stroke="#2f6b2a" strokeWidth="2" />
            <ellipse cx="34" cy="14" rx="12" ry="7" fill="#f1f1ec" />
            <circle cx="24" cy="30" r="7" fill="#262626" />
            <circle cx="56" cy="30" r="7" fill="#262626" />
          </g>
        </>
      )
    case 'caldo':
      return (
        <>
          <rect width="160" height="120" fill="#d8d2c2" />
          <rect y="84" width="160" height="36" fill="#9c8a6c" />
          <g transform="translate(52 22)">
            <rect width="56" height="72" rx="6" fill="#f5f5f2" stroke="#8a8a80" strokeWidth="2" />
            <rect x="2" y="30" width="52" height="40" rx="4" fill="#7fb5c9" opacity="0.85" />
            <rect x="18" y="-8" width="20" height="10" rx="2" fill="#2f6b2a" />
            {[14, 26, 38, 50, 62].map((y) => (
              <line key={y} x1="40" x2="52" y1={y} y2={y} stroke="#8a8a80" strokeWidth="1.2" />
            ))}
          </g>
          <text x="80" y="112" textAnchor="middle" fontSize="8" fill="#3d2b1f" fontFamily="system-ui">Caldo · 80 l/ha</text>
        </>
      )
    case 'remito':
      return (
        <>
          <rect width="160" height="120" fill="#a7926f" />
          <g transform="translate(36 12) rotate(-4)">
            <rect width="88" height="100" fill="#fbf8ef" />
            <rect x="8" y="8" width="40" height="6" fill="#3d2b1f" />
            {[24, 32, 40, 48, 56, 64, 72].map((y, i) => (
              <rect key={y} x="8" y={y} width={i % 2 ? 60 : 72} height="3" fill="#b9ad97" />
            ))}
            <path d="M52 86 c6 -8 10 4 16 -2 s6 4 12 -1" stroke="#244720" strokeWidth="1.5" fill="none" />
          </g>
        </>
      )
    default:
      return (
        <>
          {cielo}
          {surcos('#7aa35f', '#a9875f')}
        </>
      )
  }
}
