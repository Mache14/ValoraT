import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, BrainCircuit, Info, RotateCcw, CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { useWebAudio } from '../../../hooks/useWebAudio'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { FeedbackCard } from '../../../components/ui/FeedbackCard'
import { estimatePercentile } from '../../../utils/percentileUtils'
import { getFeedback } from '../../../data/testFeedbackMessages'
import { tribeValuesFor } from '../../../data/mockTribeData'
import {
  AGE_GROUPS, getNorms, getTmtBPercentiles, buildDiagnosis,
  type AgeGroup, type Education,
} from './tmtNorms'

/**
 * TrailMakingTest — Test de conexión de huellas (TMT-A y TMT-B).
 * Evalúa velocidad de procesamiento (A) y flexibilidad cognitiva / función ejecutiva (B).
 * Tablero procedural sin líneas de conexión (validez clínica). Baremos de Tombaugh (2004).
 *
 * El tablero usa fondo oscuro de alto contraste (necesario clínicamente); el resto de
 * pantallas usan el tema claro de ValoraT. Requiere orientación horizontal en móvil.
 */

interface TrailMakingTestProps {
  onBack: () => void
}

type Screen = 'welcome' | 'info' | 'run' | 'results'
type Part = 'A' | 'B'
type InfoPhase = 'A_PRACTICE' | 'A_REAL' | 'B_PRACTICE' | 'B_REAL'

interface Circle {
  id: number
  label: number | string
  x: number // 0-1000 (viewBox 16:9)
  y: number // 0-562
  visited: boolean
}

interface Results {
  timeA: number; timeB: number
  errorsA: number; errorsB: number
  distanceA: number; distanceB: number
  errorsSeq: number; errorsPers: number
}

const EMPTY_RESULTS: Results = {
  timeA: 0, timeB: 0, errorsA: 0, errorsB: 0,
  distanceA: 0, distanceB: 0, errorsSeq: 0, errorsPers: 0,
}

// ── Generación de la secuencia teórica ──
function getSequence(part: Part, isPractice: boolean): (number | string)[] {
  if (part === 'A') {
    const max = isPractice ? 5 : 25
    return Array.from({ length: max }, (_, i) => i + 1)
  }
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  const maxItems = isPractice ? 5 : 25
  const seq: (number | string)[] = []
  let n = 0, l = 0
  for (let i = 0; i < maxItems; i++) {
    if (i % 2 === 0) seq.push(nums[n++])
    else seq.push(letters[l++])
  }
  return seq
}

// ── Distribución procedural por relajación de fuerzas (16:9) ──
function generateLayout(count: number): { x: number; y: number }[] {
  const width = 1000, height = 562
  const marginX = 75, marginY = 55
  const minDist = 38 * 2.1
  const points = Array.from({ length: count }, () => ({
    x: marginX + Math.random() * (width - 2 * marginX),
    y: marginY + Math.random() * (height - 2 * marginY),
  }))
  for (let iter = 0; iter < 75; iter++) {
    for (let i = 0; i < count; i++) {
      let fx = 0, fy = 0
      for (let j = 0; j < count; j++) {
        if (i === j) continue
        const dx = points[i].x - points[j].x
        const dy = points[i].y - points[j].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        if (dist < minDist) {
          const f = (minDist - dist) / dist
          fx += dx * f * 0.4
          fy += dy * f * 0.4
        }
      }
      points[i].x = Math.max(marginX, Math.min(width - marginX, points[i].x + fx))
      points[i].y = Math.max(marginY, Math.min(height - marginY, points[i].y + fy))
    }
  }
  return points
}

function pathDistance(layout: { x: number; y: number }[]): number {
  let total = 0
  for (let i = 0; i < layout.length - 1; i++) {
    const dx = layout[i + 1].x - layout[i].x
    const dy = layout[i + 1].y - layout[i].y
    total += Math.sqrt(dx * dx + dy * dy)
  }
  return Math.round(total)
}

export function TrailMakingTest({ onBack }: TrailMakingTestProps) {
  const audio = useWebAudio()

  const [screen, setScreen] = useState<Screen>('welcome')
  const [age, setAge] = useState<AgeGroup>('45-54')
  const [education, setEducation] = useState<Education>('high')
  const [infoPhase, setInfoPhase] = useState<InfoPhase>('A_PRACTICE')

  const [part, setPart] = useState<Part>('A')
  const [isPractice, setIsPractice] = useState(true)
  const [circles, setCircles] = useState<Circle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sequence, setSequence] = useState<(number | string)[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [timerDisplay, setTimerDisplay] = useState('0.0')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [results, setResults] = useState<Results>(EMPTY_RESULTS)
  const [isPortrait, setIsPortrait] = useState(false)
  const [feedbackTip, setFeedbackTip] = useState<string | null>(null)
  const [showAbandon, setShowAbandon] = useState(false)

  // Refs para datos mutables que leen los timers (evita closures obsoletos)
  const startTimeRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const errorsRef = useRef({ total: 0, sequence: 0, alternation: 0 })
  const resultsRef = useRef<Results>(EMPTY_RESULTS)
  const partRef = useRef<Part>('A')
  const practiceRef = useRef(true)
  const finishPhaseRef = useRef<() => void>(() => {})

  // ── Detección de orientación (forzar landscape en móvil) ──
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Limpieza del timer al desmontar
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  // Abandonar la evaluación: limpia timers y vuelve a la configuración (sin guardar)
  const abandonTest = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setShowAbandon(false)
    setCountdown(null)
    setScreen('welcome')
  }, [])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    startTimeRef.current = performance.now()
    timerRef.current = window.setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      setTimerDisplay(elapsed.toFixed(1))
      if (elapsed >= 300) { stopTimer(); finishPhaseRef.current() } // límite de seguridad 5 min
    }, 100)
  }, [stopTimer])

  // ── Configurar el tablero ──
  const setupBoard = useCallback((p: Part, practice: boolean) => {
    const count = practice ? 5 : 25
    const seq = getSequence(p, practice)
    const layout = generateLayout(count)

    if (!practice) {
      const d = pathDistance(layout)
      if (p === 'A') resultsRef.current.distanceA = d
      else resultsRef.current.distanceB = d
    }

    // Mezclar posiciones espaciales
    const idxs = Array.from({ length: count }, (_, i) => i)
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[idxs[i], idxs[j]] = [idxs[j], idxs[i]]
    }
    const newCircles: Circle[] = idxs.map((seqIndex, i) => ({
      id: seqIndex,
      label: seq[seqIndex],
      x: layout[i].x,
      y: layout[i].y,
      visited: false,
    }))

    errorsRef.current = { total: 0, sequence: 0, alternation: 0 }
    setErrorCount(0)
    setSequence(seq)
    setCurrentIndex(0)
    setCircles(newCircles)
    setTimerDisplay('0.0')
  }, [])

  // ── Cuenta atrás antes del tablero ──
  const startCountdown = useCallback((p: Part, practice: boolean) => {
    setScreen('run')
    setCountdown(3)
    let n = 3
    const iv = setInterval(() => {
      n--
      if (n > 0) setCountdown(n)
      else {
        clearInterval(iv)
        setCountdown(null)
        setupBoard(p, practice)
      }
    }, 900)
  }, [setupBoard])

  // ── Mostrar pantalla de instrucciones ──
  const showInfo = useCallback((phase: InfoPhase) => {
    setInfoPhase(phase)
    setScreen('info')
  }, [])

  // ── Finalizar una fase ──
  const finishPhase = useCallback(() => {
    stopTimer()
    audio.playComplete()
    const elapsed = (performance.now() - startTimeRef.current) / 1000
    const p = partRef.current
    const practice = practiceRef.current

    if (practice) {
      // Práctica completada → pasa al test real de la misma parte
      if (p === 'A') { practiceRef.current = false; setIsPractice(false); showInfo('A_REAL') }
      else { practiceRef.current = false; setIsPractice(false); showInfo('B_REAL') }
      return
    }

    if (p === 'A') {
      resultsRef.current.timeA = elapsed
      resultsRef.current.errorsA = errorsRef.current.total
      resultsRef.current.errorsSeq += errorsRef.current.sequence
      partRef.current = 'B'; practiceRef.current = true
      setPart('B'); setIsPractice(true)
      showInfo('B_PRACTICE')
    } else {
      resultsRef.current.timeB = elapsed
      resultsRef.current.errorsB = errorsRef.current.total
      resultsRef.current.errorsSeq += errorsRef.current.sequence
      resultsRef.current.errorsPers += errorsRef.current.alternation
      setResults({ ...resultsRef.current })
      // Guardar en localStorage (migrará a Supabase más adelante)
      try {
        const hist = JSON.parse(localStorage.getItem('tmt_history_v1') ?? '[]')
        hist.push({
          id: Date.now(),
          date: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
          age, education,
          timeA: +resultsRef.current.timeA.toFixed(2),
          timeB: +resultsRef.current.timeB.toFixed(2),
          ratio: resultsRef.current.timeA > 0 ? +(resultsRef.current.timeB / resultsRef.current.timeA).toFixed(2) : 0,
          errorsB: resultsRef.current.errorsB,
        })
        localStorage.setItem('tmt_history_v1', JSON.stringify(hist))
      } catch { /* almacenamiento no disponible */ }
      setScreen('results')
    }
  }, [stopTimer, audio, showInfo, age, education])

  // Mantener el ref apuntando a la última versión de finishPhase
  finishPhaseRef.current = finishPhase

  // ── Interacción con un círculo ──
  const handleCircle = useCallback((circleId: number) => {
    const clicked = circles.find((c) => c.id === circleId)
    if (!clicked) return

    if (circleId === currentIndex) {
      // Acierto
      if (currentIndex === 0) startTimer()
      audio.playCorrect()
      setCircles((prev) => prev.map((c) => (c.id === circleId ? { ...c, visited: true } : c)))
      const next = currentIndex + 1
      setCurrentIndex(next)
      setFeedbackTip(null)
      if (next >= sequence.length) finishPhase()
    } else {
      // Error
      if (clicked.visited) return
      audio.playIncorrect()
      errorsRef.current.total++
      setErrorCount(errorsRef.current.total)
      // Clasificar error (Parte B: alternancia vs secuencia)
      if (partRef.current === 'A') {
        errorsRef.current.sequence++
      } else {
        const expected = sequence[currentIndex]
        const expectedIsNum = typeof expected === 'number'
        const clickedIsNum = typeof clicked.label === 'number'
        if (expectedIsNum !== clickedIsNum) {
          errorsRef.current.alternation++
          setFeedbackTip(expectedIsNum ? 'Alternancia: ahora toca un NÚMERO.' : 'Alternancia: ahora toca una LETRA.')
          setTimeout(() => setFeedbackTip(null), 3000)
        } else {
          errorsRef.current.sequence++
        }
      }
    }
  }, [circles, currentIndex, sequence, startTimer, audio, finishPhase])

  // ── Iniciar el test desde welcome ──
  const handleStart = () => {
    resultsRef.current = { ...EMPTY_RESULTS }
    partRef.current = 'A'; practiceRef.current = true
    setPart('A'); setIsPractice(true); setResults(EMPTY_RESULTS)
    showInfo('A_PRACTICE')
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      {/* ── WELCOME: configuración del perfil ── */}
      {screen === 'welcome' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col">
          <div className="flex items-center gap-3 pt-2 mb-6">
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Trail Making Test</h1>
              <p className="text-xs text-slate-500">Velocidad de procesamiento y flexibilidad cognitiva</p>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-4 mb-4 space-y-2 text-sm">
            <p className="text-slate-700"><strong>¿Qué mide?</strong> Tu velocidad de procesamiento mental y tu capacidad para alternar entre tareas (función ejecutiva), conectando círculos en orden (Tombaugh, 2004).</p>
            <p className="text-slate-700"><strong>¿Cómo?</strong> En horizontal, conecta los números en orden (Parte A) y luego alternando números y letras: 1-A-2-B... (Parte B), lo más rápido posible.</p>
            <p className="text-slate-700"><strong>¿Qué significa?</strong> Tiempos rápidos indican buena agilidad mental. Tiempos lentos pueden asociarse con deterioro cognitivo y se benefician de estimulación y ejercicio.</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Grupo de edad</label>
              <select value={age} onChange={(e) => setAge(e.target.value as AgeGroup)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-700 focus:border-orange-400 outline-none">
                {AGE_GROUPS.map((g) => <option key={g} value={g}>{g} años</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nivel educativo</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setEducation('high')}
                  className={`py-3 rounded-xl border-2 font-medium text-sm transition-colors ${education === 'high' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}>
                  Secundaria o superior
                </button>
                <button onClick={() => setEducation('low')}
                  className={`py-3 rounded-xl border-2 font-medium text-sm transition-colors ${education === 'low' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500'}`}>
                  Primaria o básica
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-indigo-700 text-xs flex gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>En móvil se te pedirá girar la pantalla a <strong>horizontal</strong> para realizar la prueba.</p>
          </div>

          <button onClick={handleStart}
            className="mt-auto mb-2 w-full bg-orange-500 hover:bg-orange-600 active:translate-y-px text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all">
            Comenzar Evaluación
          </button>
        </div>
      )}

      {/* ── INFO: instrucciones de fase ── */}
      {screen === 'info' && (
        <div className="max-w-md mx-auto p-5 min-h-full flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-4">
            <div className={`inline-flex w-12 h-12 rounded-full items-center justify-center text-lg font-bold ${infoPhase.startsWith('A') ? 'bg-orange-100 text-orange-600' : 'bg-violet-100 text-violet-600'}`}>
              {infoPhase.startsWith('A') ? 'A' : 'B'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {infoPhase === 'A_PRACTICE' && 'Parte A: Práctica'}
                {infoPhase === 'A_REAL' && 'Parte A: Evaluación Real'}
                {infoPhase === 'B_PRACTICE' && 'Parte B: Práctica'}
                {infoPhase === 'B_REAL' && 'Parte B: Evaluación Real'}
              </h2>
              <p className="text-[11px] uppercase tracking-wider font-bold text-orange-400 mt-1">
                {infoPhase.includes('PRACTICE') ? 'Fase de práctica' : 'Test cronometrado'}
              </p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {infoPhase === 'A_PRACTICE' && 'Conecta los círculos en orden ascendente del 1 al 5, lo más rápido posible.'}
              {infoPhase === 'A_REAL' && 'Ahora el test real: conecta los círculos del 1 al 25 en orden, lo más rápido posible.'}
              {infoPhase === 'B_PRACTICE' && 'Alterna números y letras: 1, A, 2, B, 3, C... Realiza esta breve práctica.'}
              {infoPhase === 'B_REAL' && 'Test final: alterna 1-A-2-B-3-C... hasta el 13. Lo más rápido posible.'}
            </p>
            <div className="flex items-center justify-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 rounded-lg py-2">
              {infoPhase.startsWith('A')
                ? <span>1 → 2 → 3 → ... → {infoPhase === 'A_REAL' ? 25 : 5}</span>
                : <span>1 → <span className="text-violet-600 font-bold">A</span> → 2 → <span className="text-violet-600 font-bold">B</span> → ...</span>}
            </div>
            <button
              onClick={() => startCountdown(infoPhase.startsWith('A') ? 'A' : 'B', infoPhase.includes('PRACTICE'))}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-colors">
              Iniciar Fase
            </button>
          </div>
        </div>
      )}

      {/* ── RUN: tablero (fondo oscuro, clínico) ── */}
      {screen === 'run' && (
        <div className="fixed inset-0 bg-slate-950 flex flex-col">
          {/* Aviso de orientación vertical */}
          {isPortrait && (
            <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
              <RotateCcw size={56} className="text-orange-400 mb-4 animate-pulse" />
              <h3 className="text-white font-bold text-lg mb-1">Gira el dispositivo</h3>
              <p className="text-slate-400 text-sm max-w-xs">Coloca el teléfono en horizontal para realizar el Trail Making Test correctamente.</p>
            </div>
          )}

          {/* Barra de estado */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAbandon(true)} aria-label="Abandonar"
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors">
                <X size={16} />
              </button>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${part === 'A' ? 'bg-orange-900 text-orange-200' : 'bg-violet-900 text-violet-200'}`}>
                PARTE {part} {isPractice && '· PRÁCTICA'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div><span className="text-[8px] text-slate-400 block uppercase font-semibold">Errores</span><span className="text-sm font-extrabold text-rose-500">{errorCount}</span></div>
              <div><span className="text-[8px] text-slate-400 block uppercase font-semibold">Tiempo</span><span className="text-sm font-mono font-bold text-emerald-400">{timerDisplay}s</span></div>
            </div>
          </div>

          {/* Lienzo */}
          <div className="flex-1 flex items-center justify-center p-2">
            <div className="w-full max-w-5xl aspect-[16/9] relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              {/* Cuenta atrás */}
              {countdown !== null && (
                <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">La prueba inicia en</p>
                  <div className="text-6xl font-extrabold text-orange-500">{countdown}</div>
                </div>
              )}

              {/* Círculos: TODOS los no visitados se ven IGUALES (sin pista del objetivo)
                  y sin líneas de conexión — validez cognitiva del TMT */}
              {circles.map((c) => (
                <button
                  key={c.id}
                  onPointerDown={(e) => { e.preventDefault(); handleCircle(c.id) }}
                  style={{
                    left: `${c.x / 10}%`,
                    top: `${c.y / 5.62}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '6.8%',
                    height: '12%',
                    touchAction: 'manipulation',
                  }}
                  className={`absolute flex items-center justify-center rounded-full text-xs sm:text-sm font-extrabold shadow-md border-2 transition-colors ${
                    c.visited
                      ? 'bg-emerald-600 border-emerald-500 text-white pointer-events-none'
                      : 'bg-white text-slate-950 border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Indicación inferior (genérica, sin revelar el objetivo) */}
          <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 text-center shrink-0">
            {feedbackTip
              ? <span className="text-amber-400 text-xs font-semibold">{feedbackTip}</span>
              : <span className="text-slate-500 text-xs">Conecta los círculos en el orden correcto lo más rápido posible</span>}
          </div>

          <ConfirmDialog
            open={showAbandon}
            title="Abandonar evaluación"
            message="¿Seguro que quieres abandonar? Se perderá el progreso de este test."
            onConfirm={abandonTest}
            onCancel={() => setShowAbandon(false)}
          />
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === 'results' && (() => {
        const norm = getNorms(age, education)
        const diff = results.timeB - results.timeA
        const ratio = results.timeA > 0 ? results.timeB / results.timeA : 0
        const diag = buildDiagnosis(results.timeA, results.timeB, norm.b)
        const tmtP = getTmtBPercentiles(age, education)
        const tmtPercentile = estimatePercentile(results.timeB, tmtP.p25, tmtP.p50, tmtP.p75, false)
        const tmtFeedback = getFeedback('tmt', tmtPercentile)
        const diagStyles = {
          healthy: { dot: 'bg-emerald-500', text: 'text-emerald-600', icon: CheckCircle2 },
          mild: { dot: 'bg-amber-500', text: 'text-amber-600', icon: AlertTriangle },
          deficit: { dot: 'bg-rose-500', text: 'text-rose-600', icon: AlertTriangle },
        }[diag.status]
        const DiagIcon = diagStyles.icon
        const barA = Math.min(100, (results.timeA / (norm.a * 2.3)) * 100)
        const barNormA = Math.min(100, (norm.a / (norm.a * 2.3)) * 100)
        const barB = Math.min(100, (results.timeB / (norm.b * 2.3)) * 100)
        const barNormB = Math.min(100, (norm.b / (norm.b * 2.3)) * 100)

        return (
          <div className="max-w-md mx-auto p-5 min-h-full space-y-4 pb-8">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-xl font-bold text-slate-800">Análisis del TMT</h2>
              <button onClick={onBack} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">Volver</button>
            </div>
            <p className="text-xs text-slate-500">Perfil: {age} años · {education === 'high' ? '≥12 años de escolaridad' : '<12 años de escolaridad'}</p>

            {/* Tiempos principales */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-400">Parte A</span>
                <div className="text-2xl font-extrabold text-orange-500">{results.timeA.toFixed(1)}s</div>
                <div className="text-[9px] text-slate-400">Norma: {norm.a}s</div>
              </div>
              <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                <span className="text-[9px] uppercase font-bold text-slate-400">Parte B</span>
                <div className="text-2xl font-extrabold text-violet-500">{results.timeB.toFixed(1)}s</div>
                <div className="text-[9px] text-slate-400">Norma: {norm.b}s</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-indigo-400">Diferencia B−A</span>
                <div className="text-2xl font-extrabold text-indigo-500">{diff.toFixed(1)}s</div>
                <div className="text-[9px] text-indigo-400/80">Coste de alternancia</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-emerald-500">Ratio B/A</span>
                <div className="text-2xl font-extrabold text-emerald-600">{ratio.toFixed(2)}</div>
                <div className="text-[9px] text-emerald-500/80">Normal: 2.0–3.0</div>
              </div>
            </div>

            {/* Comparativa poblacional */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Comparativa (baremo Tombaugh)</h3>
              {[
                { label: 'TMT-A', user: barA, normP: barNormA, color: 'bg-orange-500', t: results.timeA, n: norm.a },
                { label: 'TMT-B', user: barB, normP: barNormB, color: 'bg-violet-500', t: results.timeB, n: norm.b },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600 font-semibold">{b.label}</span>
                    <span className="font-mono text-slate-500">Tú {b.t.toFixed(1)}s · Norma {b.n}s</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full relative overflow-hidden border border-slate-200">
                    <div className="absolute top-0 bottom-0 bg-slate-300 rounded-full" style={{ width: `${b.normP}%` }} />
                    <div className={`absolute top-0 bottom-0 ${b.color} rounded-full transition-all duration-700`} style={{ width: `${b.user}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Percentil + tribu */}
            <PercentileGauge
              userValue={+results.timeB.toFixed(1)} unit="s"
              p25={tmtP.p25} p50={tmtP.p50} p75={tmtP.p75}
              higherIsBetter={false} estimatedPercentile={tmtPercentile} testLabel="TMT-B"
              tribeValues={tribeValuesFor('tmt_b')} tribeUserValue={+results.timeB.toFixed(1)}
            />

            {/* Feedback personalizado por percentil */}
            <FeedbackCard feedback={tmtFeedback} />

            {/* Diagnóstico técnico */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full ${diagStyles.dot}`} />
                <span className={`font-bold text-sm ${diagStyles.text} flex items-center gap-1.5`}>
                  <DiagIcon size={15} /> {diag.title}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{diag.description}</p>
            </div>

            {/* Telemetría de errores */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-100 p-3 rounded-xl text-center"><span className="text-[9px] text-slate-400 uppercase font-bold block">Errores A</span><span className="text-lg font-bold text-slate-700">{results.errorsA}</span></div>
              <div className="bg-white border border-slate-100 p-3 rounded-xl text-center"><span className="text-[9px] text-slate-400 uppercase font-bold block">Errores B</span><span className="text-lg font-bold text-slate-700">{results.errorsB}</span></div>
              <div className="bg-white border border-slate-100 p-3 rounded-xl text-center"><span className="text-[9px] text-slate-400 uppercase font-bold block">Perseverac.</span><span className="text-lg font-bold text-amber-500">{results.errorsPers}</span></div>
            </div>

            <button onClick={() => { setScreen('welcome') }}
              className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
              <BrainCircuit size={18} /> Nueva Evaluación
            </button>
          </div>
        )
      })()}
    </div>
  )
}
