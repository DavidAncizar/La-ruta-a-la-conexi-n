import { useEffect } from 'react'
import { GAME_HELP, SOCIAL_REMINDER } from '@/data/gameHelp'
import ReplayTip from '@/components/ui/ReplayTip'

interface GameHelpModalProps {
  /** Valor de `game.mechanic`, para elegir la ayuda del juego */
  mechanic: string
  onClose: () => void
}

/**
 * Ayuda "¿Cómo se juega?" de un juego: objetivo, pasos, con quién se
 * juega y consejos para quien se queda trabado. Reutiliza el overlay
 * del modal de Drive para mantener el mismo aspecto.
 */
export default function GameHelpModal({ mechanic, onClose }: GameHelpModalProps) {
  const help = GAME_HELP[mechanic]

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!help) return null

  return (
    <div className="drive-modal-overlay" onClick={onClose}>
      <div
        className="drive-modal gh-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gh-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="drive-modal__header">
          <div className="drive-modal__header-icon gh-modal__emoji" aria-hidden="true">
            {help.emoji}
          </div>
          <div className="drive-modal__header-text">
            <h5 className="drive-modal__title" id="gh-title">¿Cómo se juega?</h5>
            <p className="drive-modal__subtitle">{help.name}</p>
          </div>
          <button className="drive-modal__close" onClick={onClose} aria-label="Cerrar ayuda">✕</button>
        </div>

        <div className="gh-modal__body">
          <p className="gh-modal__goal">
            <strong>🎯 La idea:</strong> {help.goal}
          </p>

          <div className="gh-modal__cols">
            <div>
              <h6 className="gh-modal__heading">Paso a paso</h6>
              <ol className="gh-modal__steps">
                {help.steps.map((s, i) => (
                  <li key={i} className="gh-modal__step">
                    <span className="gh-modal__step-num" aria-hidden="true">{i + 1}</span>
                    <span className="gh-modal__step-text">
                      <span aria-hidden="true">{s.emoji} </span>{s.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <div className="gh-modal__social">
                <p className="gh-modal__social-title">👥 No se juega solo</p>
                <p className="gh-modal__social-text">{SOCIAL_REMINDER}</p>
                <p className="gh-modal__social-text gh-modal__social-text--game">{help.withWhom}</p>
              </div>

              <ReplayTip compact />

              <h6 className="gh-modal__heading">¿Te quedaste trabado?</h6>
              <ul className="gh-modal__tips">
                {help.stuckTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="drive-modal__nav gh-modal__footer">
          <button className="btn btn-success btn-sm fw-bold px-4 ms-auto" onClick={onClose} type="button">
            ¡Entendido! ✓
          </button>
        </div>
      </div>
    </div>
  )
}
