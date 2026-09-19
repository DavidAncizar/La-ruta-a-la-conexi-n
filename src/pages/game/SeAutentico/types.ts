// =====================================================
// Tipos del juego "Sé auténtico, más allá de un like"
// Mundo 3, Nivel 1
// =====================================================

/**
 * Fases del juego.
 *
 * ── PARTE 1: solo like ──
 * intro       → pantalla de bienvenida ("MÁS ALLÁ DEL LIKE")
 * like_post   → publicación ficticia con las dos opciones
 * like_result → resultado de haber dado solo like + reflexión educativa
 *
 * ── PARTE 2: curiosidad y conversación ──
 * curiosity_post   → misma publicación, elegir cómo responder (3 opciones)
 * curiosity_chat   → respuesta simulada + secuencia educativa PUBLICACIÓN→CONOCER
 *
 * ── PARTE 3: acción real ──
 * real_intro   → "Ahora te toca a ti" + orientación para la interacción real
 * real_goal    → objetivo visual: Comparte → Pregunta → Descubre
 * real_closing → cierre "MÁS ALLÁ DEL LIKE" + evidencia opcional + FINALIZAR
 * finished     → pantalla de logro con XP, barra de progreso y botones de salida
 */
export type SeAutenticoPhase =
  | 'intro'
  | 'like_post'
  | 'like_result'
  | 'curiosity_post'
  | 'curiosity_chat'
  | 'real_intro'
  | 'real_goal'
  | 'real_closing'
  | 'real_challenge'
  | 'finished'

/** Una opción de respuesta en la simulación de curiosidad */
export interface ReplyOption {
  id: string
  text: string
  /** true = la opción que el juego quiere enseñar (mostrar curiosidad) */
  isCorrect: boolean
}

/** Una publicación ficticia de la simulación */
export interface SimPost {
  id: string
  /** Emoji que representa el avatar del autor */
  avatar: string
  /** Nombre de usuario ficticio */
  username: string
  /** Texto de la publicación */
  text: string
}
