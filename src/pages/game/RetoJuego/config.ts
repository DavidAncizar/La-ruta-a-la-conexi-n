// =====================================================
// Configuración del juego "El poder de tu decisión"
// Mundo 1, Nivel 1
// =====================================================
//
// Todos los valores ajustables del juego viven aquí, separados
// de la lógica visual y de los componentes.

// NOTA: El enlace de Google Drive para la evidencia ya NO vive aquí.
// Ahora es compartido por todos los niveles y se configura mediante la
// variable de entorno VITE_EVIDENCE_DRIVE_URL.
// Ver: src/lib/evidence.ts

/** Cantidad de retos que se juegan por partida */
export const CHALLENGES_PER_GAME = 5

/** XP otorgado por cada reto completado individualmente */
export const XP_PER_CHALLENGE = 20

/** XP total al completar los 5 retos (5 × 20 = 100) */
export const XP_TOTAL_GAME = CHALLENGES_PER_GAME * XP_PER_CHALLENGE
