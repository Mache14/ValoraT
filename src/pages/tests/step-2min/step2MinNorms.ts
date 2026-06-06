/**
 * step2MinNorms.ts — Lógica normativa del 2-Minute Step Test (marcha en el sitio 2 min).
 *
 * Evalúa la resistencia aeróbica domiciliaria. Se cuentan las elevaciones de la rodilla
 * DERECHA que alcanzan la altura objetivo (punto medio rótula-cresta ilíaca) en 120 s.
 * Más pasos = mejor (higherIsBetter = true).
 *
 * Baremos (riskLimit ≈ P25 · excLimit ≈ P75) extraídos del prototipo validado, anclados en
 * Rikli & Jones (2013, Senior Fitness Test). Nota: la tabla del prototipo no es estrictamente
 * monótona entre cohortes (se conserva fiel a la fuente).
 */

export type Step2MinSex = 'Hombre' | 'Mujer'

export interface Step2MinNorms {
  riskLimit: number // ≈ P25
  excLimit: number  // ≈ P75
}

export interface Step2MinAssessment {
  title: string
  sub: string
  tone: 'green' | 'yellow' | 'red'
}

/** Umbrales por edad y sexo (tabla exacta del prototipo). */
export function getStep2MinNorms(age: number, sex: Step2MinSex): Step2MinNorms {
  if (sex === 'Hombre') {
    if (age <= 50) return { riskLimit: 78, excLimit: 103 }
    if (age <= 60) return { riskLimit: 72, excLimit: 91 }
    if (age <= 64) return { riskLimit: 87, excLimit: 115 }
    return { riskLimit: 86, excLimit: 116 }
  }
  if (age <= 50) return { riskLimit: 65, excLimit: 88 }
  if (age <= 60) return { riskLimit: 70, excLimit: 83 }
  if (age <= 64) return { riskLimit: 75, excLimit: 107 }
  return { riskLimit: 73, excLimit: 107 }
}

/** Diagnóstico por cohortes (verde / amarillo / rojo). */
export function evaluateStep2Min(steps: number, norms: Step2MinNorms): Step2MinAssessment {
  if (steps > norms.excLimit) {
    return {
      title: 'Excelente',
      sub: 'Capacidad aeróbica sobresaliente. Excelente reserva cardiorrespiratoria.',
      tone: 'green',
    }
  }
  if (steps < norms.riskLimit) {
    return {
      title: 'Riesgo',
      sub: 'Fenotipo vulnerable. Aptitud aeróbica inferior al promedio poblacional.',
      tone: 'red',
    }
  }
  return {
    title: 'Normal',
    sub: 'Capacidad funcional homeostática. Rendimiento dentro de lo esperado.',
    tone: 'yellow',
  }
}

export const TONE_CLASSES: Record<Step2MinAssessment['tone'], string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
}

export interface Step2MinSession {
  id: number
  date: string
  age: number
  sex: Step2MinSex
  steps: number
  assessment: string
}

export const STEP2MIN_STORAGE_KEY = 'step2min_history_v1'
