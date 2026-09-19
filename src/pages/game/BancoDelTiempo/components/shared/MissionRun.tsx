import { useEffect, useState } from 'react'
import { EVIDENCE_DRIVE_URL, isEvidenceUrlConfigured } from '@/lib/evidence'
import { MISSION_DURATION_MS } from '../../config'
import { useMissionTimer } from '../../hooks/useMissionTimer'
import type { SkillCategory } from '../../types'

interface MissionRunProps {
  skill: SkillCategory
  /** Instante en que arrancó el contador */
  timerStartedAt: number | null
  /** Si marcó que guardó su evidencia (opcional) */
  evidenceSaved: boolean
  onToggleEvidence: () => void
  /** Cierra la misión */
  onComplete: () => void
  /** Sale al mapa sin perder la misión ni el contador */
  onLeave: () => void

  // ── Textos personalizables (por defecto, los del banco 1) ──
  /** Título de la pantalla, junto a ⏱️ */
  timerTitle?: string
  /** Texto bajo el contador mientras sigue corriendo */
  runningText?: string
  /** Texto del bloque "🎯 RETO ACTUAL" */
  challengeText?: string
  /** Mensajes breves que van apareciendo mientras la misión está activa */
  encouragementMessages?: string[]
  /** Texto del bloque "COMPARTE / CIERRA" al final de la pantalla */
  shareTitle?: string
  shareText?: string
}

// Geometría del círculo de progreso del contador
const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Misión en curso: contador, evidencia opcional y cierre.
 *
 * El contador es solo una guía. Al llegar a 00:00 no se bloquea nada, y
 * el estudiante puede pulsar "MISIÓN COMPLETADA" en cualquier momento.
 */
export default function MissionRun({
  skill,
  timerStartedAt,
  evidenceSaved,
  onToggleEvidence,
  onComplete,
  onLeave,
  timerTitle = '⏱️ TIEMPO DE MISIÓN',
  runningText = 'Tienes aproximadamente 10 minutos para realizar el intercambio.',
  challengeText = 'Enséñale a tu amigo algo que sabes hacer muy bien.',
  encouragementMessages,
  shareTitle = '🤝 COMPARTE LO QUE SABES',
  shareText =
    'Cuando termines, comparte lo que hiciste con tu amigo o persona de ' +
    'confianza. Puede ser mostrándole directamente lo que hiciste o ' +
    'enviándole la evidencia que decidiste guardar.',
}: MissionRunProps) {
  const timer = useMissionTimer(timerStartedAt, MISSION_DURATION_MS)

  return (
    <div
      className="bt-m bt-m--run"
      style={{
        '--skill-color': skill.color,
        '--skill-bg': skill.background,
      } as React.CSSProperties}
    >
      <h2 className="bt-m__title bt-m__title--sm">{timerTitle}</h2>

      {/* ── Contador circular ── */}
      <div className={`bt-timer ${timer.isFinished ? 'is-finished' : ''}`}>
        <svg className="bt-timer__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            className="bt-timer__track"
            cx="60" cy="60" r={RADIUS}
          />
          <circle
            className="bt-timer__progress"
            cx="60" cy="60" r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - timer.fraction)}
          />
        </svg>

        <div className="bt-timer__center">
          <span
            className="bt-timer__value"
            role="timer"
            aria-live="off"
          >
            {timer.label}
          </span>
          <span className="bt-timer__unit">
            {timer.isFinished ? '¡tiempo cumplido!' : 'minutos'}
          </span>
        </div>
      </div>

      <p className="bt-m__text bt-m__text--sm">
        {timer.isFinished
          ? 'Se cumplió el tiempo sugerido. Puedes cerrar la misión cuando quieras, no hay prisa.'
          : runningText}
      </p>

      {/* ── Reto actual ── */}
      <div className="bt-challenge">
        <span className="bt-challenge__label">🎯 RETO ACTUAL</span>
        <span className="bt-challenge__text">{challengeText}</span>
        <span className="bt-challenge__skill">
          {skill.emoji} {skill.label}
        </span>
      </div>

      {/* ── Mensajes motivacionales, uno a la vez ── */}
      {encouragementMessages && encouragementMessages.length > 0 && (
        <EncouragementTicker messages={encouragementMessages} />
      )}

      {/* ── Evidencia opcional ── */}
      <div className="bt-optional">
        <span className="bt-optional__title">📸 ¿QUIERES GUARDAR LA EVIDENCIA?</span>
        <p className="bt-optional__text">
          Puedes grabarte realizando el tutorial y guardar la evidencia para
          conservarla.
        </p>
        <p className="bt-optional__text bt-optional__text--muted">
          Si deseas guardarla, utiliza el botón de Google Drive que hemos
          utilizado en los demás niveles.
        </p>

        {/* Mismo botón y comportamiento de Drive que el resto de niveles */}
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

        <label className="bt-optional__check">
          <input
            type="checkbox"
            checked={evidenceSaved}
            onChange={onToggleEvidence}
          />
          <span>Guardé mi evidencia (opcional)</span>
        </label>
      </div>

      {/* ── Recordatorio de compartir / cerrar ── */}
      <div className="bt-share">
        <span className="bt-share__title">{shareTitle}</span>
        <p className="bt-share__text">{shareText}</p>
      </div>

      <button className="bt-m__cta bt-m__cta--done" onClick={onComplete} type="button">
        ✅ MISIÓN COMPLETADA
      </button>

      <button className="bt-m__leave" onClick={onLeave} type="button">
        ← Volver al mapa (el contador sigue corriendo)
      </button>
    </div>
  )
}

/**
 * Rotador de mensajes motivacionales.
 *
 * Muestra UN mensaje a la vez (nunca varios juntos, como pide el
 * requerimiento) y va cambiando de forma discreta con un fundido, para
 * dar dinamismo sin distraer de la actividad real.
 */
function EncouragementTicker({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (messages.length <= 1) return

    const intervalId = window.setInterval(() => {
      // Se oculta, se cambia el mensaje y se vuelve a mostrar: así el
      // cambio se siente como un fundido y no como un salto brusco.
      setVisible(false)
      window.setTimeout(() => {
        setIndex(prev => (prev + 1) % messages.length)
        setVisible(true)
      }, 300)
    }, 6000)

    return () => window.clearInterval(intervalId)
  }, [messages.length])

  return (
    <p
      className={`bt-encouragement ${visible ? 'is-visible' : ''}`}
      role="status"
      aria-live="polite"
    >
      💬 {messages[index]}
    </p>
  )
}
