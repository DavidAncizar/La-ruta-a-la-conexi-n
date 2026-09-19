import { CHALLENGES_PER_GAME, XP_TOTAL_GAME } from '../config'
import { XP_REPLAY_MULTIPLIER } from '@/lib/constants'

interface GameIntroProps {
  gameTitle: string
  /** Número de intento (1 = primera vez). Desde el 2, se avisa la mitad de XP. */
  attemptNumber: number
  onStart: () => void
}

/**
 * Pantalla de introducción del juego.
 * Explica la mecánica antes de comenzar la partida.
 */
export default function GameIntro({ gameTitle, attemptNumber, onStart }: GameIntroProps) {
  const isReplay = attemptNumber > 1
  const replayXp = Math.round(XP_TOTAL_GAME * XP_REPLAY_MULTIPLIER)

  return (
    <div className="reto-intro page-fade">
      <div className="reto-intro__badge">🎯 Nivel 1 · Mundo 1</div>

      <h1 className="reto-intro__title">{gameTitle}</h1>

      {isReplay && (
        <div className="reto-intro__replay-badge">
          🔁 Estás jugando de nuevo (intento #{attemptNumber}) — esta vez ganarás
          la mitad de XP.
        </div>
      )}

      <p className="reto-intro__lead">
        Tu misión es completar <strong>{CHALLENGES_PER_GAME} retos</strong> relacionados
        con tu entorno y tus decisiones diarias. Tú decides cuáles aceptar.
      </p>

      <div className="reto-intro__rules">
        <div className="reto-intro__rule">
          <span className="reto-intro__rule-icon">🎲</span>
          <span>Se eligen {CHALLENGES_PER_GAME} retos al azar para ti</span>
        </div>
        <div className="reto-intro__rule">
          <span className="reto-intro__rule-icon">✋</span>
          <span>Tú decides si aceptas, rechazas o cambias de reto</span>
        </div>
        <div className="reto-intro__rule">
          <span className="reto-intro__rule-icon">⚡</span>
          <span>Ganas XP solo por los retos que completes de verdad</span>
        </div>
        <div className="reto-intro__rule">
          <span className="reto-intro__rule-icon">🏆</span>
          {isReplay ? (
            <span>Como es un reintento, ganarás hasta {replayXp} XP</span>
          ) : (
            <span>Completa los {CHALLENGES_PER_GAME} para ganar hasta {XP_TOTAL_GAME} XP</span>
          )}
        </div>
      </div>

      <button className="reto-btn reto-btn--primary reto-btn--lg" onClick={onStart}>
        {isReplay ? '🔁 Jugar de nuevo' : '🚀 Comenzar reto'}
      </button>
    </div>
  )
}
