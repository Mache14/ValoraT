import { Trophy } from 'lucide-react'
import { compareWithTribe } from '../../utils/percentileUtils'

/**
 * PercentileGauge — barra de percentil poblacional (5 zonas de color) con la posición
 * del usuario, más una barra de comparación con la Tribu (ranking + Z-score).
 * Reutilizable por todos los tests.
 */

interface PercentileGaugeProps {
  /** Valor obtenido por el usuario (en las unidades del test) */
  userValue: number
  p25: number
  p50: number
  p75: number
  /** true si mayor valor = mejor; false si menor = mejor */
  higherIsBetter: boolean
  /** Percentil estimado del usuario (0-100) */
  estimatedPercentile: number
  /** Etiqueta corta del test */
  testLabel: string
  unit?: string
  /** Comparación con la tribu (opcional) */
  tribeValues?: number[]
  /** Valor del usuario en la métrica de la tribu (por defecto = userValue) */
  tribeUserValue?: number
}

const MEDALS = ['🥇', '🥈', '🥉']

export function PercentileGauge({
  userValue, p25, p50, p75, higherIsBetter, estimatedPercentile, testLabel, unit = '',
  tribeValues, tribeUserValue,
}: PercentileGaugeProps) {
  const pct = Math.max(0, Math.min(100, estimatedPercentile))

  // Posiciones de las etiquetas P25/P50/P75 sobre la barra.
  // La barra representa el PERCENTIL (0-100 izq→der). P25 está al 25%, etc.
  // (independiente de higherIsBetter, porque mostramos percentiles de rendimiento)

  const tribe = tribeValues && tribeValues.length
    ? compareWithTribe(tribeUserValue ?? userValue, tribeValues, higherIsBetter)
    : null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
      {/* ── Barra poblacional ── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tu percentil poblacional</h3>
          <span className="text-xs font-bold text-slate-700">P{pct} · {testLabel}</span>
        </div>

        <div className="relative pt-7 pb-6">
          {/* Barra de 5 zonas */}
          <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner">
            <div className="h-full bg-rose-400"    style={{ width: '25%' }} />
            <div className="h-full bg-orange-400"  style={{ width: '25%' }} />
            <div className="h-full bg-amber-300"   style={{ width: '15%' }} />
            <div className="h-full bg-lime-400"    style={{ width: '15%' }} />
            <div className="h-full bg-emerald-500" style={{ width: '20%' }} />
          </div>

          {/* Marcas P25 / P50 / P75 con su valor normativo */}
          {[{ p: 25, l: 'P25', v: p25 }, { p: 50, l: 'P50', v: p50 }, { p: 75, l: 'P75', v: p75 }].map((m) => (
            <div key={m.p} className="absolute bottom-2 -translate-x-1/2 text-center" style={{ left: `${m.p}%` }}>
              <div className="w-px h-2 bg-slate-300 mx-auto mb-0.5" />
              <span className="text-[9px] font-bold text-slate-400 block leading-none">{m.l}</span>
              <span className="text-[8px] text-slate-300 block leading-none">{m.v}{unit}</span>
            </div>
          ))}

          {/* Chincheta del usuario */}
          <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700" style={{ left: `${pct}%` }}>
            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow">
              Tú · {userValue}{unit}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-white border-[3px] border-slate-800 -mt-0.5 shadow" />
          </div>
        </div>

        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide -mt-2">
          <span>Riesgo</span>
          <span>Media</span>
          <span>Excelente</span>
        </div>
      </div>

      {/* ── Barra de la tribu ── */}
      {tribe && (
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-600">Tu posición en la tribu</span>
            </div>
            <span className="text-sm font-extrabold text-slate-800">
              {tribe.rank <= 3 ? MEDALS[tribe.rank - 1] : ''} {tribe.rank}º <span className="text-xs font-medium text-slate-400">de {tribe.total}</span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${tribe.betterThanMean ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.max(8, Math.min(100, 50 + tribe.z * 25))}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${tribe.betterThanMean ? 'text-emerald-600' : 'text-amber-600'}`}>
              Z = {tribe.z > 0 ? '+' : ''}{tribe.z}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {tribe.betterThanMean
              ? 'Por encima de la media de tu tribu. ¡Buen trabajo!'
              : 'Ligeramente por debajo de la media de tu tribu. ¡Tú puedes mejorar!'}
          </p>
        </div>
      )}
    </div>
  )
}
