import {
  AlertOctagon, AlertTriangle, ArrowUpRight, Lightbulb, Brain, Sparkles,
  TrendingUp, CalendarDays, Heart, Smile, Moon, Activity, Coffee, Users,
  Trophy, Flame, Flag, Star, Target, CheckCircle2,
} from 'lucide-react'

/**
 * PeliculaView — pantalla "Tu Película".
 * El análisis longitudinal completo: alertas prioritarias, plan de acción,
 * pilares de calidad de vida y logros (gamificación).
 */
export function PeliculaView() {
  return (
    <div className="pb-24 animate-in">
      {/* Header */}
      <div className="pt-8 mb-6 px-2">
        <h2 className="text-3xl font-black text-indigo-900 tracking-widest uppercase flex items-center gap-3">
          Tu Película
        </h2>
        <p className="text-slate-500 font-medium mt-1 text-sm">El análisis completo de tu evolución</p>
      </div>

      {/* 1. Alertas prioritarias */}
      <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-3xl p-6 shadow-lg shadow-red-200 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <AlertOctagon size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
              <AlertTriangle size={14} /> Acción Requerida
            </span>
          </div>
          <h3 className="text-xl font-black mb-3 leading-tight">Alerta en Cognición y Equilibrio</h3>
          <p className="text-red-50 text-sm mb-4 leading-relaxed font-medium">
            Tus últimos datos muestran una bajada conjunta. El equilibrio deficiente sumado a una
            posible baja masa muscular te expone a un <strong>riesgo de caída grave</strong>. Las
            alteraciones cognitivas también requieren evaluación médica preventiva temprana.
          </p>
          <button className="bg-white text-red-600 font-black uppercase tracking-wider py-3 px-5 rounded-xl w-full flex justify-center items-center gap-2 hover:bg-red-50 transition-colors shadow-sm">
            Contactar Profesional <ArrowUpRight size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* 2. Plan de acción */}
      <div className="mb-8">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest px-2 mb-4">Plan de Acción</h3>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-100 mb-4 flex gap-4 items-start relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl flex-shrink-0">
            <Lightbulb size={24} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 uppercase tracking-wider mb-1">Recomendaciones</h4>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Basado en tus alertas, prioriza entrenamientos de <strong>fuerza del tren inferior</strong> (STS)
              y rutinas de <strong>propiocepción</strong> (equilibrio unipodal) al menos 3 veces por semana en
              un entorno seguro.
            </p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-3xl p-5 shadow-md text-white">
          <h4 className="font-black uppercase tracking-wider mb-3 text-indigo-300 flex items-center gap-2">
            <Brain size={18} /> Entendiendo tus datos
          </h4>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm font-medium items-start">
              <Sparkles size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 leading-snug">
                <strong className="text-white">El cuerpo no es una máquina:</strong> Un test aislado no define
                nada. Puedes tener un mal día por estrés o mal sueño. No te agobies por un solo dato bajo.
              </p>
            </li>
            <li className="flex gap-3 text-sm font-medium items-start">
              <TrendingUp size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 leading-snug">
                <strong className="text-white">La magia de la repetición:</strong> A veces, repetir el test 2 o
                3 veces genera un aprendizaje motor que mejora el dato instantáneamente.
              </p>
            </li>
            <li className="flex gap-3 text-sm font-medium items-start">
              <CalendarDays size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-300 leading-snug">
                <strong className="text-white">La constancia es la clave:</strong> Para ver tu verdadera
                "película", necesitamos meses de datos. Sigue alimentando a ValoraT para protegerte mejor.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Calidad de vida */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-transparent rounded-3xl -z-10" />
        <div className="px-2 mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-emerald-900 uppercase tracking-widest">El Objetivo Final</h3>
          <Heart size={24} className="text-emerald-500 fill-emerald-100" />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 text-center">
          <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Smile size={32} />
          </div>
          <h4 className="font-black text-xl text-slate-800 mb-2">Calidad de Vida</h4>
          <p className="text-sm text-slate-600 font-medium mb-5 leading-relaxed">
            Da igual que levantes 100 kilos si no duermes bien o tienes dolor constante. Esta es tu métrica
            reina. Céntrate en mejorar estos pilares fundamentales:
          </p>

          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: Moon, color: 'text-indigo-500', label: 'Mejorar Sueño' },
              { icon: Activity, color: 'text-rose-500', label: 'Reducir Dolor' },
              { icon: Coffee, color: 'text-amber-600', label: 'Bajar Estrés' },
              { icon: Users, color: 'text-blue-500', label: 'Vida Social' },
            ].map(({ icon: Icon, color, label }) => (
              <div key={label} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                <Icon size={20} className={color} />
                <span className="text-xs font-bold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Logros */}
      <div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest px-2 mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" /> Tus Logros
        </h3>

        {/* Logros del mes (carrusel) */}
        <div className="mb-6">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider px-2 block mb-3">Este Mes</span>
          <div className="flex gap-3 overflow-x-auto pb-4 px-2 snap-x hide-scrollbar">
            {[
              { icon: CalendarDays, from: 'from-amber-100', to: 'to-orange-100', border: 'border-amber-200', color: 'text-amber-500', textColor: 'text-amber-900', label: 'Test Diario', sub: '(7 Días)' },
              { icon: TrendingUp, from: 'from-indigo-100', to: 'to-blue-100', border: 'border-indigo-200', color: 'text-indigo-500', textColor: 'text-indigo-900', label: 'Mejora Doble', sub: '(2 Tests seguidos)' },
              { icon: Flame, from: 'from-emerald-100', to: 'to-teal-100', border: 'border-emerald-200', color: 'text-emerald-500', textColor: 'text-emerald-900', label: 'Racha Vital', sub: '(15 Días QoL)' },
            ].map(({ icon: Icon, from, to, border, color, textColor, label, sub }) => (
              <div
                key={label}
                className={`snap-start min-w-[140px] bg-gradient-to-br ${from} ${to} p-4 rounded-3xl border ${border} flex flex-col items-center text-center shadow-sm`}
              >
                <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm ${color}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-xs font-bold ${textColor} leading-tight`}>
                  {label}<br />{sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de logros */}
        <div className="px-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-3">Historial Histórico</span>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 space-y-1">
            {[
              { icon: Flag, bg: 'bg-slate-100', color: 'text-slate-600', title: 'Tu primer paso', desc: 'Hiciste tu primer test en ValoraT', done: true },
              { icon: Flame, bg: 'bg-amber-100', color: 'text-amber-600', title: 'Racha Inicial', desc: '5 días seguidos evaluándote', done: true },
              { icon: Heart, bg: 'bg-blue-100', color: 'text-blue-600', title: 'Espíritu de Tribu', desc: 'Animaste a un miembro de tu familia', done: true },
              { icon: Star, bg: 'bg-yellow-100', color: 'text-yellow-600', title: 'Líder del Equilibrio', desc: 'Posición nº1 en tu tribu (Ojos cerrados)', done: true },
              { icon: Target, bg: 'bg-slate-100', color: 'text-slate-400', title: 'El Retador', desc: 'Reta a un familiar a superar tu marca', done: false },
            ].map(({ icon: Icon, bg, color, title, desc, done }) => (
              <div
                key={title}
                className={`flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors ${!done ? 'opacity-60 grayscale' : ''}`}
              >
                <div className={`w-10 h-10 ${bg} ${color} rounded-full flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                  <p className="text-[11px] font-medium text-slate-500">{desc}</p>
                </div>
                {done ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
