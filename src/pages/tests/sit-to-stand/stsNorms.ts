/**
 * stsNorms.ts — Lógica normativa del Sit-to-Stand (5-STS y 30-STS).
 *
 * 5-STS (tiempo en segundos para 5 levantamientos):
 *   > 15 s → Riesgo de sarcopenia | > 12 s → debilidad temprana | ≤ 12 s → normal.
 * 30-STS (repeticiones en 30 s): baremos por edad y sexo.
 *
 * Referencias: Bohannon (5-STS); Rikli & Jones / 30-STS normative data.
 */

export type Gender = 'M' | 'F'

export interface StsAssessment {
  title: string
  sub: string
  tone: 'red' | 'yellow' | 'green' | 'emerald'
}

interface Norm30 { low: number; high: number }

/** Baremos del 30-STS (repeticiones) por edad y sexo. */
export function get30StsNorms(age: number, gender: Gender): Norm30 {
  if (age >= 40 && age < 50) {
    return gender === 'M' ? { low: 20, high: 25 } : { low: 17, high: 23 }
  }
  if (age >= 50 && age < 60) {
    return gender === 'M' ? { low: 18, high: 24 } : { low: 15, high: 20 }
  }
  // 60+
  return gender === 'M' ? { low: 15, high: 19 } : { low: 13, high: 17 }
}

/** Diagnóstico combinado 5-STS + 30-STS. */
export function evaluateSts(age: number, gender: Gender, reps30: number, time5: number): StsAssessment {
  // El riesgo del 5-STS prevalece siempre
  if (time5 > 15) {
    return { title: 'Riesgo de Sarcopenia', sub: '5-STS > 15 s indica declive neuromuscular', tone: 'red' }
  }

  let assessment: StsAssessment = {
    title: 'Rendimiento Medio',
    sub: 'Dentro de los valores esperados',
    tone: 'green',
  }

  if (time5 > 12) {
    assessment = { title: 'Debilidad Temprana', sub: 'Tiempo 5-STS elevado (> 12 s)', tone: 'yellow' }
  }

  const { low, high } = get30StsNorms(age, gender)
  const isLow = reps30 < low
  const isHigh = reps30 >= high

  if (isLow && time5 <= 12) {
    assessment = { title: 'Baja Resistencia', sub: 'Volumen 30-STS por debajo de la media', tone: 'yellow' }
  } else if (isHigh && time5 <= 12) {
    assessment = { title: 'Rendimiento Óptimo', sub: 'Por encima del percentil 75', tone: 'emerald' }
  }

  return assessment
}

export const TONE_CLASSES: Record<StsAssessment['tone'], string> = {
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export interface StsSession {
  id: number
  date: string
  age: number
  gender: Gender
  time5STS: number
  reps30STS: number
  assessment: string
}

export const STS_STORAGE_KEY = 'sts_history_v1'
