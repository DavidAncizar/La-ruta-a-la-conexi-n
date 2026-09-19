import { xpRequiredForLevel } from '@/lib/constants'
import { ACHIEVEMENT_NAME } from '../config'

interface ShieldCompletionProps {
  xpEarned:     number
  isReplay:     boolean
  currentXp:    number
  currentLevel: number
  saveResult:   boolean | null
  saving:       boolean
  onRetrySave:  () => void
  onBackToGames: () => void
}

function getLevelProgress(currentXp: number, currentLevel: number) {
  const cur  = xpRequiredForLevel(currentLevel)
  const next = xpRequiredForLevel(currentLevel + 1)
  const range  = next - cur
  const gained = currentXp - cur
  const percent = range > 0
    ? Math.min(100, Math.max(0, Math.round((gained / range) * 100)))
    : 0
  return { percent, xpToNext: Math.max(0, next - currentXp) }
}

/**
 * Pantalla de logro del nivel 6.
 * Reutiliza las clases nc-completion como el resto de niveles.
 */
export default function ShieldCompletion({
  xpEarned, isReplay, currentXp, currentLevel,
  saveResult, saving, onRetrySave, onBackToGames,
}: ShieldCompletionProps) {
  const isSaving   = saving || saveResult === null
  const saveFailed = saveResult === false
  const saved      = saveResult === true
  const progress   = getLevelProgress(currentXp, currentLevel)

  return (
    <div className="nc-completion page-fade">
      <div className="nc-completion__icon">🎉</div>

      <h1 className="nc-completion__title">¡ESCUDO CREADO!</h1>

      <p className="nc-completion__message">
        Creaste tu escudo personal. Este diseño representa algo tuyo que nadie
        más puede crear exactamente igual.
      </p>

      <div className="nc-completion__achievement">
        <span className="nc-completion__achievement-icon">🏅</span>
        <div className="nc-completion__achievement-text">
          <span className="nc-completion__achievement-label">Logro obtenido</span>
          <strong className="nc-completion__achievement-name">{ACHIEVEMENT_NAME}</strong>
        </div>
      </div>

      <div className="nc-completion__xp">
        <span className="nc-completion__xp-icon">⭐</span>
        <span className="nc-completion__xp-value">+{xpEarned} XP</span>
      </div>

      {isReplay && (
        <p className="nc-completion__note">
          🔁 Como ya habías jugado este nivel, esta vez ganaste la mitad de XP.
        </p>
      )}

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
          <div className="nc-completion__progress-fill" style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="nc-completion__progress-foot">
          <span>{currentXp} XP acumulados</span>
          <span>Faltan {progress.xpToNext} XP para el nivel {currentLevel + 1}</span>
        </div>
      </div>

      {isSaving && !saveFailed && (
        <p className="nc-completion__status" role="status">💾 Guardando tu progreso…</p>
      )}

      {saved && (
        <p className="nc-completion__status nc-completion__status--ok" role="status">
          ✅ Tu progreso quedó guardado
        </p>
      )}

      {saveFailed && (
        <div className="nc-completion__status nc-completion__status--error" role="alert">
          <p>⚠️ No se pudo guardar tu progreso. Revisa tu conexión e inténtalo de nuevo.</p>
          <button className="nc-btn nc-btn--outline" onClick={onRetrySave} type="button">
            🔄 Reintentar
          </button>
        </div>
      )}

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
