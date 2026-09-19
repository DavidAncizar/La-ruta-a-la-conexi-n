import { CATEGORIES } from '../data/categories'

interface WheelProps {
  /**
   * Rotación acumulada en grados que se aplica al disco. El componente
   * padre la calcula para que el sector ganador quede bajo el puntero.
   */
  rotation: number
  /** true mientras gira: la transición CSS anima el cambio de rotación */
  spinning: boolean
  /** Duración del giro en ms (debe coincidir con la de config) */
  spinDurationMs: number
  /** Se llama al pulsar el centro/botón para girar */
  onSpin: () => void
  /** Deshabilita el giro (mientras ya está girando) */
  disabled: boolean
}

const SECTORS = CATEGORIES.length          // 6
const SECTOR_ANGLE = 360 / SECTORS         // 60°
const R = 50                               // radio en el viewBox 0..100
const CENTER = 50

/** Punto (x,y) sobre la circunferencia para un ángulo dado (en grados) */
function pointOnCircle(angleDeg: number, radius = R) {
  // -90 para que el ángulo 0 quede arriba, no a la derecha
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

/** Path SVG del sector i (una porción de pizza) */
function sectorPath(index: number): string {
  const start = index * SECTOR_ANGLE
  const end = start + SECTOR_ANGLE
  const p1 = pointOnCircle(start)
  const p2 = pointOnCircle(end)
  // largeArcFlag = 0 porque cada sector es menor a 180°
  return `M ${CENTER} ${CENTER} L ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y} Z`
}

/**
 * La ruleta. Es puramente visual: recibe la rotación ya calculada y la
 * aplica al disco con una transición CSS. Toda la lógica de qué sector
 * gana vive en el orquestador (Explorador.tsx).
 */
export default function Wheel({
  rotation,
  spinning,
  spinDurationMs,
  onSpin,
  disabled,
}: WheelProps) {
  return (
    <div className="exp-wheel">
      {/* Puntero fijo que marca el sector ganador */}
      <div className="exp-wheel__pointer" aria-hidden="true">▼</div>

      <div className="exp-wheel__stage">
        <svg
          className="exp-wheel__disc"
          viewBox="0 0 100 100"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? `transform ${spinDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`
              : 'none',
          }}
          role="img"
          aria-label="Ruleta de categorías"
        >
          {CATEGORIES.map((category, index) => {
            // Ángulo del centro del sector, para colocar el texto y el emoji
            const midAngle = index * SECTOR_ANGLE + SECTOR_ANGLE / 2
            const labelPos = pointOnCircle(midAngle, R * 0.62)
            const emojiPos = pointOnCircle(midAngle, R * 0.88)

            return (
              <g key={category.id}>
                <path
                  d={sectorPath(index)}
                  fill={category.background}
                  stroke="#ffffff"
                  strokeWidth={0.6}
                />
                {/* Emoji cerca del borde */}
                <text
                  x={emojiPos.x}
                  y={emojiPos.y}
                  fontSize={5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${midAngle}, ${emojiPos.x}, ${emojiPos.y})`}
                >
                  {category.emoji}
                </text>
                {/* Nombre de la categoría, radial */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fontSize={3.1}
                  fontWeight={800}
                  fill={category.color}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {category.label.length > 16
                    ? category.label.split(' ')[0]
                    : category.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Botón central para girar */}
        <button
          type="button"
          className="exp-wheel__hub"
          onClick={onSpin}
          disabled={disabled}
        >
          {spinning ? '···' : '¡GIRAR!'}
        </button>
      </div>
    </div>
  )
}
