import { useEffect, useRef, useState } from 'react'
import { EVIDENCE_DRIVE_URL, isEvidenceUrlConfigured } from '@/lib/evidence'

interface RealChallengeProps {
  /**
   * Cuando el estudiante pulsa "Ya lo hice / Terminar" o cuando decide
   * avanzar después de que el contador llegó a cero.
   */
  onFinish: () => void
}

// ─── Configuración del contador ──────────────────────────────────────────────

/** Duración sugerida de la conversación real (5 minutos). No es obligatoria. */
const DURATION_MS = 5 * 60 * 1000

/** Radio del círculo SVG */
const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// ─── Frases de ánimo ─────────────────────────────────────────────────────────
// Aparecen de una en una mientras el contador corre, para acompañar al
// estudiante sin decirle qué tiene que decir.

const ENCOURAGEMENTS = [
  'Busca a esa persona de confianza ahora mismo.',
  'Comparte algo sencillo que te guste.',
  'Hazle una pregunta que muestre que te interesa.',
  'Escucha. Eso ya es mucho.',
  'No hay respuesta perfecta — solo curiosidad real.',
  'Ya diste el primer paso al aprender esto.',
  'Una conversación puede cambiar cómo ves a alguien.',
]

// ─── Movimientos de doble dirección ─────────────────────────────────────────
// Dos acciones concretas, una por lado: el estudiante pregunta Y abre
// la puerta para que le pregunten a él. Se muestran como tarjetas
// visuales para que el reto se sienta como una misión de dos pasos,
// no solo como una instrucción de texto.

const DOUBLE_MOVES = [
  {
    direction: 'Tú → Ella',
    icon: '➡️',
    headline: 'Conoce a esa persona',
    tip: '«¿Hay algo que siempre hayas querido aprender o hacer?»',
    note: 'No busques la respuesta perfecta. Solo muestra que te importa.',
  },
  {
    direction: 'Ella → Ti',
    icon: '⬅️',
    headline: 'Permítele conocerte',
    tip: '«¿Y tú? ¿Qué quieres saber de mí?» o «Pregúntame algo.»',
    note: 'Hacerse conocer también es parte de la conexión.',
  },
] as const

/** Formatea milisegundos como MM:SS */
function formatMs(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Pantalla del reto de conversación real.
 *
 * Presenta un contador de 5 minutos como guía (nunca como requisito),
 * frases de ánimo que rotan cada pocos segundos y el botón de Drive
 * marcado como opcional. El estudiante puede finalizar en cualquier
 * momento: cuando termina el contador o cuando decide que ya tuvo la
 * conversación.
 */
export default function RealChallenge({ onFinish }: RealChallengeProps) {
  const startedAtRef = useRef<number>(Date.now())
  const [now, setNow] = useState(Date.now())
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)

  // ── Contador: actualiza cada 500 ms hasta llegar a 0 ──
  useEffect(() => {
    const elapsed = now - startedAtRef.current
    if (elapsed >= DURATION_MS) return

    const id = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current - startedAtRef.current >= DURATION_MS) {
        window.clearInterval(id)
      }
    }, 500)

    return () => window.clearInterval(id)
  }, [])

  // ── Rotador de frases de ánimo con fundido ──
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPhraseVisible(false)
      window.setTimeout(() => {
        setPhraseIndex(prev => (prev + 1) % ENCOURAGEMENTS.length)
        setPhraseVisible(true)
      }, 300)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [])

  const elapsed    = now - startedAtRef.current
  const remaining  = Math.max(0, DURATION_MS - elapsed)
  const fraction   = remaining / DURATION_MS
  const isFinished = remaining === 0

  return (
    <div className="sa-challenge page-fade">

      {/* ── Cabecera ── */}
      <p className="sa-challenge__title">⏱️ TIEMPO PARA CONECTAR</p>
      <p className="sa-challenge__subtitle">
        Tienes 5 minutos sugeridos para ir a tener esa conversación real.
        No es obligatorio terminar el tiempo: puedes avanzar cuando quieras.
      </p>

      {/* ── Contador circular ── */}
      <div className={`sa-timer ${isFinished ? 'is-finished' : ''}`}>
        <svg className="sa-timer__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle
            className="sa-timer__track"
            cx="60" cy="60" r={RADIUS}
          />
          <circle
            className="sa-timer__progress"
            cx="60" cy="60" r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          />
        </svg>

        <div className="sa-timer__center">
          <span
            className="sa-timer__value"
            role="timer"
            aria-live="off"
            aria-label={`${formatMs(remaining)} restantes`}
          >
            {formatMs(remaining)}
          </span>
          <span className="sa-timer__unit">
            {isFinished ? '¡ya!' : 'minutos'}
          </span>
        </div>
      </div>

      {isFinished && (
        <p className="sa-challenge__done page-fade">
          Se cumplió el tiempo. Puedes avanzar cuando quieras — no hay prisa.
        </p>
      )}

      {/* ── Frase de ánimo rotante ── */}
      <p
        className={`sa-challenge__phrase ${phraseVisible ? 'is-visible' : ''}`}
        aria-live="polite"
      >
        💬 {ENCOURAGEMENTS[phraseIndex]}
      </p>

      {/* ── Doble dirección: conocer Y hacerse conocer ── */}
      <div className="sa-double" role="list" aria-label="Dos movimientos de la conversación">
        {DOUBLE_MOVES.map(move => (
          <div key={move.direction} className="sa-double__card" role="listitem">
            <div className="sa-double__head">
              <span className="sa-double__icon" aria-hidden="true">{move.icon}</span>
              <span className="sa-double__direction">{move.direction}</span>
              <span className="sa-double__headline">{move.headline}</span>
            </div>
            <p className="sa-double__tip">{move.tip}</p>
            <p className="sa-double__note">{move.note}</p>
          </div>
        ))}
      </div>

      {/* ── Evidencia opcional ── */}
      <div className="sa-closing__evidence">
        <p className="sa-closing__evidence-title">
          📸 Evidencia (opcional)
        </p>
        <p className="sa-closing__evidence-text">
          Si quieres guardar un recuerdo de la conversación, puedes subir
          una captura o nota a Google Drive. No es necesario para avanzar.
        </p>

        {isEvidenceUrlConfigured ? (
          <a
            href={EVIDENCE_DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nc-btn nc-btn--outline nc-btn--full"
          >
            📤 Guardar evidencia en Drive (opcional)
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
      </div>

      {/* ── Botón de avance: siempre disponible ── */}
      <button
        className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
        onClick={onFinish}
        type="button"
      >
        ✅ Ya lo hice — FINALIZAR
      </button>

      <p className="sa-challenge__skip">
        Puedes pulsar en cualquier momento, con o sin evidencia.
      </p>
    </div>
  )
}
