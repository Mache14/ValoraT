/**
 * HealthReportDocument — documento imprimible del Informe de Salud Integral.
 *
 * Pensado para imprimirse / guardarse como PDF desde el navegador (window.print()).
 * Reutiliza el feedback clínico de testFeedbackMessages.ts y el gráfico SVG nativo
 * HistoryLineChart. Renderiza un perfil de demostración fijo (reportSampleData.ts).
 *
 * El contenedor lleva la clase `report-print-area`, que el CSS de impresión usa para
 * mostrar SOLO este documento al imprimir (ver src/index.css).
 */

import { HeartPulse, ShieldCheck, AlertTriangle, TrendingUp, Activity, Brain, Trophy, Target } from 'lucide-react'
import { HistoryLineChart } from '../ui/HistoryLineChart'
import { getFeedback } from '../../data/testFeedbackMessages'
import { SAMPLE_HEALTH_REPORT, semaforo, type HealthReport } from '../../data/reportSampleData'

const PRIORIDAD_STYLE: Record<'alta' | 'media' | 'baja', { label: string; color: string; bg: string }> = {
  alta:  { label: 'Prioridad alta',  color: '#e11d48', bg: '#fff1f2' },
  media: { label: 'Prioridad media', color: '#d97706', bg: '#fffbeb' },
  baja:  { label: 'Prioridad baja',  color: '#4f46e5', bg: '#eef2ff' },
}

const REFERENCIAS = [
  'Hooper & Mackinnon (1995); McLean et al. (2010); Saw, Main & Gastin (2016) — bienestar subjetivo.',
  'Podsiadlo & Richardson (1991); Bohannon (2006); Kear et al. (2017) — TUG / movilidad.',
  'Springer et al. (2007); Vellas et al. (1997) — equilibrio y riesgo de caída.',
  'Rikli & Jones (1999, 2013); Cruz-Jentoft et al. (2019, EWGSOP2) — fuerza y sarcopenia.',
  'Tombaugh (2004); Lezak et al. (2012); Basner & Dinges (2011) — función cognitiva.',
  'Enright & Sherrill (1998); ATS (2002); ACSM (2021) — capacidad aeróbica.',
]

export function HealthReportDocument({ report = SAMPLE_HEALTH_REPORT }: { report?: HealthReport }) {
  const { user, dominios } = report
  const fragPct = Math.round((report.indiceFragilidad / 5) * 100)

  return (
    <div className="report-print-area bg-white text-slate-800 max-w-3xl mx-auto px-8 py-8 print:px-0 print:py-0">
      {/* ── 1. Portada / cabecera ── */}
      <header className="border-b-4 border-indigo-600 pb-5 mb-6 break-inside-avoid">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <HeartPulse size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-indigo-900 tracking-tight">ValoraT</h1>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Informe de Salud Integral</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md uppercase">
            Perfil de demostración
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-sm">
          {[
            ['Nombre', user.nombre],
            ['Edad', `${user.edad} años`],
            ['Sexo', user.sexo === 'M' ? 'Mujer' : 'Hombre'],
            ['Fecha del informe', report.fechaGeneracion],
            ['Altura', `${user.altura_cm} cm`],
            ['Peso', `${user.peso_kg} kg`],
            ['IMC', `${user.imc} kg/m²`],
            ['Perímetro cintura', `${user.perimetro_cintura_cm} cm`],
          ].map(([k, v]) => (
            <div key={k} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
              <p className="font-bold text-slate-800 leading-tight">{v}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── 2. Resumen ejecutivo ── */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Target size={18} className="text-indigo-600" /> Resumen ejecutivo
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Índice de Fragilidad Preventiva</p>
            <p className="text-3xl font-black text-slate-800">{report.indiceFragilidad.toFixed(1)} <span className="text-base font-bold text-slate-400">/ 5</span></p>
            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${fragPct}%`, backgroundColor: '#f59e0b' }} />
            </div>
            <p className="text-xs font-semibold text-amber-600 mt-1.5">{report.fragilidadEtiqueta}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Percentil Global</p>
            <p className="text-3xl font-black text-slate-800">P{report.percentilGlobal}</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${report.percentilGlobal}%`, backgroundColor: semaforo(report.percentilGlobal).color }} />
            </div>
            <p className="text-xs font-semibold mt-1.5" style={{ color: semaforo(report.percentilGlobal).color }}>{semaforo(report.percentilGlobal).label}</p>
          </div>
        </div>

        {/* Semáforo de dominios */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Perfil por dimensión</p>
        <div className="space-y-2">
          {dominios.map((d) => {
            const s = semaforo(d.percentil)
            return (
              <div key={d.key} className="flex items-center gap-3">
                <span className="w-44 shrink-0 text-xs font-bold text-slate-700">{d.nombre}</span>
                <div className="flex-1 h-3.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${d.percentil}%`, backgroundColor: s.color }} />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-bold text-slate-600">P{d.percentil}</span>
                <span className="w-16 shrink-0 text-[10px] font-bold uppercase text-right" style={{ color: s.color }}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3. Dimensiones de salud (detalle por dominio) ── */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity size={18} className="text-indigo-600" /> Dimensiones de salud
        </h2>

        <div className="space-y-5">
          {dominios.map((d) => {
            const s = semaforo(d.percentil)
            const fb = d.feedback ?? getFeedback(d.feedbackKey!, d.percentil)
            return (
              <div key={d.key} className="rounded-2xl border border-slate-200 overflow-hidden break-inside-avoid">
                <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: s.bg }}>
                  <h3 className="font-black text-slate-800">{d.nombre}</h3>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md" style={{ color: s.color, backgroundColor: '#ffffff' }}>
                    P{d.percentil} · {s.label}
                  </span>
                </div>

                {/* Tabla de pruebas del dominio */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 text-left border-b border-slate-100">
                      <th className="font-bold uppercase tracking-wider px-4 py-1.5">Prueba</th>
                      <th className="font-bold uppercase tracking-wider px-2 py-1.5">Resultado</th>
                      <th className="font-bold uppercase tracking-wider px-2 py-1.5">Percentil</th>
                      <th className="font-bold uppercase tracking-wider px-4 py-1.5">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.tests.map((t) => (
                      <tr key={t.nombre} className="border-b border-slate-50">
                        <td className="px-4 py-1.5 font-semibold text-slate-700">{t.nombre}</td>
                        <td className="px-2 py-1.5 font-bold text-slate-800">{t.valor}</td>
                        <td className="px-2 py-1.5 font-bold" style={{ color: semaforo(t.percentil).color }}>P{t.percentil}</td>
                        <td className="px-4 py-1.5 text-slate-500">{t.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Feedback clínico del dominio */}
                <div className="px-4 py-3 bg-slate-50/70 space-y-1.5 text-xs leading-relaxed">
                  <p><span className="font-bold text-slate-700">Interpretación: </span><span className="text-slate-600">{fb.performance}</span></p>
                  <p><span className="font-bold text-slate-700">Implicación para la salud: </span><span className="text-slate-600">{fb.healthImplication}</span></p>
                  <p><span className="font-bold text-emerald-700">Recomendación: </span><span className="text-slate-600">{fb.recommendation}</span></p>
                  <p className="text-[10px] italic text-slate-400 pt-0.5">Fuente: {fb.citation}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 4. Monitorización (bienestar diario) ── */}
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-indigo-600" /> Monitorización del bienestar
        </h2>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-700">Índice de Hooper-Mackinnon — últimos 14 días</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-500">Z-Score: <span className="text-slate-800">{report.hooperZScore.toFixed(1)}</span></span>
              <span className="font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">{report.hooperEstado}</span>
            </div>
          </div>
          <div className="h-44">
            <HistoryLineChart data={report.monitoringHooper} color="#0d9488" unit=" pts" />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
            La métrica clave no es la puntuación absoluta, sino su desviación frente a la línea base personal
            (Z-Score). El registro diario breve sostiene la adherencia y permite detectar a tiempo caídas del
            bienestar por carga física o estrés cotidiano, ajustando la actividad antes de que aparezca la lesión.
          </p>
        </div>
      </section>

      {/* ── 5. Plan de acción priorizado ── */}
      <section className="mb-8">
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-indigo-600" /> Plan de acción
        </h2>
        <div className="space-y-3">
          {report.planAccion.map((p, i) => {
            const ps = PRIORIDAD_STYLE[p.prioridad]
            return (
              <div key={i} className="rounded-2xl border border-slate-200 p-4 break-inside-avoid">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-black text-slate-800 text-sm">{i + 1}. {p.titulo}</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md" style={{ color: ps.color, backgroundColor: ps.bg }}>{ps.label}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{p.detalle}</p>
                <p className="text-[11px] font-bold text-indigo-600">Frecuencia recomendada: {p.frecuencia}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 6. Pie: advertencia + referencias ── */}
      <footer className="border-t-2 border-slate-200 pt-4 break-inside-avoid">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Este informe tiene carácter orientativo y preventivo; no constituye un diagnóstico médico ni
            sustituye la valoración de un profesional sanitario o un graduado en CAFD. Ante hallazgos en zona
            de riesgo se recomienda consulta profesional.
          </p>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck size={14} className="text-slate-400" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Referencias científicas</p>
        </div>
        <ul className="text-[10px] text-slate-500 leading-relaxed space-y-0.5 list-disc pl-4">
          {REFERENCIAS.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
          <Brain size={11} /> Generado por ValoraT · Informe de Salud Integral · {report.fechaGeneracion}
        </p>
      </footer>
    </div>
  )
}
