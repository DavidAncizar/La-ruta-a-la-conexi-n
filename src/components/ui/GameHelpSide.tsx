import { GAME_HELP } from '@/data/gameHelp'
import ReplayTip from '@/components/ui/ReplayTip'

interface GameHelpSideProps {
  mechanic: string
  /** left: objetivo y pasos · right: jugar con amigos/online y consejos */
  side: 'left' | 'right'
}

/**
 * Panel lateral fijo con la ayuda del juego. Se muestra a los costados del
 * juego en pantallas anchas, para que "cómo se juega" y "se juega con amigos
 * y online" estén siempre a la vista mientras se juega.
 */
export default function GameHelpSide({ mechanic, side }: GameHelpSideProps) {
  const help = GAME_HELP[mechanic]
  if (!help) return null

  if (side === 'left') {
    return (
      <aside className="gh-side" aria-label="Cómo se juega">
        <div className="gh-side__card">
          <p className="gh-side__title">❓ ¿Cómo se juega?</p>
          <p className="gh-side__goal">{help.goal}</p>
          <ol className="gh-side__steps">
            {help.steps.map((s, i) => (
              <li key={i} className="gh-side__step">
                <span className="gh-side__num" aria-hidden="true">{i + 1}</span>
                <span><span aria-hidden="true">{s.emoji} </span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    )
  }

  return (
    <aside className="gh-side" aria-label="Juega con amigos y online">
      <div className="gh-side__card gh-side__card--social">
        <p className="gh-side__title">👥 Se juega acompañado</p>
        <ul className="gh-side__chips">
          <li>🌐 Online: chat, llamada o redes sociales</li>
          <li>🧑‍🤝‍🧑 En persona: con un amigo</li>
          <li>👨‍👩‍👧‍👦 En grupo: si se reúnen</li>
        </ul>
        <p className="gh-side__text">{help.withWhom}</p>
      </div>

      <ReplayTip compact />
    </aside>
  )
}
