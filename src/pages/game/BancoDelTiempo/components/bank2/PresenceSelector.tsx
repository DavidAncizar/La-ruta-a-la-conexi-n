import type { PresenceMode } from '../../types'

interface PresenceOption {
  id: PresenceMode
  emoji: string
  title: string
  description: string
}

const OPTIONS: PresenceOption[] = [
  {
    id: 'together',
    emoji: '🧑‍🤝‍🧑',
    title: 'ESTÁ CONMIGO',
    description: 'Tu amigo o persona de confianza está contigo. Pueden realizar la actividad juntos.',
  },
  {
    id: 'remote',
    emoji: '📱',
    title: 'ESTÁ A DISTANCIA',
    description:
      'Está en otro lugar. Pídele que te enseñe utilizando el medio que normalmente utilicen para comunicarse.',
  },
]

interface PresenceSelectorProps {
  selected: PresenceMode | null
  onSelect: (mode: PresenceMode) => void
  onConfirm: () => void
  onLeave: () => void
}

/**
 * ¿Cómo está tu compañero? Dos tarjetas grandes, mismo lenguaje visual
 * que el selector de habilidades: la elección solo adapta los textos de
 * las pantallas siguientes, no crea perfiles ni conexiones.
 */
export default function PresenceSelector({
  selected,
  onSelect,
  onConfirm,
  onLeave,
}: PresenceSelectorProps) {
  return (
    <div className="bt-m bt-m--presence">
      <h2 className="bt-m__title bt-m__title--sm">🤝 ¿CÓMO ESTÁ TU COMPAÑERO?</h2>
      <p className="bt-m__text">Elige cómo realizarás esta misión.</p>

      <div className="bt-presence" role="radiogroup" aria-label="Modo del intercambio">
        {OPTIONS.map((option, index) => {
          const isSelected = option.id === selected

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`bt-presence__card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelect(option.id)}
              style={{ '--delay': `${0.06 + index * 0.09}s` } as React.CSSProperties}
            >
              <span className="bt-presence__glow" aria-hidden="true" />
              <span className="bt-presence__emoji" aria-hidden="true">{option.emoji}</span>
              <span className="bt-presence__title">{option.title}</span>
              <span className="bt-presence__desc">{option.description}</span>

              {isSelected && (
                <span className="bt-presence__badge" aria-hidden="true">✓ ELEGIDO</span>
              )}
            </button>
          )
        })}
      </div>

      <button
        className="bt-m__cta"
        onClick={onConfirm}
        type="button"
        disabled={!selected}
      >
        {selected ? 'CONTINUAR' : 'ELIGE UNA OPCIÓN'}
      </button>

      <button className="bt-m__leave" onClick={onLeave} type="button">
        ← Volver al mapa
      </button>
    </div>
  )
}
