import { useEffect, useState } from 'react'
import { tw } from './styles/design-tokens'
import { supabase } from './lib/supabase'
import { useAuth } from './lib/auth'
import type { TestCatalogo, CategoriaTest } from './types'

// Tests que ya tienen pantalla funcional (migrados de Gemini)
const TESTS_LISTOS = new Set(['pvt_b', 'tmt_ab'])

// Emoji por categoría
const CAT_EMOJI: Record<CategoriaTest, string> = {
  fuerza:       '💪',
  resistencia:  '🏃',
  equilibrio:   '🦵',
  coordinacion: '🤹',
  flexibilidad: '🤸',
  movilidad:    '🚶',
  cognitivo:    '🧠',
  calidad_vida: '❤️',
}

function App() {
  const { session, loading: authLoading } = useAuth()
  const [tests, setTests] = useState<TestCatalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('tests_catalogo')
      .select('*')
      .order('categoria')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTests(data ?? [])
        setLoading(false)
      })
  }, [])

  const listos = tests.filter(t => TESTS_LISTOS.has(t.id)).length

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
          <div className="flex items-center gap-2">
            <span className={tw.badgeCyan}>MVP · v0.1</span>
            {!authLoading && (
              <span className={session ? tw.badgeGood : tw.badgeInfo}>
                {session ? 'Sesión activa' : 'Sin sesión'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 rounded-3xl p-6 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10">
            <span className={tw.badgeInfo + ' mb-3 inline-block'}>Proyecto en construcción</span>
            <h2 className="text-2xl font-extrabold text-white mb-2">Batería de Evaluación ValoraT</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Autoevaluación física, cognitiva y de calidad de vida para adultos de 40-65 años.
              Los tests cargados aquí provienen directamente de la base de datos.
            </p>
          </div>
        </div>

        {/* Grid de tests desde Supabase */}
        <div>
          <h3 className={tw.h3 + ' mb-4'}>
            Batería de Tests
            {!loading && !error && ` (${tests.length} en catálogo · ${listos} disponibles)`}
          </h3>

          {loading && (
            <div className={tw.card + ' text-center'}>
              <p className={tw.muted}>Cargando catálogo desde Supabase...</p>
            </div>
          )}

          {error && (
            <div className={tw.card + ' border-rose-800 bg-rose-950/20'}>
              <p className="text-rose-400 text-sm font-semibold">Error de conexión con Supabase</p>
              <p className={tw.micro + ' mt-1'}>{error}</p>
              <p className={tw.micro + ' mt-2'}>Revisa que .env.local tenga las claves correctas.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tests.map(test => {
                const ready = TESTS_LISTOS.has(test.id)
                return (
                  <div
                    key={test.id}
                    className={[
                      tw.card,
                      'transition-all',
                      ready ? 'hover:border-indigo-600 hover:bg-slate-800/60 cursor-pointer' : 'opacity-50',
                    ].join(' ')}
                  >
                    <span className="text-2xl block mb-2">{CAT_EMOJI[test.categoria]}</span>
                    <p className="text-white font-semibold text-sm leading-tight">{test.nombre}</p>
                    <p className={tw.micro + ' mt-1 capitalize'}>{test.categoria.replace('_', ' ')}</p>
                    {ready
                      ? <span className={tw.badgeGood + ' mt-2 inline-block'}>Listo</span>
                      : <span className={tw.badgeInfo + ' mt-2 inline-block'}>Pendiente</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Estado de cimientos */}
        <div className={tw.card}>
          <h3 className={tw.h3 + ' mb-3'}>Cimientos del Proyecto</h3>
          <div className="space-y-2 text-sm">
            {[
              { done: true, label: 'Vite + React + TypeScript + Tailwind v4' },
              { done: true, label: 'Repositorio en GitHub (Mache14/ValoraT)' },
              { done: true, label: 'Supabase: 5 tablas + RLS + catálogo de 19 tests' },
              { done: true, label: 'Conexión app ↔ Supabase verificada' },
              { done: true, label: 'Sistema de diseño unificado (design tokens)' },
              { done: true, label: 'Router + contexto de autenticación' },
              { done: false, label: 'Pantallas de registro / login' },
              { done: false, label: 'Onboarding de perfil de usuario' },
              { done: false, label: 'Migrar PVT-B y TMT de Gemini' },
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
