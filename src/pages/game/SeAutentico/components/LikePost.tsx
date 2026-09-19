import type { SimPost } from '../types'

interface LikePostProps {
  post: SimPost
  /** El estudiante elige solo el like en esta primera parte */
  onLike: () => void
}

/**
 * Publicación ficticia de la simulación.
 *
 * Muestra un post de red social minimalista y le pide al estudiante
 * que seleccione "❤️ Dar like". La opción "💬 Ir más allá" está
 * visible pero deshabilitada: en esta primera parte la historia
 * avanza con el like, y la segunda parte la activará.
 *
 * DISEÑO INTENCIONAL: la opción deshabilitada insinúa que existe una
 * alternativa, generando la pregunta "¿qué pasaría si la elegiera?"
 * antes de que el resultado del like responda esa inquietud.
 */
export default function LikePost({ post, onLike }: LikePostProps) {
  return (
    <div className="sa-scene page-fade">
      {/* Instrucción contextual */}
      <p className="sa-scene__cue">
        Esta es una publicación de un conocido tuyo. ¿Qué haces?
      </p>

      {/* Publicación ficticia */}
      <div className="sa-post" aria-label="Publicación ficticia">
        <div className="sa-post__header">
          <span className="sa-post__avatar" aria-hidden="true">{post.avatar}</span>
          <span className="sa-post__username">@{post.username}</span>
        </div>

        <p className="sa-post__text">{post.text}</p>

        <div className="sa-post__bar" aria-hidden="true">
          <span className="sa-post__likes">0 reacciones</span>
          <span className="sa-post__comments">0 comentarios</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="sa-actions" role="group" aria-label="Elige una acción">
        <button
          className="sa-action sa-action--like"
          onClick={onLike}
          type="button"
        >
          <span className="sa-action__icon" aria-hidden="true">❤️</span>
          <span className="sa-action__label">Dar like</span>
        </button>

        {/*
          Opción de la segunda parte. Deshabilitada ahora a propósito:
          la segunda parte todavía no está construida y el estudiante
          debe experimentar primero qué pasa con solo el like.
        */}
        <button
          className="sa-action sa-action--beyond"
          type="button"
          disabled
          aria-disabled="true"
          aria-label="Ir más allá (disponible en la siguiente parte)"
        >
          <span className="sa-action__icon" aria-hidden="true">💬</span>
          <span className="sa-action__label">Ir más allá</span>
          <span className="sa-action__lock" aria-hidden="true">🔒</span>
        </button>
      </div>
    </div>
  )
}
