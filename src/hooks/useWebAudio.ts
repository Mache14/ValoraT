import { useRef, useCallback } from 'react'

/**
 * useWebAudio — sintetizador de tonos con Web Audio API (sin archivos de audio).
 * Compartido por el TMT y el PVT-B. Genera feedback sonoro de baja latencia.
 *
 * El AudioContext se crea de forma perezosa (lazy) en la primera reproducción,
 * porque los navegadores bloquean el audio hasta que hay una interacción del usuario.
 */
export function useWebAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctxRef.current = new AC()
    }
    return ctxRef.current
  }, [])

  /** Reproduce un tono simple */
  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, gain = 0.12) => {
      const ctx = getCtx()
      if (!ctx) return
      try {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration)
      } catch {
        /* AudioContext bloqueado o no soportado */
      }
    },
    [getCtx],
  )

  /**
   * unlock — desbloqueo de audio en iOS. DEBE llamarse SÍNCRONAMENTE dentro del
   * handler de un click/touch del usuario, ANTES de cualquier `await`. Dispara un
   * oscilador inaudible para registrar el "user gesture" y reanuda el AudioContext.
   */
  const unlock = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    try {
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      g.gain.value = 0 // silencio
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch {
      /* */
    }
  }, [getCtx])

  /** Pitido de metrónomo (cuenta atrás de cámara) con volumen pleno. */
  const playBeep = useCallback(
    (freq: number, duration: number) => {
      const ctx = getCtx()
      if (!ctx) return
      try {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        g.gain.setValueAtTime(1, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
        osc.connect(g)
        g.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration)
      } catch {
        /* */
      }
    },
    [getCtx],
  )

  // ── Sonidos con nombre (cubren TMT y PVT-B) ──
  const playStart = useCallback(() => playTone(880, 'sine', 0.15), [playTone])
  const playSuccess = useCallback(() => playTone(1500, 'sine', 0.1), [playTone])
  const playCorrect = useCallback(() => {
    playTone(587.33, 'sine', 0.15) // D5
    setTimeout(() => playTone(880, 'sine', 0.12), 50) // A5
  }, [playTone])
  const playIncorrect = useCallback(() => playTone(140, 'triangle', 0.25), [playTone])
  const playLapse = useCallback(() => {
    playTone(400, 'triangle', 0.3)
    setTimeout(() => playTone(300, 'triangle', 0.3), 150)
  }, [playTone])
  const playAnticipation = useCallback(() => playTone(150, 'sawtooth', 0.4), [playTone])
  const playDone = useCallback(() => {
    playTone(1000, 'sine', 0.2)
    setTimeout(() => playTone(1500, 'sine', 0.4), 200)
  }, [playTone])
  const playComplete = useCallback(() => {
    playTone(783.99, 'sine', 0.3) // G5
    setTimeout(() => playTone(1046.5, 'sine', 0.5), 120) // C6
  }, [playTone])

  return {
    playTone,
    unlock,
    playBeep,
    playStart,
    playSuccess,
    playCorrect,
    playIncorrect,
    playLapse,
    playAnticipation,
    playDone,
    playComplete,
  }
}
