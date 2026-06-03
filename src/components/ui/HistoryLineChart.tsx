/**
 * HistoryLineChart — gráfico de líneas de historial dibujado con SVG nativo.
 * Sustituye a Chart.js (sin dependencias externas). Muestra la progresión de
 * los intentos de un test a lo largo del tiempo.
 */

interface HistoryPoint {
  label: string
  score: number
}

interface HistoryLineChartProps {
  data: HistoryPoint[]
  color?: string
  unit?: string
}

export function HistoryLineChart({ data, color = '#2563eb', unit = 's' }: HistoryLineChartProps) {
  if (data.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-8">Sin datos de historial todavía.</p>
  }

  const W = 320, H = 160
  const padL = 30, padR = 12, padT = 14, padB = 26
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const scores = data.map((d) => d.score)
  const maxY = Math.max(...scores, 1) * 1.15
  const minY = 0

  const x = (i: number) => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v: number) => padT + innerH - ((v - minY) / (maxY - minY)) * innerH

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.score)}`).join(' ')
  const areaPath = `${linePath} L ${x(data.length - 1)} ${padT + innerH} L ${x(0)} ${padT + innerH} Z`

  // Líneas de referencia horizontales
  const gridLines = [0, 0.5, 1].map((f) => {
    const val = minY + f * (maxY - minY)
    return { y: y(val), val: Math.round(val) }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid + ejes Y */}
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1={padL} y1={g.y} x2={W - padR} y2={g.y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <text x={padL - 6} y={g.y + 3} fontSize="9" fill="#94a3b8" textAnchor="end" fontFamily="monospace">{g.val}</text>
        </g>
      ))}

      {/* Área bajo la curva */}
      <path d={areaPath} fill={color} opacity={0.1} />
      {/* Línea */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Puntos */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.score)} r="4" fill="#fff" stroke={color} strokeWidth="2" />
          <title>{d.label}: {d.score}{unit}</title>
        </g>
      ))}

      {/* Etiqueta del último punto */}
      {data.length > 0 && (
        <text x={x(data.length - 1)} y={y(data[data.length - 1].score) - 8} fontSize="9" fill={color} textAnchor="middle" fontWeight="bold">
          {data[data.length - 1].score}{unit}
        </text>
      )}
    </svg>
  )
}
