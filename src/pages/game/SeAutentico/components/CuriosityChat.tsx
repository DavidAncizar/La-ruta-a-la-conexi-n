import { useEffect, useState } from 'react'

interface CuriosityChatProps {
  /** Pregunta que hizo el estudiante */
  question: string
  /** Respuesta ficticia del "conocido" */
  reply: string
  /** Avanza hacia la tercera parte (aún no implementada) */
  onContinue: () => void
}

/** Los cinco nodos de la secuencia educativa, en orden */
const SEQUENCE_STEPS = [
  { icon: '📄', label: 'Publicación' },
  { icon: '🔍', label: 'Curiosidad' },
  { icon: '❓', label: 'Pregunta' },
  { icon: '💬', label: 'Conversación' },
  { icon: '🤝', label: 'Conocer al otro' },
]

/**
 * Segunda parte — resultado de mostrar curiosidad.
 *
 * Se construye en cuatro momentos para que la comparación con el
 * resultado del like sea evidente sin necesitar texto extra:
 *
 *   Momento 1: el chat muestra la pregunta del estudiante
 *   Momento 2: llega la respuesta simulada del "conocido"
 *   Momento 3: "¿Qué pasó esta vez?" → "Ahora descubriste algo nuevo"
 *   Momento 4: mensaje central + secuencia visual + frase de cierre + botón
 */
export default function CuriosityChat({
  question,
  reply,
  onContinue,
}: CuriosityChatProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [seqIndex, setSeqIndex] = useState(-1)

  useEffect(() => {
    const t2 = window.setTimeout(() => setStep(2), 1200)
    const t3 = window.setTimeout(() => setStep(3), 2600)
    const t4 = window.setTimeout(() => setStep(4), 4000)
    return () => {
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
    }
  }, [])

  // Cuando llega el paso 4, encadena la animación de la secuencia
  useEffect(() => {
    if (step < 4) return

    let index = 0
    const tick = () => {
      setSeqIndex(index)
      index++
      if (index < SEQUENCE_STEPS.length) {
        window.setTimeout(tick, 500)
      }
    }
    const start = window.setTimeout(tick, 300)
    return () => window.clearTimeout(start)
  }, [step])

  return (
    <div className="sa-chat page-fade">

      {/* ── Mini chat ficticio ── */}
      <div className="sa-chat__window">
        <div className="sa-chat__header">
          <span className="sa-chat__avatar" aria-hidden="true">🧑</span>
          <span className="sa-chat__name">@usuario_anónimo</span>
        </div>

        {/* Pregunta del estudiante — siempre visible */}
        <div className="sa-chat__bubble sa-chat__bubble--sent page-fade">
          {question}
        </div>

        {/* Respuesta ficticia — aparece en el momento 2 */}
        {step >= 2 && (
          <div className="sa-chat__bubble sa-chat__bubble--received page-fade">
            {reply}
          </div>
        )}
      </div>

      {/* ── Momento 3: reflexión ── */}
      {step >= 3 && (
        <div className="sa-result__question page-fade">
          <p className="sa-result__q">¿Qué pasó esta vez?</p>
          <p className="sa-result__answer sa-result__answer--positive">
            Ahora descubriste algo nuevo sobre esa persona.
          </p>
        </div>
      )}

      {/* ── Momento 4: mensaje central + secuencia + cierre + botón ── */}
      {step >= 4 && (
        <div className="sa-result__lesson sa-result__lesson--beyond page-fade">

          <p className="sa-chat__headline">Eso es ir más allá del like.</p>

          <p className="sa-result__lesson-text">
            No solo reaccionaste a una publicación. Mostraste curiosidad y
            abriste una conversación.
          </p>

          {/* Secuencia visual animada */}
          <ol className="sa-sequence" aria-label="Secuencia de la conversación">
            {SEQUENCE_STEPS.map((s, i) => (
              <li
                key={s.label}
                className={`sa-sequence__step ${seqIndex >= i ? 'is-lit' : ''}`}
              >
                <span className="sa-sequence__icon" aria-hidden="true">{s.icon}</span>
                <span className="sa-sequence__label">{s.label}</span>
                {i < SEQUENCE_STEPS.length - 1 && (
                  <span className={`sa-sequence__arrow ${seqIndex >= i ? 'is-lit' : ''}`} aria-hidden="true">↓</span>
                )}
              </li>
            ))}
          </ol>

          <div className="sa-result__divider" aria-hidden="true">✦</div>

          <p className="sa-result__closing">
            "Una buena pregunta puede descubrir una parte de alguien que un
            like nunca muestra."
          </p>

          <button
            className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
            onClick={onContinue}
            type="button"
          >
            CONTINUAR →
          </button>
        </div>
      )}
    </div>
  )
}
