/**
 * ValoraT Design Tokens
 * Sistema de diseño unificado para todos los módulos de la app.
 * Importar este archivo en cualquier componente para garantizar homogeneidad visual.
 */

// ─── Clases Tailwind reutilizables ───────────────────────────────────────────

export const tw = {
  // Fondos de página y tarjetas
  page:        'min-h-screen bg-slate-950 text-slate-100 font-[Inter]',
  card:        'bg-slate-900 border border-slate-800 rounded-2xl p-5',
  cardHover:   'hover:border-slate-700 transition-colors cursor-pointer',
  cardInner:   'bg-slate-950/40 border border-slate-800 rounded-xl p-4',

  // Botones
  btnPrimary:  'bg-indigo-600 hover:bg-indigo-500 active:translate-y-px text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2',
  btnSecondary:'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2.5 px-5 rounded-xl transition-all',
  btnDanger:   'bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800 text-rose-400 font-semibold py-2 px-4 rounded-xl transition-all',
  btnSuccess:  'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2',

  // Badges / etiquetas de estado
  badgeGood:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold',
  badgeWarn:   'bg-amber-500/10  text-amber-400  border border-amber-500/20  text-xs px-2.5 py-0.5 rounded-full font-semibold',
  badgeBad:    'bg-rose-500/10   text-rose-400   border border-rose-500/20   text-xs px-2.5 py-0.5 rounded-full font-semibold',
  badgeInfo:   'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold',
  badgeCyan:   'bg-cyan-500/10   text-cyan-400   border border-cyan-500/20   text-xs px-2.5 py-0.5 rounded-full font-semibold',

  // Header sticky
  header:      'sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3',

  // Input / Select
  input:       'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors',
  select:      'w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer',

  // Tipografía
  h1:          'text-3xl font-extrabold text-white leading-tight',
  h2:          'text-xl font-bold text-white',
  h3:          'text-sm font-bold text-slate-300 uppercase tracking-wider',
  muted:       'text-slate-400 text-sm',
  micro:       'text-slate-500 text-xs',

  // Métricas (tarjetas de datos)
  metricCard:  'bg-slate-950/30 border border-slate-800/80 rounded-xl p-4',
  metricLabel: 'text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1',
  metricValue: 'font-mono text-2xl font-bold text-white',

  // Divisor
  divider:     'border-t border-slate-800 my-4',
} as const

// ─── Colores semánticos para resultados de tests ─────────────────────────────

export const RESULT_COLORS = {
  excellent:    { badge: tw.badgeGood, text: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900/50' },
  good:         { badge: tw.badgeGood, text: 'text-emerald-300', bg: 'bg-emerald-950/10 border-emerald-900/30' },
  average:      { badge: tw.badgeInfo, text: 'text-indigo-400',  bg: 'bg-indigo-950/20  border-indigo-900/50'  },
  below_avg:    { badge: tw.badgeWarn, text: 'text-amber-400',   bg: 'bg-amber-950/20   border-amber-900/50'   },
  low:          { badge: tw.badgeBad,  text: 'text-rose-400',    bg: 'bg-rose-950/20    border-rose-900/50'    },
} as const

// ─── Función helper: obtener color según percentil ───────────────────────────

export function getPercentileColor(percentil: number) {
  if (percentil >= 75) return RESULT_COLORS.excellent
  if (percentil >= 50) return RESULT_COLORS.good
  if (percentil >= 25) return RESULT_COLORS.average
  if (percentil >= 10) return RESULT_COLORS.below_avg
  return RESULT_COLORS.low
}

export function getPercentileLabel(percentil: number): string {
  if (percentil >= 75) return 'Por encima de la media'
  if (percentil >= 50) return 'Media'
  if (percentil >= 25) return 'Ligeramente bajo'
  if (percentil >= 10) return 'Por debajo de la media'
  return 'Muy bajo'
}
