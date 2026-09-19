import { useState } from 'react'
import type { SimPost, ReplyOption } from '../types'

interface CuriosityPostProps {
  post: SimPost
  options: ReplyOption[]
  onChoose: (option: ReplyOption) => void
}

/**
 * Segunda simulación: misma publicación, pero ahora el estudiante
 * elige cómo responder entre tres opciones.
 *
 * DISEÑO INTENCIONAL
 * Las tres opciones tienen aspecto similar al principio, pero al
 * seleccionar la correcta se produce un destello distinto: el juego
 * enseña por contraste, no por texto explicativo.
 *
 * Solo la opción marcada como `isCorrect` avanza el flujo; las demás
 * muestran un parpadeo de "intenta de nuevo" sin regañar al estudiante.
 */
export default function CuriosityPost({ post, options, onChoose }: CuriosityPostProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [wrongShake, setWrongShake] = useState<string | null>(null)

  function handlePick(option: ReplyOption) {
    setSelected(option.id)

    if (option.isCorrect) {
      // Pequeña pausa para que el estudiante vea el estado "marcado"
      // antes de que el padre avance la fase.
      window.setTimeout(() => onChoose(option), 520)
    } else {
      // Anima el botón incorrecto y lo limpia, sin bloquear el intento
      setWrongShake(option.id)
      window.setTimeout(() => {
        setWrongShake(null)
        setSelected(null)
      }, 600)
    }
  }

  return (
    <div className="sa-scene page-fade">
      <p className="sa-scene__cue">
        Aquí tienes otra oportunidad. ¿Cómo quieres responder?
      </p>

      {/* La misma publicación de la parte 1 */}
      <div className="sa-post" aria-label="Publicación ficticia">
        <div className="sa-post__header">
          <span className="sa-post__avatar" aria-hidden="true">{post.avatar}</span>
          <span className="sa-post__username">@{post.username}</span>
        </div>
        <p className="sa-post__text">{post.text}</p>
      </div>

      {/* Opciones de respuesta */}
      <div className="sa-replies" role="group" aria-label="Elige cómo responder">
        {options.map((opt, index) => {
          const isSelected  = selected === opt.id
          const isWrong     = wrongShake === opt.id
          const isConfirmed = isSelected && opt.isCorrect

          return (
            <button
              key={opt.id}
              type="button"
              className={[
                'sa-reply',
                isConfirmed ? 'is-correct' : '',
                isWrong     ? 'is-wrong'   : '',
                isSelected && !opt.isCorrect ? 'is-selected' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handlePick(opt)}
              disabled={isSelected && opt.isCorrect}
              style={{ '--delay': `${0.06 + index * 0.08}s` } as React.CSSProperties}
              aria-pressed={isConfirmed}
            >
              <span className="sa-reply__bubble" aria-hidden="true">💬</span>
              <span className="sa-reply__text">{opt.text}</span>
              {isConfirmed && (
                <span className="sa-reply__check" aria-hidden="true">✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
