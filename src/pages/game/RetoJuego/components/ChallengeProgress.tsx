interface ChallengeProgressProps {
  current: number
  total: number
}

/**
 * Barra de progreso visual: [██████░░░░░░] 2/5
 */
export default function ChallengeProgress({ current, total }: ChallengeProgressProps) {
  const percent = Math.round((current / total) * 100)

  return (
    <div className="reto-progress">
      <div className="reto-progress__track">
        <div className="reto-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="reto-progress__label">
        Reto {current} de {total}
      </span>
    </div>
  )
}
