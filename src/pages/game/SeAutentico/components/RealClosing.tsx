/**
 * Parte 3 — pantalla de cierre conceptual.
 *
 * Muestra el resumen del aprendizaje (cadena Publicación → Conexión).
 * Al pulsar "IR AL RETO" se avanza a la pantalla del contador donde
 * el estudiante tiene tiempo para tener la conversación real.
 */
interface RealClosingProps {
  onChallenge: () => void
}

const CHAIN = [
  { icon: '📄', label: 'Publicación' },
  { icon: '🔍', label: 'Curiosidad' },
  { icon: '💬', label: 'Conversación' },
  { icon: '🤝', label: 'Conexión' },
]

export default function RealClosing({ onChallenge }: RealClosingProps) {
  return (
    <div className="sa-closing page-fade">

      <div className="sa-closing__icon" aria-hidden="true">❤️</div>
      <h2 className="sa-closing__title">MÁS ALLÁ DEL LIKE</h2>

      <p className="sa-closing__text">
        Una publicación puede recibir muchas reacciones y aun así terminar ahí.
      </p>

      <p className="sa-closing__text">
        Pero una pregunta puede convertir una reacción en una conversación.
      </p>

      <ol className="sa-chain" aria-label="Del like a la conexión">
        {CHAIN.map((item, index) => (
          <li key={item.label} className="sa-chain__item">
            <span className="sa-chain__icon" aria-hidden="true">{item.icon}</span>
            <span className="sa-chain__label">{item.label}</span>
            {index < CHAIN.length - 1 && (
              <span className="sa-chain__arrow" aria-hidden="true">→</span>
            )}
          </li>
        ))}
      </ol>

      <p className="sa-closing__text">
        "Una buena pregunta puede descubrir una parte de alguien que un like
        nunca muestra."
      </p>

      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onChallenge}
        type="button"
      >
        ¡IR AL RETO! →
      </button>
    </div>
  )
}
