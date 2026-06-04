import type { PercentileFeedback } from '../../data/testFeedbackMessages'

/**
 * FeedbackCard — muestra el mensaje de feedback personalizado por percentil:
 * título, rendimiento, implicación de salud, recomendación y cita científica.
 * El color del borde se adapta al rango de percentil.
 */

const RANGE_TONE: Record<string, string> = {
  '<P25': 'border-rose-200 bg-rose-50',
  'P25-P40': 'border-orange-200 bg-orange-50',
  'P40-P60': 'border-amber-200 bg-amber-50',
  'P60-P75': 'border-lime-200 bg-lime-50',
  'P75-P90': 'border-emerald-200 bg-emerald-50',
  'P90-P100': 'border-emerald-300 bg-emerald-50',
}

export function FeedbackCard({ feedback }: { feedback: PercentileFeedback }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${RANGE_TONE[feedback.range] ?? 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{feedback.emoji}</span>
        <div>
          <h3 className="font-bold text-slate-800 leading-tight">{feedback.title}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Percentil {feedback.range}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
        <p>{feedback.performance}</p>
        <p><strong className="text-slate-700">Salud:</strong> {feedback.healthImplication}</p>
        <p><strong className="text-slate-700">Recomendación:</strong> {feedback.recommendation}</p>
      </div>

      <p className="text-[10px] text-slate-400 italic mt-3 pt-2 border-t border-slate-200/60">
        Fundamento científico: {feedback.citation}
      </p>
    </div>
  )
}
