import { useState, useEffect } from 'react'
import { ArrowLeft, Ruler, Zap, CheckCircle2, ShoppingBag, MapPin, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { TestInstructions } from '../../../components/ui/TestInstructions'
import { HistoryLineChart } from '../../../components/ui/HistoryLineChart'

type FlowMode = 'menu' | 'perimetros' | 'bioimpedancia' | 'report_perimetros' | 'report_bioimpedancia'

interface PerimetroRecord {
  id: number
  date: string
  cintura: number
  pantorrilla: number
  whtr: number
}

interface BiaRecord {
  id: number
  date: string
  peso: number
  grasa: number
  musculo: number
  agua?: number
}

export function AntropometriaTest({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<FlowMode>('menu')

  // Datos comunes / Perfil
  const [sex, setSex] = useState<'Hombre' | 'Mujer'>('Hombre')
  const [height, setHeight] = useState('172')

  // Formulario Perímetros
  const [cintura, setCintura] = useState('')
  const [pantorrilla, setPantorrilla] = useState('')
  const [perimetroError, setPerimetroError] = useState<string | null>(null)

  // Formulario Bioimpedancia
  const [peso, setPeso] = useState('')
  const [grasa, setGrasa] = useState('')
  const [musculo, setMusculo] = useState('')
  const [agua, setAgua] = useState('')
  const [biaError, setBiaError] = useState<string | null>(null)

  // Protocolo ESPEN Checkboxes para Bioimpedancia
  const [chkAyuno, setChkAyuno] = useState(false)
  const [chkAlcohol, setChkAlcohol] = useState(false)
  const [chkVejiga, setChkVejiga] = useState(false)
  const [chkEjercicio, setChkEjercicio] = useState(false)
  const [chkHora, setChkHora] = useState(false)

  // Historiales
  const [perimetroHistory, setPerimetroHistory] = useState<PerimetroRecord[]>([])
  const [biaHistory, setBiaHistory] = useState<BiaRecord[]>([])

  // Cargar historial
  useEffect(() => {
    try {
      const p = localStorage.getItem('antropometria_perimetros_history_v1')
      if (p) setPerimetroHistory(JSON.parse(p))
      const b = localStorage.getItem('antropometria_bioimpedancia_history_v1')
      if (b) setBiaHistory(JSON.parse(b))
    } catch { /* */ }
  }, [])

  // Guardar perímetros
  const handleSavePerimetros = () => {
    if (!cintura || !pantorrilla || !height) {
      setPerimetroError('Por favor, completa todos los campos.')
      return
    }
    const cVal = parseFloat(cintura)
    const pVal = parseFloat(pantorrilla)
    const hVal = parseFloat(height)

    if (isNaN(cVal) || isNaN(pVal) || isNaN(hVal)) {
      setPerimetroError('Introduce valores numéricos válidos.')
      return
    }

    const calculatedWhtr = cVal / hVal
    const newRecord: PerimetroRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      cintura: cVal,
      pantorrilla: pVal,
      whtr: calculatedWhtr
    }

    const updatedHistory = [...perimetroHistory, newRecord]
    setPerimetroHistory(updatedHistory)
    localStorage.setItem('antropometria_perimetros_history_v1', JSON.stringify(updatedHistory))
    setPerimetroError(null)
    setMode('report_perimetros')
  }

  // Guardar bioimpedancia
  const handleSaveBia = () => {
    if (!peso || !grasa || !musculo) {
      setBiaError('Peso, Grasa (%) y Masa Muscular (kg) son campos obligatorios.')
      return
    }
    const pesoVal = parseFloat(peso)
    const grasaVal = parseFloat(grasa)
    const musculoVal = parseFloat(musculo)
    const aguaVal = agua ? parseFloat(agua) : undefined

    if (isNaN(pesoVal) || isNaN(grasaVal) || isNaN(musculoVal)) {
      setBiaError('Introduce valores numéricos válidos.')
      return
    }

    const newRecord: BiaRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      peso: pesoVal,
      grasa: grasaVal,
      musculo: musculoVal,
      agua: aguaVal
    }

    const updatedHistory = [...biaHistory, newRecord]
    setBiaHistory(updatedHistory)
    localStorage.setItem('antropometria_bioimpedancia_history_v1', JSON.stringify(updatedHistory))
    setBiaError(null)
    setMode('report_bioimpedancia')
  }

  // Reiniciar formularios
  const resetForm = () => {
    setCintura('')
    setPantorrilla('')
    setPeso('')
    setGrasa('')
    setMusculo('')
    setAgua('')
    setChkAyuno(false)
    setChkAlcohol(false)
    setChkVejiga(false)
    setChkEjercicio(false)
    setChkHora(false)
    setPerimetroError(null)
    setBiaError(null)
    setMode('menu')
  }

  // Protocolo ESPEN completado
  const isProtocolCompliant = chkAyuno && chkAlcohol && chkVejiga && chkEjercicio && chkHora

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto p-5 min-h-full flex flex-col pb-24">

        {/* ── CABECERA COMÚN ── */}
        <div className="flex items-center gap-3 pt-2 mb-6">
          <button
            onClick={() => {
              if (mode === 'menu') onBack()
              else if (mode.startsWith('report')) resetForm()
              else setMode('menu')
            }}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-wider">Antropometría</h1>
            <p className="text-xs text-slate-500 font-medium">Composición Corporal y Perímetros</p>
          </div>
        </div>

        {/* ── PANTALLA 1: SELECTOR DE FLUJO ── */}
        {mode === 'menu' && (
          <div className="space-y-6 flex-1 flex flex-col justify-center animate-in">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Estrategia Híbrida de Medición</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                De acuerdo con la evidencia clínica del envejecimiento activo, combinamos dos dominios latentes: la
                <strong> Geometría Corporal Crónica</strong> (perímetros simples como indicador estructural) y el
                <strong> Estado Fisiológico Agudo</strong> (bioimpedancia eléctrica para el seguimiento celular e hídrico).
              </p>
              <div className="bg-slate-50 p-3 rounded-2xl flex items-start gap-2.5">
                <Info size={16} className="text-cyan-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Utiliza la antropometría manual para una señal estructural estable y libre de sesgos de hidratación, e integra la BIA como refinamiento tisular continuo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Opción A: Perímetros */}
              <button
                onClick={() => setMode('perimetros')}
                className="bg-white hover:border-cyan-400 hover:shadow-md transition-all rounded-3xl p-6 border border-slate-100 text-left flex gap-5 items-center active:scale-[0.99]"
              >
                <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                  <Ruler size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">Perímetros</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                    Cintura y pantorrilla. Medida geométrica crónica y cribado preventivo de sarcopenia.
                  </p>
                </div>
              </button>

              {/* Opción B: Bioimpedancia */}
              <button
                onClick={() => setMode('bioimpedancia')}
                className="bg-white hover:border-indigo-400 hover:shadow-md transition-all rounded-3xl p-6 border border-slate-100 text-left flex gap-5 items-center active:scale-[0.99]"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Zap size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-wide">Bioimpedancia</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                    Músculo, grasa y agua. Análisis fraccionado de tejidos mediante báscula inteligente.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── PANTALLA 2A: REGISTRO DE PERÍMETROS ── */}
        {mode === 'perimetros' && (
          <div className="space-y-5 animate-in">
            <TestInstructions
              accent="blue"
              measures="Tu adiposidad visceral/riesgo cardiometabólico (cintura) y tu masa muscular apendicular como marcador de fragilidad y sarcopenia (pantorrilla) (EWGSOP2, 2019; Staynor et al., 2020)."
              how="Utiliza una cinta métrica flexible no elástica. Mide la cintura en el punto medio entre la última costilla y la cresta ilíaca, y la pantorrilla en su punto de máxima circunferencia."
              keyRule="Medir siempre de pie, con el abdomen relajado (sin contraer) y la cinta paralela al suelo sin comprimir los tejidos blandos."
              meaning="Cintura ≤94 cm (hombres) y ≤80 cm (mujeres) indican bajo riesgo. Pantorrilla ≥34 cm (hombres) y ≥33 cm (mujeres) descartan riesgo de baja masa muscular."
            />

            {/* Imagen Guía */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guía Correcta de Medida</h3>
              <img
                src="/images/antropometria-guia.png"
                alt="Guía de medida de perímetros"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 shadow-inner"
              />
            </div>

            {/* Caja de Recomendación del Material */}
            <div className="bg-cyan-50/50 border border-cyan-100 rounded-3xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
                <Ruler size={18} />
                <span>Estandarización del Instrumento</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recomendamos utilizar una **cinta antropométrica metálica** o de fibra de vidrio no elástica.
                Evita cintas de costura de tela elástica, ya que con el tiempo ceden o se retraen induciendo a un error sistemático de hasta **2-3 cm**. Realiza la medición siempre en las mismas condiciones biomecánicas.
              </p>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Datos Fisiológicos</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Sexo de Referencia</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Hombre', 'Mujer'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSex(g)}
                        className={`py-2 rounded-xl border font-bold text-xs transition-colors ${sex === g ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-500'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Estatura (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="172"
                    className="w-full p-2 rounded-xl border border-slate-200 focus:border-cyan-400 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Cintura (cm)</label>
                  <input
                    type="number"
                    value={cintura}
                    onChange={(e) => setCintura(e.target.value)}
                    placeholder="88.5"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-cyan-400 outline-none text-base font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Pantorrilla (cm)</label>
                  <input
                    type="number"
                    value={pantorrilla}
                    onChange={(e) => setPantorrilla(e.target.value)}
                    placeholder="35.0"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-cyan-400 outline-none text-base font-bold text-center"
                  />
                </div>
              </div>

              {/* Feedback en tiempo real */}
              {cintura && height && (
                <div className="pt-2 border-t border-slate-50 space-y-2">
                  {(() => {
                    const cVal = parseFloat(cintura)
                    const hVal = parseFloat(height)
                    const whtr = cVal / hVal
                    const hasWhtrAlert = whtr >= 0.50

                    const pVal = parseFloat(pantorrilla)
                    const hasMuscularAlert = !isNaN(pVal) && ((sex === 'Hombre' && pVal < 34) || (sex === 'Mujer' && pVal < 33))

                    return (
                      <div className="space-y-2 text-xs">
                        {/* WHtR Info */}
                        <div className={`p-3 rounded-2xl border ${hasWhtrAlert ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                          <div className="flex gap-2">
                            {hasWhtrAlert ? <AlertTriangle size={16} className="flex-shrink-0" /> : <CheckCircle2 size={16} className="flex-shrink-0" />}
                            <div>
                              <p className="font-bold">Relación Cintura-Talla (WHtR): {whtr.toFixed(2)}</p>
                              <p className="text-[10px] mt-0.5 opacity-90">
                                {hasWhtrAlert
                                  ? 'Alerta: Supera el umbral de 0.50. Indica acumulación excesiva de grasa visceral y riesgo metabólico incrementado.'
                                  : 'Saludable: Tu relación se sitúa por debajo del límite de riesgo cardiometabólico global (0.50).'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Calf/Sarcopenia Info */}
                        {hasMuscularAlert && (
                          <div className="p-3 rounded-2xl border bg-rose-50 border-rose-100 text-rose-800">
                            <div className="flex gap-2">
                              <AlertCircle size={16} className="flex-shrink-0" />
                              <div>
                                <p className="font-bold">Masa Muscular Apendicular Reducida</p>
                                <p className="text-[10px] mt-0.5 opacity-90">
                                  Tu perímetro de pantorrilla ({pVal} cm) es inferior al umbral clínico de {sex === 'Hombre' ? '34 cm' : '33 cm'}.
                                  Esto es una bandera roja preventiva de sarcopenia según el consenso europeo EWGSOP2. Prioriza el entrenamiento de fuerza.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {perimetroError && <p className="text-rose-500 text-sm">{perimetroError}</p>}

            <button
              onClick={handleSavePerimetros}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-100 transition-colors active:translate-y-px"
            >
              Registrar Perímetros
            </button>
          </div>
        )}

        {/* ── PANTALLA 2B: REGISTRO DE BIOIMPEDANCIA (BIA) ── */}
        {mode === 'bioimpedancia' && (
          <div className="space-y-5 animate-in">
            <TestInstructions
              accent="indigo"
              measures="Tu composición corporal fraccionada (masa grasa, masa libre de grasa, masa muscular y agua corporal) utilizando la resistividad eléctrica de los tejidos (ESPEN, 2004; Zaplatosch et al., 2025)."
              how="Súbete descalzo a tu báscula de bioimpedancia inteligente o pesa tu cuerpo en el módulo profesional de tu farmacia habitual (1€)."
              keyRule="Para que la medición sea fiable en el seguimiento longitudinal, mantén estrictamente el mismo protocolo antes de pesarte."
              meaning="Permite diagnosticar fenotipos complejos como la obesidad sarcopénica (alta grasa FMI con bajo músculo SMMI), invisibles con el peso bruto."
            />

            {/* Caja de Marketing: Compra vs Farmacia */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <ShoppingBag size={18} />
                <span>¿Por qué Bioimpedancia en vez de peso normal?</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El peso neto no sirve para nada por sí solo si no está contextualizado. Puedes estar perdiendo peso pero perdiendo
                <strong> masa muscular valiosa</strong> en vez de grasa, lo que acelera el declive funcional.
              </p>
              <div className="pt-2 border-t border-indigo-100 flex items-start gap-2.5">
                <MapPin size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>Alternativa práctica y económica:</strong> Si no dispones de báscula inteligente en casa, casi todas las
                  <strong> farmacias locales</strong> disponen de básculas de bioimpedancia fiables por <strong>solo 1 €</strong>.
                  Una medición mensual en farmacia te aportará un dato objetivo de gran calidad científica.
                </p>
              </div>
            </div>

            {/* Checklist de Protocolo ESPEN */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Protocolo de Control Preanalítico (ESPEN)</h3>
              <p className="text-[11px] text-slate-500">
                La BIA es altamente sensible al estado hídrico. Marca las condiciones que cumples hoy para calibrar el análisis:
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'ayuno', text: 'Estado de ayuno de líquidos y comida (>4 horas)', state: chkAyuno, set: setChkAyuno },
                  { id: 'alcohol', text: 'Sin consumo de alcohol en las últimas 48 horas', state: chkAlcohol, set: setChkAlcohol },
                  { id: 'vejiga', text: 'Vejiga vacía inmediatamente antes de la medición', state: chkVejiga, set: setChkVejiga },
                  { id: 'ejercicio', text: 'Sin ejercicio físico intenso en las últimas 48 horas', state: chkEjercicio, set: setChkEjercicio },
                  { id: 'hora', text: 'Realizado a la misma hora del día (ej. al despertar)', state: chkHora, set: setChkHora },
                ].map((item) => (
                  <label key={item.id} className="flex items-start gap-3 text-xs text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.set(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                    />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>

              {!isProtocolCompliant && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex items-start gap-2 text-[10px] text-amber-800 leading-relaxed mt-2 animate-in">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    El incumplimiento de algún punto altera la impedancia. La app guardará el registro, pero recuerda que el dato de grasa y músculo puede estar sesgado temporalmente por fluctuaciones hídricas.
                  </span>
                </div>
              )}
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Métricas de Composición</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Peso Corporal (kg)</label>
                  <input
                    type="number"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="78.2"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none text-base font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Grasa Corporal (%)</label>
                  <input
                    type="number"
                    value={grasa}
                    onChange={(e) => setGrasa(e.target.value)}
                    placeholder="22.5"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none text-base font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Masa Muscular (kg)</label>
                  <input
                    type="number"
                    value={musculo}
                    onChange={(e) => setMusculo(e.target.value)}
                    placeholder="58.4"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none text-base font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Agua Corporal (%) (Op.)</label>
                  <input
                    type="number"
                    value={agua}
                    onChange={(e) => setAgua(e.target.value)}
                    placeholder="54.0"
                    className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-indigo-400 outline-none text-base font-bold text-center"
                  />
                </div>
              </div>
            </div>

            {biaError && <p className="text-rose-500 text-sm">{biaError}</p>}

            <button
              onClick={handleSaveBia}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-colors active:translate-y-px"
            >
              Registrar Composición (BIA)
            </button>
          </div>
        )}

        {/* ── REPORT 2A: INFORME DE PERÍMETROS ── */}
        {mode === 'report_perimetros' && perimetroHistory.length > 0 && (
          <div className="space-y-4 animate-in">
            {(() => {
              const latest = perimetroHistory[perimetroHistory.length - 1]
              const wVal = latest.cintura
              const pVal = latest.pantorrilla

              let wcStatus = 'Óptimo'
              let wcColor = 'bg-green-50 border-green-100 text-green-800'
              const wcLimitRisk = sex === 'Hombre' ? 94 : 80
              const wcLimitHigh = sex === 'Hombre' ? 102 : 88

              if (wVal >= wcLimitHigh) {
                wcStatus = 'Riesgo Alto'
                wcColor = 'bg-rose-50 border-rose-100 text-rose-800'
              } else if (wVal >= wcLimitRisk) {
                wcStatus = 'Riesgo Aumentado'
                wcColor = 'bg-orange-50 border-orange-100 text-orange-800'
              }

              const pLimit = sex === 'Hombre' ? 34 : 33
              const isLowMuscle = pVal < pLimit

              return (
                <>
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 text-center">
                    <CheckCircle2 size={40} className="text-cyan-500 mx-auto" />
                    <div>
                      <h2 className="text-lg font-black uppercase text-slate-800 tracking-wider">Registro Guardado</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{latest.date} · Sexo: {sex} · Talla: {height} cm</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Cintura</span>
                        <span className="text-2xl font-black text-slate-800">{wVal}</span>
                        <span className="text-xs text-slate-500 ml-0.5">cm</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Pantorrilla</span>
                        <span className="text-2xl font-black text-slate-800">{pVal}</span>
                        <span className="text-xs text-slate-500 ml-0.5">cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnóstico Cintura */}
                  <div className={`rounded-3xl p-5 border space-y-1 ${wcColor}`}>
                    <p className="text-[10px] uppercase font-bold opacity-80 tracking-wider">Estado de Adiposidad Abdominal</p>
                    <p className="text-lg font-black">{wcStatus}</p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {wcStatus === 'Óptimo'
                        ? 'Tu perímetro se mantiene bajo control, reduciendo la acumulación de grasa visceral altamente inflamatoria.'
                        : `Tu perímetro de cintura (${wVal} cm) supera el límite aconsejado de ${wcLimitRisk} cm para la población europea. Prioriza la reducción de grasa visceral.`}
                    </p>
                  </div>

                  {/* Diagnóstico Pantorrilla */}
                  <div className={`rounded-3xl p-5 border space-y-1 ${isLowMuscle ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                    <p className="text-[10px] uppercase font-bold opacity-80 tracking-wider">Estado de Masa Muscular</p>
                    <p className="text-lg font-black">{isLowMuscle ? 'Masa Muscular Reducida' : 'Masa Muscular Óptima'}</p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {isLowMuscle
                        ? `Alerta: Tu pantorrilla (${pVal} cm) está por debajo de los ${pLimit} cm recomendados. Esto eleva el riesgo preventivo de dinapenia y fragilidad muscular.`
                        : `Excelente: Tu pantorrilla se encuentra sobre el límite clínico de ${pLimit} cm, indicando una reserva muscular saludable.`}
                    </p>
                  </div>

                  {/* Gráfico de evolución de Cintura */}
                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Evolución del Perímetro de Cintura</h3>
                    <div className="h-40">
                      <HistoryLineChart
                        data={perimetroHistory.map((h) => ({ label: h.date, score: h.cintura }))}
                        color="#06b6d4"
                        unit=" cm"
                      />
                    </div>
                  </div>

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

        {/* ── REPORT 2B: INFORME DE BIOIMPEDANCIA (BIA) ── */}
        {mode === 'report_bioimpedancia' && biaHistory.length > 0 && (
          <div className="space-y-4 animate-in">
            {(() => {
              const latest = biaHistory[biaHistory.length - 1]
              const pVal = latest.peso
              const gVal = latest.grasa
              const mVal = latest.musculo

              // Estimar rango de grasa
              const limitMin = sex === 'Hombre' ? 12 : 22
              const limitMax = sex === 'Hombre' ? 22 : 32
              let fatStatus = 'Saludable'
              let fatColor = 'bg-green-50 border-green-100 text-green-800'

              if (gVal > limitMax) {
                fatStatus = gVal > (limitMax + 6) ? 'Elevado' : 'Sobrepeso'
                fatColor = 'bg-rose-50 border-rose-100 text-rose-800'
              } else if (gVal < limitMin) {
                fatStatus = 'Bajo'
                fatColor = 'bg-cyan-50 border-cyan-100 text-cyan-800'
              }

              // Calcular índices si la altura existe
              const hVal = parseFloat(height) / 100
              const fatWeight = (gVal * pVal) / 100
              const fmi = fatWeight / (hVal * hVal)
              const ffmi = (pVal - fatWeight) / (hVal * hVal)

              return (
                <>
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 text-center">
                    <CheckCircle2 size={40} className="text-indigo-500 mx-auto" />
                    <div>
                      <h2 className="text-lg font-black uppercase text-slate-800 tracking-wider">Reporte Composición</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{latest.date} · Sexo: {sex}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold">Peso</span>
                        <span className="text-lg font-black text-slate-800">{pVal}</span>
                        <span className="text-[10px] text-slate-500 ml-0.5">kg</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold">Grasa</span>
                        <span className="text-lg font-black text-slate-800">{gVal}</span>
                        <span className="text-[10px] text-slate-500 ml-0.5">%</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <span className="block text-[9px] text-slate-400 uppercase font-bold">Músculo</span>
                        <span className="text-lg font-black text-slate-800">{mVal}</span>
                        <span className="text-[10px] text-slate-500 ml-0.5">kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado de Grasa */}
                  <div className={`rounded-3xl p-5 border space-y-1 ${fatColor}`}>
                    <p className="text-[10px] uppercase font-bold opacity-80 tracking-wider">Porcentaje de Grasa Corporal</p>
                    <p className="text-lg font-black">{fatStatus}</p>
                    <p className="text-xs opacity-90 leading-relaxed">
                      Tu grasa corporal se sitúa en un {gVal}%. El rango recomendado para tu edad y sexo es de {limitMin}% a {limitMax}%.
                      {fmi && <span className="block mt-1 font-semibold text-[11px]">Índice de Masa Grasa (FMI): {fmi.toFixed(1)} kg/m²</span>}
                    </p>
                  </div>

                  {/* Estado del Músculo e Índices */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Índice Músculo-Esquelético (FFMI)</p>
                    <p className="text-lg font-black text-slate-800">{ffmi.toFixed(1)} kg/m²</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      El Índice de Masa Libre de Grasa (FFMI) normaliza tu masa libre de grasa en proporción a tu talla.
                      La media poblacional de referencia sana se sitúa en torno a los **18.3 kg/m²** (Franssen et al., 2014).
                    </p>
                  </div>

                  {/* Aviso de fluctuación hídrica (ESPEN) si no completó protocolo */}
                  {!isProtocolCompliant && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-start gap-3 text-xs text-amber-800">
                      <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Protocolo Incompleto</p>
                        <p className="text-[10px] mt-0.5 opacity-90 leading-relaxed">
                          La falta de ayuno, el ejercicio previo o la variación de hora alteran la conductancia tisular.
                          No interpretes pequeños cambios diarios como pérdida real de músculo o grasa; prioriza la tendencia en tu historial.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Gráfico de evolución de Peso y Músculo */}
                  <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Evolución de Peso e Hidratación</h3>
                    <div className="h-40">
                      <HistoryLineChart
                        data={biaHistory.map((h) => ({ label: h.date, score: h.peso }))}
                        color="#6366f1"
                        unit=" kg"
                      />
                    </div>
                  </div>

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
