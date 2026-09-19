interface BankIntroProps {
  gameTitle: string
  attemptNumber: number
  onStart: () => void
}

/**
 * Pantalla de introducción: explica los controles antes de entrar al
 * escenario, para que el estudiante sepa que se mueve con el teclado.
 */
export default function BankIntro({
  gameTitle,
  attemptNumber,
  onStart,
}: BankIntroProps) {
  const isReplay = attemptNumber > 1

  return (
    <div className="bt-intro page-fade">
      <div className="bt-intro__badge">🪑 Nivel 4 · Mundo 2</div>

      <h1 className="bt-intro__title">{gameTitle}</h1>

      {isReplay && (
        <div className="bt-intro__replay">
          🔁 Ya recorriste este parque antes (intento #{attemptNumber}).
        </div>
      )}

      <p className="bt-intro__lead">
        Recorre el parque, encuentra los <strong>dos bancos del tiempo</strong> y
        llega a la meta. Cada banco te hará pensar en cómo usas tus horas libres.
      </p>

      {/* Controles */}
      <div className="bt-controls">
        <div className="bt-controls__group">
          <div className="bt-controls__keys">
            <span className="bt-key">W</span>
            <div className="bt-controls__row">
              <span className="bt-key">A</span>
              <span className="bt-key">S</span>
              <span className="bt-key">D</span>
            </div>
          </div>
          <span className="bt-controls__label">Moverte</span>
        </div>

        <div className="bt-controls__group">
          <div className="bt-controls__keys">
            <span className="bt-key">↑</span>
            <div className="bt-controls__row">
              <span className="bt-key">←</span>
              <span className="bt-key">↓</span>
              <span className="bt-key">→</span>
            </div>
          </div>
          <span className="bt-controls__label">También sirven</span>
        </div>

        <div className="bt-controls__group">
          <div className="bt-controls__keys">
            <span className="bt-key bt-key--wide">E</span>
          </div>
          <span className="bt-controls__label">Interactuar</span>
        </div>
      </div>

      <p className="bt-intro__hint">
        💡 También puedes hacer clic sobre un banco para interactuar.
      </p>

      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onStart}
        type="button"
      >
        🚶 Entrar al parque
      </button>
    </div>
  )
}
