interface ExplorerIntroProps {
  gameTitle: string
  /** Número de intento (1 = primera vez) */
  attemptNumber: number
  /** XP de esta partida, ya ajustado si es reintento */
  xpReward: number
  onStart: () => void
}

/**
 * Pantalla de introducción del juego.
 * Explica la misión antes de mostrar la ruleta.
 */
export default function ExplorerIntro({
  gameTitle,
  attemptNumber,
  xpReward,
  onStart,
}: ExplorerIntroProps) {
  const isReplay = attemptNumber > 1

  return (
    <div className="exp-intro page-fade">
      <div className="exp-intro__badge">🎡 Nivel 3 · Mundo 2</div>

      <h1 className="exp-intro__title">{gameTitle}</h1>

      {isReplay && (
        <div className="exp-intro__replay">
          🔁 Estás jugando de nuevo (intento #{attemptNumber}) — esta vez ganarás
          la mitad de XP.
        </div>
      )}

      <p className="exp-intro__lead">
        Gira la ruleta, deja que el azar elija una <strong>categoría</strong> y
        descubre experiencias nuevas para disfrutar tu tiempo libre.
      </p>

      <div className="exp-intro__steps">
        <div className="exp-intro__step">
          <span className="exp-intro__step-num">1</span>
          <span>Gira la ruleta y cae en una de las 6 categorías</span>
        </div>
        <div className="exp-intro__step">
          <span className="exp-intro__step-num">2</span>
          <span>Elige una de las 4 experiencias que se despliegan</span>
        </div>
        <div className="exp-intro__step">
          <span className="exp-intro__step-num">3</span>
          <span>Hazla en la vida real y registra tu evidencia</span>
        </div>
      </div>

      <div className="exp-intro__reward">
        <span>⚡</span>
        <span>Recompensa: <strong>{xpReward} XP</strong></span>
      </div>

      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onStart}
        type="button"
      >
        {isReplay ? '🔁 Jugar de nuevo' : '🚀 Comenzar misión'}
      </button>
    </div>
  )
}
