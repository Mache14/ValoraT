import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Play, Square, CheckCircle2 } from 'lucide-react'
import { useWebAudio } from '../../../hooks/useWebAudio'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { TestInstructions } from '../../../components/ui/TestInstructions'
import { estimatePercentile } from '../../../utils/percentileUtils'
import { getFeedback } from '../../../data/testFeedbackMessages'
import { tribeValuesFor } from '../../../data/mockTribeData'
import {
  predictedDistance, lowerLimit, gaugePercentiles, evaluate6mwt, normalizeHeight,
  TONE_CLASSES, SIXMWT_STORAGE_KEY,
  type SixMinSex, type SixMinAssessment, type SixMinSession,
} from './sixMinuteNorms'

const TOTAL_SECONDS = 360 // 6 min

/**
 * SixMinuteWalkTest — 6-Minute Walk Test (capacidad aeróbica máxima). SIN cámara.
 * Flujo: configuración → temporizador descendente de 6 min → input de distancia caminada →
 * informe (distancia real vs predicha de Enright & Sherrill y LIN de Casanova). Mayor = mejor.
 */
export function SixMinuteWalkTest({ onBack }: { onBack: () => void }) {
  const audio = useWebAudio()

  const [screen, setScreen] = useState<'config' | 'timer' | 'distance' | 'report'>('config')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<SixMinSex>('Hombre')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [running, setRunning] = useState(false)
  const [distance, setDistance] = useState('')
  const [assessment, setAssessment] = useState<SixMinAssessment | null>(null)
  const [history, setHistory] = useState<SixMinSession[]>([])

  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    try {
      const s = localStorage.getItem(SIXMWT_STORAGE_KEY)
      setHistory(s ? JSON.parse(s) : [])
    } catch { setHistory([]) }
  }, [])

  // Limpieza del temporizador al desmontar
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const goToTimer = () => {
    if (!age || !height || !weight) { setFormError('Completa todos los campos.'); return }
    const a = parseInt(age)
    if (a < 40 || a > 65) { setFormError('La edad debe estar entre 40 y 65 años.'); return }
    setFormError(null)
    setTimeLeft(TOTAL_SECONDS); setRunning(false)
    setScreen('timer')
  }

  const stopTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    setRunning(false)
    setScreen('distance')
  }

  const startTimer = () => {
    audio.unlock() // SÍNCRONO en el gesto del usuario (iOS)
    setRunning(true)
    let t = TOTAL_SECONDS
    setTimeLeft(t)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      t -= 1
      setTimeLeft(t)
      if (t === 60) audio.playBeep(800, 0.25)          // entra el último minuto
      else if (t <= 5 && t > 0) audio.playBeep(800, 0.15)
      if (t <= 0) {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
        audio.playBeep(1200, 0.6)
        setRunning(false)
        setScreen('distance')
      }
    }, 1000)
  }

  const analyze = () => {
    if (!distance) { setFormError('Introduce la distancia recorrida en metros.'); return }
    const real = parseFloat(distance)
    const a = parseInt(age)
    const pred = predictedDistance(sex, a, parseFloat(height), parseFloat(weight))
    const lin = lowerLimit(sex, pred)
    const result = evaluate6mwt(real, pred, lin, a)
    setAssessment(result)
    const session: SixMinSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      age: a, sex, distance: real, predicted: Math.round(pred), assessment: result.title,
    }
    setHistory((prev) => {
      const next = [...prev, session]
      try { localStorage.setItem(SIXMWT_STORAGE_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
    setFormError(null)
    setScreen('report')
  }

  const resetAll = () => {
    setDistance(''); setAssessment(null); setTimeLeft(TOTAL_SECONDS); setRunning(false); setScreen('config')
  }

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      {/* ── CONFIG ── */}
      {screen === 'config' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
          <div className="flex items-center gap-3 pt-2 mb-6">
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">6-Minute Walk Test</h1>
              <p className="text-xs text-slate-500">Capacidad aeróbica máxima (circuito de 30 m)</p>
            </div>
          </div>

          <TestInstructions
            accent="blue"
            measures="La capacidad aeróbica máxima y la resistencia cardiorrespiratoria global, reflejando la capacidad para realizar actividades de la vida diaria (Enright & Sherrill, 1998)."
            how="Mide un espacio plano de 30 metros con dos marcas en los extremos. Camina lo más rápido posible (sin correr) de un lado a otro durante 6 minutos, rodeando las marcas."
            keyRule="Cuenta cuidadosamente el número de vueltas o cruces para calcular con precisión la distancia total recorrida al finalizar."
            meaning="Mayor distancia = mejor capacidad cardiorrespiratoria y rendimiento óptimo. Distancias inferiores al Límite Inferior de Normalidad (LIN) indican riesgo funcional."
          />

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sexo</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Hombre', 'Mujer'] as SixMinSex[]).map((g) => (
                  <button key={g} onClick={() => setSex(g)}
                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-colors ${sex === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="55"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Altura</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="172"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75"
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-lg" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">La estatura puede introducirse en cm (172) o m (1,72): se ajusta automáticamente.</p>
          </div>

          {formError && <p className="text-rose-500 text-sm mt-3">{formError}</p>}

          <button onClick={goToTimer}
            className="mt-auto mb-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
            Ir al Temporizador
          </button>
        </div>
      )}

      {/* ── TIMER ── */}
      {screen === 'timer' && (
        <div className="fixed inset-0 bg-slate-900 text-white flex flex-col">
          <div className="p-6 flex justify-between items-center bg-slate-800">
            <button onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); onBack() }}
              className="text-slate-300 flex items-center gap-1 text-sm font-semibold">
              <ArrowLeft size={18} /> Salir
            </button>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-bold border border-blue-500/30">
              {running ? 'Fase Activa' : 'Listo'}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-[6rem] sm:text-[8rem] font-bold leading-none tracking-tighter drop-shadow-lg font-mono">
              {fmt(timeLeft)}
            </div>
            <p className={`mt-4 text-lg ${running ? 'text-green-400 animate-pulse' : 'text-slate-400'}`}>
              {running ? 'Prueba en curso… camina lo más rápido posible' : 'Listo para comenzar'}
            </p>
          </div>

          <div className="p-6 flex flex-col gap-4 bg-slate-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            {!running ? (
              <button onClick={startTimer}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 rounded-2xl shadow-lg active:scale-95 transition-transform text-xl flex items-center justify-center gap-2">
                <Play size={22} /> Iniciar Prueba
              </button>
            ) : (
              <button onClick={stopTimer}
                className="w-full bg-slate-700 hover:bg-red-600 text-white font-bold py-4 rounded-2xl border border-slate-600 active:scale-95 transition-colors text-lg flex items-center justify-center gap-2">
                <Square size={18} /> Terminar / Abandonar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── DISTANCE INPUT ── */}
      {screen === 'distance' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 pt-4 text-center">Prueba finalizada</h2>
          <p className="text-sm text-slate-500 text-center mb-6">Introduce la distancia total recorrida en el circuito.</p>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center gap-3">
            <div className="flex items-baseline gap-2">
              <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="0"
                className="w-36 p-4 text-4xl font-bold text-center border-b-2 border-blue-500 bg-blue-50 text-blue-900 rounded-t-lg outline-none" />
              <span className="text-2xl font-bold text-slate-400">metros</span>
            </div>
            <p className="text-[11px] text-slate-400 text-center">Distancia = vueltas × longitud del circuito (p. ej. 30 m por tramo).</p>
          </div>

          {formError && <p className="text-rose-500 text-sm mt-3 text-center">{formError}</p>}

          <button onClick={analyze}
            className="mt-auto mb-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all">
            Analizar Resultados
          </button>
        </div>
      )}

      {/* ── REPORT ── */}
      {screen === 'report' && assessment && (() => {
        const real = parseFloat(distance) || 0
        const a = parseInt(age)
        const pred = predictedDistance(sex, a, parseFloat(height), parseFloat(weight))
        const lin = lowerLimit(sex, pred)
        const pc = gaugePercentiles(pred, lin)
        const pct = estimatePercentile(real, pc.p25, pc.p50, pc.p75, true)
        return (
          <div className="max-w-md mx-auto p-5 min-h-full flex flex-col space-y-4">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-2xl font-black text-slate-800">Informe 6MWT</h2>
              <button onClick={onBack} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
            </div>
            <p className="text-xs text-slate-500">{sex}, {age} años · {Math.round(normalizeHeight(parseFloat(height)))} cm · {weight} kg</p>

            <div className={`p-4 rounded-2xl text-center border ${TONE_CLASSES[assessment.tone]}`}>
              <p className="text-[10px] uppercase tracking-wide font-bold mb-1 opacity-70">Cohorte de salud</p>
              <p className="text-xl font-bold">{assessment.title}</p>
              <p className="text-sm mt-1">{assessment.sub}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl text-white text-center">
                <h3 className="text-xs font-bold text-blue-100 uppercase mb-1">Distancia Real</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">{real}</span><span className="text-blue-200 text-sm">m</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-600 to-slate-800 p-4 rounded-2xl text-white text-center">
                <h3 className="text-xs font-bold text-slate-300 uppercase mb-1">Valor Esperado</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold">{Math.round(pred)}</span><span className="text-slate-300 text-sm">m</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">LIN: {Math.round(lin)} m</p>
              </div>
            </div>

            <PercentileGauge
              userValue={real} unit=" m"
              p25={pc.p25} p50={pc.p50} p75={pc.p75}
              higherIsBetter={true} estimatedPercentile={pct} testLabel="6MWT"
              tribeValues={tribeValuesFor('6mwt')} tribeUserValue={real}
            />
            <FeedbackCard feedback={getFeedback('6mwt', pct)} />

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-700 mb-2 text-center">Progresión (metros)</h3>
              <div className="h-40">
                <HistoryLineChart data={history.map((h, i) => ({ label: h.date ?? `#${i + 1}`, score: h.distance }))} color="#3b82f6" unit=" m" />
              </div>
            </div>

            <button onClick={resetAll}
              className="w-full bg-white text-slate-700 border-2 border-slate-200 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Finalizar y Nuevo Test
            </button>
          </div>
        )
      })()}
    </div>
  )
}
