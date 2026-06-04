/**
 * tmtNorms.ts — Baremos normativos del Trail Making Test (Tombaugh, 2004).
 * Valores de referencia (segundos) para TMT-A y TMT-B por grupo de edad,
 * para nivel educativo ≥12 años. Para <12 años se aplica un factor de
 * penalización aproximado (×1.15) — simplificación de MVP; Tombaugh publica
 * normas específicas por educación que se incorporarán en una versión futura.
 *
 * Referencia: Tombaugh, T. N. (2004). Trail Making Test A and B: Normative data
 * stratified by age and education. Archives of Clinical Neuropsychology, 19(2), 203-214.
 */

export type AgeGroup =
  | '18-24' | '25-34' | '35-44' | '45-54' | '55-59'
  | '60-64' | '65-69' | '70-74' | '75-79' | '80-84' | '85+'

export type Education = 'high' | 'low' // high: ≥12 años | low: <12 años

export interface TmtNorm {
  a: number // media TMT-A (s)
  b: number // media TMT-B (s)
}

export const TOMBAUGH_NORMS: Record<AgeGroup, TmtNorm> = {
  '18-24': { a: 22.9, b: 49.0 },
  '25-34': { a: 24.4, b: 50.6 },
  '35-44': { a: 28.2, b: 58.9 },
  '45-54': { a: 30.0, b: 63.8 },
  '55-59': { a: 31.8, b: 68.7 },
  '60-64': { a: 35.7, b: 79.8 },
  '65-69': { a: 39.7, b: 90.9 },
  '70-74': { a: 45.2, b: 110.8 },
  '75-79': { a: 50.7, b: 130.8 },
  '80-84': { a: 59.5, b: 152.5 },
  '85+':   { a: 64.0, b: 175.0 },
}

export const EDUCATION_PENALTY_MULTIPLIER = 1.15

export const AGE_GROUPS: AgeGroup[] = [
  '18-24', '25-34', '35-44', '45-54', '55-59',
  '60-64', '65-69', '70-74', '75-79', '80-84', '85+',
]

/**
 * Percentiles aproximados de TMT-B (segundos) para un grupo de edad/educación.
 * Tombaugh publica medias y DE; aquí se derivan p25/p50/p75 asumiendo distribución
 * con DE ≈ 30% de la media (típico en TMT-B). Menor tiempo = mejor, por lo que
 * p25 (mejor cuartil) es el tiempo más rápido y p75 el más lento.
 */
export function getTmtBPercentiles(ageGroup: AgeGroup, education: Education): { p25: number; p50: number; p75: number } {
  const b = getNorms(ageGroup, education).b
  return {
    p25: +(b * 0.78).toFixed(1), // más rápido (mejor)
    p50: +b.toFixed(1),
    p75: +(b * 1.30).toFixed(1), // más lento (peor)
  }
}

/** Devuelve las normas (ajustadas por educación) para un grupo de edad. */
export function getNorms(ageGroup: AgeGroup, education: Education): TmtNorm {
  const base = TOMBAUGH_NORMS[ageGroup] ?? TOMBAUGH_NORMS['75-79']
  if (education === 'low') {
    return {
      a: Math.round(base.a * EDUCATION_PENALTY_MULTIPLIER * 10) / 10,
      b: Math.round(base.b * EDUCATION_PENALTY_MULTIPLIER * 10) / 10,
    }
  }
  return base
}

export type DiagStatus = 'healthy' | 'mild' | 'deficit'

export interface TmtDiagnosis {
  status: DiagStatus
  title: string
  description: string
}

/**
 * Clasifica el rendimiento ejecutivo a partir del TMT-B y el ratio B/A,
 * comparado con la norma poblacional.
 */
export function buildDiagnosis(timeA: number, timeB: number, normB: number): TmtDiagnosis {
  const ratio = timeA > 0 ? timeB / timeA : 0
  const isDeficitB = timeB > normB * 1.5
  const ratioSevere = ratio > 4.0

  if (isDeficitB || ratioSevere) {
    return {
      status: 'deficit',
      title: 'Alerta: Disfunción Ejecutiva Significativa',
      description:
        `Se evidencia un enlentecimiento ejecutivo en la Parte B respecto a la norma de ${normB}s. ` +
        `El ratio es de ${ratio.toFixed(2)}, sugiriendo dificultades en flexibilidad cognitiva (shifting).`,
    }
  }
  if (timeB > normB * 1.2 || ratio > 3.2) {
    return {
      status: 'mild',
      title: 'Sugerencia de Deterioro Ejecutivo Leve',
      description:
        'Los valores de la Parte B reflejan un enlentecimiento sutil en la alternancia. ' +
        'El monitoreo continuo ayudará a descartar fluctuaciones atencionales ligadas a fatiga.',
    }
  }
  return {
    status: 'healthy',
    title: 'Rendimiento Neurocognitivo Saludable',
    description:
      'Tu flexibilidad ejecutiva y tu velocidad de procesamiento basal se sitúan dentro de los ' +
      'límites esperados para tu edad y escolaridad.',
  }
}
