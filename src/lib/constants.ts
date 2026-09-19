import type { LevelThreshold } from '@/types'

// =====================================================
// Constantes del sistema — La ruta hacia la conexión
// =====================================================

// ─────────────────────────────────────────────────────
// SISTEMA DE NIVELES — SIN TECHO
// ─────────────────────────────────────────────────────
//
// El nivel de un estudiante no tiene límite superior. Sigue creciendo
// indefinidamente a medida que acumula XP, incluso después de terminar
// los 6 juegos actuales. Esto es intencional: permite construir a
// futuro un ranking real entre estudiantes por XP y nivel alcanzado,
// sin que nadie se quede "topado" en un nivel máximo.
//
// Los primeros 5 niveles usan los umbrales originales del diseño del
// juego (alcanzables jugando los 6 niveles actuales). A partir del
// nivel 6, cada salto de nivel exige progresivamente más XP que el
// anterior, calculado con una fórmula en vez de una lista fija.

/** Umbrales fijos de los primeros 5 niveles (diseño original del juego) */
const BASE_LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xp_required: 0 },
  { level: 2, xp_required: 100 },
  { level: 3, xp_required: 250 },
  { level: 4, xp_required: 500 },
  { level: 5, xp_required: 1000 },
]

/**
 * XP necesario para alcanzar un nivel cualquiera, sin límite superior.
 *
 * Para los niveles 1 a 5 devuelve los umbrales fijos de siempre (así el
 * nivel de los estudiantes que ya están jugando no cambia). A partir
 * del nivel 6, cada nivel exige 250 XP más de salto que el anterior
 * (750, 1000, 1250...), para que subir de nivel siga siendo un logro
 * cada vez mayor a largo plazo.
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0

  const lastBase = BASE_LEVEL_THRESHOLDS[BASE_LEVEL_THRESHOLDS.length - 1]
  if (level <= lastBase.level) {
    return BASE_LEVEL_THRESHOLDS[level - 1].xp_required
  }

  let required = lastBase.xp_required
  let step = 500 // el salto de XP del nivel 4 al 5

  for (let currentLevel = lastBase.level + 1; currentLevel <= level; currentLevel++) {
    step += 250
    required += step
  }

  return required
}

/**
 * Multiplicador de XP aplicado a partir del segundo intento de un juego.
 * Todos los juegos pueden volver a jugarse: la primera vez otorga el 100%
 * del XP configurado en `games.xp_reward`, y desde el segundo intento en
 * adelante se otorga esta fracción (0.5 = mitad de XP).
 */
export const XP_REPLAY_MULTIPLIER = 0.5

/**
 * Aplica el multiplicador de reintento al XP que el estudiante ganó
 * en la partida actual (por ejemplo, retos completados × XP por reto).
 * El primer intento (attemptNumber === 1) siempre otorga el 100%.
 */
export function calculateXpForAttempt(earnedXp: number, attemptNumber: number): number {
  if (attemptNumber <= 1) return earnedXp
  return Math.round(earnedXp * XP_REPLAY_MULTIPLIER)
}

/** Total de mundos */
export const TOTAL_WORLDS = 3

/** Juegos por mundo */
export const GAMES_PER_WORLD = 2

/** Total de juegos */
export const TOTAL_GAMES = TOTAL_WORLDS * GAMES_PER_WORLD

/** XP total posible (150 + 200 por mundo × 3) */
export const TOTAL_XP_POSSIBLE = 1050

/**
 * Nombres de los mundos (para referencia rápida en UI sin consultar BD)
 */
export const WORLD_NAMES: Record<number, string> = {
  1: 'Conexión con tu entorno',
  2: 'Buen uso del tiempo libre',
  3: 'Autoestima e identidad personal',
}

/**
 * Nombres de los juegos por world_id y order_index
 */
export const GAME_NAMES: Record<string, string> = {
  '1-1': 'El poder de tu decisión',
  '1-2': 'Nueva conexión',
  '2-1': 'Explorador de experiencias',
  '2-2': 'Banco del tiempo',
  '3-1': 'Sé auténtico, más allá de un like',
  '3-2': 'Escudo personal',
}

/**
 * Etiquetas legibles para las mecánicas de juego
 */
export const MECHANIC_LABELS: Record<string, string> = {
  roulette: 'Ruleta aleatoria',
  interactive_map: 'Mapa interactivo',
  quiz: 'Quiz de conocimiento',
  disconnect_challenge: 'Reto de desconexión',
  decision_simulator: 'Simulador de decisiones',
  reflection: 'Desafío de reflexión',
}

/**
 * Grados disponibles
 */
export const GRADES = ['8', '9', '10'] as const

/**
 * Ejemplo de cursos (el admin podría crear más)
 */
export const SAMPLE_CLASSROOMS = [
  '8-1', '8-2', '8-3', '8-4', '8-5',
  '9-1', '9-2', '9-3', '9-4', '9-5',
  '10-1', '10-2', '10-3', '10-4', '10-5',
] as const
