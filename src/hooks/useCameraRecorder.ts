import { useRef, useState, useCallback, useEffect } from 'react'
import { useWebAudio } from './useWebAudio'

/**
 * useCameraRecorder — encapsula la captura de cámara y grabación de los tests de fuerza.
 *
 * Maneja: getUserMedia, MediaRecorder, cuenta atrás de preparación con pitidos,
 * grabación de 30 s y producción del Blob de vídeo. Centraliza las protecciones
 * críticas de iOS (Fullscreen Hijack + desbloqueo de AudioContext síncrono).
 *
 * REGLAS iOS (no romper):
 *  - El <video> de cámara DEBE tener playsinline + webkit-playsinline + muted.
 *  - `unlock()` del audio se ejecuta SÍNCRONAMENTE al inicio de startCamera(),
 *    antes del primer `await`, dentro del click del usuario.
 */

export type RecPhase = 'idle' | 'setup' | 'prep' | 'recording'

const RECORD_SECONDS = 30

export function useCameraRecorder() {
  const audio = useWebAudio()

  const [phase, setPhase] = useState<RecPhase>('idle')
  const [countdown, setCountdown] = useState(0)
  const [prepTime, setPrepTime] = useState(15)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<number | null>(null)
  const canceledRef = useRef(false)
  const prepTimeRef = useRef(prepTime)
  prepTimeRef.current = prepTime

  // Limpieza global al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Ref callback: adjunta el stream al <video> en cuanto React lo monta. */
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el
    if (el && streamRef.current) {
      el.muted = true
      el.defaultMuted = true
      el.setAttribute('playsinline', 'true')
      el.setAttribute('webkit-playsinline', 'true')
      el.srcObject = streamRef.current
      el.play().catch(() => { /* autoplay mitigado por iOS */ })
    }
  }, [])

  /** Abre la cámara. LLAMAR dentro del click del usuario. Devuelve true si va bien. */
  const startCamera = useCallback(async (): Promise<boolean> => {
    audio.unlock() // SÍNCRONO antes del await (iOS)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      // Si el <video> ya está montado, adjuntar ya
      if (videoElRef.current) attachVideo(videoElRef.current)
      setPhase('setup')
      return true
    } catch {
      setError('No se pudo acceder a la cámara. Revisa los permisos del navegador.')
      return false
    }
  }, [audio, facingMode, attachVideo])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  /** Cancela la prueba en curso y vuelve a la fase de preparación (setup). */
  const cancel = useCallback(() => {
    canceledRef.current = true
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    setPhase('setup')
    setCountdown(0)
  }, [])

  /** Cierra cámara por completo (al salir del test). */
  const closeCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try { recorderRef.current.stop() } catch { /* */ }
    }
    stopStream()
    setPhase('idle')
  }, [stopStream])

  // refs a callbacks para evitar dependencias circulares
  const startRecordingRef = useRef<() => void>(() => {})

  /** Inicia la cuenta atrás de preparación; al acabar arranca la grabación. */
  const startCountdown = useCallback(() => {
    audio.unlock()
    if (!recorderRef.current && streamRef.current) {
      const rec = new MediaRecorder(streamRef.current)
      rec.ondataavailable = (e) => { if (e.data.size > 0 && !canceledRef.current) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        if (canceledRef.current) return
        let blob = new Blob(chunksRef.current, { type: 'video/mp4' })
        if (blob.size === 0) blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
      }
      recorderRef.current = rec
    }

    canceledRef.current = false
    setPhase('prep')
    let timeLeft = prepTimeRef.current
    setCountdown(timeLeft)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      if (canceledRef.current) { if (intervalRef.current) clearInterval(intervalRef.current); return }
      timeLeft--
      setCountdown(timeLeft)
      if (timeLeft <= 3 && timeLeft > 0) audio.playBeep(800, 0.15)
      if (timeLeft <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        audio.playBeep(1200, 0.5)
        startRecordingRef.current()
      }
    }, 1000)
  }, [audio])

  /** Graba 30 s con pitidos en los últimos 3 s. */
  const startRecording = useCallback(() => {
    if (canceledRef.current || !recorderRef.current) return
    chunksRef.current = []
    recorderRef.current.start()
    setPhase('recording')
    let timeLeft = RECORD_SECONDS
    setCountdown(timeLeft)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      if (canceledRef.current) { if (intervalRef.current) clearInterval(intervalRef.current); return }
      timeLeft--
      setCountdown(timeLeft)
      if (timeLeft <= 3 && timeLeft > 0) audio.playBeep(800, 0.15)
      if (timeLeft <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        audio.playBeep(1200, 0.5)
        if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
        stopStream()
      }
    }, 1000)
  }, [audio, stopStream])

  startRecordingRef.current = startRecording

  return {
    phase, countdown, prepTime, setPrepTime, error, videoUrl, facingMode, setFacingMode,
    attachVideo, startCamera, startCountdown, cancel, closeCamera,
  }
}
