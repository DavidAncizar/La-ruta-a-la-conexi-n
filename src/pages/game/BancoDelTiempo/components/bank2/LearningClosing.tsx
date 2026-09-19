import type { SkillCategory } from '../../types'

interface LearningClosingProps {
  skill: SkillCategory
  /** Cierra el banco 2 y devuelve el control al mapa */
  onContinue: () => void
}

/**
 * Cierre del intercambio del banco 2: primero un agradecimiento (la
 * pequeña acción social que pide el requerimiento) y luego el botón que
 * marca el intercambio como completado.
 */
export default function LearningClosing({ skill, onContinue }: LearningClosingProps) {
  return (
    <div
      className="bt-m bt-m--celebration"
      style={{
        '--skill-color': skill.color,
        '--skill-bg': skill.background,
      } as React.CSSProperties}
    >
      <div className="bt-celebrate" aria-hidden="true">
        <span className="bt-celebrate__ring" />
        <span className="bt-celebrate__ring bt-celebrate__ring--2" />
        <span className="bt-celebrate__icon">🤝</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--1">✨</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--2">⭐</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--3">💫</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--4">✨</span>
      </div>

      <h2 className="bt-m__title bt-m__title--sm">🤝 ¡AHORA SABES ALGO NUEVO!</h2>

      <p className="bt-m__text">
        Agradece a tu amigo por enseñarte y, si puedes, muéstrale lo que lograste
        aprender.
      </p>

      <div className="bt-objective bt-objective--done">
        <span className="bt-objective__label">✅ INTERCAMBIO COMPLETADO</span>
        <span className="bt-objective__text">
          Aprendiste algo de <strong>{skill.label}</strong>.
        </span>
      </div>

      <button className="bt-m__cta" onClick={onContinue} type="button" autoFocus>
        CONTINUAR →
      </button>
    </div>
  )
}
