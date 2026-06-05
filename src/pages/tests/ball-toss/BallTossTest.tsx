import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Camera, X, CheckCircle2, Video, AlertTriangle } from 'lucide-react'
import { useCameraRecorder } from '../../../hooks/useCameraRecorder'
import { VideoAnalyzer, type VideoAnalyzerControls } from '../../../components/video/VideoAnalyzer'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { estimatePercentile } from '../../../utils/percentileUtils'
import { getFeedback } from '../../../data/testFeedbackMessages'
import { tribeValuesFor } from '../../../data/mockTribeData'
import {
  evaluateBallToss, getBallTossNorms, TONE_CLASSES, BALL_TOSS_STORAGE_KEY,
  type Gender, type BallTossAssessment, type BallTossSession,
} from './ballTossNorms'

/**
 * BallTossTest — Alternate Hand Wall Toss Test (AHWTT): coordinación óculo-manual bilateral.
 * Flujo: configuración → cámara (preparación + grabación 30 s, frontal) → análisis del vídeo
 * (contar recepciones y caídas revisando el vídeo) → informe clínico.
 *
 * Reutiliza useCameraRecorder en modo fijo de 30 s (igual que STS / Arm Curl), con cámara
 * frontal ('user'). No marca timestamps: la fase de análisis solo registra dos conteos.
 */
export function BallTossTest({ onBack }: { onBack: () => void }) {
  const recorder = useCameraRecorder()
  const controlsRef = useRef<VideoAnalyzerControls | null>(null)

  const [screen, setScreen] = useState<'config' | 'camera' | 'analysis' | 'report'>('config')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('M')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [catches, setCatches] = useState('')
  const [drops, setDrops] = useState('')
  const [assessment, setAssessment] = useState<BallTossAssessment | null>(null)
  const [history, setHistory] = useState<BallTossSession[]>([])

  // Cargar historial
  useEffect(() => {
    try {
      const s = localStorage.getItem(BALL_TOSS_STORAGE_KEY)
      setHistory(s ? JSON.parse(s) : [])
    } catch { setHistory([]) }
  }, [])

  // Cuando el vídeo está listo, pasar a análisis
  useEffect(() => {
    if (recorder.videoUrl) setScreen('analysis')
  }, [recorder.videoUrl])

  const handleExit = () => { recorder.closeCamera(); onBack() }

  const activateCamera = async () => {
    if (!age || !height) { setFormError('Edad y estatura son obligatorias.'); return }
    const a = parseInt(age)
    if (a < 40 || a > 65) { setFormError('La edad debe estar entre 40 y 65 años.'); return }
    setFormError(null)
    const ok = await recorder.startCamera('user') // cámara frontal + unlock() de audio (iOS)
    if (ok) setScreen('camera')
  }

  const generateReport = () => {
    if (!catches || !drops) { setFormError('Introduce las recepciones y las caídas.'); return }
    const c = parseInt(catches)
    const d = parseInt(drops)
    const a = parseInt(age)
    const norms = getBallTossNorms(a, gender)
    const result = evaluateBallToss(c, d, norms)
    setAssessment(result)
    const session: BallTossSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      age: a, gender, catches: c, drops: d, assessment: result.title,
    }
    setHistory((prev) => {
      const next = [...prev, session]
      try { localStorage.setItem(BALL_TOSS_STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
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
              <h1 className="text-xl font-bold text-slate-800">AHWTT</h1>
              <p className="text-xs text-slate-500">Alternate Hand Wall Toss Test</p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 mb-4 space-y-2 text-sm">
            <p className="text-slate-700"><strong>¿Qué mide?</strong> La coordinación óculo-manual bilateral: tu capacidad de lanzar y atrapar alternando manos. Refleja la integración visomotora y la función cerebelosa (Rikli &amp; Jones, 2013).</p>
            <p className="text-slate-700"><strong>¿Cómo?</strong> De pie a <strong>2 metros</strong> de una pared lisa. Lanza una pelota de tenis por debajo del hombro con una mano y atrápala tras el rebote con la mano contraria. Alterna continuamente durante 30 s.</p>
            <p className="text-slate-700"><strong>Regla clave:</strong> Solo cuentan las recepciones exitosas. Si la pelota cae, recupérala rápido y sigue — el cronómetro no se detiene.</p>
            <p className="text-slate-700"><strong>¿Qué significa?</strong> Más recepciones = mejor coordinación. Valores bajos pueden indicar déficits en la integración visomotora, la función cerebelosa o la velocidad de procesamiento visuoespacial.</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="55"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sexo</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['M', 'F'] as Gender[]).map((g) => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl border-2 font-bold text-sm transition-colors ${gender === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                      {g === 'M' ? 'H' : 'M'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estatura (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="172"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Opcional"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-lg" />
              </div>
            </div>
          </div>

          {formError && <p className="text-rose-500 text-sm mt-3">{formError}</p>}

          <button onClick={activateCamera}
            className="mt-auto mb-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
            <Camera size={20} /> Activar Cámara y Preparación
          </button>
        </div>
      )}

      {/* ── CAMERA ── */}
      {screen === 'camera' && (
        <div className="fixed inset-0 bg-black flex flex-col">
          <video ref={recorder.attachVideo} autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

          {/* Instrucción superior */}
          <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
            <div className="bg-blue-600/90 backdrop-blur-sm text-white text-sm font-medium p-4 rounded-xl border border-blue-400/30 text-center shadow-lg">
              {recorder.phase === 'recording'
                ? <span className="animate-pulse font-bold text-lg text-red-200">🔴 GRABANDO AHWTT (30 s)</span>
                : recorder.phase === 'prep'
                  ? <><span className="block font-bold text-lg mb-1">Preparación</span>Sitúate a 2 metros de la pared. El test arrancará tras el pitido.</>
                  : <><span className="block font-bold text-lg mb-1">Fase de Preparación</span>Coloque el dispositivo lateralmente. Ubíquese a 2 metros de la pared.</>}
            </div>
          </div>

          {/* Contador gigante */}
          {(recorder.phase === 'prep' || recorder.phase === 'recording') && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <span className={`text-[9rem] font-bold drop-shadow-2xl ${recorder.phase === 'recording' ? 'text-red-400/80' : 'text-yellow-300/70'}`}>
                {recorder.countdown}
              </span>
            </div>
          )}

          {/* Controles de setup */}
          {recorder.phase === 'setup' && (
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-30 flex flex-col gap-4">
              <div className="flex justify-between items-center text-white bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-600">
                <span className="font-medium">Tiempo para colocarte:</span>
                <select value={recorder.prepTime} onChange={(e) => recorder.setPrepTime(parseInt(e.target.value))}
                  className="bg-slate-700 text-white font-bold p-2 rounded-lg outline-none text-lg">
                  {[10, 15, 30].map((t) => <option key={t} value={t}>{t} s</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { recorder.closeCamera(); setScreen('config') }}
                  className="bg-slate-700 text-white font-bold py-4 px-4 rounded-xl active:scale-95 transition-transform">
                  <ArrowLeft size={22} />
                </button>
                <button onClick={() => recorder.startCountdown()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-lg">
                  Empezar Cuenta Atrás
                </button>
              </div>
            </div>
          )}

          {/* Cancelar durante prep/grabación */}
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
            {/* Inputs clínicos: recepciones + caídas */}
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-4">
              <h3 className="font-bold text-blue-900">Resultados de la prueba</h3>
              <p className="text-xs text-slate-500 -mt-2">Revisa el vídeo fotograma a fotograma (±0,04 s) para un conteo preciso.</p>
              <div>
                <label className="block text-sm font-bold text-blue-800 mb-1">Recepciones Exitosas *</label>
                <input type="number" value={catches} onChange={(e) => setCatches(e.target.value)} placeholder="Ej: 24"
                  className="w-full p-4 rounded-xl border-2 border-blue-300 bg-white focus:border-blue-500 text-xl font-bold text-center outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Caídas / Pérdidas de pelota *</label>
                <input type="number" value={drops} onChange={(e) => setDrops(e.target.value)} placeholder="Ej: 2"
                  className="w-full p-4 rounded-xl border-2 border-slate-300 bg-white focus:border-slate-400 text-xl font-bold text-center outline-none" />
                <p className="text-xs text-slate-500 mt-1 px-1">Evalúa el error radial y pérdida de control.</p>
              </div>
            </div>

            {formError && <p className="text-rose-500 text-sm">{formError}</p>}

            <button onClick={generateReport}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
              <Video size={18} /> Generar Informe Clínico
            </button>
          </VideoAnalyzer>
        </div>
      )}

      {/* ── REPORT ── */}
      {screen === 'report' && assessment && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col space-y-4">
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-2xl font-black text-slate-800">Informe AHWTT</h2>
            <button onClick={handleExit} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
          </div>
          <p className="text-xs text-slate-500">{gender === 'M' ? 'Hombre' : 'Mujer'}, {age} años · {height} cm{weight ? ` · ${weight} kg` : ''}</p>

          {/* Diagnóstico */}
          <div className={`p-4 rounded-2xl text-center border ${TONE_CLASSES[assessment.tone]}`}>
            <p className="text-[10px] uppercase tracking-wide font-bold mb-1 opacity-70">Diagnóstico normativo</p>
            <p className="text-xl font-bold">{assessment.title}</p>
            <p className="text-sm mt-1">{assessment.sub}</p>
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl text-white text-center">
              <h3 className="text-xs font-bold text-blue-100 uppercase mb-1">Recepciones</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">{catches}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-4 rounded-2xl text-white text-center">
              <h3 className="text-xs font-bold text-slate-300 uppercase mb-1">Caídas (Error)</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">{drops}</span>
              </div>
            </div>
          </div>

          {/* Alerta dinámica de caídas (> 3) */}
          {parseInt(drops) > 3 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm flex items-start gap-3">
              <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-amber-800 font-bold text-sm">Alta tasa de error radial</h4>
                <p className="text-amber-700 text-xs mt-1">Se recomienda entrenamiento enfocado en core y estabilidad escapular para reducir el error radial de lanzamiento y mejorar la cadena cinética.</p>
              </div>
            </div>
          )}

          {/* Percentil + tribu + feedback */}
          {(() => {
            const c = parseInt(catches) || 0
            const norms = getBallTossNorms(parseInt(age), gender)
            const pct = estimatePercentile(c, norms.p25, norms.p50, norms.p75, true)
            return (
              <>
                <PercentileGauge
                  userValue={c} unit=" recep."
                  p25={norms.p25} p50={norms.p50} p75={norms.p75}
                  higherIsBetter={true} estimatedPercentile={pct} testLabel="AHWTT"
                  tribeValues={tribeValuesFor('balltoss')} tribeUserValue={c}
                />
                <FeedbackCard feedback={getFeedback('balltoss', pct)} />
              </>
            )
          })()}

          {/* Historial */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-2 text-center">Evolución visomotora (recepciones)</h3>
            <div className="h-40">
              <HistoryLineChart data={history.map((h, i) => ({ label: h.date ?? `#${i + 1}`, score: h.catches }))} color="#3b82f6" unit=" recep." />
            </div>
          </div>

          <button onClick={() => { setCatches(''); setDrops(''); setAssessment(null); setScreen('config') }}
            className="w-full bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Finalizar y Nuevo Test
          </button>
        </div>
      )}
    </div>
  )
}
