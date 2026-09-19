// =====================================================
// Configuración del juego "Banco del tiempo"
// Mundo 2, Nivel 2
// =====================================================
//
// Todos los valores ajustables viven aquí, separados de la lógica y de
// los componentes visuales.

/** Nombre del logro que se otorgará al completar el nivel */
export const ACHIEVEMENT_NAME = 'Banco del tiempo'

/**
 * XP de respaldo si no se puede leer `xp_reward` desde la tabla `games`.
 * El valor real siempre viene de la base de datos (200 para este nivel).
 */
export const FALLBACK_XP_REWARD = 200

// ─────────────────────────────────────────────────────
// MUNDO
// ─────────────────────────────────────────────────────
//
// El escenario se mide en "unidades de mundo", no en píxeles. La
// pantalla escala el mapa completo para que quepa siempre, así que el
// juego se ve igual en un portátil y en un móvil.
//
// La proporción WORLD_WIDTH:WORLD_HEIGHT debe coincidir con el
// aspect-ratio de .bt-stage en el CSS (3:2), para que moverse en
// horizontal y en vertical tenga la misma velocidad real.

export const WORLD_WIDTH = 120
export const WORLD_HEIGHT = 80

/** Velocidad del avatar en unidades de mundo por segundo */
export const PLAYER_SPEED = 28

/** Medio ancho del avatar, usado para las colisiones */
export const PLAYER_HALF_SIZE = 2.2

/**
 * Tiempo entre fotogramas de la animación de caminata, en ms.
 * Solo afecta al aspecto visual del avatar.
 */
export const WALK_FRAME_MS = 140

// ─────────────────────────────────────────────────────
// MISIÓN DEL BANCO 1
// ─────────────────────────────────────────────────────

/**
 * Duración sugerida de la misión del banco 1 (10 minutos).
 *
 * IMPORTANTE: es una guía, no un requisito. Cuando llega a 00:00 no
 * bloquea nada, y el estudiante puede terminar antes si ya cumplió.
 */
export const MISSION_DURATION_MS = 10 * 60 * 1000

/** Clave de sessionStorage donde se guarda el progreso del nivel */
export const STORAGE_KEY = 'banco_del_tiempo_state'
