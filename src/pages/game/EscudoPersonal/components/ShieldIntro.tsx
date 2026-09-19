interface ShieldIntroProps {
  gameTitle: string
  onStart: () => void
}

/**
 * Pantalla de introducción breve del nivel 6.
 * Explica el objetivo y abre el editor al pulsar el botón.
 */
export default function ShieldIntro({ gameTitle, onStart }: ShieldIntroProps) {
  return (
    <div className="ep-intro page-fade">
      <div className="ep-intro__icon" aria-hidden="true">🛡️</div>

      <span className="ep-intro__eyebrow">{gameTitle}</span>
      <h1 className="ep-intro__title">ESCUDO PERSONAL</h1>

      <p className="ep-intro__lead">
        Crea un escudo que represente algo de ti.
      </p>

      <p className="ep-intro__text">
        Puedes dibujar, escribir, borrar, cambiar colores y combinar
        diferentes elementos para crear tu propio diseño.
      </p>

      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onStart}
        type="button"
        autoFocus
      >
        🎨 CREAR MI ESCUDO
      </button>
    </div>
  )
}
