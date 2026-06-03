import { Home, BarChart2, Activity, Users, User } from 'lucide-react'
import type { TabId } from '../../App'

/**
 * BottomNav — barra de navegación inferior fija.
 * 5 botones: Inicio, Película, Evaluaciones (FAB central), Tribu, Perfil.
 */

interface BottomNavProps {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 pb-safe pt-2 px-6 flex justify-between items-center h-20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50 md:max-w-md md:left-1/2 md:-translate-x-1/2">
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <Home size={24} className={activeTab === 'home' ? 'fill-indigo-100' : ''} />
        <span className="text-[10px] font-bold">Inicio</span>
      </button>

      <button
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'stats' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <BarChart2 size={24} />
        <span className="text-[10px] font-bold">Película</span>
      </button>

      {/* FAB central de Evaluaciones */}
      <div className="relative -top-5">
        <button
          onClick={() => setActiveTab('evaluaciones')}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
            activeTab === 'evaluaciones'
              ? 'bg-indigo-800 shadow-indigo-400 scale-110'
              : 'bg-indigo-600 shadow-indigo-300 hover:scale-105'
          }`}
        >
          <Activity size={28} className="text-white" />
        </button>
      </div>

      <button
        onClick={() => setActiveTab('tribe')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'tribe' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <Users size={24} />
        <span className="text-[10px] font-bold">Tribu</span>
      </button>

      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}
      >
        <User size={24} />
        <span className="text-[10px] font-bold">Perfil</span>
      </button>
    </div>
  )
}
