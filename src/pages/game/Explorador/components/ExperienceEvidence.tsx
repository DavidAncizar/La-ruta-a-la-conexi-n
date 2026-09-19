import { EVIDENCE_DRIVE_URL, isEvidenceUrlConfigured } from '@/lib/evidence'
import type { Category, Experience } from '../types'

interface ExperienceEvidenceProps {
  category: Category
  experience: Experience
  evidenceConfirmed: boolean
  onToggleEvidence: () => void
  /** Cierra la misión y va a la pantalla de finalización */
  onFinish: () => void
  /** Vuelve a la lista de experiencias de la categoría */
  onBack: () => void
  saving: boolean
}

/**
 * Vista de evidencia del nivel 3.
 *
 * El estudiante ya eligió su experiencia; aquí la realiza en la vida
 * real y confirma que subió su evidencia a Drive antes de cerrar.
 *
 * PRIVACIDAD: la aplicación no almacena fotos ni datos personales. Solo
 * guarda que el estudiante marcó su evidencia como subida.
 */
export default function ExperienceEvidence({
  category,
  experience,
  evidenceConfirmed,
  onToggleEvidence,
  onFinish,
  onBack,
  saving,
}: ExperienceEvidenceProps) {
  return (
    <div
      className="exp-evidence page-fade"
      style={{
        '--cat-color': category.color,
        '--cat-bg': category.background,
      } as React.CSSProperties}
    >
      {/* Experiencia elegida */}
      <div className="exp-evidence__chosen">
        <span className="exp-evidence__chosen-emoji" aria-hidden="true">
          {experience.emoji}
        </span>
        <div>
          <div className="exp-evidence__chosen-eyebrow">
            {category.emoji} {category.label}
          </div>
          <div className="exp-evidence__chosen-label">{experience.label}</div>
        </div>
      </div>

      {/* Llamado a la acción real */}
      <div className="exp-action">
        <span className="exp-action__icon" aria-hidden="true">🚀</span>
        <div className="exp-action__body">
          <h3 className="exp-action__title">AHORA HAZLO EN LA VIDA REAL</h3>
          <p className="exp-action__text">
            Vive esta experiencia y captura tu momento para la evidencia.
          </p>
        </div>
      </div>

      {/* Zona de evidencia */}
      <div className="exp-evidence__box">
        <div className="exp-evidence__icon" aria-hidden="true">📎</div>
        <h2 className="exp-evidence__title">Evidencia de tu experiencia</h2>
        <p className="exp-evidence__text">
          Sube una foto, un vídeo corto o una nota contando cómo te fue.
          No incluyas datos ni fotos de otras personas.
        </p>

        {isEvidenceUrlConfigured ? (
          <a
            href={EVIDENCE_DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nc-btn nc-btn--outline nc-btn--full"
          >
            📤 Guardar evidencia en Drive
          </a>
        ) : (
          <button
            className="nc-btn nc-btn--outline nc-btn--full"
            type="button"
            disabled
            title="Falta definir VITE_EVIDENCE_DRIVE_URL en el archivo .env"
          >
            📤 Guardar evidencia en Drive (enlace no configurado)
          </button>
        )}

        <label className="exp-evidence__checkbox">
          <input
            type="checkbox"
            checked={evidenceConfirmed}
            onChange={onToggleEvidence}
          />
          <span>Ya subí mi evidencia a Drive (opcional)</span>
        </label>
      </div>

      {/* Cierre de la misión */}
      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onFinish}
        disabled={saving}
        type="button"
      >
        {saving ? 'Guardando...' : '🏁 Completar misión'}
      </button>

      <button className="nc-back-link" onClick={onBack} type="button">
        ← Elegir otra experiencia
      </button>
    </div>
  )
}
