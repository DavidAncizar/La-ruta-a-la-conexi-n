/**
 * Parte 3 — primera pantalla: puente de la simulación a la acción real.
 *
 * Orienta al estudiante para que haga en la vida real lo que aprendió
 * en las partes 1 y 2, con ejemplos concretos y sin exigir nada íntimo.
 */
interface RealIntroProps {
  onContinue: () => void
}

export default function RealIntro({ onContinue }: RealIntroProps) {
  return (
    <div className="sa-real page-fade">

      <div className="sa-real__badge" aria-hidden="true">🌎</div>

      <h2 className="sa-real__title">Ahora te toca a ti.</h2>

      <p className="sa-real__text">
        Piensa en alguien de confianza con quien normalmente hables por chat
        o redes sociales.
      </p>

      <p className="sa-real__text">
        Comparte algo sencillo sobre ti que pueda abrir una conversación.
      </p>

      {/* Ejemplo de publicación real */}
      <div className="sa-real__example">
        <span className="sa-real__example-icon" aria-hidden="true">📄</span>
        <span className="sa-real__example-text">
          "Siempre he querido aprender fotografía."
        </span>
      </div>

      {/* Transición: del post a la pregunta */}
      <div className="sa-real__bridge">
        <p className="sa-real__bridge-a">En lugar de esperar un like…</p>
        <span className="sa-real__bridge-arrow" aria-hidden="true">↓</span>
        <p className="sa-real__bridge-b">
          …haz una pregunta que permita conocer algo más de esa persona.
        </p>
      </div>

      {/* Ejemplo de pregunta */}
      <div className="sa-real__example sa-real__example--question">
        <span className="sa-real__example-icon" aria-hidden="true">💬</span>
        <span className="sa-real__example-text">
          "¿Y tú? ¿Hay algo que siempre hayas querido aprender?"
        </span>
      </div>

      {/* Nota sobre autorrevelación */}
      <p className="sa-real__note">
        💡 No necesitas contar algo íntimo. Compartir algo cotidiano también
        puede abrir una conversación significativa.
      </p>

      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onContinue}
        type="button"
      >
        CONTINUAR →
      </button>
    </div>
  )
}
