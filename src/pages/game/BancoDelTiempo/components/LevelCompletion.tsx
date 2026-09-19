import { xpRequiredForLevel } from '@/lib/constants'
import { ACHIEVEMENT_NAME } from '../config'

interface LevelCompletionProps {
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
  /** Vuelve a recorrer el parque desde el inicio */
  onWalkAgain: () => void
  onBackToGames: () => void
}

/**
 * Progreso hacia el siguiente nivel usando xpRequiredForLevel, la misma
 * fórmula sin techo que usa el resto de la aplicación.
 */
function getLevelProgress(currentXp: number, currentLevel: number) {
  const currentThreshold = xpRequiredForLevel(currentLevel)
  const nextThreshold = xpRequiredForLevel(currentLevel + 1)

  const range = nextThreshold - currentThreshold
  const gained = currentXp - currentThreshold
  const percent = range > 0
    ? Math.min(100, Math.max(0, Math.round((gained / range) * 100)))
    : 0

  return { percent, xpToNext: Math.max(0, nextThreshold - currentXp) }
}

/**
 * Pantalla final del nivel "Banco del tiempo".
 *
 * Misma estructura y animación que la pantalla de logro del nivel 3
 * (Explorador de experiencias): logro, XP ganado, progreso general y
 * estado del guardado, reutilizando las clases `nc-completion` para que
 * los tres niveles se sientan parte del mismo sistema.
 */
export default function LevelCompletion({
  xpEarned,
  isReplay,
  currentXp,
  currentLevel,
  saveResult,
  saving,
  onRetrySave,
  onWalkAgain,
  onBackToGames,
}: LevelCompletionProps) {
  const isSaving = saving || saveResult === null
  const saveFailed = saveResult === false
  const saved = saveResult === true

  const progress = getLevelProgress(currentXp, currentLevel)

  return (
    <div className="nc-completion page-fade">
      <div className="nc-completion__icon">🎉</div>

      <h1 className="nc-completion__title">¡RECORRIDO COMPLETADO!</h1>

      <p className="nc-completion__message">
        Compartiste algo que sabes hacer y aprendiste algo nuevo de una persona
        de confianza. Ese intercambio es el Banco del Tiempo.
      </p>

      {/* Logro obtenido */}
      <div className="nc-completion__achievement">
        <span className="nc-completion__achievement-icon">🏅</span>
        <div className="nc-completion__achievement-text">
          <span className="nc-completion__achievement-label">Logro obtenido</span>
          <strong className="nc-completion__achievement-name">{ACHIEVEMENT_NAME}</strong>
        </div>
      </div>

      {/* Los dos bancos recorridos */}
      <p className="nc-completion__route">
        🪑 Banco 1: enseñaste una habilidad · 🪑 Banco 2: aprendiste algo nuevo
      </p>

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
            ⚠️ No se pudo guardar tu progreso. Revisa tu conexión a internet e
            inténtalo de nuevo: tu recorrido no se ha perdido.
          </p>
          <button className="nc-btn nc-btn--outline" onClick={onRetrySave} type="button">
            🔄 Reintentar guardado
          </button>
        </div>
      )}

      {/* Los botones de salida se habilitan cuando el progreso está a salvo */}
      <div className="nc-completion__actions">
        <button
          className="nc-btn nc-btn--primary nc-btn--lg"
          onClick={onWalkAgain}
          disabled={!saved}
          type="button"
        >
          🚶 RECORRER DE NUEVO
        </button>

        <button
          className="nc-btn nc-btn--outline nc-btn--lg"
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
