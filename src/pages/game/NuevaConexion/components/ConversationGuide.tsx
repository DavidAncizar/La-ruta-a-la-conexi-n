import { useState } from 'react'
import { EVIDENCE_DRIVE_URL, isEvidenceUrlConfigured } from '@/lib/evidence'
import { guideToPlainText } from '../utils/guideBuilder'
import type { ConnectionRoute, GuideLine, GuideStage } from '../types/connection'

// ─── Props ───────────────────────────────────────────────────────────────────

interface ConversationGuideProps {
  route: ConnectionRoute
  lines: GuideLine[]
  guideStage: GuideStage
  evidenceConfirmed: boolean

  /** reviewing → transition */
  onGoToAction: () => void
  /** transition → confirming */
  onContinueAfterTransition: () => void
  /** confirming (sí) → evidence */
  onConfirmConversationDone: () => void
  /** confirming (todavía no) → reviewing */
  onConversationPending: () => void
  /** evidence → reviewing (para volver a ver la guía) */
  onBackToReviewing: () => void

  /** Toggle del checkbox de evidencia */
  onConfirmEvidence: () => void
  /** Cierra la misión y va a la pantalla de finalización */
  onFinish: () => void
  /** "Cambiar mis respuestas" desde reviewing → vuelve a la fase 'steps' */
  onBackToSteps: () => void

  saving: boolean
}

// ─── Componente principal ────────────────────────────────────────────────────

/**
 * Fase 'guide' del juego "Nueva Conexión".
 *
 * Se compone de 4 sub-vistas encadenadas:
 *   reviewing   → guía personalizada + sección "AHORA HAZLO EN LA VIDA REAL"
 *   transition  → pantalla breve que invita a salir de la app
 *   confirming  → ¿ya realizaste la conversación? (sí / todavía no)
 *   evidence    → subida de evidencia a Drive + cierre de la misión
 *
 * PRIVACIDAD: la aplicación NUNCA pide nombre, teléfono, dirección,
 * ni datos personales de la otra persona. Solo registra que el
 * estudiante marcó su actividad como realizada.
 */
export default function ConversationGuide(props: ConversationGuideProps) {
  if (props.guideStage === 'reviewing')  return <ReviewingView {...props} />
  if (props.guideStage === 'transition') return <TransitionView {...props} />
  if (props.guideStage === 'confirming') return <ConfirmingView {...props} />
  return <EvidenceView {...props} />
}

// ─── Sub-vista 1: guía + acción real ─────────────────────────────────────────

function ReviewingView({ route, lines, onGoToAction, onBackToSteps }: ConversationGuideProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(guideToPlainText(route, lines))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* portapapeles bloqueado — la guía sigue visible */ }
  }

  return (
    <div
      className="nc-guide page-fade"
      style={{
        '--route-color': route.color,
        '--route-bg': route.background,
      } as React.CSSProperties}
    >
      {/* Encabezado */}
      <div className="nc-guide__header">
        <span className="nc-guide__badge">
          {route.emoji} {route.label}
        </span>
        <h2 className="nc-guide__title">💬 TU GUÍA DE CONEXIÓN</h2>

        {/* Copiar: botón compacto para no gastar una fila entera */}
        <button
          className="nc-guide__copy"
          onClick={handleCopy}
          type="button"
          aria-label="Copiar mi guía"
        >
          {copied ? '✓ Copiada' : '📋 Copiar'}
        </button>
      </div>

      {/*
        Guía armada — las 4 secciones en cuadrícula para que se vean
        todas a la vez. El número (1..4) lo pone el CSS con un contador
        (::before del .nc-guide__item), no el texto.
      */}
      <ol className="nc-guide__list">
        {lines.map((line, index) => (
          <li key={index} className="nc-guide__item">
            <span className="nc-guide__item-label">{line.label}</span>
            <span className="nc-guide__item-text">{line.text}</span>
          </li>
        ))}
      </ol>

      {/* Aviso: no es un guion */}
      <p className="nc-guide__note" role="note">
        <span aria-hidden="true">💡</span> No es un guion: úsala como apoyo y
        habla con tus propias palabras.
      </p>

      {/* Franja "AHORA HAZLO EN LA VIDA REAL" */}
      <div className="nc-action">
        <span className="nc-action__icon" aria-hidden="true">🚀</span>
        <div className="nc-action__body">
          <h3 className="nc-action__title">AHORA HAZLO EN LA VIDA REAL</h3>
          <p className="nc-action__text">
            Busca a la persona que elegiste y descubre qué tienen en común.
          </p>
        </div>
        <span className="nc-action__status">
          <span className="nc-action__status-dot" aria-hidden="true" />
          Pendiente
        </span>
      </div>

      {/* Acciones */}
      <div className="nc-guide__actions">
        <button
          className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
          onClick={onGoToAction}
          type="button"
        >
          IR A CREAR MI CONEXIÓN
        </button>

        <button className="nc-back-link" onClick={onBackToSteps} type="button">
          ← Cambiar mis respuestas
        </button>
      </div>
    </div>
  )
}

// ─── Sub-vista 2: transición ("puedes salir de la app") ──────────────────────

function TransitionView({ route, onContinueAfterTransition }: ConversationGuideProps) {
  return (
    <div
      className="nc-transition page-fade"
      style={{
        '--route-color': route.color,
        '--route-bg': route.background,
      } as React.CSSProperties}
    >
      <div className="nc-transition__icon" aria-hidden="true">🚀</div>
      <h2 className="nc-transition__title">¡Adelante!</h2>
      <p className="nc-transition__text">
        Puedes cerrar la aplicación para hablar con esa persona. Tu
        progreso queda guardado y te esperamos aquí cuando vuelvas.
      </p>

      <div className="nc-transition__hint">
        <span aria-hidden="true">🔒</span>
        <span>Nada de lo que hables se guarda en la aplicación.</span>
      </div>

      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onContinueAfterTransition}
        type="button"
      >
        Continuar
      </button>
    </div>
  )
}

// ─── Sub-vista 3: confirmación (¿ya realizaste la conversación?) ─────────────

function ConfirmingView({
  route,
  onConfirmConversationDone,
  onConversationPending,
}: ConversationGuideProps) {
  const [showEncouragement, setShowEncouragement] = useState(false)

  // Mensaje alentador dentro de la propia vista antes de volver a la guía.
  // Mantiene todo el progreso intacto.
  if (showEncouragement) {
    return (
      <div
        className="nc-confirm page-fade"
        style={{
          '--route-color': route.color,
          '--route-bg': route.background,
        } as React.CSSProperties}
      >
        <div className="nc-confirm__icon" aria-hidden="true">❤️</div>
        <h2 className="nc-confirm__title">No hay prisa.</h2>
        <p className="nc-confirm__text">
          Iniciar una conversación nueva puede dar nervios. Vuelve a leer tu
          guía cuando estés listo/a. Va a estar aquí esperándote.
        </p>

        <button
          className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
          onClick={onConversationPending}
          type="button"
        >
          Volver a mi guía
        </button>
      </div>
    )
  }

  return (
    <div
      className="nc-confirm page-fade"
      style={{
        '--route-color': route.color,
        '--route-bg': route.background,
      } as React.CSSProperties}
    >
      <div className="nc-confirm__icon" aria-hidden="true">🤝</div>
      <h2 className="nc-confirm__title">¿Ya realizaste la conversación?</h2>
      <p className="nc-confirm__text">
        Solo tú sabes cómo fue. La aplicación no guarda ningún detalle.
      </p>

      <div className="nc-confirm__actions">
        <button
          className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
          onClick={onConfirmConversationDone}
          type="button"
        >
          ✅ SÍ, YA LO HICE
        </button>
        <button
          className="nc-btn nc-btn--ghost nc-btn--full"
          onClick={() => setShowEncouragement(true)}
          type="button"
        >
          ↩ TODAVÍA NO
        </button>
      </div>
    </div>
  )
}

// ─── Sub-vista 4: evidencia + cierre ─────────────────────────────────────────

function EvidenceView({
  route,
  evidenceConfirmed,
  onConfirmEvidence,
  onFinish,
  onBackToReviewing,
  saving,
}: ConversationGuideProps) {
  return (
    <div
      className="nc-evidence page-fade"
      style={{
        '--route-color': route.color,
        '--route-bg': route.background,
      } as React.CSSProperties}
    >
      <div className="nc-evidence__header">
        <div className="nc-evidence__icon" aria-hidden="true">📎</div>
        <h2 className="nc-evidence__title">Evidencia de tu conexión</h2>
        <p className="nc-evidence__text">
          Sube una foto tuya, una nota o un mensaje corto contando cómo
          te fue. No incluyas datos ni fotos de la otra persona.
        </p>
      </div>

      {/* Enlace a Drive */}
      <div className="nc-evidence__actions">
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

        <label className="nc-evidence__checkbox">
          <input
            type="checkbox"
            checked={evidenceConfirmed}
            onChange={onConfirmEvidence}
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

      <button className="nc-back-link" onClick={onBackToReviewing} type="button">
        ← Ver mi guía de nuevo
      </button>
    </div>
  )
}
