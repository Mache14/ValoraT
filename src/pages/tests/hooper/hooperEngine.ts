/**
 * hooperEngine.ts — Motor y datos del Índice de Hooper-Mackinnon (Hooper Wellness Tracker).
 *
 * Cuestionario subjetivo de bienestar de 5 ítems (1-5 cada uno → total 5-25). La métrica
 * clave NO es un percentil poblacional, sino el Z-Score frente al historial PERSONAL del
 * usuario, con una salvaguarda de variabilidad mínima (SD ≥ 1.2) que evita falsos positivos
 * cuando el histórico es ultraestable (bug crítico documentado en el informe del prototipo).
 *
 * Referencias: Hooper, S.L. & Mackinnon, L.T. (1995). Monitoring overtraining in athletes.
 * Sports Medicine, 20(5), 321-327. Saw, A.E., Main, L.C. & Gastin, P.B. (2016). BJSM, 50(5).
 */

export interface HooperQuestion {
  id: string
  category: string
  title: string
  legendMin: string // explicación del valor 1
  legendMax: string // explicación del valor 5
  icon: string      // nombre del icono lucide-react
  color: string     // color temático (amber | blue | emerald | purple | rose)
}

/** Las 5 preguntas del protocolo (textos exactos del prototipo). */
export const HOOPER_QUESTIONS: HooperQuestion[] = [
  {
    id: 'fatigue',
    category: 'Fatiga General',
    title: '¿Cómo describirías tu nivel de fatiga muscular y de energía hoy?',
    legendMin: 'Agotamiento absoluto y total (incapaz de entrenar)',
    legendMax: 'Lleno de energía, descansado y con máxima vitalidad',
    icon: 'BatteryCharging',
    color: 'amber',
  },
  {
    id: 'sleep',
    category: 'Calidad del Sueño',
    title: '¿Cómo fue el descanso nocturno de tu última noche?',
    legendMin: 'Insomnio severo, sueño fragmentado y muy cansado',
    legendMax: 'Sueño profundo, reparador e ininterrumpido',
    icon: 'Moon',
    color: 'blue',
  },
  {
    id: 'pain',
    category: 'Dolor Muscular (DOMS)',
    title: '¿Sientes dolor muscular o agujetas por esfuerzos previos?',
    legendMin: 'Dolor incapacitante y rigidez generalizada',
    legendMax: 'Músculos relajados, libres de molestias o tensión',
    icon: 'Sparkles',
    color: 'emerald',
  },
  {
    id: 'stress',
    category: 'Nivel de Estrés',
    title: '¿Cuál es tu nivel de tensión mental o estrés psicológico hoy?',
    legendMin: 'Ansiedad extrema, agobiado y mente dispersa',
    legendMax: 'Total calma mental, enfocado y libre de tensiones',
    icon: 'Brain',
    color: 'purple',
  },
  {
    id: 'mood',
    category: 'Estado de Ánimo',
    title: '¿Cómo valoras tu disposición emocional y motivacional hoy?',
    legendMin: 'Irritable, apático, triste o desmotivado',
    legendMax: 'Sumamente positivo, entusiasmado y motivado',
    icon: 'Smile',
    color: 'rose',
  },
]

/** Color hex por dimensión (orden: fatiga, sueño, dolor, estrés, ánimo) — para el desglose. */
export const DIMENSION_COLORS = ['#fbbf24', '#60a5fa', '#34d399', '#c084fc', '#f43f5e']

export type AdaptationStatus = 'optimal' | 'stable' | 'warning' | 'critical'

export interface StatusMeta {
  label: string
  explanation: string
  /** clases tailwind para el badge/tarjeta del estado */
  badge: string
  card: string
  text: string
}

/** Metadatos de cada estado de adaptación (textos exactos del prototipo). */
export const STATUS_META: Record<AdaptationStatus, StatusMeta> = {
  optimal: {
    label: 'Homeostasis / Óptimo',
    explanation:
      'Luz Verde: tu asimilación de la carga es excelente. Estás en un estado óptimo para entrenar o responder a demandas mentales intensas hoy.',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    card: 'bg-emerald-50/60 border-emerald-200',
    text: 'text-emerald-600',
  },
  stable: {
    label: 'Estable / Adaptado',
    explanation:
      'Normalidad: tus valores fisiológicos están dentro de tu rango diario esperado de adaptación. Continúa con tu planificación normal.',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    card: 'bg-white border-slate-200',
    text: 'text-slate-700',
  },
  warning: {
    label: 'Aviso: Fluctuación Leve',
    explanation:
      'Variabilidad Normal: hemos detectado una leve caída en tu bienestar habitual. Puede ser ruido diario normal, pero te sugerimos regular la intensidad de tus tareas hoy.',
    badge: 'bg-amber-50 text-amber-600 border-amber-200',
    card: 'bg-amber-50/60 border-amber-200',
    text: 'text-amber-600',
  },
  critical: {
    label: 'Alerta: Fatiga Severa',
    explanation:
      'Aviso Clínico: tu bienestar de hoy se encuentra significativamente desadaptado respecto a tu histórico. Te aconsejamos descanso completo o una reducción radical del volumen de entrenamiento.',
    badge: 'bg-rose-50 text-rose-600 border-rose-200',
    card: 'bg-rose-50/60 border-rose-200',
    text: 'text-rose-600',
  },
}

export interface HooperResult {
  totalScore: number      // 5-25
  scores: number[]        // [fatigue, sleep, pain, stress, mood]
  zScore: number | null   // Z-Score vs historial (null si < 3 sesiones)
  status: AdaptationStatus
  statusLabel: string
  explanation: string
}

/** Variabilidad fisiológica mínima: evita falsos positivos con históricos ultraestables. */
export const MIN_VARIABILITY = 1.2

/** Umbral de puntuación absoluta que anula cualquier alarma (homeostasis). */
const OPTIMAL_THRESHOLD = 19

/** Número mínimo de sesiones históricas para poder calcular el Z-Score. */
export const MIN_HISTORY_FOR_Z = 3

export interface HooperSession {
  id: number
  date: string            // 'DD/MM/YYYY'
  dateISO: string         // ISO 8601 para ordenación
  scores: number[]        // [fatigue, sleep, pain, stress, mood]
  totalScore: number
  zScore: number | null
  status: AdaptationStatus
}

export const HOOPER_STORAGE_KEY = 'hooper_history_v1'

/**
 * Motor clínico: calcula el resultado del día frente al historial personal.
 * @param todayScores  las 5 puntuaciones de hoy (1-5)
 * @param history      sesiones PREVIAS (sin incluir la de hoy)
 */
export function calculateHooperResult(todayScores: number[], history: HooperSession[]): HooperResult {
  const totalScore = todayScores.reduce((a, b) => a + (b || 0), 0)
  const base = { totalScore, scores: [...todayScores] }

  // Sin historial suficiente: clasificación por umbrales absolutos, sin Z-Score.
  if (history.length < MIN_HISTORY_FOR_Z) {
    const status = absoluteStatus(totalScore)
    return { ...base, zScore: null, status, statusLabel: STATUS_META[status].label, explanation: STATUS_META[status].explanation }
  }

  // Línea base personal: media y desviación estándar de los totales históricos.
  const totals = history.map((h) => h.totalScore)
  const n = totals.length
  const mean = totals.reduce((a, b) => a + b, 0) / n
  const variance = totals.reduce((a, b) => a + (b - mean) ** 2, 0) / n
  let stdDev = Math.sqrt(variance)
  // Salvaguarda de variabilidad mínima (regularización anti-falsos-positivos).
  if (stdDev < MIN_VARIABILITY) stdDev = MIN_VARIABILITY

  const zScore = +((totalScore - mean) / stdDev).toFixed(2)

  let status: AdaptationStatus
  if (totalScore >= OPTIMAL_THRESHOLD) status = 'optimal' // el puntaje excelente anula alarmas
  else if (zScore < -1.5) status = 'critical'
  else if (zScore < -0.8) status = 'warning'
  else status = 'stable'

  return { ...base, zScore, status, statusLabel: STATUS_META[status].label, explanation: STATUS_META[status].explanation }
}

/** Clasificación por umbral absoluto (cuando no hay historial para Z-Score). */
function absoluteStatus(total: number): AdaptationStatus {
  if (total >= OPTIMAL_THRESHOLD) return 'optimal'
  if (total >= 15) return 'stable'
  if (total >= 10) return 'warning'
  return 'critical'
}

/**
 * Pseudo-percentil para integrar el Hooper con el sistema de feedback de la app
 * (que trabaja con percentiles 0-100). Mapea la puntuación total 5-25 a un percentil
 * representativo dentro del bin correspondiente de `percentileToRange`.
 */
export function hooperScoreToPercentile(total: number): number {
  if (total <= 10) return 15  // <P25
  if (total <= 14) return 32  // P25-P40
  if (total <= 17) return 50  // P40-P60
  if (total <= 19) return 67  // P60-P75
  if (total <= 22) return 82  // P75-P90
  return 95                   // P90-P100
}

/** Fecha de hoy en formato 'DD/MM/YYYY' (para detectar/sustituir la sesión del día). */
export function todayKey(d: Date = new Date()): string {
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Carga el historial ordenado cronológicamente (más antiguo → más reciente). */
export function loadHooperHistory(): HooperSession[] {
  try {
    const raw = localStorage.getItem(HOOPER_STORAGE_KEY)
    const list: HooperSession[] = raw ? JSON.parse(raw) : []
    return list.sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  } catch {
    return []
  }
}

/** Guarda una sesión haciendo upsert por fecha (una sola entrada por día). */
export function saveHooperSession(session: HooperSession): HooperSession[] {
  const list = loadHooperHistory().filter((s) => s.date !== session.date)
  const next = [...list, session].sort((a, b) => a.dateISO.localeCompare(b.dateISO))
  try { localStorage.setItem(HOOPER_STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
  return next
}
