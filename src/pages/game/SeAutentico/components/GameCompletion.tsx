import { xpRequiredForLevel } from '@/lib/constants'
import { ACHIEVEMENT_NAME } from '../config'

interface GameCompletionProps {
  /** XP ganado en esta partida, ya con el multiplicador de reintento */
  xpEarned: number
  /** true si es una repetición del nivel (gana la mitad de XP) */
  isReplay: boolean
  /** XP total del estudiante, ya actualizado tras guardar */
  currentXp: number
  /** Nivel actual del estudiante, ya actualizado tras guardar */
  currentLevel: number
  /** null = guardando, true = guardado en Supabase, false = falló */
  saveResult: boolean | null
  /** true mientras GamePage está escribiendo en Supabase */
  saving: boolean
  onRetrySave: () => void
  onBackToGames: () => void
}

function getLevelProgress(currentXp: number, currentLevel: number) {
  const currentThreshold = xpRequiredForLevel(currentLevel)
  const nextThreshold    = xpRequiredForLevel(currentLevel + 1)
  const range  = nextThreshold - currentThreshold
  const gained = currentXp - currentThreshold
  const percent = range > 0
    ? Math.min(100, Math.max(0, Math.round((gained / range) * 100)))
    : 0
  return { percent, xpToNext: Math.max(0, nextThreshold - currentXp) }
}

/**
 * Pantalla de logro de "Sé auténtico, más allá de un like".
 *
 * Reutiliza las clases `nc-completion` que ya usan los niveles 2, 3 y 4,
 * así el estudiante ve siempre la misma animación al ganar XP.
 * Los botones de salida quedan deshabilitados hasta que el guardado
 * confirma, para que nadie salga perdiendo su XP.
 */
export default function GameCompletion({
  xpEarned,
  isReplay,
  currentXp,
  currentLevel,
  saveResult,
  saving,
  onRetrySave,
  onBackToGames,
}: GameCompletionProps) {
  const isSaving  = saving || saveResult === null
  const saveFailed = saveResult === false
  const saved      = saveResult === true

  const progress = getLevelProgress(currentXp, currentLevel)

  return (
    <div className="nc-completion page-fade">
      <div className="nc-completion__icon">🎉</div>

      <h1 className="nc-completion__title">¡MÁS ALLÁ DEL LIKE!</h1>

      <p className="nc-completion__message">
        Completaste la simulación. Ahora sabes que una pregunta puede
        abrir una conversación que un like nunca podría.
      </p>

      {/* Logro obtenido */}
      <div className="nc-completion__achievement">
        <span className="nc-completion__achievement-icon">🏅</span>
        <div className="nc-completion__achievement-text">
          <span className="nc-completion__achievement-label">Logro obtenido</span>
          <strong className="nc-completion__achievement-name">{ACHIEVEMENT_NAME}</strong>
        </div>
      </div>

      {/* XP obtenido */}
      <div className="nc-completion__xp">
        <span className="nc-completion__xp-icon">⭐</span>
        <span className="nc-completion__xp-value">+{xpEarned} XP</span>
      </div>

      {isReplay && (
        <p className="nc-completion__note">
          🔁 Como ya habías jugado este nivel, esta vez ganaste la mitad de XP.
        </p>
      )}

      {/* Progreso general */}
      <div className="nc-completion__progress">
        <div className="nc-completion__progress-head">
          <span>Tu progreso general</span>
          <strong>Nivel {currentLevel}</strong>
        </div>

        <div
          className="nc-completion__progress-bar"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso hacia el nivel ${currentLevel + 1}`}
        >
          <div
            className="nc-completion__progress-fill"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <div className="nc-completion__progress-foot">
          <span>{currentXp} XP acumulados</span>
          <span>Faltan {progress.xpToNext} XP para el nivel {currentLevel + 1}</span>
        </div>
      </div>

      {/* Estado del guardado */}
      {isSaving && !saveFailed && (
        <p className="nc-completion__status" role="status">
          💾 Guardando tu progreso...
        </p>
      )}

      {saved && (
        <p className="nc-completion__status nc-completion__status--ok" role="status">
          ✅ Tu progreso quedó guardado
        </p>
      )}

      {saveFailed && (
        <div className="nc-completion__status nc-completion__status--error" role="alert">
          <p>
            ⚠️ No se pudo guardar tu progreso. Revisa tu conexión e inténtalo
            de nuevo.
          </p>
          <button
            className="nc-btn nc-btn--outline"
            onClick={onRetrySave}
            type="button"
          >
            🔄 Reintentar guardado
          </button>
        </div>
      )}

      {/* Los botones se habilitan solo cuando el guardado confirma */}
      <div className="nc-completion__actions">
        <button
          className="nc-btn nc-btn--primary nc-btn--lg"
          onClick={onBackToGames}
          disabled={!saved}
          type="button"
        >
          🏠 VOLVER A JUEGOS
        </button>
      </div>
    </div>
  )
}
