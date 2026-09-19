import type { SkillCategory } from '../../types'

interface SkillMissionProps {
  skill: SkillCategory
  onContinue: () => void
  /** Vuelve al selector para cambiar de categoría */
  onChangeSkill: () => void
  /** Prefijo del título. Ej: "MISIÓN" o "MISIÓN: APRENDE" */
  titlePrefix?: string
  lead?: string
  text?: string
  /** Etiqueta del enlace para volver al selector */
  changeSkillLabel?: string
}

/**
 * Misión personalizada: el contenido se adapta a la categoría elegida
 * (emoji, ejemplos y color de acento vienen de los datos de la skill).
 *
 * Se reutiliza en los dos bancos: en el banco 1 el estudiante enseña, en
 * el banco 2 aprende de otra persona. Solo cambian los textos.
 */
export default function SkillMission({
  skill,
  onContinue,
  onChangeSkill,
  titlePrefix = 'MISIÓN:',
  lead = 'Ahora es tu turno de enseñar.',
  text =
    'Piensa en algo de esta categoría que sepas hacer muy bien y enséñaselo a ' +
    'un amigo o persona de confianza.',
  changeSkillLabel = '← Elegir otra habilidad',
}: SkillMissionProps) {
  return (
    <div
      className="bt-m bt-m--mission"
      style={{
        '--skill-color': skill.color,
        '--skill-bg': skill.background,
      } as React.CSSProperties}
    >
      <div className="bt-m__emblem bt-m__emblem--skill" aria-hidden="true">
        <span className="bt-m__emblem-glow" />
        <span className="bt-m__emblem-icon">{skill.emoji}</span>
      </div>

      <span className="bt-m__eyebrow">Misión personalizada</span>
      <h2 className="bt-m__title bt-m__title--sm">
        {skill.emoji} {titlePrefix} {skill.missionName}
      </h2>

      <p className="bt-m__lead">{lead}</p>

      <p className="bt-m__text">{text}</p>

      {/* Ejemplos de la categoría */}
      <div className="bt-examples">
        <span className="bt-examples__title">Por ejemplo</span>
        <ul className="bt-examples__list">
          {skill.examples.map(example => (
            <li key={example} className="bt-examples__item">{example}</li>
          ))}
        </ul>
      </div>

      <button className="bt-m__cta" onClick={onContinue} type="button">
        ESTOY LISTO →
      </button>

      <button className="bt-m__leave" onClick={onChangeSkill} type="button">
        {changeSkillLabel}
      </button>
    </div>
  )
}
