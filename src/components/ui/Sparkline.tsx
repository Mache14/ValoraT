import { ArrowUpRight, ArrowDown, TrendingUp } from 'lucide-react'

/**
 * Sparkline — mini-gráfico de tendencia dibujado con SVG nativo.
 * Recibe un array de números y los convierte en una línea.
 * Sin librerías externas: mantiene la app muy ligera.
 */

export type SparklineStatus = 'up' | 'down' | 'stable'

interface SparklineProps {
  data: number[]
  status: SparklineStatus
}

export function Sparkline({ data, status }: SparklineProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const stepX = 100 / (data.length - 1)

  // Mapear cada valor a coordenadas SVG (eje Y invertido: arriba = mejor)
  const points = data
    .map((val, i) => {
      const x = i * stepX
      const y = 30 - ((val - min) / range) * 20 - 5
      return `${x},${y}`
    })
    .join(' L ')

  const pathColor =
    status === 'up' ? '#10b981' : status === 'down' ? '#f43f5e' : '#3b82f6'

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
      <div className="w-24 h-8 relative">
        <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
          <path
            d={`M ${points}`}
            fill="none"
            stroke={pathColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="0" y1="28" x2="100" y2="28" stroke="#cbd5e1" strokeWidth="1" />
          {data.map((val, i) => {
            const x = i * stepX
            const y = 30 - ((val - min) / range) * 20 - 5
            return <circle key={i} cx={x} cy={y} r="2" fill={pathColor} />
          })}
        </svg>
      </div>
      <div className="flex items-center text-xs font-bold" style={{ color: pathColor }}>
        {status === 'up' && (
          <span className="flex items-center">
            <ArrowUpRight size={14} /> Mejora
          </span>
        )}
        {status === 'down' && (
          <span className="flex items-center">
            <ArrowDown size={14} /> Bajada
          </span>
        )}
        {status === 'stable' && (
          <span className="flex items-center">
            <TrendingUp size={14} /> Estable
          </span>
        )}
      </div>
    </div>
  )
}
