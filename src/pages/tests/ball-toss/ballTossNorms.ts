/**
 * ballTossNorms.ts — Lógica normativa del Alternate Hand Wall Toss Test (AHWTT).
 *
 * Coordinación óculo-manual bilateral: recepciones exitosas en 30 s lanzando una pelota
 * de tenis contra una pared a 2 m y atrapándola alternando manos. Más recepciones = mejor
 * (higherIsBetter = true). Las caídas/pérdidas son un marcador secundario de error radial.
 *
 * Baremos por edad y sexo (P25/P75). El P50 se estima como media aritmética de P25 y P75.
 * Tabla validada contra el prototipo de origen (AHWTT Analyzer, líneas 558-581).
 *
 * Referencias: Rikli & Jones (2013, Senior Fitness Test Manual);
 * Hoeger & Hoeger (Lifetime Physical Fitness and Wellness) — testing de coordinación;
 * literatura de coordinación visomotora y envejecimiento.
 */

export type Gender = 'M' | 'F'

export interface BallTossPercentiles {
  p25: number
  p50: number
  p75: number
}

export interface BallTossAssessment {
  title: string
  sub: string
  tone: 'green' | 'amber' | 'red'
}

/** Baremos del AHWTT (recepciones en 30 s) por edad y sexo. P50 = media de P25 y P75. */
export function getBallTossNorms(age: number, gender: Gender): BallTossPercentiles {
  let p25: number
  let p75: number

  if (age >= 40 && age <= 49) {
    if (gender === 'M') { p25 = 23; p75 = 31 } else { p25 = 17; p75 = 24 }
  } else if (age >= 50 && age <= 59) {
    if (gender === 'M') { p25 = 19; p75 = 27 } else { p25 = 14; p75 = 20 }
  } else {
    // 60-65 (y fallback de seguridad)
    if (gender === 'M') { p25 = 16; p75 = 23 } else { p25 = 12; p75 = 18 }
  }

  return { p25, p50: Math.round((p25 + p75) / 2), p75 }
}

/**
 * Diagnóstico normativo según las recepciones frente a los percentiles del grupo.
 * Las caídas (drops) se evalúan de forma separada en el informe (alerta si > 3).
 */
export function evaluateBallToss(
  catches: number,
  _drops: number,
  norms: BallTossPercentiles,
): BallTossAssessment {
  if (catches < norms.p25) {
    return {
      title: 'Pobre / Bajo',
      sub: `Por debajo del P25 (${norms.p25}) para tu edad y sexo`,
      tone: 'red',
    }
  }
  if (catches > norms.p75) {
    return {
      title: 'Rendimiento Óptimo',
      sub: `Por encima del P75 (${norms.p75}). Excelente coordinación`,
      tone: 'green',
    }
  }
  return {
    title: 'Promedio',
    sub: `Rendimiento esperado (P25 ${norms.p25} – P75 ${norms.p75})`,
    tone: 'amber',
  }
}

export const TONE_CLASSES: Record<BallTossAssessment['tone'], string> = {
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export interface BallTossSession {
  id: number
  date: string
  age: number
  gender: string
  catches: number
  drops: number
  assessment: string
}

export const BALL_TOSS_STORAGE_KEY = 'balltoss_history_v1'
