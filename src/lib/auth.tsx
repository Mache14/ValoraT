/**
 * ValoraT — Contexto de Autenticación
 * Provee el usuario actual de Supabase a toda la app.
 * Envuelve la app en <AuthProvider> y usa useAuth() en cualquier componente.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
  session: User | null      // usuario de auth.users (null si no hay sesión)
  loading: boolean          // true mientras se comprueba la sesión inicial
}

const AuthContext = createContext<AuthState>({ session: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Comprobar si ya hay una sesión activa al cargar la app
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session?.user ?? null)
      setLoading(false)
    })

    // 2. Suscribirse a cambios (login / logout) en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para acceder al usuario actual desde cualquier componente
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
