interface Bank1BriefingProps {
  onStart: () => void
  /** Sale al mapa sin perder el progreso de la misión */
  onLeave: () => void
}

/**
 * Apertura del banco 1: presenta la misión como el arranque de una
 * misión de videojuego, no como un formulario.
 */
export default function Bank1Briefing({ onStart, onLeave }: Bank1BriefingProps) {
  return (
    <div className="bt-m bt-m--briefing">
      {/* Emblema del banco */}
      <div className="bt-m__emblem" aria-hidden="true">
        <span className="bt-m__emblem-glow" />
        <span className="bt-m__emblem-icon">🪑</span>
      </div>

      <span className="bt-m__eyebrow">Banco 1 de 2</span>
      <h2 className="bt-m__title">BANCO DEL TIEMPO</h2>

      <p className="bt-m__lead">
        Todos tenemos algo que sabemos hacer muy bien.
      </p>

      <p className="bt-m__text">
        Tu primera misión es compartir una de tus habilidades con alguien de
        confianza.
      </p>

      <button
        className="bt-m__cta"
        onClick={onStart}
        type="button"
        autoFocus
      >
        COMENZAR MISIÓN
      </button>

      <button className="bt-m__leave" onClick={onLeave} type="button">
        ← Volver al mapa
      </button>
    </div>
  )
}
