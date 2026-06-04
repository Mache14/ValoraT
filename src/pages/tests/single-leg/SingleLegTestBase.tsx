import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Play, Eye, EyeOff, X } from 'lucide-react'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { estimatePercentile } from '../../../utils/percentileUtils'
import { getFeedback } from '../../../data/testFeedbackMessages'
import { tribeValuesFor } from '../../../data/mockTribeData'
import { getPercentiles, classify, type Modality, type Sex, type Percentiles } from './upstNorms'

type SupportFoot = 'Derecho' | 'Izquierdo'

/**
 * SingleLegTestBase — lógica compartida del Unipodal Stance Test.
 * Cada modalidad (Ojos Abiertos / Ojos Cerrados) la usa como base;
 * los componentes SingleLegOpenEyes y SingleLegClosedEyes son envoltorios finos.
 *
 * Mecanismo "Touch Anywhere": durante la prueba, tocar cualquier parte de la
 * pantalla detiene el cronómetro (UX pensada para ojos cerrados).
 */

interface Props {
  modality: Modality
  onBack: () => void
}

type Screen = 'form' | 'instructions' | 'run' | 'results'
interface HistPoint { label: string; score: number; foot?: SupportFoot; sex?: Sex; age?: number }

export function SingleLegTestBase({ modality, onBack }: Props) {
  const isClosed = modality === 'Ojos Cerrados'
  const storageKey = `upst_history_${modality}`

  const [screen, setScreen] = useState<Screen>('form')
  const [sex, setSex] = useState<Sex | ''>('')
  const [supportFoot, setSupportFoot] = useState<SupportFoot | ''>('')
  const [age, setAge] = useState('')
  const [ageError, setAgeError] = useState(false)
  const [showAbandon, setShowAbandon] = useState(false)
  const [prepTime, setPrepTime] = useState(5)
  const [runPhase, setRunPhase] = useState<'prep' | 'active'>('prep')
  const [countdown, setCountdown] = useState(5)
  const [chrono, setChrono] = useState('0.00')
  const [finalTime, setFinalTime] = useState(0)
  const [history, setHistory] = useState<HistPoint[]>([])
  const [percentiles, setPercentiles] = useState<Percentiles | null>(null)

  const startRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const prepIntervalRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const isPrepRef = useRef(false)

  // Cargar historial al montar / cambiar de modalidad
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      setHistory(stored ? JSON.parse(stored) : [])
    } catch { setHistory([]) }
  }, [storageKey])

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
  }, [])

  const ageNum = parseInt(age)

  const goToInstructions = () => {
    if (!sex || !supportFoot) { setAgeError(true); return }
    if (isNaN(ageNum) || ageNum < 40 || ageNum > 65) { setAgeError(true); return }
    setAgeError(false)
    setPercentiles(getPercentiles(modality, sex, ageNum))
    setScreen('instructions')
  }

  const startActive = useCallback(() => {
    isPrepRef.current = false
    isRunningRef.current = true
    setRunPhase('active')
    startRef.current = performance.now()
    const tick = () => {
      if (!isRunningRef.current) return
      setChrono(((performance.now() - startRef.current) / 1000).toFixed(2))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const startPrep = () => {
    setScreen('run')
    setRunPhase('prep')
    isPrepRef.current = true
    isRunningRef.current = false
    let current = prepTime
    setCountdown(current)
    prepIntervalRef.current = window.setInterval(() => {
      if (!isPrepRef.current) { if (prepIntervalRef.current) clearInterval(prepIntervalRef.current); return }
      current--
      if (current > 0) setCountdown(current)
      else {
        if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
        setCountdown(0)
        startActive()
      }
    }, 1000)
  }

  const saveResult = useCallback((time: number) => {
    setHistory((prev) => {
      const next: HistPoint[] = [
        ...prev,
        {
          label: `Intento ${prev.length + 1}`,
          score: time,
          foot: supportFoot || undefined,
          sex: sex || undefined,
          age: isNaN(ageNum) ? undefined : ageNum,
        },
      ]
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }, [storageKey, supportFoot, sex, ageNum])

  // Touch Anywhere: detiene la prueba (registra el resultado)
  const stopTest = () => {
    if (isPrepRef.current) {
      // Cancelar durante preparación → vuelve a instrucciones
      isPrepRef.current = false
      if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
      setScreen('instructions')
      return
    }
    if (!isRunningRef.current) return
    isRunningRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const time = +((performance.now() - startRef.current) / 1000).toFixed(2)
    setFinalTime(time)
    saveResult(time)
    setScreen('results')
  }

  // Abandonar sin guardar: limpia timers y vuelve a instrucciones
  const abandonTest = () => {
    isPrepRef.current = false
    isRunningRef.current = false
    if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setShowAbandon(false)
    setScreen('instructions')
  }

  // ════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto" style={{ touchAction: 'manipulation' }}>
      {/* ── FORM: datos ── */}
      {screen === 'form' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
          <div className="flex items-center gap-3 pt-2 mb-6">
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {isClosed ? <EyeOff size={18} className="text-rose-500" /> : <Eye size={18} className="text-rose-500" />}
                Equilibrio Unipodal
              </h1>
              <p className="text-xs text-slate-500">{modality}</p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-700 text-center mb-4">Tus Datos</h2>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Sexo biológico</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Masculino', 'Femenino'] as Sex[]).map((s) => (
                  <button key={s} onClick={() => setSex(s)}
                    className={`py-3 rounded-xl border-2 font-medium transition-colors ${sex === s ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Pie de apoyo</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Derecho', 'Izquierdo'] as SupportFoot[]).map((f) => (
                  <button key={f} onClick={() => setSupportFoot(f)}
                    className={`py-3 rounded-xl border-2 font-medium transition-colors ${supportFoot === f ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-500'}`}>
                    🦶 {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Edad (40 a 65 años)</label>
              <input type="number" min={40} max={65} value={age} placeholder="Ej: 52"
                onChange={(e) => setAge(e.target.value)}
                className="w-full text-center text-xl py-3 rounded-xl border-2 border-slate-200 focus:border-rose-400 outline-none transition-colors" />
              {ageError && <p className="text-rose-500 text-xs mt-1">Selecciona sexo, pie de apoyo e introduce una edad válida (40-65).</p>}
            </div>
          </div>

          <button onClick={goToInstructions}
            className="mt-auto mb-2 w-full bg-rose-500 hover:bg-rose-600 active:translate-y-px text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-rose-200 transition-all">
            Siguiente
          </button>
        </div>
      )}

      {/* ── INSTRUCTIONS + barra de percentiles ── */}
      {screen === 'instructions' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
          <div className="flex items-center gap-3 pt-2 mb-4">
            <button onClick={() => setScreen('form')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-700">{modality}</h2>
          </div>

          {/* Barra de percentiles */}
          {percentiles && <PercentileBar p={percentiles} modality={modality} lastScore={history.at(-1)?.score} />}

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mt-4">
            <h3 className="font-bold text-rose-600 mb-2">Instrucciones</h3>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4 mb-3">
              <li>Coloca las <strong>manos en las caderas</strong>. Sujeta el móvil con una mano, manteniéndola en la cadera.</li>
              <li>Eleva el pie libre flexionando la rodilla, cerca del tobillo de apoyo, <strong>sin tocarla</strong>.</li>
              <li>{isClosed
                ? <>Una vez estabilizado, <strong>CIERRA LOS OJOS</strong> para comenzar el registro.</>
                : <>Fija la mirada en un punto a la altura de la vista.</>}</li>
            </ul>

            {/* Cómo funciona el cronómetro */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 mb-3 leading-relaxed">
              <strong>📱 Cómo funciona el cronómetro:</strong><br />
              Sujeta el móvil con una mano apoyada en la cadera. Cuando pierdas el equilibrio, apoyes el pie
              elevado o cometas cualquier fallo, <strong>toca cualquier parte de la pantalla</strong> inmediatamente
              y el cronómetro se detendrá al instante. El test mide cuántos segundos mantienes la postura.
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-xs text-slate-500 mb-4">
              Realiza la prueba siempre en el <strong>mismo sitio</strong>, sobre superficie lisa y firme (preferiblemente descalzo).
            </div>
            <h4 className="font-bold text-sm text-rose-600 mb-1">Criterios de parada:</h4>
            <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
              <li>Despegar las manos de las caderas.</li>
              <li>Apoyar el pie elevado en el suelo o la otra pierna.</li>
              <li>Saltar o desplazar el pie de apoyo.</li>
            </ul>
          </div>

          {/* Tiempo de preparación */}
          <div className="mt-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Tiempo de preparación</label>
            <div className="flex justify-center gap-2">
              {[5, 10, 15, 20].map((t) => (
                <button key={t} onClick={() => setPrepTime(t)}
                  className={`w-12 h-10 rounded-lg font-bold border-2 transition-all ${prepTime === t ? 'bg-rose-100 text-rose-700 border-rose-400' : 'bg-slate-100 text-slate-600 border-transparent'}`}>
                  {t}s
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-100 text-center">
            <strong>Mecanismo de parada:</strong> al perder el equilibrio, <strong>TOCA CUALQUIER PARTE DE LA PANTALLA</strong> para detener el cronómetro.
          </div>

          <button onClick={startPrep}
            className="mt-4 mb-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
            <Play size={20} /> Iniciar Preparación
          </button>
        </div>
      )}

      {/* ── RUN: ejecución (touch anywhere para detener) ── */}
      {screen === 'run' && (
        <div
          onClick={stopTest}
          className={`fixed inset-0 z-[70] flex flex-col items-center justify-center p-6 cursor-pointer transition-colors duration-500 ${runPhase === 'active' ? 'bg-emerald-100' : 'bg-slate-800'}`}
        >
          {/* Imagen de postura de referencia (no interfiere con el touch anywhere) */}
          <img src="/images/balance-pose.png" alt="Postura correcta"
            className="absolute bottom-4 right-4 w-40 h-40 object-contain opacity-20 pointer-events-none select-none" />

          {/* Botón de abandonar (área pequeña, no dispara el touch anywhere) */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowAbandon(true) }}
            aria-label="Abandonar"
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/20 text-white/80 hover:bg-black/40 flex items-center justify-center transition-colors z-[75]"
          >
            <X size={18} />
          </button>

          {runPhase === 'prep' ? (
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-slate-300 mb-4 tracking-widest uppercase">Prepárate</h2>
              <div className="text-8xl font-black text-white tabular-nums drop-shadow-lg">{countdown}</div>
              <p className="mt-8 text-slate-400 max-w-xs">Adopta la postura. El tiempo comenzará automáticamente. Toca para cancelar.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center w-full">
              <div className="mb-6 flex flex-col items-center">
                <span className="w-4 h-4 bg-rose-500 rounded-full mb-2 animate-pulse" />
                <span className="text-emerald-800 font-bold tracking-widest uppercase text-sm">Test Activo</span>
              </div>
              <div className="text-7xl font-black text-emerald-900 tabular-nums tracking-tighter">{chrono}</div>
              <span className="text-emerald-700 text-xl font-bold mt-2">segundos</span>
              <p className="absolute bottom-12 text-emerald-900 font-bold text-lg px-4 opacity-70">TOCA LA PANTALLA PARA DETENER</p>
            </div>
          )}

          {/* Diálogo de abandono (envuelto para que sus clics no disparen el touch anywhere) */}
          <div onClick={(e) => e.stopPropagation()}>
            <ConfirmDialog
              open={showAbandon}
              title="Abandonar evaluación"
              message="¿Seguro que quieres abandonar? Se perderá el progreso y no se guardará ningún resultado."
              onConfirm={abandonTest}
              onCancel={() => setShowAbandon(false)}
            />
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === 'results' && (() => {
        // Color del resultado según el percentil alcanzado
        const resultColor = !percentiles ? 'from-slate-500 to-slate-700'
          : finalTime >= percentiles.p75 ? 'from-emerald-500 to-green-700'
          : finalTime >= percentiles.p25 ? 'from-amber-500 to-orange-600'
          : 'from-rose-500 to-rose-700'
        return (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col space-y-4">
          <h2 className="text-2xl font-black text-center text-slate-800 pt-2">Resultado</h2>

          {/* Hero (color según percentil) */}
          <div className={`bg-gradient-to-br ${resultColor} text-white p-6 rounded-3xl shadow-xl flex flex-col items-center relative overflow-hidden`}>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full" />
            <span className="text-white/80 font-medium uppercase tracking-wider text-sm mb-1">Test: {modality}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tighter">{finalTime.toFixed(2)}</span>
              <span className="text-xl font-bold text-white/70">s</span>
            </div>
            <div className="mt-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-center w-full border border-white/30">
              <p className="text-xs text-white/80 uppercase tracking-wide">Clasificación poblacional</p>
              <p className="font-bold text-lg mt-0.5">{percentiles ? classify(finalTime, percentiles) : 'Datos no disponibles'}</p>
            </div>
          </div>

          {/* Percentil + tribu + feedback */}
          {percentiles && (() => {
            const pct = estimatePercentile(finalTime, percentiles.p25, percentiles.p50, percentiles.p75, true)
            return (
              <>
                <PercentileGauge
                  userValue={+finalTime.toFixed(1)} unit="s"
                  p25={percentiles.p25} p50={percentiles.p50} p75={percentiles.p75}
                  higherIsBetter={true} estimatedPercentile={pct} testLabel={isClosed ? 'Equil. OC' : 'Equil. OA'}
                  tribeValues={tribeValuesFor(isClosed ? 'balance_oc' : 'balance_oa')} tribeUserValue={+finalTime.toFixed(1)}
                />
                <FeedbackCard feedback={getFeedback('balance', pct)} />
              </>
            )
          })()}

          {/* Historial */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700 mb-2 text-sm">Historial de rendimiento</h3>
            <div className="h-44">
              <HistoryLineChart data={history} color="#f43f5e" unit="s" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto pb-2">
            <button onClick={onBack} className="bg-slate-200 text-slate-700 text-sm font-bold py-4 rounded-xl">Volver</button>
            <button onClick={() => setScreen('instructions')} className="bg-rose-500 text-white text-sm font-bold py-4 rounded-xl shadow-md">Nuevo intento</button>
          </div>
        </div>
        )
      })()}
    </div>
  )
}

// ── Barra de percentiles (P25 rojo / P50-P75 amarillo / >P75 verde + marcador último test) ──
function PercentileBar({ p, modality, lastScore }: { p: Percentiles; modality: Modality; lastScore?: number }) {
  const maxVal = modality === 'Ojos Abiertos' ? 50 : Math.max(p.p75 * 1.3, 15)
  const redPct = (p.p25 / maxVal) * 100
  const yellowPct = ((p.p75 - p.p25) / maxVal) * 100
  const greenPct = 100 - redPct - yellowPct
  const ceiling = p.p50 === p.p75 // efecto techo (Ojos Abiertos)
  const markerPct = lastScore != null ? Math.min(100, (lastScore / maxVal) * 100) : null

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <h4 className="text-sm font-bold text-slate-700 mb-6 text-center">Tus percentiles y última marca</h4>
      <div className="relative w-full">
        <div className="w-full h-3 rounded-full overflow-hidden flex shadow-inner">
          <div className="h-full bg-rose-400" style={{ width: `${redPct}%` }} />
          <div className="h-full bg-amber-400" style={{ width: `${yellowPct}%` }} />
          <div className="h-full bg-emerald-400" style={{ width: `${greenPct}%` }} />
        </div>
        {/* Etiquetas */}
        <div className="absolute top-4 text-[10px] text-slate-500 font-bold -translate-x-1/2 whitespace-nowrap" style={{ left: `${redPct}%` }}>P25 ({p.p25}s)</div>
        {ceiling ? (
          <div className="absolute top-4 text-[10px] text-slate-500 font-bold -translate-x-1/2 whitespace-nowrap" style={{ left: `${(p.p50 / maxVal) * 100}%` }}>P50/P75 ({p.p50}s)</div>
        ) : (
          <>
            <div className="absolute top-4 text-[10px] text-slate-500 font-bold -translate-x-1/2 whitespace-nowrap" style={{ left: `${(p.p50 / maxVal) * 100}%` }}>P50 ({p.p50}s)</div>
            <div className="absolute top-7 text-[10px] text-slate-500 font-bold -translate-x-1/2 whitespace-nowrap" style={{ left: `${(p.p75 / maxVal) * 100}%` }}>P75 ({p.p75}s)</div>
          </>
        )}
        {/* Marcador del último test */}
        {markerPct != null && (
          <div className="absolute -top-1.5 w-5 h-5 bg-white border-4 border-rose-500 rounded-full shadow -translate-x-1/2 z-10" style={{ left: `${markerPct}%` }}>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">Últ: {lastScore}s</div>
          </div>
        )}
      </div>
    </div>
  )
}
