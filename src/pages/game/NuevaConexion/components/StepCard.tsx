import type { ConnectionRoute, ConnectionStep } from '../types/connection'

interface StepCardProps {
  route: ConnectionRoute
  step: ConnectionStep
  /** Índice del paso actual (base 0) */
  stepIndex: number
  /** Total de pasos de la ruta */
  totalSteps: number
  /** Opción ya elegida en este paso, si el estudiante volvió atrás */
  selectedOptionId?: string
  /**
   * Todas las opciones elegidas hasta ahora, una por paso. Se usa para
   * marcar en el recorrido superior qué paradas ya están resueltas.
   */
  selectedOptionIds: string[]
  /** Marca una opción como elegida sin avanzar todavía */
  onSelectOption: (optionId: string) => void
  /** Avanza al siguiente paso (o a la guía si es el último) */
  onContinue: () => void
  onBack: () => void
}

/** Icono de cada una de las cuatro paradas del recorrido */
const STEP_ICONS = ['👋', '❓', '🤝', '🔄'] as const

/**
 * Un paso de la construcción de la guía.
 *
 * Flujo:
 *  1. El estudiante toca una opción → queda marcada visualmente.
 *  2. El botón "Continuar" se habilita.
 *  3. Al tocar "Continuar" se avanza al siguiente paso (o a la guía).
 *
 * NO hay avance automático al elegir, para que el estudiante pueda
 * cambiar de opinión antes de confirmar.
 *
 * DISEÑO: arriba va el recorrido de las cuatro paradas (misma metáfora
 * que el mapa) y las tres opciones se presentan como cartas, no como
 * una lista, para que todo quepa en una sola pantalla.
 *
 * Si la ruta trae un `safetyNote`, se muestra como banner destacado
 * SOLO en el primer paso, sin ocupar una fase extra del flujo.
 */
export default function StepCard({
  route,
  step,
  stepIndex,
  totalSteps,
  selectedOptionId,
  selectedOptionIds,
  onSelectOption,
  onContinue,
  onBack,
}: StepCardProps) {
  const isLastStep     = stepIndex === totalSteps - 1
  const isFirstStep    = stepIndex === 0
  const showSafetyNote = isFirstStep && !!route.safetyNote

  return (
    <div
      className="nc-step page-fade"
      style={{
        '--route-color': route.color,
        '--route-bg': route.background,
      } as React.CSSProperties}
    >
      {/* Contexto elegido + contador */}
      <div className="nc-step__topbar">
        <span className="nc-step__route">
          {route.emoji} {route.label}
        </span>
        <span className="nc-step__counter">
          Parada {stepIndex + 1} de {totalSteps}
        </span>
      </div>

      {/* Recorrido de las cuatro paradas */}
      <div
        className="nc-track"
        role="progressbar"
        aria-valuenow={stepIndex + 1}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-label={`Parada ${stepIndex + 1} de ${totalSteps}`}
      >
        <span className="nc-track__line" aria-hidden="true" />
        <span
          className="nc-track__line nc-track__line--done"
          style={{ width: `${(stepIndex / (totalSteps - 1)) * 100}%` }}
          aria-hidden="true"
        />

        {route.steps.map((trackStep, i) => {
          const isDone    = i < stepIndex && !!selectedOptionIds[i]
          const isCurrent = i === stepIndex

          return (
            <span
              key={trackStep.id}
              className={[
                'nc-track__stop',
                isCurrent ? 'is-current' : '',
                isDone    ? 'is-done'    : '',
              ].filter(Boolean).join(' ')}
            >
              <span className="nc-track__dot" aria-hidden="true">
                {isDone ? '✓' : STEP_ICONS[i]}
              </span>
              <span className="nc-track__name">{trackStep.title}</span>
            </span>
          )
        })}
      </div>

      {/* Aviso de seguridad (solo primer paso, solo si la ruta lo trae) */}
      {showSafetyNote && (
        <div className="nc-step__safety" role="note">
          <span className="nc-step__safety-icon" aria-hidden="true">🛡️</span>
          <p className="nc-step__safety-text">{route.safetyNote}</p>
        </div>
      )}

      {/* Título del paso */}
      <div className="nc-step__heading">
        <h2 className="nc-step__title">
          <span className="nc-step__title-icon" aria-hidden="true">
            {STEP_ICONS[stepIndex]}
          </span>
          {step.title}
        </h2>
        <p className="nc-step__desc">{step.description}</p>
      </div>

      {/* Opciones como cartas (selección, sin avance automático) */}
      <div className="nc-step__options" role="radiogroup" aria-label={step.title}>
        {step.options.map((option, i) => {
          const isSelected = option.id === selectedOptionId
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`nc-option ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectOption(option.id)}
              style={{ '--delay': `${0.05 + i * 0.07}s` } as React.CSSProperties}
            >
              <span className="nc-option__mark" aria-hidden="true">
                {(['A', 'B', 'C'] as const)[i]}
              </span>
              <span className="nc-option__label">{option.label}</span>
              {isSelected && (
                <span className="nc-option__check" aria-hidden="true">✓</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Acciones */}
      <div className="nc-step__actions">
        <button
          type="button"
          className="nc-btn nc-btn--primary nc-btn--full nc-btn--lg"
          onClick={onContinue}
          disabled={!selectedOptionId}
        >
          {!selectedOptionId
            ? 'ELIGE UNA OPCIÓN'
            : isLastStep ? 'VER MI GUÍA ✨' : 'CONTINUAR →'}
        </button>

        <button className="nc-back-link" onClick={onBack} type="button">
          ← {isFirstStep ? 'Cambiar de conexión' : 'Parada anterior'}
        </button>
      </div>
    </div>
  )
}
