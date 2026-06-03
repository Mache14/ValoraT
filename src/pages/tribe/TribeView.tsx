import { Users, Trophy, Sparkles, Target, Award, BellRing, Activity, ArrowUpRight } from 'lucide-react'

/**
 * TribeView — pantalla de la Tribu.
 * Red de apoyo familiar: ranking del equipo, reto activo y miembros.
 * Es uno de los diferenciadores clave de ValoraT (el "Efecto Tribu").
 */
export function TribeView() {
  return (
    <div className="pb-24 animate-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tu Tribu</h2>
          <p className="text-sm text-slate-500 font-medium">Familia López</p>
        </div>
        <div className="bg-amber-100 p-2 rounded-2xl shadow-sm border border-amber-200">
          <Trophy size={28} className="text-amber-500" />
        </div>
      </div>

      {/* Nivel del equipo */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl p-5 text-white shadow-lg shadow-blue-200 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles size={18} /> Nivel del Equipo
          </h3>
          <span className="text-2xl font-extrabold">
            78 <span className="text-sm font-normal opacity-80">pts</span>
          </span>
        </div>
        <p className="text-blue-100 text-sm mb-4">
          ¡Vuestra tribu está un <strong className="text-white">+15% por encima</strong> de la media española! 🇪🇸
        </p>

        <div className="w-full bg-white/20 rounded-full h-2.5 mb-1">
          <div
            className="bg-emerald-400 h-2.5 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
            style={{ width: '78%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-100 font-medium">
          <span>Media Esp: 65</span>
          <span>Objetivo: 85</span>
        </div>
      </div>

      {/* Reto activo */}
      <div className="bg-white border-2 border-orange-100 rounded-3xl p-5 mb-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
          Reto Activo
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Target size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Semana de Piernas Fuertes</h4>
            <p className="text-xs text-slate-500 mt-1">
              Conseguir 100 Sit-to-Stands en equipo. ¡Faltan 24!
            </p>
          </div>
        </div>
      </div>

      {/* Miembros */}
      <h3 className="text-lg font-bold text-slate-800 mb-4">Miembros (3)</h3>
      <div className="space-y-4">
        {/* Mamá */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 text-lg border-2 border-white shadow-sm">
                  R
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Mamá (Rosa)</h4>
                <p className="text-xs text-slate-500">68 pts • Estabilidad</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-red-400 block mb-1">Falta test</span>
              <Activity size={16} className="text-red-300 inline-block" />
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
            <p className="text-xs text-slate-600 pr-4">No ha hecho el test de equilibrio Unipodal hoy.</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1 transition-colors flex-shrink-0 shadow-sm shadow-indigo-200">
              <BellRing size={14} /> Animar
            </button>
          </div>
        </div>

        {/* Hermana */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 opacity-90">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-lg border-2 border-white shadow-sm">
                A
              </div>
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  Hermana (Ana) <Award size={14} className="text-amber-500" />
                </h4>
                <p className="text-xs text-slate-500">91 pts • Fuerza</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-emerald-500 font-bold text-sm flex items-center gap-1">
                <ArrowUpRight size={14} /> +3%
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">Líder</span>
            </div>
          </div>
        </div>

        {/* Tú */}
        <div className="bg-indigo-50 rounded-3xl p-4 border border-indigo-100 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg border-2 border-white shadow-sm">
                M
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">Tú (Mathías)</h4>
                <p className="text-xs text-indigo-600/70">82 pts • Coordinación</p>
              </div>
            </div>
            <Users size={20} className="text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
