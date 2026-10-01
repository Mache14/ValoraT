/**
 * chairReachNorms.ts — Lógica normativa del Chair Sit-and-Reach (flexión de tronco en silla).
 *
 * Evalúa la flexibilidad isquiosural y de la cadena posterior, relevante para el patrón
 * de marcha y la mecánica lumbar. Unidad: cm respecto a la punta del pie
 * (+ = sobrepasa el pie, − = no llega).
 * Baremos P10-P90 por cohortes quinquenales de edad y sexo: datos reales de
 * Rikli & Jones (2013) en 60-74 años y extrapolación documentada (Δ = +1 cm/quinquenio)
 * para 40-59 años (compendio normativo ValoraT, apartado 3.8.1 [A5]).
 */

export type ChairReachGender = 'Hombre' | 'Mujer'

export interface ChairReachNorm {
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
}

export interface ChairReachAssessment {
  label: string
  tone: 'red' | 'blue' | 'green'
  desc: string
}

type NormRow = { min: number; max: number; norm: ChairReachNorm }

const NORMS_MUJER: NormRow[] = [
  { min: 40, max: 44, norm: { p10: 0, p25: 3, p50: 7, p75: 10, p90: 13 } },
  { min: 45, max: 49, norm: { p10: -1, p25: 2, p50: 6, p75: 9, p90: 12 } },
  { min: 50, max: 54, norm: { p10: -2, p25: 1, p50: 5, p75: 8, p90: 11 } },
  { min: 55, max: 59, norm: { p10: -3, p25: 0, p50: 4, p75: 7, p90: 10 } },
  { min: 60, max: 64, norm: { p10: -4, p25: -1, p50: 3, p75: 6, p90: 9 } },
  { min: 65, max: 69, norm: { p10: -5, p25: -2, p50: 2, p75: 5, p90: 8 } },
  { min: 70, max: 74, norm: { p10: -5, p25: -2, p50: 1, p75: 5, p90: 8 } },
]

const NORMS_HOMBRE: NormRow[] = [
  { min: 40, max: 44, norm: { p10: -3, p25: 0, p50: 4, p75: 7, p90: 11 } },
  { min: 45, max: 49, norm: { p10: -4, p25: -1, p50: 3, p75: 6, p90: 10 } },
  { min: 50, max: 54, norm: { p10: -5, p25: -2, p50: 2, p75: 5, p90: 9 } },
  { min: 55, max: 59, norm: { p10: -6, p25: -3, p50: 1, p75: 4, p90: 8 } },
  { min: 60, max: 64, norm: { p10: -7, p25: -4, p50: 0, p75: 3, p90: 7 } },
  { min: 65, max: 69, norm: { p10: -8, p25: -5, p50: -1, p75: 2, p90: 6 } },
  { min: 70, max: 74, norm: { p10: -9, p25: -6, p50: -2, p75: 1, p90: 5 } },
]

/** Percentiles normativos por edad y sexo (cohortes quinquenales; clamp en los extremos). */
export function getNormativeData(age: number, gender: ChairReachGender): ChairReachNorm {
  const rows = gender === 'Hombre' ? NORMS_HOMBRE : NORMS_MUJER
  const clamped = Math.max(rows[0].min, Math.min(rows[rows.length - 1].max, age))
  const row = rows.find((r) => clamped >= r.min && clamped <= r.max) ?? rows[0]
  return row.norm
}

/** Evaluación clínica por bandas P25/P75 (mismo criterio que el resto de la batería). */
export function evaluateChairReach(age: number, gender: ChairReachGender, cm: number): ChairReachAssessment {
  const norms = getNormativeData(age, gender)

  if (cm < norms.p25) {
    return {
      label: 'BAJO (Acortamiento)',
      tone: 'red',
      desc: 'Por debajo del percentil 25 para tu rango de edad. Indica un acortamiento de la musculatura isquiosural y de la cadena posterior que limita la amplitud funcional de la cadera. Este déficit se asocia a una zancada más corta, mayor sobrecarga de la zona lumbar al agacharte y mayor dificultad para tareas cotidianas como calzarte o recoger objetos del suelo. Se recomienda incorporar estiramientos suaves y mantenidos de isquiosurales (30-60 segundos) varios días por semana, siempre sin dolor.',
    }
  }
  if (cm >= norms.p75) {
    return {
      label: 'EXCELENTE',
      tone: 'green',
      desc: 'Igual o superior al percentil 75 para tu rango de edad. Tu flexibilidad isquiosural está muy por encima de la media poblacional: la cadena posterior permite un patrón de marcha amplio, protege la mecánica lumbar en las flexiones de tronco y facilita las actividades cotidianas que exigen alcanzar el suelo. Mantén este nivel integrando estiramientos en tu rutina habitual de actividad física.',
    }
  }
  return {
    label: 'PROMEDIO (Normal)',
    tone: 'blue',
    desc: 'Rendimiento dentro de los valores normativos esperados (entre el percentil 25 y el 75). Tu amplitud de movimiento es adecuada para las demandas de la vida diaria. Para progresar hacia la franja superior, añade estiramientos regulares de isquiosurales y movilidad de cadera al final de tus sesiones de ejercicio.',
  }
}

export const CHAIRREACH_TONE_CLASSES: Record<ChairReachAssessment['tone'], string> = {
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export interface ChairReachSession {
  id: number
  date: string
  age: number
  gender: ChairReachGender
  /** Mejor marca de los dos intentos (cm, con signo). */
  cm: number
  assessment: string
}

export const CHAIRREACH_STORAGE_KEY = 'chairreach_history_v1'
