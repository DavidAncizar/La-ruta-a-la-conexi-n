import { useEffect, useState } from 'react'

interface LikeResultProps {
  /** Texto de la publicación que se acaba de "likear", para contexto */
  postText: string
  /**
   * Prepara la transición hacia la segunda parte del juego.
   * Por ahora solo navega fuera, hasta que esté implementada.
   */
  onContinue: () => void
}

/**
 * Resultado de haber dado solo like.
 *
 * La pantalla se construye en tres momentos para que el estudiante
 * procese la reflexión en lugar de leer todo de golpe:
 *   1. La reacción confirmada (animación del corazón)
 *   2. La pregunta y la respuesta "Nada nuevo"
 *   3. El mensaje educativo con la invitación a continuar
 *
 * IMPORTANTE: el botón "CONTINUAR" queda preparado para la parte 2
 * aunque esa parte aún no esté construida. Cuando se implemente,
 * `onContinue` simplemente cambiará la fase en lugar de navegar fuera.
 */
export default function LikeResult({ postText, onContinue }: LikeResultProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // El segundo y tercer momento se revelan automáticamente con un retraso
  // para que el estudiante tenga tiempo de procesar cada idea.
  useEffect(() => {
    const t2 = window.setTimeout(() => setStep(2), 1400)
    const t3 = window.setTimeout(() => setStep(3), 2800)
    return () => { window.clearTimeout(t2); window.clearTimeout(t3) }
  }, [])

  return (
    <div className="sa-result page-fade">

      {/* Momento 1: confirmación del like con animación */}
      <div className={`sa-result__like-confirm ${step >= 1 ? 'is-visible' : ''}`}>
        <span className="sa-result__heart" aria-hidden="true">❤️</span>
        <p className="sa-result__confirm-text">Reaccionaste a la publicación.</p>

        {/* La publicación queda en segundo plano con el like encima */}
        <div className="sa-result__post-echo" aria-hidden="true">
          <span className="sa-result__post-text">"{postText}"</span>
        </div>
      </div>

      {/* Momento 2: pregunta + respuesta */}
      {step >= 2 && (
        <div className="sa-result__question page-fade">
          <p className="sa-result__q">¿Qué descubriste sobre esta persona?</p>
          <p className="sa-result__answer">Nada nuevo.</p>
        </div>
      )}

      {/* Momento 3: mensaje educativo + botón */}
      {step >= 3 && (
        <div className="sa-result__lesson page-fade">
          <p className="sa-result__lesson-text">
            Un like puede mostrar interés, pero la conversación termina aquí.
            No descubriste nada nuevo sobre la persona.
          </p>

          <div className="sa-result__divider" aria-hidden="true">✦</div>

          <p className="sa-result__closing">
            "Una reacción puede conectar con una publicación. Una conversación
            puede ayudarte a conocer a quien está detrás de ella."
          </p>

          <button
            className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
            onClick={onContinue}
            type="button"
          >
            CONTINUAR →
          </button>
        </div>
      )}
    </div>
  )
}
