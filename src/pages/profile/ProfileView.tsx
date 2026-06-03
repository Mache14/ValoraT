import { ShieldCheck, Settings, TrendingUp, Award, Flame, Heart, Zap, ArrowUpRight } from 'lucide-react'

/**
 * ProfileView — pantalla de Perfil de Salud.
 * Anillo de progreso animado, racha, mensaje de la tribu,
 * mejora semanal y barra de percentiles.
 */
export function ProfileView() {
  return (
    <div className="pb-24 animate-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            Perfil de Salud
          </h2>
          <div className="mt-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-emerald-100">
            <ShieldCheck size={14} /> Modo Prevención Activo
          </div>
        </div>
        <button className="p-2.5 text-slate-400 hover:text-slate-600 bg-white rounded-full hover:bg-slate-100 transition-colors shadow-sm border border-slate-100">
          <Settings size={20} />
        </button>
      </div>

      {/* Anillo de progreso */}
      <div className="relative w-44 h-44 mx-auto mb-10">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" stroke="#f1f5f9" strokeWidth="6" fill="none" />
          <circle
            cx="50" cy="50" r="46"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="289"
            strokeDashoffset="50"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute top-2 -right-4 bg-white text-slate-800 px-3 py-1.5 rounded-full font-bold shadow-lg shadow-slate-200/50 border border-slate-100 z-20 flex items-center gap-1.5 animate-bounce-slow">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-sm">+2%</span>
          <span className="text-[10px] text-slate-500 font-medium">Calidad de Vida</span>
        </div>

        <div className="absolute inset-3 rounded-full overflow-hidden border-[3px] border-white shadow-inner bg-slate-100">
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-emerald-50 flex items-center justify-center">
            <span className="font-bold text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500">M</span>
          </div>
        </div>

        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-full shadow-md text-xs tracking-wide flex items-center gap-1.5 border-2 border-white z-10">
          <Award size={14} className="text-emerald-400" /> Nivel 1
        </div>
      </div>

      {/* Racha + mensaje de mamá */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-5 shadow-sm border border-amber-100 flex flex-col items-start relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <Flame size={80} className="text-orange-500" />
          </div>
          <span className="text-xs font-bold text-orange-600/80 uppercase tracking-wider mb-2">Tu Racha</span>
          <div className="flex items-end gap-2 relative z-10">
            <span className="font-extrabold text-4xl text-orange-600 leading-none">20</span>
            <span className="font-medium text-sm text-orange-700/70 mb-1">Días</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-5 shadow-sm border border-blue-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center font-bold text-[10px] text-pink-700 border border-white shadow-sm">
              R
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">De Mamá</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-bold text-lg text-indigo-900 leading-tight">¡Ánimos!</span>
          </div>
        </div>
      </div>

      {/* Mejora semanal */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 mb-8 shadow-lg shadow-emerald-200 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="flex justify-between items-center relative z-10">
          <div className="flex-1">
            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block backdrop-blur-sm">
              Esta Semana
            </span>
            <h3 className="font-bold text-lg leading-tight mb-1">
              Subiste <span className="text-emerald-100 text-2xl font-black mx-1">+2</span> repeticiones
            </h3>
            <p className="text-sm font-medium text-emerald-50 opacity-90">Test: STS 30 seg</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner flex-shrink-0">
            <Zap size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Percentiles */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
        <div className="flex justify-between items-center mb-10">
          <h3 className="font-bold text-lg text-slate-800">Percentiles</h3>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">P 66</span>
        </div>

        <div className="relative">
          <div className="h-4 w-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-400 rounded-full shadow-inner" />

          <div className="absolute top-1/2 left-[66%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="absolute bottom-full mb-3 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-lg flex items-center gap-1.5 animate-bounce-slow">
              <ArrowUpRight size={14} className="text-emerald-400" />
              +2 Puntos
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45" />
            </div>

            <div className="w-8 h-8 bg-white rounded-full border-4 border-slate-800 shadow-md flex items-center justify-center relative z-10 transition-transform hover:scale-110">
              <span className="font-extrabold text-[10px] text-slate-800">TÚ</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Atención</span>
          <span>Excelente</span>
        </div>
      </div>
    </div>
  )
}
