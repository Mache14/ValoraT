import { tw } from './styles/design-tokens'

const TESTS = [
  { id: 'pvt',          label: 'PVT-B',              cat: 'Cognitivo',   emoji: '⚡', ready: true  },
  { id: 'tmt',          label: 'Trail Making Test',   cat: 'Cognitivo',   emoji: '🔗', ready: true  },
  { id: 'chair-stand',  label: '30-s Chair Stand',   cat: 'Fuerza',      emoji: '🪑', ready: false },
  { id: 'sit-to-stand', label: '5-rep Sit to Stand', cat: 'Fuerza',      emoji: '💪', ready: false },
  { id: 'arm-curl',     label: '30-s Arm Curl',      cat: 'Fuerza',      emoji: '🏋️', ready: false },
  { id: 'push-up',      label: 'Push-Up Test',       cat: 'Fuerza',      emoji: '⬆️', ready: false },
  { id: 'chair-reach',  label: 'Chair Sit & Reach',  cat: 'Flexibilidad',emoji: '🤸', ready: false },
  { id: 'back-scratch', label: 'Back Scratch',       cat: 'Flexibilidad',emoji: '🔄', ready: false },
  { id: 'single-leg',   label: 'Equilibrio Unipodal',cat: 'Equilibrio',  emoji: '🦵', ready: false },
  { id: 'tug',          label: 'Timed Up and Go',    cat: 'Movilidad',   emoji: '🚶', ready: false },
  { id: 'step-2min',    label: '2-min Step Test',    cat: 'Resistencia', emoji: '🏃', ready: false },
  { id: 'ymca',         label: 'YMCA Step Test',     cat: 'Resistencia', emoji: '📈', ready: false },
  { id: 'moca',         label: 'MoCA',               cat: 'Cognitivo',   emoji: '🧠', ready: false },
  { id: 'sage',         label: 'SAGE',               cat: 'Cognitivo',   emoji: '📝', ready: false },
  { id: 'dual-task',    label: 'Dual-Task TUG',      cat: 'Cognitivo',   emoji: '🔀', ready: false },
]

function App() {
  return (
    <div className={tw.page}>
      {/* Header */}
      <header className={tw.header}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">ValoraT</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Evaluación Funcional</p>
            </div>
          </div>
          <span className={tw.badgeCyan}>MVP · v0.1</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10">
            <span className={tw.badgeInfo + ' mb-3 inline-block'}>Proyecto en construcción</span>
            <h2 className="text-2xl font-extrabold text-white mb-2">
              Batería de Evaluación ValoraT
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Autoevaluación física, cognitiva y de calidad de vida para adultos de 40-65 años.
              Los tests marcados como "Listo" ya están disponibles.
            </p>
          </div>
        </div>

        {/* Grid de tests */}
        <div>
          <h3 className={tw.h3 + ' mb-4'}>Batería de Tests ({TESTS.filter(t => t.ready).length} disponibles)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TESTS.map(test => (
              <button
                key={test.id}
                disabled={!test.ready}
                className={[
                  tw.card,
                  'text-left transition-all',
                  test.ready
                    ? 'hover:border-indigo-600 hover:bg-slate-800/60 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed',
                ].join(' ')}
              >
                <span className="text-2xl block mb-2">{test.emoji}</span>
                <p className="text-white font-semibold text-sm leading-tight">{test.label}</p>
                <p className={tw.micro + ' mt-1'}>{test.cat}</p>
                {test.ready && (
                  <span className={tw.badgeGood + ' mt-2 inline-block'}>Listo</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Estado del proyecto */}
        <div className={tw.card}>
          <h3 className={tw.h3 + ' mb-3'}>Estado del Proyecto</h3>
          <div className="space-y-2 text-sm">
            {[
              { done: true,  label: 'Proyecto Vite + React + TypeScript creado' },
              { done: true,  label: 'Tailwind CSS v4 configurado' },
              { done: true,  label: 'Supabase + MediaPipe + Router instalados' },
              { done: true,  label: 'Design tokens y tipos TypeScript creados' },
              { done: true,  label: 'Repositorio en GitHub (Mache14/ValoraT)' },
              { done: false, label: 'Supabase: schema de base de datos' },
              { done: false, label: 'Autenticación (login / registro)' },
              { done: false, label: 'Migrar PVT-B de Gemini → React' },
              { done: false, label: 'Migrar TMT de Gemini → React' },
              { done: false, label: 'Deploy en Vercel' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={item.done ? 'text-emerald-400' : 'text-slate-600'}>
                  {item.done ? '✓' : '○'}
                </span>
                <span className={item.done ? 'text-slate-300' : tw.micro}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
