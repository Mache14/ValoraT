/**
 * tugNorms.ts — Normativa del Timed Up and Go (TUG, 3 m).
 *
 * En el TUG, MENOR tiempo = mejor rendimiento (higherIsBetter = false), por lo que
 * en los percentiles p25 < p50 < p75 representan tiempos crecientes: p25 es el mejor
 * cuartil (más rápido) y p75 el peor (más lento).
 *
 * Referencias: Bohannon (2006), meta-análisis de valores de referencia del TUG;
 * Kear, Guck & McGaha (2017), valores normativos para 20-59 años;
 * Podsiadlo & Richardson (1991), test original; Shumway-Cook et al. (2000),
 * umbral de riesgo de caídas. Valores interpolados para la franja 40-65 años.
 */

export type TugGender = 'Hombre' | 'Mujer'

export interface TugPercentiles { p25: number; p50: number; p75: number }

/**
 * Percentiles de tiempo TUG (segundos) por edad y sexo (40-65 años).
 * Derivados de las medias y dispersión de Bohannon (2006) y Kear et al. (2017):
 * p50 ≈ media de referencia; p25 ≈ media − 0.67·DE; p75 ≈ media + 0.67·DE.
 */
export function getTugNorms(age: number, gender: TugGender): TugPercentiles {
  const isMale = gender === 'Hombre'
  if (age < 50) {
    // 40-49: media ≈ 8.5 (H) / 9.0 (M)
    return isMale ? { p25: 7.4, p50: 8.5, p75: 9.8 } : { p25: 7.8, p50: 9.0, p75: 10.3 }
  }
  if (age < 60) {
    // 50-59: media ≈ 9.0 (H) / 9.6 (M) (Kear et al., 2017)
    return isMale ? { p25: 7.8, p50: 9.0, p75: 10.4 } : { p25: 8.2, p50: 9.6, p75: 11.0 }
  }
  // 60-65: media ≈ 9.0 (H) / 9.5 (M) (Bohannon, 2006: 60-69 ≈ 8.1)
  return isMale ? { p25: 7.6, p50: 9.0, p75: 10.6 } : { p25: 8.0, p50: 9.5, p75: 11.2 }
}

export interface TugAssessment {
  title: string
  sub: string
  tone: 'green' | 'amber' | 'red'
}

/**
 * Evaluación clínica de riesgo de caídas.
 * Umbral preclínico para 40-65 años: ≥ 10.98 s (déficit preclínico).
 * El umbral clásico de riesgo de caídas en mayores es ≥ 13.5 s (Shumway-Cook et al., 2000),
 * demasiado laxo para adultos de mediana edad: se usa 10.98 s como referencia preventiva.
 */
export function evaluateTug(time: number, percentiles: TugPercentiles): TugAssessment {
  if (time >= 10.98) {
    return {
      title: 'Riesgo Alto (déficit preclínico)',
      sub: 'Supera el umbral preventivo de 10.98 s',
      tone: 'red',
    }
  }
  if (time <= percentiles.p25 && time <= 8.5) {
    return {
      title: 'Excelente (bajo riesgo)',
      sub: 'Movilidad funcional sobresaliente',
      tone: 'green',
    }
  }
  if (time <= percentiles.p50) {
    return {
      title: 'Bueno',
      sub: 'Por encima de la media de tu grupo',
      tone: 'green',
    }
  }
  return {
    title: 'Normalidad (margen de mejora)',
    sub: 'Dentro de los valores normativos de referencia',
    tone: 'amber',
  }
}

export const TUG_TONE_CLASSES: Record<TugAssessment['tone'], string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
}

export interface TugSession {
  id: number
  date: string
  age: number
  gender: TugGender
  tugTime: number
  assessment: string
}

export const TUG_STORAGE_KEY = 'tug_history_v1'
