import type { Category, Experience } from '../types'

interface CategoryRevealProps {
  category: Category
  /** Experiencia elegida (si el estudiante ya tocó una) */
  selectedExperienceId?: string
  onSelectExperience: (experienceId: string) => void
  /** Confirma la experiencia elegida y pasa a la evidencia */
  onConfirm: () => void
  /** Vuelve a girar la ruleta para conseguir otra categoría */
  onSpinAgain: () => void
}

/**
 * Vista que se despliega cuando la ruleta cae en una categoría.
 *
 * Muestra las cuatro experiencias como cartas (misma línea visual que
 * el mapa del nivel 2). El estudiante elige una y confirma, o vuelve a
 * girar si prefiere otra categoría.
 */
export default function CategoryReveal({
  category,
  selectedExperienceId,
  onSelectExperience,
  onConfirm,
  onSpinAgain,
}: CategoryRevealProps) {
  return (
    <div
      className="exp-reveal page-fade"
      style={{
        '--cat-color': category.color,
        '--cat-bg': category.background,
      } as React.CSSProperties}
    >
      {/* Cabecera: la categoría que salió */}
      <div className="exp-reveal__header">
        <div className="exp-reveal__emoji" aria-hidden="true">{category.emoji}</div>
        <div>
          <div className="exp-reveal__eyebrow">La ruleta eligió</div>
          <h2 className="exp-reveal__title">{category.label}</h2>
        </div>
      </div>

      <p className="exp-reveal__tagline">{category.tagline}</p>

      {/* Cuatro experiencias como cartas */}
      <div className="exp-cards" role="radiogroup" aria-label={`Experiencias de ${category.label}`}>
        {category.experiences.map((exp: Experience, i) => {
          const isSelected = exp.id === selectedExperienceId
          return (
            <button
              key={exp.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`exp-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectExperience(exp.id)}
              style={{ '--delay': `${0.08 + i * 0.08}s` } as React.CSSProperties}
            >
              <span className="exp-card__emoji" aria-hidden="true">{exp.emoji}</span>
              <span className="exp-card__label">{exp.label}</span>
              <span className="exp-card__desc">{exp.description}</span>
              {isSelected && <span className="exp-card__check" aria-hidden="true">✓</span>}
            </button>
          )
        })}
      </div>

      {/* Acciones */}
      <div className="exp-reveal__actions">
        <button
          type="button"
          className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
          onClick={onConfirm}
          disabled={!selectedExperienceId}
        >
          {selectedExperienceId ? 'ELEGIR ESTA EXPERIENCIA →' : 'ELIGE UNA EXPERIENCIA'}
        </button>

        <button className="nc-back-link" onClick={onSpinAgain} type="button">
          🎡 Girar de nuevo
        </button>
      </div>
    </div>
  )
}
