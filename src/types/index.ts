/**
 * ValoraT — Tipos TypeScript
 * Refleja el modelo de datos de Supabase.
 */

// ─── Usuario ─────────────────────────────────────────────────────────────────

export type Sexo = 'H' | 'M'
export type NivelEducativo = 'bajo' | 'medio' | 'alto'

export interface Usuario {
  id: string                    // UUID de auth.users
  nombre_completo: string
  fecha_nacimiento: string      // ISO date 'YYYY-MM-DD'
  sexo: Sexo
  nivel_educativo: NivelEducativo
  altura_cm: number
  created_at: string
}

// ─── Catálogo de Tests ───────────────────────────────────────────────────────

export type CategoriaTest =
  | 'fuerza'
  | 'resistencia'
  | 'equilibrio'
  | 'coordinacion'
  | 'flexibilidad'
  | 'movilidad'
  | 'cognitivo'
  | 'calidad_vida'

export interface TestCatalogo {
  id: string                    // ej. 'chair_stand_30s'
  nombre: string
  categoria: CategoriaTest
  unidad: string                // ej. 'repeticiones', 'segundos', 'puntos'
  descripcion: string
}

// ─── Evaluaciones ────────────────────────────────────────────────────────────

export type CategoriaResultado = 'muy_bajo' | 'bajo' | 'normal' | 'alto' | 'muy_alto'

export interface Evaluacion {
  id: string
  user_id: string
  test_id: string
  fecha: string
  resultado_bruto: number
  percentil: number | null       // null si no hay percentil para esa edad/sexo
  categoria_resultado: CategoriaResultado | null
  datos_extra_json: Record<string, unknown> | null  // para TMT: {timeA, timeB, ratio}
  created_at: string
}

// ─── Datos Antropométricos ───────────────────────────────────────────────────

export interface DatosAntropometricos {
  id: string
  user_id: string
  fecha: string
  peso_kg: number
  altura_cm: number
  perimetro_cintura_cm: number | null
  imc: number                   // calculado: peso / (altura_m^2)
  created_at: string
}

// ─── Informes ────────────────────────────────────────────────────────────────

export interface ResumenDominios {
  fuerza: number | null
  resistencia: number | null
  equilibrio: number | null
  coordinacion: number | null
  flexibilidad: number | null
  movilidad: number | null
  cognitivo: number | null
  calidad_vida: number | null
}

export interface Informe {
  id: string
  user_id: string
  fecha_generacion: string
  indice_fragilidad_preventiva: number  // 0-5
  percentil_global: number | null
  resumen_dominios_json: ResumenDominios
  recomendaciones_ia: string | null     // null hasta fase 2
  evaluaciones_incluidas: string[]      // array de IDs de evaluaciones
  created_at: string
}

// ─── Helpers de formularios ──────────────────────────────────────────────────

export interface OnboardingForm {
  nombre_completo: string
  fecha_nacimiento: string
  sexo: Sexo | ''
  nivel_educativo: NivelEducativo | ''
  altura_cm: string
}
