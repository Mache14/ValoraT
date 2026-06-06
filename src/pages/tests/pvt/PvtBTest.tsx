import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Play, Zap, Trash2, CheckCircle2, AlertTriangle, Brain, X, Smartphone, Timer, MousePointerClick } from 'lucide-react'
import { useWebAudio } from '../../../hooks/useWebAudio'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { estimatePercentile } from '../../../utils/percentileUtils'
import { getFeedback } from '../../../data/testFeedbackMessages'
import { tribeValuesFor } from '../../../data/mockTribeData'
import { TestInstructions } from '../../../components/ui/TestInstructions'

/**
 * PvtBTest — Brief Psychomotor Vigilance Task (Basner & Dinges, 2011).
 * Mide el tiempo de reacción y la atención sostenida (fatiga del SNC).
 *
 * Umbrales clínicos: lapse ≥355 ms, anticipación <100 ms, ISI 2-10 s.
 * Motor Z-Score: compara la sesión actual con la línea base personal del usuario.
 *
 * Las pantallas de configuración y resultados usan el tema claro de ValoraT;
 * el ÁREA DE DISPARO mantiene fondo oscuro (necesario clínicamente para minimizar
 * la fatiga visual). Cronometría con performance.now() y captura con pointerdown.
 */

interface PvtBTestProps {
  onBack: () => void
}

interface Session {
  id: number
  date: string
  duration: number
  meanSpeed: number
  meanRt: number
  lapses: number
  anticipations: number
  score: number
}

const EXTREME_LAPSE_TIMEOUT = 10000
const LAPSE_THRESHOLD = 355
const ANTICIPATION_THRESHOLD = 100
const STORAGE_KEY = 'pvtb_history_v1'

type Screen = 'dashboard' | 'test' | 'results'
type Feedback = { kind: 'optimal' | 'lapse' | 'anticipation'; rt: number } | null

export function PvtBTest({ onBack }: PvtBTestProps) {
  const audio = useWebAudio()

  const [screen, setScreen] = useState<Screen>('dashboard')
  const [duration, setDuration] = useState(30)
  const [vibration, setVibration] = useState(true)
  const [history, setHistory] = useState<Session[]>([])

  const [timerLabel, setTimerLabel] = useState('00:00')
  const [trialCount, setTrialCount] = useState(0)
  const [liveLapses, setLiveLapses] = useState(0)
  const [visualMs, setVisualMs] = useState<number | null>(null) // ms mostrados durante el estímulo
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [results, setResults] = useState<ReturnType<typeof computeResults> | null>(null)
  const [showAbandon, setShowAbandon] = useState(false)

  // Refs para el motor de cronometría (leídos en callbacks asíncronos)
  const testActiveRef = useRef(false)
  const trialActiveRef = useRef(false)
  const trialStartRef = useRef(0)
  const trialsRef = useRef<number[]>([])
  const isiTimerRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const durIntervalRef = useRef<number | null>(null)
  const testStartRef = useRef(0)
  const tempSessionRef = useRef<Session | null>(null)
  // Refs a las últimas versiones de las funciones (evitan referencias cruzadas obsoletas)
  const scheduleRef = useRef<() => void>(() => {})
  const handleResponseRef = useRef<(rt: number) => void>(() => {})
  const endTestRef = useRef<() => void>(() => {})

  // Cargar historial al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      setHistory(stored ? JSON.parse(stored) : [])
    } catch { setHistory([]) }
  }, [])

  // Limpieza al desmontar
  useEffect(() => () => {
    if (isiTimerRef.current) clearTimeout(isiTimerRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (durIntervalRef.current) clearInterval(durIntervalRef.current)
  }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  const vibrate = useCallback((pattern: number | number[]) => {
    if (vibration && 'vibrate' in navigator) { try { navigator.vibrate(pattern) } catch { /* */ } }
  }, [vibration])

  // ── Bucle del test ──
  const scheduleNextStimulus = useCallback(() => {
    if (!testActiveRef.current) return
    setVisualMs(null)
    setFeedback(null)
    const isi = 2000 + Math.random() * 8000 // 2-10 s
    isiTimerRef.current = window.setTimeout(() => {
      if (!testActiveRef.current) return
      trialActiveRef.current = true
      trialStartRef.current = performance.now()
      audio.playStart()
      const step = () => {
        if (!trialActiveRef.current || !testActiveRef.current) return
        const elapsed = performance.now() - trialStartRef.current
        setVisualMs(Math.floor(elapsed))
        if (elapsed >= EXTREME_LAPSE_TIMEOUT) { handleResponseRef.current(EXTREME_LAPSE_TIMEOUT); return }
        rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    }, isi)
  }, [audio]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleResponse = useCallback((rt: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    trialActiveRef.current = false
    trialsRef.current.push(rt)
    setTrialCount(trialsRef.current.length)
    setLiveLapses(trialsRef.current.filter((t) => t >= LAPSE_THRESHOLD).length)
    setVisualMs(null)

    // Feedback visual + sonido/háptica
    if (rt < ANTICIPATION_THRESHOLD) {
      audio.playAnticipation(); vibrate([300]); setFeedback({ kind: 'anticipation', rt })
    } else if (rt >= LAPSE_THRESHOLD) {
      audio.playLapse(); vibrate([120, 80, 120]); setFeedback({ kind: 'lapse', rt })
    } else {
      audio.playSuccess(); vibrate(40); setFeedback({ kind: 'optimal', rt })
    }
    // Bloqueo de feedback 1 s (estándar científico) y siguiente estímulo
    setTimeout(() => { if (testActiveRef.current) scheduleNextStimulus() }, 1000)
  }, [audio, vibrate, scheduleNextStimulus])

  const endTest = useCallback(() => {
    testActiveRef.current = false
    if (isiTimerRef.current) clearTimeout(isiTimerRef.current)
    if (durIntervalRef.current) clearInterval(durIntervalRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    audio.playDone()

    const res = computeResults(trialsRef.current, duration, history)
    tempSessionRef.current = res.tempSession
    setResults(res)
    setScreen('results')
  }, [audio, duration, history])

  // Mantener los refs apuntando a las últimas versiones
  endTestRef.current = endTest
  handleResponseRef.current = handleResponse
  scheduleRef.current = scheduleNextStimulus

  const initTest = useCallback(() => {
    trialsRef.current = []
    testActiveRef.current = true
    trialActiveRef.current = false
    setTrialCount(0); setLiveLapses(0); setFeedback(null); setVisualMs(null)
    setTimerLabel(fmt(duration))
    setScreen('test')
    testStartRef.current = performance.now()
    durIntervalRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - testStartRef.current) / 1000
      const remaining = Math.max(0, duration - elapsed)
      setTimerLabel(fmt(remaining))
      if (elapsed >= duration) endTestRef.current()
    }, 100)
    scheduleRef.current()
  }, [duration])

  const abortTest = useCallback(() => {
    testActiveRef.current = false
    if (isiTimerRef.current) clearTimeout(isiTimerRef.current)
    if (durIntervalRef.current) clearInterval(durIntervalRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setScreen('dashboard')
  }, [])

  // ── Disparo táctil de alta precisión ──
  const handleTriggerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    if (!testActiveRef.current) return
    if (trialActiveRef.current) {
      handleResponseRef.current(performance.now() - trialStartRef.current)
    } else {
      // Toque durante el ISI → anticipación (falsa alarma)
      if (isiTimerRef.current) clearTimeout(isiTimerRef.current)
      handleResponseRef.current(50)
    }
  }, [])

  // Soporte de barra espaciadora (uso en ordenador)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && screen === 'test') {
        e.preventDefault()
        if (!testActiveRef.current) return
        if (trialActiveRef.current) handleResponseRef.current(performance.now() - trialStartRef.current)
        else { if (isiTimerRef.current) clearTimeout(isiTimerRef.current); handleResponseRef.current(50) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen])

  const saveSession = () => {
    if (!tempSessionRef.current) return
    const next = [...history, tempSessionRef.current]
    setHistory(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
    tempSessionRef.current = null
    setScreen('dashboard')
  }

  const clearHistory = () => {
    setHistory([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ }
  }

  const baselineCount = history.filter((s) => s.duration === duration).length

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto" style={{ overscrollBehaviorY: 'none' }}>
      {/* ── DASHBOARD ── */}
      {screen === 'dashboard' && (
        <div className="max-w-md mx-auto p-5 space-y-5">
          <div className="flex items-center gap-3 pt-2">
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">PVT-B</h1>
              <p className="text-xs text-slate-500">Tiempo de reacción y atención sostenida</p>
            </div>
          </div>

          {/* Instrucciones */}
          <TestInstructions
            accent="indigo"
            measures="El estado de alerta y la fatiga de tu sistema nervioso central, a través de tu tiempo de reacción y tu atención sostenida (Basner & Dinges, 2011)."
            how="Sujeta el móvil con ambas manos. Cuando aparezca el contador rojo de milisegundos, pulsa la pantalla lo más rápido posible. Se repite durante toda la prueba."
            keyRule="No te anticipes: pulsar antes de que aparezca el contador cuenta como error (anticipación)."
            meaning="Reacciones rápidas y constantes indican un sistema nervioso descansado. Tiempos lentos o lapsos frecuentes reflejan fatiga y reducen la seguridad en tareas cotidianas."
          />

          {/* Cómo funciona (instrucciones visuales paso a paso) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Cómo funciona</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { Icon: Smartphone, n: '1', title: 'Prepárate', desc: 'Sujeta el móvil con ambas manos y mira la pantalla.', tone: 'bg-slate-900 text-slate-200' },
                { Icon: Timer, n: '2', title: 'Estímulo', desc: 'Aparecerá un contador rojo de milisegundos.', tone: 'bg-rose-500 text-white' },
                { Icon: MousePointerClick, n: '3', title: 'Reacciona', desc: 'Toca la pantalla lo más rápido que puedas.', tone: 'bg-emerald-500 text-white' },
              ].map((s) => (
                <div key={s.n} className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${s.tone}`}>
                    <s.Icon size={26} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">{s.n}. {s.title}</span>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de prueba</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDuration(30)}
                  className={`py-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition-colors ${duration === 30 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}>
                  <span className="bg-slate-200 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Práctica</span>
                  30 segundos
                </button>
                <button onClick={() => setDuration(180)}
                  className={`py-3 rounded-xl border-2 font-bold text-sm flex flex-col items-center gap-1 transition-colors ${duration === 180 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Evaluación Real</span>
                  3 minutos
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 px-1">
                La prueba de práctica de 30 segundos te permite familiarizarte con el funcionamiento del test.
                La evaluación real de 3 minutos es la que genera datos clínicamente válidos.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                <span className="text-sm text-slate-600 font-medium">Respuesta háptica (vibración)</span>
                <button onClick={() => setVibration((v) => !v)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${vibration ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${vibration ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 px-1">
                La respuesta háptica hace que el móvil <strong>vibre</strong> al registrar cada pulsación,
                dándote feedback táctil inmediato. Actívala si quieres sentir la confirmación en la mano,
                o desactívala si la vibración te distrae durante la prueba.
              </p>
            </div>
            <button onClick={initTest}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-colors flex items-center justify-center gap-2">
              <Play size={18} /> Iniciar Evaluación
            </button>
          </div>

          {/* Línea base */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Línea base ({duration === 180 ? '3 min' : '30 s'})</span>
              <span className={`text-xs font-bold ${baselineCount >= 3 ? 'text-emerald-600' : 'text-amber-600'}`}>{baselineCount}/3 sesiones</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {baselineCount >= 3 ? 'Línea base calibrada: ya se calcula tu Z-Score personal.' : 'Se requieren 3 sesiones de esta duración para calibrar tu Z-Score.'}
            </p>
          </div>

          {/* Historial */}
          {history.length > 0 && (
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-700">Historial reciente</h3>
                <button onClick={clearHistory} className="text-xs text-rose-500 font-semibold flex items-center gap-1"><Trash2 size={13} /> Borrar</button>
              </div>
              <div className="space-y-2">
                {[...history].reverse().slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-500">{s.date}</span>
                    <span className="font-mono text-slate-700">{s.meanRt} ms · {s.lapses} lapses</span>
                    <span className={`font-bold ${s.score >= 75 ? 'text-emerald-500' : s.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TEST (área de disparo oscura) ── */}
      {screen === 'test' && (
        <div className="fixed inset-0 bg-slate-50 flex flex-col p-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex justify-between items-center text-sm mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-slate-500 font-medium">Restante:</span>
              <span className="font-mono text-indigo-600 font-bold">{timerLabel}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>Ensayos: <strong className="text-slate-700 font-mono">{trialCount}</strong></span>
              <span>Lapses: <strong className="text-rose-500 font-mono">{liveLapses}</strong></span>
            </div>
          </div>

          {/* Área táctil de disparo (oscura, clínica) */}
          <div
            onPointerDown={handleTriggerDown}
            style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
            className={`flex-1 rounded-3xl border-2 flex flex-col items-center justify-center relative cursor-pointer overflow-hidden shadow-2xl transition-colors select-none ${
              feedback?.kind === 'optimal' ? 'bg-emerald-950/90 border-emerald-700'
              : feedback?.kind === 'lapse' ? 'bg-rose-950/90 border-rose-700'
              : feedback?.kind === 'anticipation' ? 'bg-amber-950/90 border-amber-700'
              : 'bg-slate-950 border-slate-800'
            }`}
          >
            {feedback ? (
              <div className="text-center">
                {feedback.kind === 'optimal' && <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-2" />}
                {feedback.kind === 'lapse' && <AlertTriangle size={48} className="text-rose-400 mx-auto mb-2" />}
                {feedback.kind === 'anticipation' && <AlertTriangle size={48} className="text-amber-400 mx-auto mb-2" />}
                <p className={`text-2xl font-black ${feedback.kind === 'optimal' ? 'text-emerald-300' : feedback.kind === 'lapse' ? 'text-rose-300' : 'text-amber-300'}`}>
                  {feedback.kind === 'optimal' ? 'ÓPTIMO' : feedback.kind === 'lapse' ? 'LAPSE' : 'ANTICIPACIÓN'}
                </p>
                <p className="font-mono text-3xl font-extrabold text-white mt-2">
                  {feedback.kind === 'anticipation' ? `< ${ANTICIPATION_THRESHOLD} ms` : `${Math.floor(feedback.rt)} ms`}
                </p>
              </div>
            ) : visualMs !== null ? (
              <div className="text-center">
                <div className="font-mono text-6xl font-black text-rose-500 tracking-tighter">{visualMs}</div>
                <span className="text-xs text-rose-400/80 font-semibold tracking-widest uppercase mt-2 block">Milisegundos</span>
              </div>
            ) : (
              <div className="text-center px-6">
                <Zap size={40} className="text-indigo-400 mx-auto mb-3 animate-pulse" />
                <h3 className="text-slate-200 font-bold uppercase tracking-wider">Preparado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Pulsa la pantalla lo más rápido posible cuando aparezca el contador. No te anticipes.</p>
              </div>
            )}
          </div>

          <button onClick={() => setShowAbandon(true)}
            className="mt-4 self-center flex items-center gap-1.5 text-rose-500 hover:text-rose-600 text-sm font-bold bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl transition-colors">
            <X size={16} /> Abandonar prueba
          </button>

          <ConfirmDialog
            open={showAbandon}
            title="Abandonar prueba"
            message="¿Seguro que quieres abandonar? Se perderá el progreso y no se guardará ningún resultado."
            onConfirm={() => { setShowAbandon(false); abortTest() }}
            onCancel={() => setShowAbandon(false)}
          />
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === 'results' && results && (
        <div className="max-w-md mx-auto p-5 space-y-4 pb-8">
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-xl font-bold text-slate-800">Resultados</h2>
            <button onClick={onBack} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
          </div>

          {/* Diagnóstico Z-Score */}
          <div className={`rounded-3xl p-5 border ${results.diag.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <results.diag.Icon size={22} className={results.diag.text} />
              <h3 className={`font-bold ${results.diag.text}`}>{results.diag.title}</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{results.diag.description}</p>
            {results.zEval.z !== null && (
              <div className="mt-3 text-xs font-mono text-slate-500">Z-Score: {results.zEval.z > 0 ? '+' : ''}{results.zEval.z.toFixed(2)}</div>
            )}
          </div>

          {/* Puntuación */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Puntuación total</span>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[140px]">Combina velocidad y lapses sobre 100.</p>
            </div>
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-mono font-black text-2xl ${
              results.score >= 80 ? 'border-emerald-500 text-emerald-500' : results.score >= 50 ? 'border-amber-500 text-amber-500' : 'border-rose-500 text-rose-500'
            }`}>{results.score}</div>
          </div>

          {/* Percentil + tribu (población por score; tribu por tiempo de reacción) */}
          {(() => {
            const pct = estimatePercentile(results.score, 40, 60, 80, true)
            return (
              <>
                <PercentileGauge
                  userValue={results.score} unit=" pts"
                  p25={40} p50={60} p75={80}
                  higherIsBetter={true} estimatedPercentile={pct} testLabel="PVT-B"
                  tribeValues={tribeValuesFor('pvt_rt').map((rt) => -rt)} tribeUserValue={-results.meanRt}
                />
                <FeedbackCard feedback={getFeedback('pvt', pct)} />
              </>
            )
          })()}

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Tiempo de reacción" value={`${results.meanRt} ms`} color="text-slate-700" />
            <Metric label="Velocidad recíproca" value={`${results.meanSpeed.toFixed(2)} s⁻¹`} color="text-indigo-600" />
            <Metric label="Lapses (≥355 ms)" value={`${results.lapses}`} color="text-rose-500" />
            <Metric label="Anticipaciones" value={`${results.anticipations}`} color="text-amber-500" />
          </div>

          <div className="flex gap-3">
            <button onClick={saveSession} className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Guardar sesión
            </button>
            <button onClick={() => setScreen('dashboard')} className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-xl">Inicio</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">{label}</span>
      <div className={`font-mono text-xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

// ── Cálculo de métricas y diagnóstico (función pura) ──
function computeResults(rawTrials: number[], duration: number, history: Session[]) {
  const valid = rawTrials.filter((rt) => rt >= ANTICIPATION_THRESHOLD)
  const total = rawTrials.length
  const anticipations = rawTrials.filter((rt) => rt < ANTICIPATION_THRESHOLD).length
  const lapses = rawTrials.filter((rt) => rt >= LAPSE_THRESHOLD).length

  const meanRt = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0
  const meanSpeed = valid.length ? valid.reduce((a, b) => a + 1000 / b, 0) / valid.length : 0

  let score = 0
  if (total > 0) {
    const speedFactor = Math.min(100, Math.max(0, (meanSpeed - 1) * 20))
    const lapseDed = (lapses / total) * 100
    const antiDed = (anticipations / total) * 50
    score = Math.max(0, Math.min(100, Math.round(speedFactor - lapseDed - antiDed)))
  }

  // Z-Score vs línea base (misma duración, ≥3 sesiones)
  const sameDur = history.filter((s) => s.duration === duration)
  let zEval: { z: number | null } = { z: null }
  if (sameDur.length >= 3) {
    const speeds = sameDur.map((s) => s.meanSpeed)
    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length
    const sd = Math.sqrt(speeds.reduce((a, b) => a + (b - mean) ** 2, 0) / speeds.length) || 0.01
    zEval = { z: (meanSpeed - mean) / sd }
  }

  const diag = buildDiag(zEval.z, sameDur.length)

  const tempSession: Session = {
    id: Date.now(),
    date: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
    duration,
    meanSpeed: +meanSpeed.toFixed(2),
    meanRt: Math.round(meanRt),
    lapses, anticipations, score,
  }

  return { meanRt: Math.round(meanRt), meanSpeed, lapses, anticipations, score, zEval, diag, tempSession }
}

function buildDiag(z: number | null, baselineCount: number) {
  if (z === null) {
    return {
      title: `Calibrando línea base (${baselineCount}/3)`,
      description: 'Se necesitan 3 sesiones de la misma duración para definir tu media neuronal personalizada y poder alertarte con precisión.',
      text: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', Icon: Brain,
    }
  }
  if (z <= -1.5) {
    return {
      title: 'Alerta de fatiga del SNC',
      description: 'Tu velocidad neuro-motora está significativamente por debajo de tu rango histórico. Riesgo elevado de errores de atención. Se recomienda descanso.',
      text: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', Icon: AlertTriangle,
    }
  }
  if (z < -0.5) {
    return {
      title: 'Fatiga central moderada',
      description: 'Indicios de fatiga acumulada en el SNC. Sigues funcional pero tus reflejos están retrasados respecto a tu estado óptimo.',
      text: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', Icon: AlertTriangle,
    }
  }
  return {
    title: 'Sistema nervioso óptimo',
    description: 'Tus tiempos de reacción están alineados o superan tu rango histórico. Capacidad ejecutiva y coordinación neuromuscular al máximo.',
    text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', Icon: CheckCircle2,
  }
}
