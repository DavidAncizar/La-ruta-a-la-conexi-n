// =====================================================
// Configuración del juego "Nueva Conexión"
// Mundo 1, Nivel 2
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
export const ACHIEVEMENT_NAME = 'Nueva Conexión'

/**
 * XP de respaldo si por alguna razón no se puede leer `xp_reward`
 * desde la tabla `games` de Supabase.
 *
 * El valor real que se otorga viene siempre de la base de datos
 * (`games.xp_reward`), que para este nivel está en 200.
 */
export const FALLBACK_XP_REWARD = 200

/**
 * Si es true, el estudiante debe confirmar que subió su evidencia a
 * Drive antes de poder cerrar la misión.
 *
 * Está en FALSE: la evidencia es siempre opcional en todos los niveles.
 * Se recomienda grabarse o tomar una foto como recuerdo, pero nunca se
 * exige para poder avanzar. El nivel se considera completado con solo
 * tres condiciones:
 *   1. eligió una ruta
 *   2. completó los 4 pasos
 *   3. marcó que realizó la conversación
 */
export const REQUIRE_EVIDENCE_TO_FINISH = false

// NOTA SOBRE REPETIR EL NIVEL
// La política de repetición es global para todos los juegos y vive en
// src/lib/constants.ts: el primer intento otorga el 100% del XP y a
// partir del segundo se otorga XP_REPLAY_MULTIPLIER (la mitad).
// Este juego no define reglas propias de XP, usa las del sistema.
