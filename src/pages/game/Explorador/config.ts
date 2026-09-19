// =====================================================
// Configuración del juego "Explorador de experiencias"
// Mundo 2, Nivel 1
// =====================================================
//
// Todos los valores ajustables del juego viven aquí, separados de la
// lógica visual y de los componentes.
//
// NOTA SOBRE LA EVIDENCIA
// El enlace de Google Drive NO se configura aquí: es compartido por
// todos los niveles y se define en la variable de entorno
// VITE_EVIDENCE_DRIVE_URL. Ver src/lib/evidence.ts

/** Nombre del logro que se otorga al completar el nivel */
export const ACHIEVEMENT_NAME = 'Explorador de experiencias'

/**
 * XP de respaldo si por alguna razón no se puede leer `xp_reward`
 * desde la tabla `games` de Supabase.
 *
 * El valor real que se otorga viene siempre de la base de datos
 * (`games.xp_reward`), que para este nivel está en 150.
 */
export const FALLBACK_XP_REWARD = 150

// NOTA SOBRE REPETIR EL NIVEL
// La política de repetición es global para todos los juegos y vive en
// src/lib/constants.ts: el primer intento otorga el 100% del XP y a
// partir del segundo se otorga XP_REPLAY_MULTIPLIER (la mitad).
// Este juego no define reglas propias de XP, usa las del sistema.

/**
 * Duración de la animación de giro de la ruleta, en milisegundos.
 * Debe coincidir con la transición CSS de .exp-wheel__disc.
 */
export const SPIN_DURATION_MS = 4200

/**
 * La evidencia es siempre opcional en todos los niveles: se recomienda
 * grabarse o tomar una foto como recuerdo, pero nunca se exige para
 * poder cerrar la misión.
 */
export const REQUIRE_EVIDENCE_TO_FINISH = false
