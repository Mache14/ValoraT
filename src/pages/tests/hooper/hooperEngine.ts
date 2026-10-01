/**
 * hooperEngine.ts — Motor y datos del Índice de Hooper-Mackinnon (Hooper Wellness Tracker).
 *
 * Cuestionario subjetivo de bienestar de 5 ítems (1-5 cada uno → total 5-25). La métrica
 * clave NO es un percentil poblacional, sino el Z-Score frente al historial PERSONAL del
 * usuario, con una salvaguarda de variabilidad mínima (SD ≥ 1.2) que evita falsos positivos
 * cuando el histórico es ultraestable (bug crítico documentado en el informe del prototipo).
 *
 * NOTA SOBRE LOS 5 ÍTEMS: el Índice de Hooper-Mackinnon ORIGINAL (1995) consta de 4 ítems
 * (sueño, fatiga, estrés y dolor muscular). La versión de 5 ítems empleada aquí —que añade el
 * "estado de ánimo" con escala 1-5 y total 5-25— corresponde al CUESTIONARIO DE BIENESTAR
 * MODIFICADO de McLean et al. (2010), ampliamente usado en monitorización del bienestar. Las
 * preguntas se han adaptado a población sedentaria/recreacional de 40-65 años (ver campos
 * `adaptationNote` y `adaptationSource` de cada ítem).
 *
 * Referencias: Hooper, S.L. & Mackinnon, L.T. (1995). Monitoring overtraining in athletes.
 * Sports Medicine, 20(5), 321-327 [doi:10.2165/00007256-199520050-00003]. McLean, B.D. et al.
 * (2010). IJSPP, 5(3), 367-383 [doi:10.1123/ijspp.5.3.367]. Saw, A.E., Main, L.C. & Gastin, P.B.
 * (2016). BJSM, 50(5), 281-291 [doi:10.1136/bjsports-2015-094758].
 */

export interface HooperQuestion {
  id: string
  category: string
  title: string
  legendMin: string        // explicación del valor 1
  legendMax: string        // explicación del valor 5
  icon: string             // nombre del icono lucide-react
  color: string            // color temático (amber | blue | emerald | purple | rose)
  adaptationNote: string   // qué se adaptó y por qué (población sedentaria/recreacional de 40-65 años)
  adaptationSource: string // referencia(s) científica(s) que respaldan la adaptación
}

/** Las 5 preguntas del protocolo (textos exactos del prototipo). */
export const HOOPER_QUESTIONS: HooperQuestion[] = [
  {
    id: 'fatigue',
    category: 'Fatiga General',
    title: '¿Cómo describirías hoy tu nivel general de fatiga y energía (teniendo en cuenta también el cansancio del día a día: trabajo, tareas y descanso)?',
    legendMin: 'Agotamiento total, sin energía para mis actividades cotidianas',
    legendMax: 'Lleno de energía, descansado y con máxima vitalidad',
    icon: 'BatteryCharging',
    color: 'amber',
    adaptationNote: 'Se evalúa la fatiga de forma global (no solo la derivada del ejercicio): en adultos de 40-65 años poco activos, la fatiga diaria depende sobre todo de estresores cotidianos —laborales, de sueño y vitales—, no del entrenamiento. Por eso se retira del extremo bajo la referencia a "ser incapaz de entrenar".',
    adaptationSource: 'Saw, Main & Gastin (2016); carga alostática de McEwen (1998), que se acumula con la edad (Seeman et al., 2001).',
  },
  {
    id: 'sleep',
    category: 'Calidad del Sueño',
    title: '¿Cómo fue el descanso nocturno de tu última noche?',
    legendMin: 'Insomnio severo, sueño fragmentado y muy cansado',
    legendMax: 'Sueño profundo, reparador e ininterrumpido',
    icon: 'Moon',
    color: 'blue',
    adaptationNote: 'El ítem se conserva porque la calidad del sueño es un marcador de recuperación universal, pero su interpretación se calibra por edad: a partir de los 40-65 años el sueño se fragmenta y disminuye el sueño profundo de forma fisiológica. Por ello no se compara con una norma de joven deportista, sino con la línea base personal del usuario (Z-Score).',
    adaptationSource: 'Hooper & Mackinnon (1995); Ohayon et al. (2004); McEwen (1998).',
  },
  {
    id: 'pain',
    category: 'Dolor Muscular (DOMS)',
    title: '¿Sientes hoy dolor muscular o agujetas (por actividad física reciente o por esfuerzos poco habituales del día a día)?',
    legendMin: 'Dolor incapacitante y rigidez generalizada',
    legendMax: 'Músculos relajados, libres de molestias o tensión',
    icon: 'Sparkles',
    color: 'emerald',
    adaptationNote: 'Se amplía "esfuerzos previos" para incluir gestos cotidianos poco habituales, no solo el entrenamiento. En personas desentrenadas, cargas absolutas bajas ya producen agujetas y daño muscular desproporcionados (fase de alarma); además, a partir de los 40-65 años el músculo es más susceptible al daño y la recuperación es más lenta.',
    adaptationSource: 'Clarkson & Hubal (2002); Selye (1950); y, para la edad, Fell & Williams (2008).',
  },
  {
    id: 'stress',
    category: 'Nivel de Estrés',
    title: '¿Cuál es hoy tu nivel de estrés o tensión mental (laboral, familiar o personal)?',
    legendMin: 'Ansiedad extrema, agobiado y mente dispersa',
    legendMax: 'Total calma mental, enfocado y libre de tensiones',
    icon: 'Brain',
    color: 'purple',
    adaptationNote: 'Se explicita el origen cotidiano del estrés (laboral, familiar, personal) porque en población de 40-65 años poco activa el estrés psicosocial domina la carga total; el organismo no distingue el origen del estresor: físico, psicológico o social convergen en los mismos mediadores neuroendocrinos.',
    adaptationSource: 'Carga alostática de McEwen (1998), acumulativa con la edad (Seeman et al., 2001); medidas subjetivas sensibles a estresores no deportivos (Saw et al., 2016).',
  },
  {
    id: 'mood',
    category: 'Estado de Ánimo',
    title: '¿Cómo valoras tu disposición emocional y motivacional hoy?',
    legendMin: 'Irritable, apático, triste o desmotivado',
    legendMax: 'Sumamente positivo, entusiasmado y motivado',
    icon: 'Smile',
    color: 'rose',
    adaptationNote: 'Aclaración importante: este 5.º ítem NO pertenece al Hooper-Mackinnon original de 4 ítems; corresponde al cuestionario de bienestar modificado de 5 ítems (McLean et al., 2010). Se conserva porque la disposición emocional/motivacional es un marcador temprano de sobrecarga y, en población poco motivada de 40-65 años, es determinante de la adherencia al programa.',
    adaptationSource: 'McLean et al. (2010); Meeusen et al. (2013).',
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
