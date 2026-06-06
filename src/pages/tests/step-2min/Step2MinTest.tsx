import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Camera, X, CheckCircle2, Video } from 'lucide-react'
import { useCameraRecorder } from '../../../hooks/useCameraRecorder'
import { VideoAnalyzer, type VideoAnalyzerControls } from '../../../components/video/VideoAnalyzer'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { TestInstructions } from '../../../components/ui/TestInstructions'
import { estimatePercentile } from '../../../utils/percentileUtils'
import { getFeedback } from '../../../data/testFeedbackMessages'
import { tribeValuesFor } from '../../../data/mockTribeData'
import {
  evaluateStep2Min, getStep2MinNorms, TONE_CLASSES, STEP2MIN_STORAGE_KEY,
  type Step2MinSex, type Step2MinAssessment, type Step2MinSession,
} from './step2MinNorms'

/**
 * Step2MinTest — 2-Minute Step Test (resistencia aeróbica domiciliaria).
 * Flujo: configuración → cámara frontal (preparación + grabación de 120 s) → análisis del vídeo
 * (contar elevaciones de la rodilla derecha) → informe clínico. Más pasos = mejor.
 */
export function Step2MinTest({ onBack }: { onBack: () => void }) {
  const recorder = useCameraRecorder()
  const controlsRef = useRef<VideoAnalyzerControls | null>(null)

  const [screen, setScreen] = useState<'config' | 'camera' | 'analysis' | 'report'>('config')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Step2MinSex>('Hombre')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [steps, setSteps] = useState('')
  const [assessment, setAssessment] = useState<Step2MinAssessment | null>(null)
  const [history, setHistory] = useState<Step2MinSession[]>([])

  useEffect(() => {
    try {
      const s = localStorage.getItem(STEP2MIN_STORAGE_KEY)
      setHistory(s ? JSON.parse(s) : [])
    } catch { setHistory([]) }
  }, [])

  useEffect(() => {
    if (recorder.videoUrl) setScreen('analysis')
  }, [recorder.videoUrl])

  const handleExit = () => { recorder.closeCamera(); onBack() }
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const activateCamera = async () => {
    if (!age || !height || !weight) { setFormError('Completa todos los campos.'); return }
    const a = parseInt(age)
    if (a < 40 || a > 65) { setFormError('La edad debe estar entre 40 y 65 años.'); return }
    setFormError(null)
    const ok = await recorder.startCamera('user') // cámara frontal
    if (ok) setScreen('camera')
  }

  const generateReport = () => {
    if (!steps) { setFormError('Introduce el número de pasos contados.'); return }
    const n = parseInt(steps)
    const a = parseInt(age)
    const norms = getStep2MinNorms(a, sex)
    const result = evaluateStep2Min(n, norms)
    setAssessment(result)
    const session: Step2MinSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      age: a, sex, steps: n, assessment: result.title,
    }
    setHistory((prev) => {
      const next = [...prev, session]
      try { localStorage.setItem(STEP2MIN_STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
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
              <h1 className="text-xl font-bold text-slate-800">2-Minute Step Test</h1>
              <p className="text-xs text-slate-500">Resistencia aeróbica domiciliaria</p>
            </div>
          </div>

          <TestInstructions
            accent="indigo"
            measures="La resistencia aeróbica domiciliaria y la capacidad funcional cardiorrespiratoria (Rikli & Jones, 2013)."
            how="De pie, cerca de una pared para mantener el equilibrio si es necesario. Marche en el sitio levantando las rodillas hasta un punto intermedio entre la rótula y la cresta ilíaca (altura de la cadera)."
            keyRule={<>Solo cuentan las elevaciones de la <strong>pierna derecha</strong> que alcancen la altura objetivo durante los 2 minutos.</>}
            meaning="Más pasos = excelente reserva cardiorrespiratoria. Un número bajo indica un fenotipo vulnerable y necesidad de intervención preventiva."
          />

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sexo</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Hombre', 'Mujer'] as Step2MinSex[]).map((g) => (
                  <button key={g} onClick={() => setSex(g)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-colors ${sex === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}>
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
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="172"
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
            <Camera size={20} /> Activar Cámara y Preparación
          </button>
        </div>
      )}

      {/* ── CAMERA ── */}
      {screen === 'camera' && (
        <div className="fixed inset-0 bg-black flex flex-col">
          <video ref={recorder.attachVideo} autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

          <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
            <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-sm font-medium p-4 rounded-xl border border-indigo-400/30 text-center shadow-lg">
              {recorder.phase === 'recording'
                ? <span className="animate-pulse font-bold text-lg text-red-200">🔴 GRABANDO TEST (2 min)</span>
                : recorder.phase === 'prep'
                  ? <><span className="block font-bold text-lg mb-1">Preparación</span>Colócate y empieza a marchar tras el pitido.</>
                  : <><span className="block font-bold text-lg mb-1">Fase de Preparación</span>Coloca el móvil donde puedas verte de cuerpo entero.</>}
            </div>
          </div>

          {(recorder.phase === 'prep' || recorder.phase === 'recording') && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <span className={`font-bold drop-shadow-2xl font-mono ${recorder.phase === 'recording' ? 'text-[7rem] text-red-400/80' : 'text-[9rem] text-yellow-300/70'}`}>
                {recorder.phase === 'recording' ? fmt(recorder.countdown) : recorder.countdown}
              </span>
            </div>
          )}

          {recorder.phase === 'setup' && (
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-30 flex flex-col gap-4">
              <div className="flex justify-between items-center text-white bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-600">
                <span className="font-medium">Tiempo para colocarte:</span>
                <select value={recorder.prepTime} onChange={(e) => recorder.setPrepTime(parseInt(e.target.value))}
                  className="bg-slate-700 text-white font-bold p-2 rounded-lg outline-none text-lg">
                  {[10, 15, 20].map((t) => <option key={t} value={t}>{t} s</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { recorder.closeCamera(); setScreen('config') }}
                  className="bg-slate-700 text-white font-bold py-4 px-4 rounded-xl active:scale-95 transition-transform">
                  <ArrowLeft size={22} />
                </button>
                <button onClick={() => recorder.startCountdown('fixed', 120)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-lg">
                  Empezar Cuenta Atrás
                </button>
              </div>
            </div>
          )}

          {(recorder.phase === 'prep' || recorder.phase === 'recording') && (
            <div className="absolute bottom-6 left-0 w-full px-6 z-30">
              <button onClick={recorder.cancel}
                className="w-full bg-red-600/90 backdrop-blur-md hover:bg-red-700 text-white font-bold py-4 rounded-xl border border-red-500 shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <X size={22} /> Cancelar Test
              </button>
            </div>
          )}

          {recorder.error && (
            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-rose-600 text-white p-4 rounded-xl text-center z-40">{recorder.error}</div>
          )}
        </div>
      )}

      {/* ── ANALYSIS ── */}
      {screen === 'analysis' && recorder.videoUrl && (
        <div className="max-w-md mx-auto p-4 min-h-full">
          <div className="flex items-center gap-3 mb-3 pt-1">
            <button onClick={() => { setScreen('config') }} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Análisis del vídeo</h2>
          </div>

          <VideoAnalyzer videoUrl={recorder.videoUrl} controlsRef={controlsRef}>
            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200 space-y-2">
              <h3 className="font-bold text-indigo-900">Recuento final</h3>
              <p className="text-xs text-slate-500">Revisa el vídeo (±0,04 s) y cuenta solo las veces que la rodilla DERECHA alcanzó la altura objetivo.</p>
              <input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="Ej: 90 pasos"
                className="w-full p-4 rounded-xl border-2 border-indigo-300 bg-white focus:border-indigo-500 text-xl font-bold text-center outline-none" />
            </div>

            {formError && <p className="text-rose-500 text-sm">{formError}</p>}

            <button onClick={generateReport}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
              <Video size={18} /> Generar Informe
            </button>
          </VideoAnalyzer>
        </div>
      )}

      {/* ── REPORT ── */}
      {screen === 'report' && assessment && (() => {
        const n = parseInt(steps) || 0
        const norms = getStep2MinNorms(parseInt(age), sex)
        const p50 = Math.round((norms.riskLimit + norms.excLimit) / 2)
        const pct = estimatePercentile(n, norms.riskLimit, p50, norms.excLimit, true)
        return (
          <div className="max-w-md mx-auto p-5 min-h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-2xl font-black text-slate-800">Informe Funcional</h2>
              <button onClick={handleExit} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
            </div>
            <p className="text-xs text-slate-500">{sex}, {age} años · {height} cm · {weight} kg</p>

            <div className={`p-4 rounded-2xl text-center border ${TONE_CLASSES[assessment.tone]}`}>
              <p className="text-[10px] uppercase tracking-wide font-bold mb-1 opacity-70">Cohorte de salud</p>
              <p className="text-xl font-bold">{assessment.title}</p>
              <p className="text-sm mt-1">{assessment.sub}</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 rounded-3xl text-white text-center shadow-lg">
              <h3 className="text-xs font-bold text-indigo-100 uppercase mb-1">Pasos (rodilla derecha · 2 min)</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black">{n}</span><span className="text-indigo-200 text-lg">pasos</span>
              </div>
            </div>

            <PercentileGauge
              userValue={n} unit=" pasos"
              p25={norms.riskLimit} p50={p50} p75={norms.excLimit}
              higherIsBetter={true} estimatedPercentile={pct} testLabel="2-Min Step"
              tribeValues={tribeValuesFor('step2min')} tribeUserValue={n}
            />
            <FeedbackCard feedback={getFeedback('step2min', pct)} />

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-2 text-center">Progresión (pasos)</h3>
              <div className="h-40">
                <HistoryLineChart data={history.map((h, i) => ({ label: h.date ?? `#${i + 1}`, score: h.steps }))} color="#6366f1" unit=" pasos" />
              </div>
            </div>

            <button onClick={() => { setSteps(''); setAssessment(null); setScreen('config') }}
              className="w-full bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Finalizar y Nuevo Test
            </button>
          </div>
        )
      })()}
    </div>
  )
}
