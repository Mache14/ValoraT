/**
 * reportSampleData.ts — Perfil de DEMOSTRACIÓN para el Informe de Salud Integral.
 *
 * Datos fijos y coherentes (no se leen de localStorage) para generar un informe completo
 * que pueda enseñarse al tribunal: todas las dimensiones medidas, con feedback clínico
 * (reutilizado de testFeedbackMessages.ts), monitorización y plan de acción.
 *
 * Persona: mujer sedentaria de 58 años. La historia: equilibrio en zona crítica (riesgo de
 * caída), cognición y movilidad en ámbar, fuerza por debajo de la media y calidad de vida
 * aceptable. Esto da sentido a las alertas y al plan de acción.
 */

import type { FeedbackTestKey } from './testFeedbackMessages'

export type Sexo = 'H' | 'M'
export type DomainKey =
  | 'fuerza' | 'resistencia' | 'equilibrio' | 'coordinacion'
  | 'flexibilidad' | 'movilidad' | 'cognitivo' | 'calidad_vida'
  | 'composicion_corporal'

export interface ReportUser {
  nombre: string
  edad: number
  sexo: Sexo
  altura_cm: number
  peso_kg: number
  imc: number
  perimetro_cintura_cm: number
}

export interface ReportTest {
  nombre: string               // nombre mostrado de la prueba
  valor: string                // resultado formateado con unidad, p. ej. "95 s"
  fecha: string                // dd/mm/aaaa
  percentil: number            // 0-100
}

/** Bloque de feedback clínico (mismo contrato que PercentileFeedback). */
export interface ReportFeedback {
  performance: string
  healthImplication: string
  recommendation: string
  citation: string
}

export interface ReportDomain {
  key: DomainKey
  nombre: string
  percentil: number             // percentil agregado del dominio
  /** Reutiliza los 66 mensajes de testFeedbackMessages.ts… */
  feedbackKey?: FeedbackTestKey
  /** …o feedback explícito para dominios sin clave propia (flexibilidad, composición corporal). */
  feedback?: ReportFeedback
  tests: ReportTest[]
}

export interface PlanAccionItem {
  titulo: string
  detalle: string
  frecuencia: string
  prioridad: 'alta' | 'media' | 'baja'
}

export interface HealthReport {
  user: ReportUser
  fechaGeneracion: string
  indiceFragilidad: number     // 0 (robusto) – 5 (frágil)
  fragilidadEtiqueta: string
  percentilGlobal: number
  dominios: ReportDomain[]
  monitoringHooper: { label: string; score: number }[] // 14 días (totalScore 5-25)
  hooperZScore: number
  hooperEstado: string
  planAccion: PlanAccionItem[]
}

/** Semáforo (etiqueta + color de marca) a partir de un percentil. */
export function semaforo(p: number): { label: string; color: string; bg: string } {
  if (p >= 75) return { label: 'Óptimo', color: '#10b981', bg: '#ecfdf5' } // emerald
  if (p >= 60) return { label: 'Bueno', color: '#34d399', bg: '#f0fdf4' }
  if (p >= 40) return { label: 'Medio', color: '#6366f1', bg: '#eef2ff' }  // indigo
  if (p >= 25) return { label: 'Bajo', color: '#f59e0b', bg: '#fffbeb' }   // amber
  return { label: 'Crítico', color: '#f43f5e', bg: '#fff1f2' }             // rose
}

const F = '12/06/2026'

export const SAMPLE_HEALTH_REPORT: HealthReport = {
  user: {
    nombre: 'María García López',
    edad: 58,
    sexo: 'M',
    altura_cm: 162,
    peso_kg: 74,
    imc: 28.2,
    perimetro_cintura_cm: 92,
  },
  fechaGeneracion: '30/06/2026',
  indiceFragilidad: 2.0,
  fragilidadEtiqueta: 'Riesgo bajo-moderado',
  percentilGlobal: 43,
  dominios: [
    {
      key: 'equilibrio', nombre: 'Equilibrio', percentil: 20, feedbackKey: 'balance',
      tests: [
        { nombre: 'Equilibrio unipodal — ojos abiertos', valor: '18 s', fecha: F, percentil: 22 },
        { nombre: 'Equilibrio unipodal — ojos cerrados', valor: '4,5 s', fecha: F, percentil: 18 },
      ],
    },
    {
      key: 'movilidad', nombre: 'Movilidad funcional', percentil: 30, feedbackKey: 'tug',
      tests: [
        { nombre: 'Timed Up and Go (TUG)', valor: '11,5 s', fecha: F, percentil: 30 },
      ],
    },
    {
      key: 'cognitivo', nombre: 'Cognición', percentil: 38, feedbackKey: 'tmt',
      tests: [
        { nombre: 'Trail Making Test (TMT-B)', valor: '95 s', fecha: F, percentil: 30 },
        { nombre: 'PVT-B (vigilancia psicomotora)', valor: '320 ms', fecha: F, percentil: 45 },
      ],
    },
    {
      key: 'fuerza', nombre: 'Fuerza', percentil: 43, feedbackKey: 'sts30',
      tests: [
        { nombre: 'Sit-to-Stand 5 rep (5-STS)', valor: '11,2 s', fecha: F, percentil: 35 },
        { nombre: 'Sit-to-Stand 30 s (30-STS)', valor: '13 rep', fecha: F, percentil: 40 },
        { nombre: 'Arm Curl 30 s', valor: '17 rep', fecha: F, percentil: 55 },
      ],
    },
    {
      key: 'flexibilidad', nombre: 'Flexibilidad', percentil: 38,
      feedback: {
        performance: 'Tu resultado en el Chair Sit-and-Reach indica una flexibilidad de la cadena posterior (isquiosurales y zona lumbar) por debajo de la media para tu edad, sin llegar a tocar la punta del pie.',
        healthImplication: 'Una flexibilidad reducida de la cadena posterior limita el rango de movimiento funcional, dificulta gestos cotidianos (agacharse, calzarse) y se asocia con mayor rigidez y molestias lumbares.',
        recommendation: 'Incorpora una rutina diaria breve de estiramientos de isquiosurales y movilidad de cadera, así como trabajo activo del rango de movimiento, preferiblemente con orientación profesional.',
        citation: 'Rikli & Jones (2013); ACSM (2021)',
      },
      tests: [
        { nombre: 'Chair Sit-and-Reach', valor: '-6 cm', fecha: F, percentil: 38 },
      ],
    },
    {
      key: 'resistencia', nombre: 'Resistencia cardiorrespiratoria', percentil: 50, feedbackKey: '6mwt',
      tests: [
        { nombre: '2-Minute Step Test', valor: '78 pasos', fecha: F, percentil: 48 },
        { nombre: '6-Minute Walk Test (6MWT)', valor: '480 m', fecha: F, percentil: 52 },
      ],
    },
    {
      key: 'coordinacion', nombre: 'Coordinación', percentil: 50, feedbackKey: 'balltoss',
      tests: [
        { nombre: 'Alternate Hand Wall Toss (AHWTT)', valor: '19 recep.', fecha: F, percentil: 50 },
      ],
    },
    {
      key: 'composicion_corporal', nombre: 'Composición corporal (Antropometría)', percentil: 40,
      feedback: {
        performance: 'Tu IMC (28,2 kg/m²) se sitúa en rango de sobrepeso y el perímetro de cintura (92 cm) junto al ratio cintura-altura (0,57) superan el umbral de riesgo cardiometabólico. El porcentaje de masa muscular está en el límite inferior.',
        healthImplication: 'La adiposidad central elevada (WHtR ≥ 0,5) se asocia con mayor riesgo cardiovascular y metabólico, y una masa muscular baja con riesgo de sarcopenia y pérdida de autonomía funcional.',
        recommendation: 'Combina entrenamiento de fuerza para preservar masa muscular con actividad aeróbica y ajuste dietético orientado a reducir perímetro de cintura, idealmente con seguimiento profesional.',
        citation: 'Cruz-Jentoft et al. (2019, EWGSOP2); Ashwell et al. (2012)',
      },
      tests: [
        { nombre: 'Índice de Masa Corporal (IMC)', valor: '28,2 kg/m²', fecha: F, percentil: 38 },
        { nombre: 'Perímetro de cintura', valor: '92 cm', fecha: F, percentil: 30 },
        { nombre: 'Ratio cintura-altura (WHtR)', valor: '0,57', fecha: F, percentil: 32 },
        { nombre: 'Masa grasa (bioimpedancia)', valor: '38 %', fecha: F, percentil: 35 },
        { nombre: 'Masa muscular (bioimpedancia)', valor: '24,6 kg', fecha: F, percentil: 45 },
      ],
    },
    {
      key: 'calidad_vida', nombre: 'Calidad de vida (bienestar)', percentil: 72, feedbackKey: 'hooper',
      tests: [
        { nombre: 'Índice de Hooper-Mackinnon (5 ítems)', valor: '20 / 25', fecha: F, percentil: 72 },
      ],
    },
  ],
  // Monitorización: 14 días de Hooper (totalScore 5-25) con un valle de fatiga y recuperación.
  monitoringHooper: [
    { label: '17/06', score: 19 }, { label: '18/06', score: 21 }, { label: '19/06', score: 20 },
    { label: '20/06', score: 18 }, { label: '21/06', score: 17 }, { label: '22/06', score: 16 },
    { label: '23/06', score: 18 }, { label: '24/06', score: 20 }, { label: '25/06', score: 21 },
    { label: '26/06', score: 22 }, { label: '27/06', score: 20 }, { label: '28/06', score: 19 },
    { label: '29/06', score: 21 }, { label: '30/06', score: 20 },
  ],
  hooperZScore: 0.3,
  hooperEstado: 'Estable',
  planAccion: [
    {
      titulo: 'Entrenamiento propioceptivo y de equilibrio',
      detalle: 'Prioridad por el riesgo de caída: progresión de apoyo unipodal, superficies inestables y marcha en tándem en un entorno seguro y supervisado.',
      frecuencia: '3 sesiones/semana',
      prioridad: 'alta',
    },
    {
      titulo: 'Fuerza del tren inferior',
      detalle: 'Sentadilla a silla, subir/bajar escalón y trabajo de extensores de rodilla y cadera para revertir la pérdida de fuerza funcional (prevención de sarcopenia).',
      frecuencia: '2-3 sesiones/semana',
      prioridad: 'alta',
    },
    {
      titulo: 'Estímulo cognitivo + ejercicio aeróbico',
      detalle: 'Caminatas a ritmo vivo combinadas con tareas cognitivas (doble tarea) para mejorar velocidad de procesamiento y función ejecutiva.',
      frecuencia: '150 min/semana de aeróbico',
      prioridad: 'media',
    },
    {
      titulo: 'Movilidad y flexibilidad de cadena posterior',
      detalle: 'Rutina diaria breve de movilidad de cadera/tobillo y estiramiento de isquiosurales para mejorar el TUG y el sit-and-reach.',
      frecuencia: 'Diario (5-10 min)',
      prioridad: 'media',
    },
    {
      titulo: 'Higiene del sueño y gestión del estrés',
      detalle: 'Mantener el registro diario de bienestar (Hooper) para vigilar la carga alostática y sostener la adherencia al programa.',
      frecuencia: 'Registro diario',
      prioridad: 'baja',
    },
  ],
}
