import { useEffect, useState } from 'react'

/**
 * Parte 3 — segunda pantalla: el objetivo final como misión visual.
 *
 * Los tres pasos se encadenan uno a uno con animación, para que el
 * estudiante los lea en orden y no los procese todos a la vez.
 * A continuación aparece el refuerzo conceptual y el botón de avance.
 */
interface RealGoalProps {
  onContinue: () => void
}

const STEPS = [
  { icon: '📤', text: 'Comparte algo.' },
  { icon: '❓', text: 'Haz una pregunta.' },
  { icon: '🤝', text: 'Descubre algo nuevo sobre esa persona.' },
]

export default function RealGoal({ onContinue }: RealGoalProps) {
  const [lit, setLit] = useState(-1)

  useEffect(() => {
    let i = 0
    const tick = () => {
      setLit(i)
      i++
      if (i < STEPS.length) window.setTimeout(tick, 550)
    }
    const start = window.setTimeout(tick, 300)
    return () => window.clearTimeout(start)
  }, [])

  const allLit = lit >= STEPS.length - 1

  return (
    <div className="sa-real page-fade">
      <span className="sa-real__badge" aria-hidden="true">🎯</span>
      <h2 className="sa-real__title">Tu objetivo</h2>

      {/* Pasos encadenados */}
      <ol className="sa-goal-steps" aria-label="Pasos del objetivo">
        {STEPS.map((step, index) => (
          <li
            key={step.text}
            className={`sa-goal-step ${lit >= index ? 'is-lit' : ''}`}
          >
            <span className="sa-goal-step__icon" aria-hidden="true">{step.icon}</span>
            <span className="sa-goal-step__text">{step.text}</span>
            {index < STEPS.length - 1 && (
              <span
                className={`sa-goal-step__arrow ${lit >= index ? 'is-lit' : ''}`}
                aria-hidden="true"
              >↓</span>
            )}
          </li>
        ))}
      </ol>

      {/* Refuerzo conceptual — aparece cuando los tres pasos ya están encendidos */}
      {allLit && (
        <div className="sa-real__reinforce page-fade">
          <p className="sa-real__text">
            No se trata de conseguir más reacciones.
          </p>
          <p className="sa-real__text sa-real__text--accent">
            Se trata de conocer un poco más a alguien.
          </p>
        </div>
      )}

      {allLit && (
        <button
          className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full page-fade"
          onClick={onContinue}
          type="button"
        >
          CONTINUAR →
        </button>
      )}
    </div>
  )
}
