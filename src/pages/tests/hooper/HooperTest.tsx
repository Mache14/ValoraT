import { useState, useEffect, type ComponentType } from 'react'
import {
  ArrowLeft, X, CheckCircle2, RotateCcw, HeartPulse, ShieldCheck, ChevronLeft,
  BatteryCharging, Moon, Sparkles, Brain, Smile,
} from 'lucide-react'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { TestInstructions } from '../../../components/ui/TestInstructions'
import { getFeedback } from '../../../data/testFeedbackMessages'
import {
  HOOPER_QUESTIONS, STATUS_META, MIN_VARIABILITY,
  calculateHooperResult, hooperScoreToPercentile, loadHooperHistory, saveHooperSession, todayKey,
  type HooperResult, type HooperSession,
} from './hooperEngine'

/** Iconos lucide por nombre (los referenciados en HOOPER_QUESTIONS). */
const ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  BatteryCharging, Moon, Sparkles, Brain, Smile,
}

/** Clases tailwind literales por color temático (evita el purgado de clases dinámicas en v4). */
const COLOR: Record<string, { chipBg: string; chipText: string; bar: string }> = {
  amber:   { chipBg: 'bg-amber-50',   chipText: 'text-amber-500',   bar: 'bg-amber-400' },
  blue:    { chipBg: 'bg-blue-50',    chipText: 'text-blue-500',    bar: 'bg-blue-400' },
  emerald: { chipBg: 'bg-emerald-50', chipText: 'text-emerald-500', bar: 'bg-emerald-400' },
  purple:  { chipBg: 'bg-purple-50',  chipText: 'text-purple-500',  bar: 'bg-purple-400' },
  rose:    { chipBg: 'bg-rose-50',    chipText: 'text-rose-500',    bar: 'bg-rose-400' },
}

const SHORT_LABELS = ['Fatiga', 'Sueño', 'Dolor', 'Estrés', 'Ánimo']

/**
 * HooperTest — Índice de Hooper-Mackinnon: cuestionario subjetivo de bienestar (5 ítems).
 * Sin cámara ni vídeo. Flujo: bienvenida → 5 preguntas (una a una) → resultados (Z-Score
 * frente al historial personal). Diseñado para completarse 1 vez al día (upsert por fecha).
 */
export function HooperTest({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<'welcome' | 'questionnaire' | 'results'>('welcome')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([0, 0, 0, 0, 0])
  const [history, setHistory] = useState<HooperSession[]>([])
  const [result, setResult] = useState<HooperResult | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)

  useEffect(() => { setHistory(loadHooperHistory()) }, [])

  const todaySession = history.find((s) => s.date === todayKey())

  const startNew = () => { setAnswers([0, 0, 0, 0, 0]); setCurrentIdx(0); setScreen('questionnaire') }

  const viewToday = () => {
    if (!todaySession) return
    setResult({
      totalScore: todaySession.totalScore, scores: todaySession.scores, zScore: todaySession.zScore,
      status: todaySession.status, statusLabel: STATUS_META[todaySession.status].label,
      explanation: STATUS_META[todaySession.status].explanation,
    })
    setScreen('results')
  }

  // Registra la respuesta y avanza; al responder la 5ª, calcula y guarda (acción de usuario).
  const selectScore = (val: number) => {
    const next = [...answers]
    next[currentIdx] = val
    setAnswers(next)
    if (currentIdx < 4) {
      setCurrentIdx(currentIdx + 1)
      return
    }
    // Última pregunta → calcular frente a la línea base (días previos, sin hoy)
    const baseline = history.filter((s) => s.date !== todayKey())
    const res = calculateHooperResult(next, baseline)
    const session: HooperSession = {
      id: Date.now(), date: todayKey(), dateISO: new Date().toISOString(),
      scores: next, totalScore: res.totalScore, zScore: res.zScore, status: res.status,
    }
    setHistory(saveHooperSession(session)) // upsert por fecha
    setResult(res)
    setScreen('results')
  }

  const navigateBack = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1) }
  const requestExit = () => { if (currentIdx > 0 || answers.some((a) => a > 0)) setConfirmExit(true); else onBack() }

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      {/* ── WELCOME ── */}
      {screen === 'welcome' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
          <div className="flex items-center gap-3 pt-2 mb-6">
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                <HeartPulse size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Hooper Wellness</h1>
                <p className="text-xs text-slate-500">Índice de Bienestar</p>
              </div>
            </div>
          </div>

          {/* Aviso si ya completó hoy */}
          {todaySession && (
            <div className="bg-teal-50 border border-teal-200 rounded-3xl p-4 mb-4">
              <p className="text-sm text-teal-800 font-semibold mb-3">
                Ya completaste tu Hooper hoy (puntuación: {todaySession.totalScore}/25).
              </p>
              <div className="flex gap-3">
                <button onClick={viewToday}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Ver resultados
                </button>
                <button onClick={startNew}
                  className="flex-1 bg-white border-2 border-teal-200 text-teal-700 font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Hacer una nueva
                </button>
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <TestInstructions
            accent="teal"
            measures={<>Tu bienestar subjetivo de hoy en 5 dimensiones: fatiga, sueño, dolor muscular, estrés y estado de ánimo (Hooper &amp; Mackinnon, 1995; Saw et al., 2016).</>}
            how="Responde 5 preguntas puntuando del 1 (peor posible) al 5 (mejor posible). Se completa en menos de 30 segundos."
            keyRule="Responde con sinceridad sobre cómo te sientes HOY. Está pensado para completarse una sola vez al día."
            meaning="Detecta caídas inusuales comparando tu puntuación de hoy con tu historial personal (Z-Score). Una bajada significativa te avisa para ajustar tu actividad."
          />

          <button onClick={startNew}
            className="mt-auto mb-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 size={20} /> Comenzar Evaluación
          </button>
        </div>
      )}

      {/* ── QUESTIONNAIRE ── */}
      {screen === 'questionnaire' && (() => {
        const q = HOOPER_QUESTIONS[currentIdx]
        const c = COLOR[q.color]
        const Icon = ICONS[q.icon] ?? Sparkles
        return (
          <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
            <div className="flex items-center justify-between pt-2 mb-6">
              <button onClick={requestExit} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
                <X size={20} />
              </button>
              <span className="text-[11px] font-extrabold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                Pregunta {currentIdx + 1} de 5
              </span>
            </div>

            {/* Pregunta activa */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${c.chipBg} ${c.chipText}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{q.category}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{q.title}</h2>

              {/* Botonera 1-5 (neutros, sin retener selección) */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => selectScore(n)}
                    className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center transition-all active:scale-95">
                    <span className="block text-base font-bold text-slate-700">{n}</span>
                  </button>
                ))}
              </div>

              {/* Leyendas de los extremos */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 text-[11px] leading-tight">
                <div className="border-r border-slate-200 pr-2">
                  <span className="font-bold text-rose-600 block mb-0.5">Puntuación 1</span>
                  <span className="text-slate-500">{q.legendMin}</span>
                </div>
                <div className="pl-1">
                  <span className="font-bold text-emerald-600 block mb-0.5">Puntuación 5</span>
                  <span className="text-slate-500">{q.legendMax}</span>
                </div>
              </div>
            </div>

            <button onClick={navigateBack} disabled={currentIdx === 0}
              className="mt-5 self-start flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-teal-600 disabled:opacity-30 disabled:pointer-events-none transition-colors">
              <ChevronLeft size={18} /> Atrás
            </button>
          </div>
        )
      })()}

      {/* ── RESULTS ── */}
      {screen === 'results' && result && (() => {
        const meta = STATUS_META[result.status]
        const pct = hooperScoreToPercentile(result.totalScore)
        return (
          <div className="max-w-md mx-auto p-5 min-h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-2xl font-black text-slate-800">Tu Bienestar Hoy</h2>
              <button onClick={onBack} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
            </div>

            {/* Puntuación total */}
            <div className={`p-5 rounded-3xl text-center border ${meta.card}`}>
              <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-slate-400">Puntuación total</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className={`text-5xl font-black ${meta.text}`}>{result.totalScore}</span>
                <span className="text-xl font-bold text-slate-400">/ 25</span>
              </div>
              <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full border ${meta.badge}`}>
                {meta.label}
              </span>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Z-Score */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Z-Score (vs tu historial)</p>
                {result.zScore !== null
                  ? <p className="text-xs text-slate-500 mt-0.5">Desviación respecto a tu línea base personal.</p>
                  : <p className="text-xs text-slate-500 mt-0.5">Necesitas ≥3 días de historial para calcularlo.</p>}
              </div>
              {result.zScore !== null
                ? <span className={`text-2xl font-black ${result.zScore >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.zScore >= 0 ? `+${result.zScore.toFixed(2)}` : result.zScore.toFixed(2)}
                  </span>
                : <span className="text-2xl font-black text-slate-300">--</span>}
            </div>

            {/* Desglose por dimensión */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-700 mb-1">Desglose por dimensión</h3>
              {HOOPER_QUESTIONS.map((q, i) => (
                <div key={q.id} className="flex items-center gap-2.5">
                  <span className="w-14 text-[11px] font-bold text-slate-500 shrink-0">{SHORT_LABELS[i]}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${COLOR[q.color].bar}`} style={{ width: `${(result.scores[i] / 5) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right text-[11px] font-bold text-slate-700">{result.scores[i]}/5</span>
                </div>
              ))}
            </div>

            {/* Feedback por puntuación */}
            <FeedbackCard feedback={getFeedback('hooper', pct)} />

            {/* Evolución */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-2 text-center">Evolución del bienestar</h3>
              <div className="h-40">
                <HistoryLineChart data={history.map((h) => ({ label: h.date.slice(0, 5), score: h.totalScore }))} color="#14b8a6" unit="/25" />
              </div>
            </div>

            {/* Salvaguarda estadística */}
            <div className="bg-teal-50/60 border border-teal-100 p-3 rounded-xl text-[11px] text-teal-800/90 leading-relaxed flex items-start gap-2">
              <ShieldCheck size={16} className="text-teal-500 shrink-0 mt-0.5" />
              <span>
                <strong>Salvaguarda estadística:</strong> aplicamos una variabilidad mínima de {MIN_VARIABILITY} puntos de desviación típica. Si tu histórico es muy estable, evitamos falsas alarmas severas por los cambios normales del día a día.
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={onBack}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200 flex items-center justify-center gap-2 transition-colors">
                <CheckCircle2 size={18} /> Guardar y Volver
              </button>
              <button onClick={startNew}
                className="flex-1 bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                <RotateCcw size={18} /> Nuevo Test
              </button>
            </div>
          </div>
        )
      })()}

      <ConfirmDialog
        open={confirmExit}
        title="Abandonar cuestionario"
        message="Si sales ahora perderás las respuestas de hoy. ¿Quieres abandonar el cuestionario?"
        onConfirm={() => { setConfirmExit(false); onBack() }}
        onCancel={() => setConfirmExit(false)}
      />
    </div>
  )
}
