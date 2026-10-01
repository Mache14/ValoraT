import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, Armchair, Info } from 'lucide-react'
import { TestInstructions } from '../../../components/ui/TestInstructions'
import { PercentileGauge } from '../../../components/ui/PercentileGauge'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'
import { estimatePercentile } from '../../../utils/percentileUtils'
import {
  getNormativeData, evaluateChairReach, CHAIRREACH_TONE_CLASSES,
  CHAIRREACH_STORAGE_KEY, type ChairReachGender, type ChairReachSession,
} from './chairReachNorms'

type FlowMode = 'instructions' | 'measure' | 'report'

/**
 * ChairReachTest — Chair Sit-and-Reach (flexión de tronco en silla).
 * Prueba de flexibilidad isquiosural del Senior Fitness Test: sentado en el borde de una
 * silla estable, una pierna extendida con el talón apoyado, se desliza la mano hacia la
 * punta del pie. Registro manual en cm con signo (+ sobrepasa el pie, − no llega),
 * mejor marca de dos intentos.
 */
export function ChairReachTest({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<FlowMode>('instructions')

  // Perfil
  const [gender, setGender] = useState<ChairReachGender>('Hombre')
  const [age, setAge] = useState('55')

  // Intentos (cm, con signo)
  const [try1, setTry1] = useState('')
  const [try2, setTry2] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Historial
  const [history, setHistory] = useState<ChairReachSession[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAIRREACH_STORAGE_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch { /* */ }
  }, [])

  const handleSave = () => {
    const ageVal = parseInt(age, 10)
    const v1 = parseFloat(try1)
    const v2 = try2 ? parseFloat(try2) : NaN

    if (!age || isNaN(ageVal) || ageVal < 18 || ageVal > 100) {
      setFormError('Introduce una edad válida (18-100 años).')
      return
    }
    if (!try1 || isNaN(v1)) {
      setFormError('Registra al menos el primer intento (en cm, con signo − si no llegas al pie).')
      return
    }
    const best = isNaN(v2) ? v1 : Math.max(v1, v2)
    if (best < -40 || best > 40) {
      setFormError('La marca debe estar entre −40 y +40 cm. Revisa la medición.')
      return
    }

    const assessment = evaluateChairReach(ageVal, gender, best)
    const session: ChairReachSession = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      age: ageVal,
      gender,
      cm: best,
      assessment: assessment.label,
    }
    const updated = [...history, session]
    setHistory(updated)
    localStorage.setItem(CHAIRREACH_STORAGE_KEY, JSON.stringify(updated))
    setFormError(null)
    setMode('report')
  }

  const resetForm = () => {
    setTry1('')
    setTry2('')
    setFormError(null)
    setMode('instructions')
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto p-5 min-h-full flex flex-col pb-24">

        {/* ── CABECERA ── */}
        <div className="flex items-center gap-3 pt-2 mb-6">
          <button
            onClick={() => {
              if (mode === 'instructions') onBack()
              else if (mode === 'report') resetForm()
              else setMode('instructions')
            }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-wider">Chair Sit-and-Reach</h1>
            <p className="text-xs text-slate-500 font-medium">Flexibilidad Isquiosural</p>
          </div>
        </div>

        {/* ── PANTALLA 1: INSTRUCCIONES ── */}
        {mode === 'instructions' && (
          <div className="space-y-5 animate-in">
            <TestInstructions
              accent="blue"
              measures="La extensibilidad de tu musculatura isquiosural y de la cadena posterior, determinante para la amplitud de zancada, la mecánica lumbar al agacharte y tareas cotidianas como calzarte (Rikli & Jones, 2013)."
              how="Siéntate en el borde de una silla estable (≈43 cm, apoyada contra la pared). Extiende una pierna con el talón en el suelo y el tobillo a 90°. Superpón las manos y desliza los dedos hacia la punta del pie, exhalando, hasta tu máximo SIN dolor. Mantén 2 segundos."
              keyRule="Sin rebotes y sin flexionar la rodilla extendida. Mide con una regla la distancia entre la punta de tus dedos y la punta del pie: positiva (+) si la sobrepasas, negativa (−) si no llegas. Realiza 2 intentos y registra ambos."
              meaning="Tu mejor marca se compara con los percentiles por edad y sexo del Senior Fitness Test. Valores por debajo del percentil 25 indican acortamiento isquiosural relevante para la movilidad."
            />

            <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                <Armchair size={18} />
                <span>Preparación segura</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Realiza un calentamiento suave previo (1-2 minutos de marcha) y evita la prueba si tienes
                dolor lumbar agudo. La silla debe estar firme y sin ruedas; si notas inestabilidad,
                colócala contra una pared.
              </p>
              <div className="bg-white/70 p-3 rounded-2xl flex items-start gap-2.5">
                <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Ejemplos de registro: dedos 4 cm más allá de la punta del pie → <strong>+4</strong>.
                  Dedos a 3 cm de llegar al pie → <strong>−3</strong>. Justo en la punta → <strong>0</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setMode('measure')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-colors active:translate-y-px"
            >
              Comenzar la prueba
            </button>
          </div>
        )}

        {/* ── PANTALLA 2: REGISTRO ── */}
        {mode === 'measure' && (
          <div className="space-y-5 animate-in">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil de referencia</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Sexo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Hombre', 'Mujer'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 rounded-xl border font-bold text-xs transition-colors ${gender === g ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Edad (años)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="55"
                    className="w-full p-2 rounded-xl border border-slate-200 focus:border-blue-400 outline-none text-sm font-medium text-center"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Marcas (cm, con signo)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Intento 1</label>
                  <input
                    type="number"
                    step="0.5"
                    value={try1}
                    onChange={(e) => setTry1(e.target.value)}
                    placeholder="-2.5"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 outline-none text-base font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Intento 2 (opcional)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={try2}
                    onChange={(e) => setTry2(e.target.value)}
                    placeholder="+1"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-400 outline-none text-base font-bold text-center"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Se registrará la <strong>mejor</strong> de las dos marcas. Recuerda: + sobrepasas la punta
                del pie · − no llegas · 0 justo en la punta.
              </p>
            </div>

            {formError && <p className="text-rose-500 text-sm">{formError}</p>}

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-colors active:translate-y-px"
            >
              Registrar resultado
            </button>
          </div>
        )}

        {/* ── PANTALLA 3: INFORME ── */}
        {mode === 'report' && history.length > 0 && (
          <div className="space-y-4 animate-in">
            {(() => {
              const latest = history[history.length - 1]
              const norms = getNormativeData(latest.age, latest.gender)
              const assessment = evaluateChairReach(latest.age, latest.gender, latest.cm)
              const percentile = estimatePercentile(latest.cm, norms.p25, norms.p50, norms.p75, true)

              return (
                <>
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 text-center">
                    <CheckCircle2 size={40} className="text-blue-500 mx-auto" />
                    <div>
                      <h2 className="text-lg font-black uppercase text-slate-800 tracking-wider">Registro guardado</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {latest.date} · {latest.gender} · {latest.age} años
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl inline-block px-10">
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Mejor marca</span>
                      <span className="text-3xl font-black text-slate-800">
                        {latest.cm > 0 ? `+${latest.cm}` : latest.cm}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">cm</span>
                    </div>
                  </div>

                  <PercentileGauge
                    userValue={latest.cm}
                    p25={norms.p25}
                    p50={norms.p50}
                    p75={norms.p75}
                    higherIsBetter={true}
                    estimatedPercentile={percentile}
                    testLabel="Chair Sit-and-Reach"
                    unit=" cm"
                  />

                  <div className={`rounded-3xl p-5 border space-y-1 ${CHAIRREACH_TONE_CLASSES[assessment.tone]}`}>
                    <p className="text-[10px] uppercase font-bold opacity-80 tracking-wider">Valoración de flexibilidad</p>
                    <p className="text-lg font-black">{assessment.label}</p>
                    <p className="text-xs opacity-90 leading-relaxed">{assessment.desc}</p>
                  </div>

                  {history.length > 1 && (
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Evolución de tu marca</h3>
                      <div className="h-40">
                        <HistoryLineChart
                          data={history.map((h) => ({ label: h.date, score: h.cm }))}
                          color="#3b82f6"
                          unit=" cm"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={resetForm}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg mt-4"
                  >
                    Volver a Evaluaciones
                  </button>
                </>
              )
            })()}
          </div>
        )}

      </div>
    </div>
  )
}
