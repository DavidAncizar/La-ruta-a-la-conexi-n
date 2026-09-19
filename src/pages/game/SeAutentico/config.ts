// =====================================================
// Configuración del juego "Sé auténtico, más allá de un like"
// Mundo 3, Nivel 1
// =====================================================
//
// El juego es una simulación educativa breve: el estudiante experimenta
// qué ocurre cuando una interacción en redes sociales se limita
// únicamente a dar like, y descubre que la conversación abre más puertas.
//
// ESTRUCTURA
//   Parte 1 — SOLO LIKE:     intro → post → result_like
//   Parte 2 y siguientes →   pendientes de implementar
//
// NOTA SOBRE LA EVIDENCIA Y XP
// El nivel NO otorga XP todavía: solo está implementada la primera parte
// (simulación del like). Cuando se completen todas las partes se
// conectará onComplete con el mismo patrón de los otros niveles.

/** Nombre del logro que se otorgará al completar el nivel completo */
export const ACHIEVEMENT_NAME = 'Sé auténtico'

/**
 * XP de respaldo si no se puede leer `xp_reward` desde la tabla `games`.
 * El valor real siempre viene de la base de datos (150 para este nivel).
 */
export const FALLBACK_XP_REWARD = 150

/**
 * Las publicaciones ficticias que se muestran durante la simulación.
 * Son completamente inventadas: no representan a ninguna persona real.
 */
export const SIMULATION_POSTS = [
  {
    id: 'post_1',
    avatar: '🧑',
    username: 'usuario_anónimo',
    text: 'Siempre he querido aprender fotografía 📷',
  },
] as const
