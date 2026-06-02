import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './lib/auth'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          {/* Las rutas de cada test se añadirán aquí:
              <Route path="/test/pvt" element={<PVTPage />} />
              <Route path="/test/tmt" element={<TMTPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/resultados" element={<ResultsPage />} />
          */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
