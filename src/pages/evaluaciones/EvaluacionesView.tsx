import { useState, type ComponentType } from 'react'
import {
  Activity, ArrowLeft, MoveUp, Dumbbell, ShieldCheck, BrainCircuit,
  Timer, Zap, Ruler, HeartPulse, Footprints, ListChecks, Play,
  Target as TargetIcon, type LucideIcon,
} from 'lucide-react'
import { Sparkline, type SparklineStatus } from '../../components/ui/Sparkline'
import { useTestsCatalogo } from '../../hooks/useTestsCatalogo'
import { TrailMakingTest } from '../tests/tmt/TrailMakingTest'
import { PvtBTest } from '../tests/pvt/PvtBTest'
import { SingleLegOpenEyes } from '../tests/single-leg/SingleLegOpenEyes'
import { SingleLegClosedEyes } from '../tests/single-leg/SingleLegClosedEyes'
import { SitToStandTest } from '../tests/sit-to-stand/SitToStandTest'
import { ArmCurlTest } from '../tests/arm-curl/ArmCurlTest'
import { TugTest } from '../tests/tug/TugTest'
import { BallTossTest } from '../tests/ball-toss/BallTossTest'

/**
 * Registro de tests con pantalla funcional.
 * Cada testId se mapea a su componente (que recibe `onBack`).
 * Al añadir un test nuevo, basta con registrar aquí su componente.
 */
const TEST_COMPONENTS: Record<string, ComponentType<{ onBack: () => void }>> = {
  tmt: TrailMakingTest,
  pvt: PvtBTest,
  'single-leg-open': SingleLegOpenEyes,
  'single-leg-closed': SingleLegClosedEyes,
  'sit-to-stand': SitToStandTest,
  'arm-curl': ArmCurlTest,
  tug: TugTest,
  'ball-toss': BallTossTest,
}

/**
 * EvaluacionesView — pantalla de Evaluaciones.
 * Vista principal: 8 dominios con anillo de progreso (ordenables).
 * Vista de detalle: al pulsar un dominio, muestra sus pruebas con Sparklines.
 * Conexión real: lee de Supabase cuántas pruebas hay en el catálogo (badge superior).
 */

interface EvalDomain {
  id: string
  title: string
  score: number
  color: string
  stroke: string
  bgStroke: string
  alert?: boolean
  text: string
}

interface TestDetail {
  title: string
  desc: string
  trend: number[]
  status: SparklineStatus
  icon: LucideIcon
  testId?: string // si está presente y registrado, la tarjeta abre el test
}

const evalsData: EvalDomain[] = [
  { id: 'calidad',       title: 'Calidad de Vida', score: 85, color: 'text-emerald-500', stroke: '#10b981', bgStroke: '#d1fae5', text: 'Tu índice global ha subido un 4% esta semana. ¡El descanso está dando frutos!' },
  { id: 'cognicion',     title: 'Cognición',       score: 25, color: 'text-orange-500',  stroke: '#f97316', bgStroke: '#ffedd5', alert: true, text: 'Hace más de 14 días que no realizas un test cognitivo. Prioritario.' },
  { id: 'equilibrio',    title: 'Equilibrio',      score: 38, color: 'text-rose-500',    stroke: '#f43f5e', bgStroke: '#ffe4e6', alert: true, text: 'Ligera inestabilidad detectada en los últimos registros. Es necesario trabajarlo.' },
  { id: 'coordinacion',  title: 'Coordinación',    score: 60, color: 'text-amber-500',   stroke: '#f59e0b', bgStroke: '#fef3c7', text: 'Rendimiento en pruebas de coordinación disminuyendo levemente. ¡Practica más!' },
  { id: 'fuerza',        title: 'Fuerza',          score: 88, color: 'text-indigo-500',  stroke: '#6366f1', bgStroke: '#e0e7ff', text: '¡Estás en tu pico histórico! Tus piernas son un seguro de vida ahora mismo.' },
  { id: 'movilidad',     title: 'Movilidad',       score: 92, color: 'text-blue-500',    stroke: '#3b82f6', bgStroke: '#dbeafe', text: 'Sigues líder con la mejor movilidad de tu TRIBU. ¡Excelente!' },
  { id: 'resistencia',   title: 'Resistencia',     score: 75, color: 'text-teal-500',    stroke: '#14b8a6', bgStroke: '#ccfbf1', text: 'Capacidad aeróbica estable. Mantener los paseos diarios a buen ritmo.' },
  { id: 'antropometria', title: 'Antropometría',   score: 81, color: 'text-cyan-500',    stroke: '#06b6d4', bgStroke: '#cffafe', text: 'Tus niveles de composición corporal han mejorado respecto al mes anterior.' },
]

const testsDetailData: Record<string, TestDetail[]> = {
  fuerza: [
    { title: 'STS-5 reps + 30 seg', desc: 'Evalúa la fuerza y potencia muscular del tren inferior, fundamentales para la autonomía al levantarse de una silla.', trend: [60, 65, 75, 82, 88], status: 'up', icon: MoveUp, testId: 'sit-to-stand' },
    { title: '30 seg Arm Curl', desc: 'Mide la fuerza del tren superior mediante flexiones de codo con peso ligero, imitando tareas como llevar la compra.', trend: [50, 52, 55, 60, 62], status: 'up', icon: Dumbbell, testId: 'arm-curl' },
  ],
  equilibrio: [
    { title: 'Equilibrio Unipodal (Ojos Abiertos)', desc: 'Control postural básico. Medimos cuánto tiempo puedes mantener la postura sobre una pierna sin apoyo.', trend: [55, 50, 48, 42, 38], status: 'down', icon: Footprints, testId: 'single-leg-open' },
    { title: 'Equilibrio Unipodal (Ojos Cerrados)', desc: 'Prueba avanzada de propiocepción. Al anular la vista, dependes totalmente de tu sistema vestibular y motor.', trend: [40, 35, 30, 25, 20], status: 'down', icon: ShieldCheck, testId: 'single-leg-closed' },
  ],
  cognicion: [
    { title: 'Trail Making Test', desc: 'Evalúa la función cognitiva, la atención visual sostenida y la capacidad de cambio de tarea rápida.', trend: [70, 65, 60, 50, 25], status: 'down', icon: BrainCircuit, testId: 'tmt' },
    { title: 'PVT-B', desc: 'Brief Psychomotor Task. Mide tu tiempo de reacción y estado de alerta para prevenir accidentes diarios.', trend: [80, 75, 60, 40, 25], status: 'down', icon: TargetIcon, testId: 'pvt' },
  ],
  coordinacion: [
    { title: 'Time Up and Go (TUG)', desc: 'Prueba de agilidad y equilibrio dinámico. Mide el tiempo en levantarse, caminar 3 metros y volver a sentarse.', trend: [75, 70, 65, 62, 60], status: 'down', icon: Timer, testId: 'tug' },
    { title: 'Pases con pelota alternos', desc: 'Coordinación óculo-manual. Lanzar y recibir una pelota contra la pared alternando las manos de forma fluida.', trend: [80, 78, 70, 65, 60], status: 'down', icon: Activity, testId: 'ball-toss' },
  ],
  antropometria: [
    { title: 'Bioimpedancia', desc: 'Análisis de la composición corporal (porcentaje de grasa, músculo y agua) mediante una báscula inteligente.', trend: [60, 65, 70, 75, 81], status: 'up', icon: Zap },
    { title: 'Perímetro de cintura', desc: 'Marcador clave de grasa visceral y riesgo metabólico/cardiovascular. Fundamental tenerlo bajo control.', trend: [70, 72, 75, 78, 81], status: 'up', icon: Ruler },
  ],
  movilidad: [
    { title: 'Chair Sit and Reach', desc: 'Evalúa la flexibilidad de la parte inferior del cuerpo (isquiosurales), crucial para el patrón de marcha.', trend: [80, 85, 88, 90, 92], status: 'up', icon: Activity },
    { title: 'Back Scratch Test', desc: 'Flexibilidad del tren superior (hombros). Nos indica la facilidad para realizar tareas como vestirse.', trend: [75, 80, 85, 90, 92], status: 'up', icon: Activity },
  ],
  resistencia: [
    { title: '2 Minute Step Test', desc: 'Evalúa la resistencia aeróbica marchando en el sitio, levantando las rodillas a una altura determinada.', trend: [60, 65, 70, 72, 75], status: 'stable', icon: HeartPulse },
    { title: '6 Min Walk Test', desc: 'Prueba de oro para la capacidad aeróbica. Mide la distancia máxima que puedes caminar en 6 minutos.', trend: [65, 68, 70, 74, 75], status: 'stable', icon: Footprints },
  ],
  calidad: [
    { title: 'Índice de Hooper-Mackinnon', desc: 'Cuestionario de 5 ítems para monitorizar el bienestar subjetivo (sueño, estrés, fatiga y dolor muscular).', trend: [70, 75, 80, 82, 85], status: 'up', icon: ListChecks },
    { title: 'Cuestionario IPAQ', desc: 'Registro internacional para cuantificar tus niveles de actividad física diaria y hábitos sedentarios.', trend: [60, 70, 75, 80, 85], status: 'up', icon: Activity },
  ],
}

type SortMode = 'default' | 'mejor' | 'peor'

export function EvaluacionesView() {
  const [sortMode, setSortMode] = useState<SortMode>('default')
  const [selectedEval, setSelectedEval] = useState<EvalDomain | null>(null)
  const [activeTestId, setActiveTestId] = useState<string | null>(null)
  const { tests } = useTestsCatalogo() // conexión real con la base de datos

  const sortedEvals = [...evalsData].sort((a, b) => {
    if (sortMode === 'mejor') return b.score - a.score
    if (sortMode === 'peor') return a.score - b.score
    if (a.alert && !b.alert) return -1
    if (!a.alert && b.alert) return 1
    return a.score - b.score
  })

  // ── Test activo (takeover a pantalla completa) ──
  if (activeTestId && TEST_COMPONENTS[activeTestId]) {
    const TestComponent = TEST_COMPONENTS[activeTestId]
    return <TestComponent onBack={() => setActiveTestId(null)} />
  }

  // ── Vista de detalle de un dominio ──
  if (selectedEval) {
    return (
      <div className="pb-24 animate-in relative">
        <div className="pt-8 mb-6 px-2 flex items-center gap-4">
          <button
            onClick={() => setSelectedEval(null)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className={`text-2xl font-black uppercase tracking-widest ${selectedEval.color}`}>
            {selectedEval.title}
          </h2>
        </div>

        <div className="px-2 mb-4 text-sm text-slate-600 font-medium">
          A continuación se detallan las pruebas validadas que conforman este bloque.
        </div>

        <div className="space-y-4 px-1">
          {testsDetailData[selectedEval.id]?.map((test, idx) => {
            const IconComponent = test.icon
            const isPlayable = !!(test.testId && TEST_COMPONENTS[test.testId])
            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl p-5 shadow-sm border flex gap-4 relative overflow-hidden transition-all ${
                  isPlayable ? 'border-slate-100 hover:border-indigo-200 hover:shadow-md' : 'border-slate-100'
                }`}
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`font-black uppercase tracking-wider text-lg ${selectedEval.color} mb-2 leading-tight`}>
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{test.desc}</p>
                  </div>
                  <Sparkline data={test.trend} status={test.status} />
                  {isPlayable && (
                    <button
                      onClick={() => setActiveTestId(test.testId!)}
                      className="mt-3 self-start bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-colors active:translate-y-px"
                    >
                      <Play size={14} /> Realizar test
                    </button>
                  )}
                </div>
                <div className="w-20 sm:w-24 flex-shrink-0 flex items-center justify-center border-l border-slate-50 pl-4">
                  <div
                    className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center opacity-80"
                    style={{ color: selectedEval.stroke }}
                  >
                    <IconComponent size={32} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Vista principal: lista de dominios ──
  return (
    <div className="pb-24 animate-in relative">
      <div className="pt-8 mb-6 px-2 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-indigo-900 tracking-widest uppercase flex items-center gap-3">
            Evaluaciones
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Tus resultados funcionales actualizados
          </p>
          {/* Indicador de conexión real con la base de datos */}
          {tests.length > 0 && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {tests.length} pruebas en la base de datos
            </span>
          )}
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
          <Activity size={24} />
        </div>
      </div>

      <div className="px-2 mb-4 flex justify-between items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordenar por:</span>
        <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner border border-slate-100">
          {([
            ['default', 'Atención', 'text-indigo-700'],
            ['mejor', 'Mejores', 'text-emerald-600'],
            ['peor', 'Peores', 'text-orange-600'],
          ] as const).map(([mode, label, color]) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                sortMode === mode ? `bg-white ${color} shadow-sm` : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {sortedEvals.map((item) => {
          const radius = 16
          const circumference = 2 * Math.PI * radius
          const strokeDashoffset = circumference - (item.score / 100) * circumference

          return (
            <div
              key={item.id}
              onClick={() => setSelectedEval(item)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-50 flex items-center justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer hover:border-indigo-200"
            >
              {item.alert && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />}

              <div className="flex-1 pr-2">
                <h3 className={`font-black uppercase tracking-wider text-lg ${item.color}`}>
                  {item.title}
                </h3>
                <div className="mt-1.5">
                  {item.alert && (
                    <span className="inline-flex items-center font-extrabold text-orange-700 uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded-md mr-1.5 text-[10px] mb-1 shadow-sm border border-orange-200">
                      ⚠️ Atención
                    </span>
                  )}
                  <p className="text-sm text-slate-600 font-medium leading-snug inline">{item.text}</p>
                </div>
              </div>

              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r={radius} fill="none" style={{ color: item.bgStroke }} className="stroke-current" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r={radius}
                    fill="none"
                    stroke={item.stroke}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-sm font-black ${item.color}`}>{item.score}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
