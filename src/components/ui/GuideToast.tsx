import { useState, useEffect, useRef } from 'react'

interface GuideToastProps {
  /** Emoji o ícono que encabeza el mensaje */
  icon: string
  /** Título corto del tip */
  title: string
  /** Cuerpo del mensaje orientador */
  message: string
  /** Texto del botón de acción opcional (ej. "Ir a Mundos") */
  actionLabel?: string
  /** Callback al pulsar el botón de acción */
  onAction?: () => void
  /**
   * Clave única para recordar en sessionStorage si ya fue cerrado.
   * Si no se pasa, el toast siempre aparece mientras el componente esté montado.
   */
  storageKey?: string
  /** ms antes de que aparezca (default 900) */
  delay?: number
}

/**
 * Mensaje flotante de orientación contextual.
 *
 * Aparece en la esquina inferior derecha tras un breve delay.
 * El estudiante puede cerrarlo con la X. Si se pasa storageKey,
 * se guarda en sessionStorage para no volver a mostrarse en la
 * misma sesión — así no molesta cada vez que el estudiante navega.
 */
export default function GuideToast({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  storageKey,
  delay = 900,
}: GuideToastProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Si ya fue cerrado en esta sesión, no mostrar
    if (storageKey && sessionStorage.getItem(storageKey) === 'dismissed') {
      return
    }

    timerRef.current = setTimeout(() => setVisible(true), delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [storageKey, delay])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => setDismissed(true), 320) // esperar animación de salida
    if (storageKey) {
      sessionStorage.setItem(storageKey, 'dismissed')
    }
  }

  function handleAction() {
    handleDismiss()
    onAction?.()
  }

  if (dismissed) return null

  return (
    <div className={`guide-toast ${visible ? 'guide-toast--visible' : ''}`} role="status" aria-live="polite">
      <button
        className="guide-toast__close"
        onClick={handleDismiss}
        aria-label="Cerrar ayuda"
        type="button"
      >
        ✕
      </button>

      <div className="guide-toast__body">
        <span className="guide-toast__icon" aria-hidden="true">{icon}</span>
        <div className="guide-toast__content">
          <p className="guide-toast__title">{title}</p>
          <p className="guide-toast__message">{message}</p>
          {actionLabel && (
            <button
              type="button"
              className="guide-toast__action"
              onClick={handleAction}
            >
              {actionLabel} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
