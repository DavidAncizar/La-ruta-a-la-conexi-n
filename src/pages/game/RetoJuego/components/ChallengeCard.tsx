import type { Challenge, ChallengeStepStatus } from '../types/challenge'
import ChallengeDecision from './ChallengeDecision'
import EvidenceButton from './EvidenceButton'

interface ChallengeCardProps {
  challenge: Challenge
  stepNumber: number
  status: ChallengeStepStatus
  canSkip: boolean
  onAccept: () => void
  onReject: () => void
  onSkip: () => void
  onConfirmEvidence: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  comunicacion: '💬 Comunicación',
  reflexion: '🧠 Reflexión',
  entorno: '🌐 Entorno',
  actividad: '🏃 Actividad',
  placeholder: '🏷️ Categoría',
}

/**
 * Tarjeta visual de un reto individual.
 * Muestra número, categoría, título, descripción y las acciones
 * correspondientes según el estado actual del reto (pending, accepted, etc).
 */
export default function ChallengeCard({
  challenge,
  stepNumber,
  status,
  canSkip,
  onAccept,
  onReject,
  onSkip,
  onConfirmEvidence,
}: ChallengeCardProps) {
  const categoryLabel = CATEGORY_LABELS[challenge.category] ?? `🏷️ ${challenge.category}`

  return (
    <div className="reto-card page-fade" key={challenge.id}>
      <div className="reto-card__header">
        <span className="reto-card__number">Reto #{stepNumber}</span>
        <span className="reto-card__category">{categoryLabel}</span>
      </div>

      <h2 className="reto-card__title">{challenge.title}</h2>
      <p className="reto-card__desc">{challenge.description}</p>

      {/* ── Estado: pendiente de decisión ── */}
      {status === 'pending' && (
        <ChallengeDecision
          onAccept={onAccept}
          onReject={onReject}
          onSkip={onSkip}
          canSkip={canSkip}
        />
      )}

      {/* ── Estado: aceptado, esperando evidencia ── */}
      {status === 'awaiting_evidence' && (
        <div className="reto-card__accepted">
          <div className="reto-card__accepted-msg">
            💪 ¡Genial! Realiza la actividad y confirma aquí cuando termines.
          </div>
          <EvidenceButton onConfirm={onConfirmEvidence} />
        </div>
      )}

      {/* ── Estado: aceptado sin evidencia requerida ── */}
      {status === 'accepted' && (
        <div className="reto-card__accepted">
          <div className="reto-card__accepted-msg">
            💪 ¡Genial! Cuando termines la actividad, confirma aquí.
          </div>
          <button
            className="reto-btn reto-btn--success"
            onClick={onConfirmEvidence}
            type="button"
          >
            ✅ Ya completé mi reto
          </button>
        </div>
      )}

      {/* ── Estado: rechazado ── */}
      {status === 'rejected' && (
        <div className="reto-card__rejected">
          <p className="reto-card__rejected-msg">
            No hay problema. Puedes elegir otro reto cuando quieras. 🙂
          </p>
          {canSkip ? (
            <button className="reto-btn reto-btn--outline" onClick={onSkip} type="button">
              🔄 Elegir otro reto
            </button>
          ) : (
            <div className="reto-card__no-more">
              <p className="reto-card__no-more-msg">
                Ya no quedan más retos distintos disponibles. Si quieres, puedes
                intentar este mismo reto.
              </p>
              <button className="reto-btn reto-btn--primary" onClick={onAccept} type="button">
                ✅ Sí, lo haré
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
