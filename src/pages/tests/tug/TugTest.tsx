import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Camera, X, CheckCircle2, Clock } from 'lucide-react'
import { useCameraRecorder } from '../../../hooks/useCameraRecorder'
import { VideoAnalyzer, type VideoAnalyzerControls } from '../../../components/video/VideoAnalyzer'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { estimatePercentile } from '../../../utils/percentileUtils'
import { getFeedback } from '../../../data/testFeedbackMessages'
import { tribeValuesFor } from '../../../data/mockTribeData'
import { TestInstructions } from '../../../components/ui/TestInstructions'
import {
  getTugNorms, evaluateTug, TUG_TONE_CLASSES, TUG_STORAGE_KEY,
  type TugGender, type TugAssessment, type TugSession,
} from './tugNorms'

/**
 * TugTest — Timed Up and Go (3 m). Movilidad funcional y equilibrio dinámico.
 * Flujo: config → cámara TRASERA (preparación + grabación de duración variable con
 * parada manual) → análisis del vídeo (marcar el fotograma donde el sujeto se sienta)
 * → informe (tiempo + percentil + tribu + feedback). Menor tiempo = mejor.
 */
export function TugTest({ onBack }: { onBack: () => void }) {
  const recorder = useCameraRecorder()
  const controlsRef = useRef<VideoAnalyzerControls | null>(null)

  const [screen, setScreen] = useState<'config' | 'camera' | 'analysis' | 'report'>('config')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<TugGender>('Hombre')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [tugTime, setTugTime] = useState<number | null>(null)
  const [assessment, setAssessment] = useState<TugAssessment | null>(null)
  const [history, setHistory] = useState<TugSession[]>([])

  useEffect(() => {
    try {
      const s = localStorage.getItem(TUG_STORAGE_KEY)
      setHistory(s ? JSON.parse(s) : [])
    } catch { setHistory([]) }
  }, [])

  useEffect(() => {
    if (recorder.videoUrl) setScreen('analysis')
  }, [recorder.videoUrl])

  const handleExit = () => { recorder.closeCamera(); onBack() }

  const activateCamera = async () => {
    if (!age || !height || !weight) { setFormError('Completa todos los campos.'); return }
    const a = parseInt(age)
    if (a < 40 || a > 65) { setFormError('La edad debe estar entre 40 y 65 años.'); return }
    setFormError(null)
    const ok = await recorder.startCamera('environment') // cámara trasera
    if (ok) setScreen('camera')
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const saveTime = () => {
    const t = controlsRef.current?.getCurrentTime() ?? 0
    if (t <= 0) { setFormError('Avanza el vídeo hasta el momento final de la prueba antes de guardar.'); return }
    const time = +t.toFixed(2)
    setTugTime(time)
    const a = parseInt(age)
    const p = getTugNorms(a, gender)
    const result = evaluateTug(time, p)
    setAssessment(result)
    const session: TugSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      age: a, gender, tugTime: time, assessment: result.title,
    }
    setHistory((prev) => {
      const next = [...prev, session]
      try { localStorage.setItem(TUG_STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
    setFormError(null)
    setScreen('report')
  }

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      {/* ── CONFIG ── */}
      {screen === 'config' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
          <div className="flex items-center gap-3 pt-2 mb-6">
            <button onClick={handleExit} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Timed Up and Go</h1>
              <p className="text-xs text-slate-500">Movilidad funcional y equilibrio dinámico (3 m)</p>
            </div>
          </div>

          {/* Instrucciones */}
          <TestInstructions
            accent="indigo"
            measures="Tu movilidad funcional, equilibrio dinámico, velocidad de marcha y capacidad de giro, en una sola prueba (Podsiadlo & Richardson, 1991)."
            how="Sentado en una silla. A la señal, levántate, camina 3 m hasta una marca, gira, vuelve y siéntate."
            keyRule={<>A velocidad cómoda y segura, <strong>sin correr</strong>. La silla marca el inicio y el final del test.</>}
            meaning="Menos tiempo = mejor coordinación neuromuscular. Tiempos altos se asocian con mayor riesgo de caídas y deterioro de la marcha."
          />

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sexo</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Hombre', 'Mujer'] as TugGender[]).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-colors ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="55"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Altura</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-lg" />
              </div>
            </div>
          </div>

          {formError && <p className="text-rose-500 text-sm mt-3">{formError}</p>}

          <button onClick={activateCamera}
            className="mt-auto mb-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
            <Camera size={20} /> Abrir Cámara
          </button>
        </div>
      )}

      {/* ── CAMERA ── */}
      {screen === 'camera' && (
        <div className="fixed inset-0 bg-black flex flex-col">
          <video ref={recorder.attachVideo} autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover" />

          {/* Instrucción superior (oculta durante la grabación) */}
          {recorder.phase !== 'recording' && (
            <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
              <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-sm font-medium p-4 rounded-xl border border-indigo-400/30 shadow-lg">
                <p className="font-bold text-center text-yellow-300 mb-1">📷 ENFOQUE ÚNICAMENTE LA SILLA</p>
                <p className="text-indigo-50 leading-relaxed text-justify">Coloca el móvil en vista lateral apuntando a la silla. <strong>No es necesario grabar el recorrido.</strong> La silla marca el inicio y el final del test.</p>
              </div>
            </div>
          )}

          {/* Cronómetro ascendente (durante grabación) */}
          {recorder.phase === 'recording' && (
            <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md text-red-500 font-mono text-3xl font-bold px-5 py-3 rounded-2xl border border-red-500/30 shadow-2xl z-40 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
              <span>{fmt(recorder.elapsed)}</span>
            </div>
          )}

          {/* Cuenta atrás de preparación */}
          {recorder.phase === 'prep' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <span className="text-[9rem] font-bold text-yellow-300/70 drop-shadow-2xl">{recorder.countdown}</span>
            </div>
          )}

          {/* Controles PRE-TEST */}
          {recorder.phase === 'setup' && (
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-30 flex flex-col gap-4">
              <div className="flex justify-between items-center text-white bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-600">
                <span className="font-medium text-sm">Tiempo antes de grabar:</span>
                <select value={recorder.prepTime} onChange={(e) => recorder.setPrepTime(parseInt(e.target.value))}
                  className="bg-slate-700 text-white font-bold p-2 rounded-lg outline-none">
                  {[5, 10, 15, 20].map((t) => <option key={t} value={t}>{t} s</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { recorder.closeCamera(); setScreen('config') }}
                  className="bg-slate-700 text-white font-bold py-4 px-4 rounded-xl active:scale-95 transition-transform">
                  <ArrowLeft size={22} />
                </button>
                <button onClick={() => recorder.startCountdown('manual')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-lg">
                  Empezar Preparación
                </button>
              </div>
            </div>
          )}

          {/* Controles DURANTE grabación */}
          {recorder.phase === 'recording' && (
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-30 flex flex-col gap-3">
              <button onClick={recorder.stopRecording}
                className="w-full bg-red-600/90 backdrop-blur-md hover:bg-red-700 text-white font-bold py-6 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/50 active:scale-95 transition-transform text-2xl">
                TERMINAR PRUEBA
              </button>
              <button onClick={() => { recorder.cancel(); setScreen('config') }}
                className="w-full bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl border border-slate-600 flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm">
                <X size={16} /> Abandonar Test sin guardar
              </button>
            </div>
          )}

          {recorder.error && (
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-rose-600 text-white p-4 rounded-xl text-center z-50">{recorder.error}</div>
          )}
        </div>
      )}

      {/* ── ANALYSIS ── */}
      {screen === 'analysis' && recorder.videoUrl && (
        <div className="max-w-md mx-auto p-4 min-h-full">
          <div className="flex items-center gap-3 mb-3 pt-1">
            <button onClick={() => setScreen('config')} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Cálculo de tiempo TUG</h2>
          </div>

          <VideoAnalyzer videoUrl={recorder.videoUrl} controlsRef={controlsRef}>
            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="font-bold text-indigo-900">Marca el fin de la prueba</h3>
              </div>
              <p className="text-sm text-indigo-700 mb-4 leading-relaxed">
                Usa los controles para localizar el fotograma <strong>exacto</strong> donde el sujeto vuelve a sentarse. El inicio del vídeo corresponde a T = 0.00 s.
              </p>
              {formError && <p className="text-rose-500 text-sm mb-2">{formError}</p>}
              <button onClick={saveTime}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                <Clock size={18} /> Guardar Tiempo y Evaluar
              </button>
            </div>
          </VideoAnalyzer>
        </div>
      )}

      {/* ── REPORT ── */}
      {screen === 'report' && assessment && tugTime != null && (() => {
        const p = getTugNorms(parseInt(age), gender)
        const pct = estimatePercentile(tugTime, p.p25, p.p50, p.p75, false)
        const grad = assessment.tone === 'green' ? 'from-emerald-500 to-green-700'
          : assessment.tone === 'amber' ? 'from-amber-500 to-orange-600'
          : 'from-rose-500 to-rose-700'
        return (
          <div className="max-w-md mx-auto p-5 min-h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-2xl font-black text-slate-800">Informe Biomecánico</h2>
              <button onClick={handleExit} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
            </div>
            <p className="text-xs text-slate-500">{gender}, {age} años · {height} cm · {weight} kg</p>

            {/* Resultado principal (color según riesgo) */}
            <div className={`bg-gradient-to-br ${grad} p-6 rounded-3xl text-white text-center shadow-lg`}>
              <h3 className="text-xs font-bold text-white/80 uppercase mb-1">Tiempo Total (TUG 3 m)</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-black tracking-tight">{tugTime.toFixed(2)}</span>
                <span className="text-white/70 text-xl">s</span>
              </div>
            </div>

            {/* Diagnóstico de riesgo */}
            <div className={`p-4 rounded-2xl border text-center ${TUG_TONE_CLASSES[assessment.tone]}`}>
              <p className="text-[10px] uppercase tracking-wide font-bold mb-1 opacity-70">Evaluación normativa y riesgo</p>
              <p className="text-lg font-bold">{assessment.title}</p>
              <p className="text-sm mt-0.5">{assessment.sub}</p>
            </div>

            {/* Percentil + tribu */}
            <PercentileGauge
              userValue={+tugTime.toFixed(1)} unit="s"
              p25={p.p25} p50={p.p50} p75={p.p75}
              higherIsBetter={false} estimatedPercentile={pct} testLabel="TUG"
              tribeValues={tribeValuesFor('tug')} tribeUserValue={+tugTime.toFixed(1)}
            />

            {/* Feedback personalizado */}
            <FeedbackCard feedback={getFeedback('tug', pct)} />

            {/* Historial */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-2 text-center">Historial (segundos)</h3>
              <div className="h-40">
                <HistoryLineChart data={history.map((h, i) => ({ label: h.date ?? `#${i + 1}`, score: h.tugTime }))} color="#6366f1" unit="s" />
              </div>
            </div>

            <button onClick={() => { setTugTime(null); setAssessment(null); setScreen('config') }}
              className="w-full bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Finalizar y Nuevo Test
            </button>
          </div>
        )
      })()}
    </div>
  )
}
