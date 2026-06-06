/**
 * sixMinuteNorms.ts — Lógica normativa del 6-Minute Walk Test (6MWT).
 *
 * Capacidad aeróbica máxima caminando 6 min en un circuito de 30 m. Mayor distancia = mejor.
 * No usa una tabla de percentiles por cohorte, sino una ECUACIÓN DE PREDICCIÓN individual:
 *   - Distancia predicha: Enright & Sherrill (1998).
 *   - Límite Inferior de Normalidad (LIN): Casanova et al. (2011).
 *
 * Bug crítico corregido (informe del prototipo): "colapso paramétrico por unidades". Si el
 * usuario introduce la estatura en metros (< 3), se multiplica por 100 antes de las ecuaciones.
 */

export type SixMinSex = 'Hombre' | 'Mujer'

export interface SixMinAssessment {
  title: string
  sub: string
  tone: 'green' | 'yellow' | 'red'
}

export interface SixMinPercentiles { p25: number; p50: number; p75: number }

/** Autocorrección de unidades: estatura en metros → cm. */
export function normalizeHeight(height: number): number {
  return height > 0 && height < 3 ? height * 100 : height
}

/** Distancia predicha (m) — ecuaciones de Enright & Sherrill (1998). */
export function predictedDistance(sex: SixMinSex, age: number, heightCm: number, weightKg: number): number {
  const h = normalizeHeight(heightCm)
  if (sex === 'Hombre') {
    return 7.57 * h - 5.02 * age - 1.76 * weightKg - 309
  }
  return 2.11 * h - 2.29 * weightKg - 5.78 * age + 667
}

/** Límite Inferior de Normalidad (m) — Casanova et al. (2011). */
export function lowerLimit(sex: SixMinSex, predicted: number): number {
  return sex === 'Hombre' ? predicted - 153 : predicted - 139
}

/**
 * Percentiles para el PercentileGauge a partir de la predicción individual:
 * P25 = LIN, P50 = distancia predicha, P75 = predicha + (predicha − LIN) (mirror superior).
 * Es una estimación para visualizar el rendimiento, no una tabla poblacional.
 */
export function gaugePercentiles(predicted: number, lin: number): SixMinPercentiles {
  const delta = predicted - lin
  return { p25: Math.round(lin), p50: Math.round(predicted), p75: Math.round(predicted + delta) }
}

/** Diagnóstico por cohortes (verde / amarillo / rojo). */
export function evaluate6mwt(real: number, predicted: number, lin: number, age: number): SixMinAssessment {
  if (real > predicted) {
    return {
      title: 'Rendimiento Óptimo',
      sub: 'Preserva intacta su capacidad aeróbica máxima esperada para su perfil.',
      tone: 'green',
    }
  }
  if (real >= lin) {
    return {
      title: 'Capacidad Normal',
      sub: 'Efecto meseta funcional. Rendimiento dentro de los límites clínicos aceptables.',
      tone: 'yellow',
    }
  }
  const extra = age >= 60
    ? ' Alerta: posible declive neuromuscular y cardiovascular acelerado.'
    : ' Límite inferior de normalidad no superado.'
  return {
    title: 'Riesgo Funcional',
    sub: 'Baja aptitud cardiorrespiratoria.' + extra,
    tone: 'red',
  }
}

export const TONE_CLASSES: Record<SixMinAssessment['tone'], string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
}

export interface SixMinSession {
  id: number
  date: string
  age: number
  sex: SixMinSex
  distance: number
  predicted: number
  assessment: string
}

export const SIXMWT_STORAGE_KEY = 'sixmwt_history_v1'
