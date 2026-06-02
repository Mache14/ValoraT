import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[ValoraT] Supabase no configurado. Crea el archivo .env.local con:\n' +
    'VITE_SUPABASE_URL=...\nVITE_SUPABASE_ANON_KEY=...'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '')
