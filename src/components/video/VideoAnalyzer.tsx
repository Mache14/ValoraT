import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

/**
 * VideoAnalyzer — reproductor de vídeo con control fotograma a fotograma.
 * Compartido por los tests de fuerza (Sit-to-Stand y Arm Curl).
 *
 * Controles: play/pause, scrubber (barra de tiempo) y avance/retroceso de
 * ±0.04 s (~25 fps) para análisis biomecánico preciso.
 *
 * El bucle de actualización lee directamente del ref del <video> y escribe en el
 * DOM del scrubber/display, evitando re-renders en cada fotograma.
 *
 * Expone el tiempo actual mediante `getCurrentTime()` a través de la prop `controlsRef`,
 * para que el contenido hijo (p. ej. marcar el fin del 5-STS) pueda leerlo.
 */

export interface VideoAnalyzerControls {
  getCurrentTime: () => number
}

interface VideoAnalyzerProps {
  videoUrl: string
  children?: ReactNode
  controlsRef?: React.MutableRefObject<VideoAnalyzerControls | null>
}

export function VideoAnalyzer({ videoUrl, children, controlsRef }: VideoAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scrubberRef = useRef<HTMLInputElement | null>(null)
  const timeDisplayRef = useRef<HTMLSpanElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)

  // Exponer el tiempo actual al componente padre
  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = { getCurrentTime: () => videoRef.current?.currentTime ?? 0 }
    }
  }, [controlsRef])

  // Bucle de actualización del scrubber y el display (lee del ref, no de state)
  useEffect(() => {
    const loop = () => {
      const v = videoRef.current
      if (v && !isNaN(v.duration)) {
        if (scrubberRef.current) {
          scrubberRef.current.max = String(v.duration)
          scrubberRef.current.value = String(v.currentTime)
        }
        if (timeDisplayRef.current) timeDisplayRef.current.textContent = v.currentTime.toFixed(2)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play().catch(() => {}); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }, [])

  const skip = useCallback((amount: number) => {
    const v = videoRef.current
    if (!v) return
    v.pause(); setPlaying(false)
    v.currentTime = Math.min(Math.max(v.currentTime + amount, 0), v.duration || 0)
  }, [])

  return (
    <div className="space-y-4">
      {/* Vídeo */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          onEnded={() => setPlaying(false)}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg font-mono text-sm tracking-wider border border-white/10">
          <span ref={timeDisplayRef}>0.00</span>s
        </div>
      </div>

      {/* Controles del reproductor */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={togglePlay}
            className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform">
            {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
          </button>
          <input ref={scrubberRef} type="range" min="0" step="0.01" defaultValue="0"
            onChange={(e) => { const v = videoRef.current; if (v) v.currentTime = parseFloat(e.target.value) }}
            className="flex-1 accent-indigo-600" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => skip(-0.04)}
            className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl border border-slate-300 text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
            <SkipBack size={15} /> −0.04s
          </button>
          <button onClick={() => skip(0.04)}
            className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl border border-slate-300 text-sm flex items-center justify-center gap-1 active:scale-95 transition-transform">
            +0.04s <SkipForward size={15} />
          </button>
        </div>
      </div>

      {/* Contenido específico de cada test */}
      {children}
    </div>
  )
}
