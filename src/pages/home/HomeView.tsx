import { Activity, Users, ShieldCheck, Zap, Flame, Info, ArrowUpRight } from 'lucide-react'
import type { TabId } from '../../App'

/**
 * HomeView — pantalla de Inicio.
 * Contiene: saludo (Header), tarjeta de IA (AIInsight),
 * cuadrícula de tests del día (TestGrid) y vista previa de la Tribu (FamilyTribe).
 */

interface HomeViewProps {
  setActiveTab: (tab: TabId) => void
}

const userScore = 82

const familyData = [
  { name: 'Mamá (Rosa)', score: 68, message: '¡Ha mejorado su equilibrio!' },
]

export function HomeView({ setActiveTab }: HomeViewProps) {
  return (
    <div className="animate-in pb-24">
      {/* ── Header: saludo + puntuación ── */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hola, Mathías 👋</h1>
          <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck size={16} className="text-emerald-500" /> Modo Prevención Activo
          </p>
        </div>
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-400 p-[2px]">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-lg text-slate-800">
              {userScore}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white">
            <Flame size={12} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── AIInsight: recomendación de la semana ── */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-200 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Activity size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm uppercase tracking-wider">
              Tu Película Semanal
            </span>
          </div>
          <h2 className="text-lg font-semibold leading-tight mb-2">
            Tu potencia en piernas ha subido un 12% 🚀
          </h2>
          <p className="text-blue-100 text-sm mb-4 leading-relaxed">
            Esto reduce drásticamente tu riesgo de lesiones. Te sugerimos mantener el volumen
            actual de entrenamiento y enfocarnos hoy en la calidad del sueño.
          </p>
          <button
            onClick={() => setActiveTab('stats')}
            className="bg-white text-indigo-700 font-bold py-2.5 px-5 rounded-xl w-full flex justify-center items-center gap-2 hover:bg-blue-50 transition-colors"
          >
            Ver análisis detallado <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* ── TestGrid: evaluaciones de hoy ── */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-800">Evaluaciones de hoy</h3>
          <span
            onClick={() => setActiveTab('evaluaciones')}
            className="text-sm font-semibold text-indigo-600 cursor-pointer"
          >
            Ver todas
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTab('evaluaciones')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h4 className="font-bold text-slate-800">Fuerza</h4>
            <p className="text-xs text-slate-400 mt-1">Sit-to-Stand</p>
          </button>
          <button
            onClick={() => setActiveTab('evaluaciones')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Activity size={24} />
            </div>
            <h4 className="font-bold text-slate-800">Equilibrio</h4>
            <p className="text-xs text-slate-400 mt-1">Unipodal</p>
          </button>
        </div>
      </div>

      {/* ── FamilyTribe: vista previa de la Tribu ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-slate-800">Tu Tribu ValoraT</h3>
          <Info size={16} className="text-slate-400" />
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                R
              </div>
              <div>
                <p className="font-bold text-slate-800">{familyData[0].name}</p>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <ArrowUpRight size={12} /> {familyData[0].message}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-bold text-lg text-slate-800">{familyData[0].score}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Puntos
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('tribe')}
            className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
          >
            <Users size={18} /> Ver toda la Tribu
          </button>
        </div>
      </div>
    </div>
  )
}
