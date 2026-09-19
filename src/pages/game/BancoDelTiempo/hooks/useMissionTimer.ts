import { useEffect, useState } from 'react'

interface TimerState {
  /** Milisegundos que quedan (nunca baja de 0) */
  remainingMs: number
  /** Fracción de 0 a 1 del tiempo que queda, para la barra circular */
  fraction: number
  /** true cuando llegó a 00:00 */
  isFinished: boolean
  /** Tiempo formateado como MM:SS */
  label: string
}

/** Convierte milisegundos a MM:SS */
function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Contador de la misión.
 *
 * POR QUÉ RECIBE EL INSTANTE DE INICIO Y NO LOS SEGUNDOS RESTANTES
 * El estudiante va a salir de la aplicación para enseñar su habilidad, y
 * puede cerrar la pestaña o recargar. Si guardáramos "quedan 7 minutos",
 * ese número se congelaría. Guardando el instante en que arrancó, el
 * tiempo restante se recalcula siempre contra el reloj real.
 *
 * El contador es una guía: al llegar a 00:00 no bloquea nada.
 */
export function useMissionTimer(
  startedAt: number | null,
  durationMs: number
): TimerState {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (startedAt === null) return

    setNow(Date.now())

    const intervalId = window.setInterval(() => {
      const current = Date.now()
      setNow(current)

      // Al agotarse se detiene el intervalo: ya no hay nada que contar y
      // así no se re-renderiza cada 250 ms para siempre.
      if (current - startedAt >= durationMs) {
        window.clearInterval(intervalId)
      }
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [startedAt, durationMs])

  const elapsed = startedAt === null ? 0 : Math.max(0, now - startedAt)
  const remainingMs = Math.max(0, durationMs - elapsed)

  return {
    remainingMs,
    fraction: durationMs > 0 ? remainingMs / durationMs : 0,
    isFinished: startedAt !== null && remainingMs === 0,
    label: formatTime(startedAt === null ? durationMs : remainingMs),
  }
}
