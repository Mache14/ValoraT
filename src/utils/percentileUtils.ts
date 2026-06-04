/**
 * percentileUtils.ts — utilidades para estimar percentiles y comparar con la tribu.
 */

/** Percentil "crudo" de un valor respecto a p25/p50/p75 (donde mayor valor → mayor percentil). */
function rawPercentile(value: number, p25: number, p50: number, p75: number): number {
  if (p25 <= 0 && value <= 0) return 1
  if (value <= p25) {
    // Extrapolación lineal hacia 0 (asume valor 0 → percentil ~0)
    return Math.max(1, 25 * (value / (p25 || 1)))
  }
  if (value <= p50) return 25 + 25 * ((value - p25) / ((p50 - p25) || 1))
  if (value <= p75) return 50 + 25 * ((value - p50) / ((p75 - p50) || 1))
  // Por encima de P75: extrapola con la pendiente P50→P75, tope en 99
  const slope = (p75 - p50) || 1
  return Math.min(99, 75 + 25 * ((value - p75) / slope))
}

/**
 * Estima el percentil de RENDIMIENTO (0-100, donde 100 = mejor) de un valor.
 * @param higherIsBetter true si un valor mayor es mejor (reps, tiempo de equilibrio);
 *                       false si un valor menor es mejor (tiempo TMT, tiempo 5-STS).
 */
export function estimatePercentile(
  value: number, p25: number, p50: number, p75: number, higherIsBetter: boolean,
): number {
  const raw = rawPercentile(value, p25, p50, p75)
  return Math.round(higherIsBetter ? raw : 100 - raw)
}

/** Rango textual del percentil (6 tramos). */
export type PercentileRange = '<P25' | 'P25-P40' | 'P40-P60' | 'P60-P75' | 'P75-P90' | 'P90-P100'

export function percentileToRange(p: number): PercentileRange {
  if (p < 25) return '<P25'
  if (p < 40) return 'P25-P40'
  if (p < 60) return 'P40-P60'
  if (p < 75) return 'P60-P75'
  if (p < 90) return 'P75-P90'
  return 'P90-P100'
}

export interface TribeComparison {
  rank: number        // posición del usuario (1 = mejor)
  total: number       // nº de participantes (tribu + usuario)
  z: number           // Z-score respecto a la media de la tribu
  betterThanMean: boolean
}

/**
 * Compara el valor del usuario con los de su tribu.
 * Devuelve la posición en el ranking y el Z-score.
 */
export function compareWithTribe(
  userValue: number, tribeValues: number[], higherIsBetter: boolean,
): TribeComparison {
  const all = [...tribeValues, userValue]
  const mean = all.reduce((a, b) => a + b, 0) / all.length
  const variance = all.reduce((a, b) => a + (b - mean) ** 2, 0) / all.length
  const sd = Math.sqrt(variance) || 1

  // Z-score orientado a rendimiento (positivo = mejor que la media)
  const rawZ = (userValue - mean) / sd
  const z = higherIsBetter ? rawZ : -rawZ

  // Ranking: ordenar por rendimiento
  const sorted = [...all].sort((a, b) => (higherIsBetter ? b - a : a - b))
  const rank = sorted.indexOf(userValue) + 1

  return { rank, total: all.length, z: +z.toFixed(2), betterThanMean: z >= 0 }
}
