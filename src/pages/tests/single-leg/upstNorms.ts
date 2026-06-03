/**
 * upstNorms.ts — Matriz normativa del Unipodal Stance Test (equilibrio estático).
 * Percentiles del tiempo de apoyo monopodal (segundos) por modalidad, cohorte de
 * edad (quinquenios 40-65) y sexo.
 *
 * Coherencia matemática verificada: P25 < P50 < P75 en todas las celdas
 * (el bug de cohortes invertidas — P50 > P75 — está corregido). En "Ojos Abiertos"
 * existe efecto techo a 45 s, por lo que P50 y P75 pueden converger (se gestiona en la UI).
 *
 * Referencia: Springer et al. (2007) e interpolación por quinquenios.
 */

export type Modality = 'Ojos Abiertos' | 'Ojos Cerrados'
export type Sex = 'Masculino' | 'Femenino'

export interface Percentiles {
  p25: number
  p50: number
  p75: number
}

// Celda que puede ser común a ambos sexos o tener variante por sexo
type Cell = Percentiles | { Masculino: Percentiles; Femenino: Percentiles }

const MATRIX: Record<Modality, Record<string, Cell>> = {
  'Ojos Abiertos': {
    // Efecto techo (límite 45 s): P50 y P75 convergen en 45.0
    '40-44': { p25: 40.0, p50: 45.0, p75: 45.0 },
    '45-49': { p25: 40.0, p50: 45.0, p75: 45.0 },
    '50-54': { Femenino: { p25: 33.0, p50: 45.0, p75: 45.0 }, Masculino: { p25: 37.0, p50: 45.0, p75: 45.0 } },
    '55-59': { Femenino: { p25: 31.0, p50: 45.0, p75: 45.0 }, Masculino: { p25: 35.0, p50: 45.0, p75: 45.0 } },
    '60-65': { Femenino: { p25: 10.0, p50: 25.0, p75: 42.0 }, Masculino: { p25: 12.0, p50: 29.0, p75: 45.0 } },
  },
  'Ojos Cerrados': {
    // P25 < P50 < P75 garantizado (corrección de cohortes aplicada)
    '40-44': { p25: 6.0, p50: 15.8, p75: 25.0 },
    '45-49': { p25: 5.0, p50: 12.6, p75: 20.0 },
    '50-54': { p25: 4.0, p50: 11.2, p75: 16.0 },
    '55-59': { p25: 3.0, p50: 7.6, p75: 12.0 },
    '60-65': { p25: 1.5, p50: 5.0, p75: 8.0 },
  },
}

function ageGroup(age: number): string | null {
  if (age >= 40 && age <= 44) return '40-44'
  if (age >= 45 && age <= 49) return '45-49'
  if (age >= 50 && age <= 54) return '50-54'
  if (age >= 55 && age <= 59) return '55-59'
  if (age >= 60 && age <= 65) return '60-65'
  return null
}

/** Devuelve los percentiles para una modalidad/sexo/edad, o null si fuera de rango. */
export function getPercentiles(modality: Modality, sex: Sex, age: number): Percentiles | null {
  const group = ageGroup(age)
  if (!group) return null
  const cell = MATRIX[modality][group]
  if (!cell) return null
  if ('p25' in cell) return cell
  return cell[sex]
}

/** Clasifica un tiempo final respecto a los percentiles (con emoji por categoría). */
export function classify(time: number, p: Percentiles): string {
  if (time >= p.p75) return '🟢 Rendimiento Excelente (> P75)'
  if (time >= p.p50) return '🔵 Por encima de la media (> P50)'
  if (time >= p.p25) return '🟠 Rendimiento Normal (> P25)'
  return '🔴 Bajo lo normal (< P25)'
}
