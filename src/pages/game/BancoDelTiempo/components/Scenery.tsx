import { memo } from 'react'
import {
  WALKABLE_AREAS,
  DECORATIONS,
  SIGNPOSTS,
  GOAL_AREA,
} from '../data/worldMap'
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config'
import type { DecorKind, Rect } from '../types'

/** Emoji de cada tipo de decoración */
const DECOR_EMOJI: Record<DecorKind, string> = {
  tree:   '🌳',
  flower: '🌷',
  rock:   '🪨',
  bush:   '🌿',
  lamp:   '🏮',
}

/** Convierte un rectángulo del mundo a porcentajes del escenario */
function rectToStyle(rect: Rect): React.CSSProperties {
  return {
    left:   `${(rect.x / WORLD_WIDTH) * 100}%`,
    top:    `${(rect.y / WORLD_HEIGHT) * 100}%`,
    width:  `${(rect.w / WORLD_WIDTH) * 100}%`,
    height: `${(rect.h / WORLD_HEIGHT) * 100}%`,
  }
}

/** Convierte un punto del mundo a porcentajes del escenario */
function pointToStyle(x: number, y: number): React.CSSProperties {
  return {
    left: `${(x / WORLD_WIDTH) * 100}%`,
    top:  `${(y / WORLD_HEIGHT) * 100}%`,
  }
}

/**
 * Todo lo que NO se mueve del escenario: el camino, la decoración, los
 * carteles y la zona meta.
 *
 * Va envuelto en memo() porque el avatar actualiza su posición unas 60
 * veces por segundo. Sin esto, cada fotograma volvería a renderizar los
 * cuarenta elementos del decorado sin necesidad.
 */
const Scenery = memo(function Scenery({ goalActive }: { goalActive: boolean }) {
  return (
    <>
      {/* Camino transitable */}
      {WALKABLE_AREAS.map((area, index) => (
        <div key={`path-${index}`} className="bt-path" style={rectToStyle(area)} />
      ))}

      {/* Zona meta */}
      <div
        className={`bt-goal ${goalActive ? 'is-active' : ''}`}
        style={rectToStyle(GOAL_AREA)}
      >
        <span className="bt-goal__flag" aria-hidden="true">🏁</span>
      </div>

      {/* Carteles orientativos */}
      {SIGNPOSTS.map(sign => (
        <div
          key={sign.text}
          className="bt-sign"
          style={pointToStyle(sign.position.x, sign.position.y)}
        >
          {sign.text}
        </div>
      ))}

      {/* Decoración ambiental */}
      {DECORATIONS.map((decor, index) => (
        <span
          key={`decor-${index}`}
          className={`bt-decor bt-decor--${decor.kind}`}
          style={{
            ...pointToStyle(decor.position.x, decor.position.y),
            fontSize: `${(decor.scale ?? 1) * 100}%`,
          }}
          aria-hidden="true"
        >
          {DECOR_EMOJI[decor.kind]}
        </span>
      ))}
    </>
  )
})

export default Scenery
