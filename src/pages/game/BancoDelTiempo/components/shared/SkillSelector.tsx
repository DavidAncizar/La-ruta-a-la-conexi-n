import { SKILL_CATEGORIES } from '../../data/skills'
import type { SkillCategoryId } from '../../types'

interface SkillSelectorProps {
  /** Categoría marcada ahora mismo, si hay alguna */
  selectedId: SkillCategoryId | null
  onSelect: (id: SkillCategoryId) => void
  /** Confirma la categoría y pasa a la misión */
  onConfirm: () => void
  onLeave: () => void
  /** Título de la pantalla. Por defecto, el del banco 1. */
  title?: string
  /** Texto de apoyo bajo el título */
  text?: string
  /** Etiqueta del botón una vez hay una categoría elegida */
  confirmLabel?: string
}

/**
 * Selector de habilidad, al estilo de una pantalla de selección de
 * personaje: siete tarjetas grandes, animadas, con estado de elegida
 * claramente distinto. Solo se puede elegir una.
 *
 * Se usa en el banco 1 (el estudiante elige qué va a enseñar) y en el
 * banco 2 (la persona de confianza elige qué va a enseñarle al
 * estudiante), con el mismo diseño para que ambas misiones se sientan
 * parte del mismo juego. El título y el texto son personalizables porque
 * cada banco pide la elección desde un ángulo distinto.
 */
export default function SkillSelector({
  selectedId,
  onSelect,
  onConfirm,
  onLeave,
  title = '🎯 ¿QUÉ SABES HACER?',
  text = 'Elige una categoría y piensa en algo que puedas enseñar muy bien.',
  confirmLabel = 'ELEGIR ESTA HABILIDAD',
}: SkillSelectorProps) {
  return (
    <div className="bt-m bt-m--selector">
      <h2 className="bt-m__title bt-m__title--sm">{title}</h2>
      <p className="bt-m__text">{text}</p>

      <div
        className="bt-skills"
        role="radiogroup"
        aria-label="Categorías de habilidad"
      >
        {SKILL_CATEGORIES.map((skill, index) => {
          const isSelected = skill.id === selectedId

          return (
            <button
              key={skill.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`bt-skill ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelect(skill.id)}
              style={{
                '--skill-color': skill.color,
                '--skill-bg': skill.background,
                '--delay': `${0.05 + index * 0.06}s`,
              } as React.CSSProperties}
            >
              <span className="bt-skill__glow" aria-hidden="true" />
              <span className="bt-skill__emoji" aria-hidden="true">{skill.emoji}</span>
              <span className="bt-skill__name">{skill.label}</span>
              <span className="bt-skill__desc">{skill.description}</span>

              {isSelected && (
                <span className="bt-skill__badge" aria-hidden="true">✓ ELEGIDA</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        className="bt-m__cta"
        onClick={onConfirm}
        type="button"
        disabled={!selectedId}
      >
        {selectedId ? confirmLabel : 'ELIGE UNA CATEGORÍA'}
      </button>

      <button className="bt-m__leave" onClick={onLeave} type="button">
        ← Volver al mapa
      </button>
    </div>
  )
}
