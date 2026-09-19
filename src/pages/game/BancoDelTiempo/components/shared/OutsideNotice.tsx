import type { SkillCategory } from '../../types'

interface OutsideNoticeProps {
  skill: SkillCategory
  /** Arranca el contador y pasa a la misión activa */
  onStartTimer: () => void
  /** Párrafos de texto, en orden. Por defecto, los del banco 1. */
  paragraphs?: string[]
  /** Texto del bloque OBJETIVO */
  objectiveText?: string
}

/**
 * Cambio de experiencia: deja claro que el siguiente paso ocurre fuera
 * de la aplicación, antes de arrancar el contador.
 *
 * Se reutiliza en los dos bancos: los textos cambian según si el
 * estudiante va a enseñar (banco 1) o a aprender (banco 2), pero la
 * puesta en escena (el globo girando, el objetivo) es la misma.
 */
export default function OutsideNotice({
  skill,
  onStartTimer,
  paragraphs = [
    'Ahora busca a un amigo o persona de confianza y enséñale algo que sepas hacer muy bien.',
    'Hazlo juntos, disfruta el momento y recuerda que la misión consiste en compartir una habilidad.',
  ],
  objectiveText = 'Enseñarle una habilidad a otra persona.',
}: OutsideNoticeProps) {
  return (
    <div
      className="bt-m bt-m--outside"
      style={{
        '--skill-color': skill.color,
        '--skill-bg': skill.background,
      } as React.CSSProperties}
    >
      <div className="bt-outside__scene" aria-hidden="true">
        <span className="bt-outside__globe">🌎</span>
        <span className="bt-outside__spark bt-outside__spark--a">✨</span>
        <span className="bt-outside__spark bt-outside__spark--b">💫</span>
      </div>

      <h2 className="bt-m__title bt-m__title--sm">
        TU MISIÓN CONTINÚA FUERA DE LA PANTALLA
      </h2>

      {paragraphs.map(paragraph => (
        <p key={paragraph} className="bt-m__text">{paragraph}</p>
      ))}

      {/* Objetivo */}
      <div className="bt-objective">
        <span className="bt-objective__label">🎯 OBJETIVO</span>
        <span className="bt-objective__text">{objectiveText}</span>
      </div>

      <button className="bt-m__cta" onClick={onStartTimer} type="button">
        ⏱️ EMPEZAR LA MISIÓN
      </button>
    </div>
  )
}
