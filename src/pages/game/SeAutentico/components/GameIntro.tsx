interface GameIntroProps {
  gameTitle: string
  onStart: () => void
}

/**
 * Pantalla de introducción del nivel 5.
 *
 * Presenta el desafío en una sola pregunta para enganchlar al estudiante
 * antes de mostrar la simulación, sin adelantar la respuesta.
 */
export default function GameIntro({ gameTitle, onStart }: GameIntroProps) {
  return (
    <div className="sa-intro page-fade">
      {/* Cabecera con el icono principal */}
      <div className="sa-intro__icon" aria-hidden="true">
        <span className="sa-intro__heart">❤️</span>
        <span className="sa-intro__bubble">💬</span>
      </div>

      <span className="sa-intro__eyebrow">{gameTitle}</span>
      <h1 className="sa-intro__title">MÁS ALLÁ DEL LIKE</h1>

      <p className="sa-intro__question">
        "Una reacción puede decir <em>'lo vi'</em>. Pero…
        ¿puede ayudarte a conocer realmente a alguien?"
      </p>

      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onStart}
        type="button"
      >
        COMENZAR
      </button>
    </div>
  )
}
