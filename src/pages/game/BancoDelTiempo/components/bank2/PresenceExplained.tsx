import type { PresenceMode } from '../../types'

interface PresenceExplainedProps {
  mode: PresenceMode
  onContinue: () => void
  onChangeMode: () => void
}

const CONTENT: Record<PresenceMode, {
  emoji: string
  title: string
  paragraphs: string[]
  objective: string
}> = {
  together: {
    emoji: '🧑‍🤝‍🧑',
    title: 'MISIÓN PRESENCIAL',
    paragraphs: [
      'Pídele a tu amigo que elija una categoría y que te enseñe algo nuevo.',
      'Puede enseñarte una habilidad que conozca muy bien, aunque sea algo sencillo.',
    ],
    objective: 'Aprender algo nuevo directamente de otra persona.',
  },
  remote: {
    emoji: '📱',
    title: 'MISIÓN A DISTANCIA',
    paragraphs: [
      'Pídele a tu amigo o persona de confianza que elija una categoría y te enseñe ' +
        'algo nuevo utilizando el medio que normalmente utilicen para comunicarse.',
      'Puede explicarte la habilidad mediante una llamada, videollamada o enviándote ' +
        'una explicación, según lo que tengan disponible.',
    ],
    objective: 'Aprender algo nuevo de una persona de confianza aunque no esté físicamente contigo.',
  },
}

/**
 * Explicación según la opción elegida en el paso anterior.
 *
 * La aplicación no crea ningún canal de comunicación: solo orienta al
 * estudiante a usar el medio que ya usa normalmente con esa persona.
 */
export default function PresenceExplained({
  mode,
  onContinue,
  onChangeMode,
}: PresenceExplainedProps) {
  const content = CONTENT[mode]

  return (
    <div className="bt-m bt-m--presence-info">
      <div className="bt-m__emblem" aria-hidden="true">
        <span className="bt-m__emblem-glow" />
        <span className="bt-m__emblem-icon">{content.emoji}</span>
      </div>

      <h2 className="bt-m__title bt-m__title--sm">
        {content.emoji} {content.title}
      </h2>

      {content.paragraphs.map(paragraph => (
        <p key={paragraph} className="bt-m__text">{paragraph}</p>
      ))}

      <div className="bt-objective">
        <span className="bt-objective__label">🎯 OBJETIVO</span>
        <span className="bt-objective__text">{content.objective}</span>
      </div>

      <button className="bt-m__cta" onClick={onContinue} type="button">
        CONTINUAR →
      </button>

      <button className="bt-m__leave" onClick={onChangeMode} type="button">
        ← Cambiar de opción
      </button>
    </div>
  )
}
