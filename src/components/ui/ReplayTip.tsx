import { XP_REPLAY_MULTIPLIER } from '@/lib/constants'

interface ReplayTipProps {
  /** Nombre del botón de repetir en esta pantalla, si existe (ej. "GIRAR OTRA VEZ") */
  buttonLabel?: string
  /** Variante compacta para paneles laterales */
  compact?: boolean
}

/**
 * Recordatorio: repetir un juego suma XP y esa XP cuenta para el ranking
 * (podio). Desde el segundo intento se gana XP_REPLAY_MULTIPLIER del XP.
 */
export default function ReplayTip({ buttonLabel, compact = false }: ReplayTipProps) {
  const pct = Math.round(XP_REPLAY_MULTIPLIER * 100)

  return (
    <div className={`replay-tip ${compact ? 'replay-tip--compact' : ''}`} role="note">
      <span className="replay-tip__icon" aria-hidden="true">🔁</span>
      <div>
        <p className="replay-tip__title">¿Quieres más XP? ¡Juega de nuevo!</p>
        <p className="replay-tip__text">
          {buttonLabel
            ? <>Pulsa <strong>{buttonLabel}</strong>. </>
            : <>Ve a <strong>🗺️ Mundos</strong> y pulsa <strong>🔁 Jugar de nuevo</strong>. </>}
          Cada vez que repites ganas el {pct}% del XP, se suma a tu total y te
          acerca al <strong>podio del ranking</strong> 🏆.
        </p>
      </div>
    </div>
  )
}
