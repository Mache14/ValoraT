import { useState } from 'react'
import { HomeView } from './pages/home/HomeView'
import { EvaluacionesView } from './pages/evaluaciones/EvaluacionesView'
import { TribeView } from './pages/tribe/TribeView'
import { PeliculaView } from './pages/stats/PeliculaView'
import { ProfileView } from './pages/profile/ProfileView'
import { BottomNav } from './components/layout/BottomNav'

/**
 * App — shell principal de ValoraT.
 * Contenedor mobile-first (max-w-md centrado) con navegación por pestañas.
 * Cada pestaña renderiza una de las 5 pantallas.
 */

// Identificadores de las pestañas (se reutiliza en HomeView y BottomNav)
export type TabId = 'home' | 'evaluaciones' | 'tribe' | 'stats' | 'profile'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans">
      {/* Restricción mobile estricta y centrado */}
      <div className="w-full max-w-md bg-slate-50 relative min-h-screen flex flex-col">
        <main className="flex-1 px-6 pt-12 overflow-y-auto">
          {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
          {activeTab === 'evaluaciones' && <EvaluacionesView />}
          {activeTab === 'tribe' && <TribeView />}
          {activeTab === 'stats' && <PeliculaView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}

export default App
