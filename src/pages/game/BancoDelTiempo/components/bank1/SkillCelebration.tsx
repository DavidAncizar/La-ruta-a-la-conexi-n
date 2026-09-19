import type { SkillCategory } from '../../types'

interface SkillCelebrationProps {
  skill: SkillCategory
  /** Cierra el banco y devuelve el control al mapa */
  onContinue: () => void
}

/**
 * Animación de cierre del banco 1. Se muestra al pulsar "MISIÓN
 * COMPLETADA" y luego devuelve al estudiante al escenario.
 */
export default function SkillCelebration({
  skill,
  onContinue,
}: SkillCelebrationProps) {
  return (
    <div
      className="bt-m bt-m--celebration"
      style={{
        '--skill-color': skill.color,
        '--skill-bg': skill.background,
      } as React.CSSProperties}
    >
      {/* Destellos alrededor del emoji de la habilidad */}
      <div className="bt-celebrate" aria-hidden="true">
        <span className="bt-celebrate__ring" />
        <span className="bt-celebrate__ring bt-celebrate__ring--2" />
        <span className="bt-celebrate__icon">{skill.emoji}</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--1">✨</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--2">⭐</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--3">💫</span>
        <span className="bt-celebrate__spark bt-celebrate__spark--4">✨</span>
      </div>

      <h2 className="bt-m__title bt-m__title--sm">✨ ¡HABILIDAD COMPARTIDA!</h2>

      <p className="bt-m__lead">Ahora continúa tu aventura.</p>

      <p className="bt-m__text">
        Enseñaste algo de <strong>{skill.label}</strong>. El segundo banco del
        tiempo te espera más adelante en el camino.
      </p>

      <button className="bt-m__cta" onClick={onContinue} type="button" autoFocus>
        CONTINUAR EL RECORRIDO →
      </button>
    </div>
  )
}
