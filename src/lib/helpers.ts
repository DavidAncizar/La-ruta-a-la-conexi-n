import { xpRequiredForLevel, GAMES_PER_WORLD } from './constants'
import type { StudentProgress } from '@/types'

// =====================================================
// Funciones auxiliares puras — La ruta hacia la conexión
// =====================================================

/**
 * Calcula el nivel correspondiente a una cantidad de XP.
 *
 * El sistema de niveles NO tiene techo: sigue subiendo mientras el
 * estudiante siga ganando XP, usando xpRequiredForLevel para calcular
 * cada siguiente umbral (ver src/lib/constants.ts). Esto es necesario
 * para poder construir un ranking real entre estudiantes sin que nadie
 * se quede "topado" en un nivel máximo.
 */
export function calculateLevel(xp: number): number {
  let level = 1
  while (xp >= xpRequiredForLevel(level + 1)) {
    level++
  }
  return level
}

/**
 * Calcula el XP necesario para el siguiente nivel.
 * Como el sistema no tiene nivel máximo, siempre existe un "siguiente".
 */
export function xpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp)
  return xpRequiredForLevel(currentLevel + 1)
}

/**
 * Calcula el porcentaje de progreso hacia el siguiente nivel.
 * Útil para barras de XP.
 */
export function xpProgressPercent(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp)
  const currentThreshold = xpRequiredForLevel(currentLevel)
  const nextThreshold = xpRequiredForLevel(currentLevel + 1)

  const xpIntoLevel = currentXp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold

  return Math.round((xpIntoLevel / xpNeeded) * 100)
}

/**
 * Determina si un mundo está desbloqueado.
 *
 * Regla: El mundo N se desbloquea cuando el mundo N-1 tiene sus 2 juegos completados.
 * El mundo 1 siempre está desbloqueado.
 *
 * @param worldOrderIndex  - order_index del mundo a verificar (1, 2 o 3)
 * @param completedGameIds - IDs de los juegos completados por el estudiante
 * @param gamesByWorld     - Mapa de world_order → array de game IDs de ese mundo
 */
export function isWorldUnlocked(
  worldOrderIndex: number,
  completedGameIds: number[],
  gamesByWorld: Record<number, number[]>
): boolean {
  // El mundo 1 siempre está disponible
  if (worldOrderIndex <= 1) return true

  // Verificar que TODOS los juegos del mundo anterior están completados
  const previousWorldGames = gamesByWorld[worldOrderIndex - 1] ?? []
  if (previousWorldGames.length === 0) return false

  return previousWorldGames.every(gameId => completedGameIds.includes(gameId))
}

/**
 * Verifica si un mundo está completamente terminado (2/2 juegos).
 */
export function isWorldComplete(
  worldOrderIndex: number,
  completedGameIds: number[],
  gamesByWorld: Record<number, number[]>
): boolean {
  const worldGames = gamesByWorld[worldOrderIndex] ?? []
  if (worldGames.length < GAMES_PER_WORLD) return false

  return worldGames.every(gameId => completedGameIds.includes(gameId))
}

/**
 * Cuenta los juegos completados para un mundo específico.
 */
export function gamesCompletedInWorld(
  worldOrderIndex: number,
  completedGameIds: number[],
  gamesByWorld: Record<number, number[]>
): number {
  const worldGames = gamesByWorld[worldOrderIndex] ?? []
  return worldGames.filter(gameId => completedGameIds.includes(gameId)).length
}

/**
 * Extrae los IDs de juegos completados de un array de StudentProgress.
 */
export function extractCompletedGameIds(progress: StudentProgress[]): number[] {
  return progress.map(p => p.game_id)
}
