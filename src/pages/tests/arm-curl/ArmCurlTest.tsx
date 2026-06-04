import { useState, useEffect } from 'react'
import { ArrowLeft, Camera, X, CheckCircle2, Video, Dumbbell } from 'lucide-react'
import { useCameraRecorder } from '../../../hooks/useCameraRecorder'
import { VideoAnalyzer } from '../../../components/video/VideoAnalyzer'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import {
  evaluateArmCurl, dumbbellWeight, ARMCURL_TONE_CLASSES, ARMCURL_STORAGE_KEY,
  type ArmCurlGender, type ArmCurlAssessment, type ArmCurlSession,
} from './armCurlNorms'

/**
 * ArmCurlTest — Test de flexión de brazo de 30 s (fuerza-resistencia tren superior).
 * Flujo: configuración → cámara (preparación + grabación 30 s) → análisis (introducir
 * repeticiones) → informe clínico. Reutiliza el VideoAnalyzer y el hook de cámara.
 */
export function ArmCurlTest({ onBack }: { onBack: () => void }) {
  const recorder = useCameraRecorder()

  const [screen, setScreen] = useState<'config' | 'camera' | 'analysis' | 'report'>('config')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<ArmCurlGender>('Hombre')
  const [weight, setWeight] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [reps, setReps] = useState('')
  const [assessment, setAssessment] = useState<ArmCurlAssessment | null>(null)
  const [history, setHistory] = useState<ArmCurlSession[]>([])

  useEffect(() => {
    try {
      const s = localStorage.getItem(ARMCURL_STORAGE_KEY)
      setHistory(s ? JSON.parse(s) : [])
    } catch { setHistory([]) }
  }, [])

  useEffect(() => {
    if (recorder.videoUrl) setScreen('analysis')
  }, [recorder.videoUrl])

  const handleExit = () => { recorder.closeCamera(); onBack() }

  const activateCamera = async () => {
    if (!age || !weight) { setFormError('Completa todos los campos.'); return }
    const a = parseInt(age)
    if (a < 40 || a > 65) { setFormError('La edad debe estar entre 40 y 65 años.'); return }
    setFormError(null)
    const ok = await recorder.startCamera()
    if (ok) setScreen('camera')
  }

  const generateReport = () => {
    if (!reps) { setFormError('Introduce las repeticiones realizadas.'); return }
    const r = parseInt(reps)
    const a = parseInt(age)
    const result = evaluateArmCurl(a, gender, r)
    setAssessment(result)
    const session: ArmCurlSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      age: a, gender, reps: r, assessment: result.label,
    }
    setHistory((prev) => {
      const next = [...prev, session]
      try { localStorage.setItem(ARMCURL_STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
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
              <h1 className="text-xl font-bold text-slate-800">Arm Curl Test (30 s)</h1>
              <p className="text-xs text-slate-500">Fuerza-resistencia del tren superior</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sexo</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Hombre', 'Mujer'] as ArmCurlGender[]).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-colors ${gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="55"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-indigo-400 outline-none text-lg" />
              </div>
            </div>
            {/* Mancuerna calculada */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
              <Dumbbell size={20} className="text-indigo-600" />
              <span className="text-sm text-indigo-800">
                Mancuerna recomendada: <strong>{dumbbellWeight(gender)} kg</strong> ({gender === 'Hombre' ? 'hombres' : 'mujeres'})
              </span>
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
                ? <span className="animate-pulse font-bold text-lg text-red-200">🔴 GRABANDO TEST (30 s)</span>
                : recorder.phase === 'prep'
                  ? <><span className="block font-bold text-lg mb-1">Preparación</span>Colócate en posición. El test arrancará tras el pitido.</>
                  : <><span className="block font-bold text-lg mb-1">Fase de Preparación</span>Coloca el móvil en vista lateral para ver el recorrido completo del codo.</>}
            </div>
          </div>

          {(recorder.phase === 'prep' || recorder.phase === 'recording') && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <span className={`text-[9rem] font-bold drop-shadow-2xl ${recorder.phase === 'recording' ? 'text-red-400/80' : 'text-yellow-300/70'}`}>
                {recorder.countdown}
              </span>
            </div>
          )}

          {recorder.phase === 'setup' && (
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-30 flex flex-col gap-4">
              <div className="flex justify-between items-center text-white bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-600">
                <span className="font-medium">Tiempo para colocarte:</span>
                <select value={recorder.prepTime} onChange={(e) => recorder.setPrepTime(parseInt(e.target.value))}
                  className="bg-slate-700 text-white font-bold p-2 rounded-lg outline-none text-lg">
                  {[10, 15, 20, 30].map((t) => <option key={t} value={t}>{t} s</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { recorder.closeCamera(); setScreen('config') }}
                  className="bg-slate-700 text-white font-bold py-4 px-4 rounded-xl active:scale-95 transition-transform">
                  <ArrowLeft size={22} />
                </button>
                <button onClick={recorder.startCountdown}
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
            <button onClick={() => setScreen('config')} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">Análisis del vídeo</h2>
          </div>

          <VideoAnalyzer videoUrl={recorder.videoUrl}>
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <h3 className="font-bold text-indigo-900 mb-1">Repeticiones válidas</h3>
              <p className="text-xs text-slate-500 mb-3">Usa el control fotograma a fotograma para contar solo las flexiones con extensión completa del codo.</p>
              <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="0 reps en 30 s"
                className="w-full p-3 rounded-xl border-2 border-indigo-300 bg-white focus:border-indigo-500 text-xl font-bold text-center outline-none" />
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
      {screen === 'report' && assessment && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col space-y-4">
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-2xl font-black text-slate-800">Informe Clínico</h2>
            <button onClick={handleExit} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
          </div>
          <p className="text-xs text-slate-500">{gender}, {age} años · {weight} kg · mancuerna {dumbbellWeight(gender)} kg</p>

          {/* Resultado grande */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-3xl text-white text-center shadow-lg shadow-indigo-200">
            <h3 className="text-xs font-bold text-indigo-100 uppercase mb-1">Repeticiones en 30 s</h3>
            <span className="text-6xl font-black">{reps}</span>
          </div>

          {/* Diagnóstico + texto clínico */}
          <div className={`p-4 rounded-2xl border ${ARMCURL_TONE_CLASSES[assessment.tone]}`}>
            <p className="text-[10px] uppercase tracking-wide font-bold mb-1 opacity-70">Evaluación normativa</p>
            <p className="text-xl font-bold mb-2">{assessment.label}</p>
            <p className="text-sm leading-relaxed opacity-90">{assessment.desc}</p>
          </div>

          {/* Historial */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-2 text-center">Progresión (repeticiones)</h3>
            <div className="h-40">
              <HistoryLineChart data={history.map((h, i) => ({ label: h.date ?? `#${i + 1}`, score: h.reps }))} color="#6366f1" unit=" reps" />
            </div>
          </div>

          <button onClick={() => { setReps(''); setAssessment(null); setScreen('config') }}
            className="w-full bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Finalizar y Nuevo Test
          </button>
        </div>
      )}
    </div>
  )
}
