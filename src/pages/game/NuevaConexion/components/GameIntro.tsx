import { CONNECTION_ROUTES } from '../data/routes'

interface GameIntroProps {
  gameTitle: string
  /** Número de intento (1 = primera vez) */
  attemptNumber: number
  /** XP de esta partida, ya ajustado si es reintento */
  xpReward: number
  onStart: () => void
}

/**
 * Pantalla de introducción del juego.
 * Explica la misión antes de mostrar el mapa de rutas.
 */
export default function GameIntro({
  gameTitle,
  attemptNumber,
  xpReward,
  onStart,
}: GameIntroProps) {
  const isReplay = attemptNumber > 1

  return (
    <div className="nc-intro page-fade">
      <div className="nc-intro__badge">🗺️ Nivel 2 · Mundo 1</div>

      <h1 className="nc-intro__title">{gameTitle}</h1>

      {isReplay && (
        <div className="nc-intro__replay">
          🔁 Estás jugando de nuevo (intento #{attemptNumber}) — esta vez ganarás
          la mitad de XP.
        </div>
      )}

      <p className="nc-intro__lead">
        Tu misión es <strong>iniciar una conversación</strong> con alguien con quien
        normalmente no hablas, y descubrir algo que tengan en común.
      </p>

      <div className="nc-intro__steps">
        <div className="nc-intro__step">
          <span className="nc-intro__step-num">1</span>
          <span>Elige a quién te vas a acercar entre {CONNECTION_ROUTES.length} opciones</span>
        </div>
        <div className="nc-intro__step">
          <span className="nc-intro__step-num">2</span>
          <span>Armas tu propia guía de conversación paso a paso</span>
        </div>
        <div className="nc-intro__step">
          <span className="nc-intro__step-num">3</span>
          <span>Usas esa guía en la vida real y registras tu evidencia</span>
        </div>
      </div>

      <div className="nc-intro__reward">
        <span>⚡</span>
        <span>Recompensa: <strong>{xpReward} XP</strong></span>
      </div>

      <button className="nc-btn nc-btn--primary nc-btn--lg" onClick={onStart} type="button">
        {isReplay ? '🔁 Jugar de nuevo' : '🚀 Comenzar misión'}
      </button>
    </div>
  )
}
