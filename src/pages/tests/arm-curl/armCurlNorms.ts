/**
 * armCurlNorms.ts — Lógica normativa del Arm Curl Test 30 s (30s-ACT).
 *
 * Evalúa fuerza-resistencia del tren superior (flexión de codo con mancuerna).
 * Peso de mancuerna estándar: Mujer = 2 kg, Hombre = 4 kg.
 * Baremos P25/P75 por edad y sexo (Rikli & Jones / Exercise Right).
 *
 * Los textos clínicos están reproducidos del prototipo validado.
 */

export type ArmCurlGender = 'Hombre' | 'Mujer'

export interface ArmCurlNorm { p25: number; p75: number }

export interface ArmCurlAssessment {
  label: string
  tone: 'red' | 'blue' | 'green'
  desc: string
}

/** Peso de la mancuerna según sexo (kg). */
export function dumbbellWeight(gender: ArmCurlGender): number {
  return gender === 'Hombre' ? 4 : 2
}

/** Percentiles normativos por edad y sexo. */
export function getNormativeData(age: number, gender: ArmCurlGender): ArmCurlNorm {
  if (gender === 'Hombre') {
    if (age < 50) return { p25: 21, p75: 27 }
    if (age < 60) return { p25: 19, p75: 24 }
    return { p25: 16, p75: 22 } // 60+
  }
  if (age < 50) return { p25: 19, p75: 25 }
  if (age < 60) return { p25: 17, p75: 23 }
  return { p25: 13, p75: 19 } // 60+
}

/** Evaluación clínica con textos extensos (reproducidos del prototipo). */
export function evaluateArmCurl(age: number, gender: ArmCurlGender, reps: number): ArmCurlAssessment {
  const norms = getNormativeData(age, gender)

  if (reps < norms.p25) {
    return {
      label: 'BAJO (Riesgo)',
      tone: 'red',
      desc: 'Por debajo del percentil 25 para su rango de edad. Indica un déficit temprano en la resistencia muscular y un posible riesgo de dinapenia. Funcionalmente, puede experimentar fatiga limitante al realizar tareas instrumentales cotidianas (transportar bolsas de la compra, limpieza doméstica, manipulación de cargas). Además, esta debilidad en los brazos reduce la capacidad para amortiguar desequilibrios, elevando el riesgo de lesiones graves por caídas, y se asocia a un mayor riesgo cardiovascular y metabólico. Se recomienda encarecidamente iniciar un programa de entrenamiento de fuerza.',
    }
  }
  if (reps >= norms.p75) {
    return {
      label: 'EXCELENTE',
      tone: 'green',
      desc: 'Igual o superior al percentil 75 para su rango de edad. Demuestra un nivel de fuerza y resistencia funcional del tren superior muy por encima de la media poblacional. Esto denota una excelente salud muscular que protege de forma robusta su independencia funcional, facilita realizar tareas pesadas sin fatiga, mejora la respuesta de protección ante desequilibrios y caídas, y actúa como un fuerte factor protector a nivel sistémico y cardiovascular.',
    }
  }
  return {
    label: 'PROMEDIO (Normal)',
    tone: 'blue',
    desc: 'Rendimiento situado dentro de los valores normativos esperados (entre el percentil 25 y 75). Posee una capacidad muscular adecuada para mantener su independencia en las actividades instrumentales de la vida diaria. Mantener este nivel con un estilo de vida activo y ejercicio regular es clave para prevenir el declive biológico natural asociado al envejecimiento.',
  }
}

export const ARMCURL_TONE_CLASSES: Record<ArmCurlAssessment['tone'], string> = {
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export interface ArmCurlSession {
  id: number
  date: string
  age: number
  gender: ArmCurlGender
  reps: number
  assessment: string
}

export const ARMCURL_STORAGE_KEY = 'armcurl_history_v1'
