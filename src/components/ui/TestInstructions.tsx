import type { ReactNode } from 'react'

/**
 * TestInstructions — tarjeta estándar de instrucciones de los tests de ValoraT.
 * Responde siempre a las mismas preguntas: ¿Qué mide? · ¿Cómo? · Regla clave (opcional)
 * · ¿Qué significa?. El acento de color se pasa por prop (el de cada prueba/dominio).
 */

export type InstructionsAccent = 'indigo' | 'orange' | 'rose' | 'blue' | 'teal'

interface TestInstructionsProps {
  accent: InstructionsAccent
  /** ¿Qué mide? — incluye la cita real entre paréntesis. */
  measures: ReactNode
  /** ¿Cómo? — el protocolo en una frase. */
  how: ReactNode
  /** Regla clave — opcional; se omite si no se pasa. */
  keyRule?: ReactNode
  /** ¿Qué significa? — interpretación del resultado. */
  meaning: ReactNode
  className?: string
}

// Clases literales (Tailwind v4 purga las clases construidas dinámicamente).
const ACCENT: Record<InstructionsAccent, string> = {
  indigo: 'bg-indigo-50 border-indigo-100',
  orange: 'bg-orange-50 border-orange-100',
  rose:   'bg-rose-50 border-rose-100',
  blue:   'bg-blue-50 border-blue-100',
  teal:   'bg-teal-50 border-teal-100',
}

export function TestInstructions({
  accent, measures, how, keyRule, meaning, className = '',
}: TestInstructionsProps) {
  return (
    <div className={`border rounded-3xl p-4 mb-4 space-y-2 text-sm ${ACCENT[accent]} ${className}`}>
      <p className="text-slate-700"><strong>¿Qué mide?</strong> {measures}</p>
      <p className="text-slate-700"><strong>¿Cómo?</strong> {how}</p>
      {keyRule && <p className="text-slate-700"><strong>Regla clave:</strong> {keyRule}</p>}
      <p className="text-slate-700"><strong>¿Qué significa?</strong> {meaning}</p>
    </div>
  )
}
