interface ChallengeDecisionProps {
  onAccept: () => void
  onReject: () => void
  onSkip: () => void
  /** Si no quedan retos de reserva, se oculta la opción "Otro reto" */
  canSkip: boolean
}

/**
 * Las 3 opciones que el estudiante tiene frente a un reto:
 * aceptar, rechazar (sin penalización) o pedir otro reto distinto.
 */
export default function ChallengeDecision({
  onAccept,
  onReject,
  onSkip,
  canSkip,
}: ChallengeDecisionProps) {
  return (
    <div className="reto-decision">
      <button className="reto-btn reto-btn--primary" onClick={onAccept} type="button">
        ✅ Sí, lo haré
      </button>
      <button className="reto-btn reto-btn--ghost" onClick={onReject} type="button">
        🙅 No quiero hacerlo
      </button>
      {canSkip && (
        <button className="reto-btn reto-btn--outline" onClick={onSkip} type="button">
          🔄 Otro reto
        </button>
      )}
    </div>
  )
}
