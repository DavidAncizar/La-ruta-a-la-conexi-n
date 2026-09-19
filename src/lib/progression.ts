// =====================================================
// Reglas de progresión: qué mundos y niveles están abiertos
// =====================================================
//
// ÚNICA FUENTE DE VERDAD del desbloqueo. Antes este cálculo estaba
// copiado en WorldsPage y en DashboardPage, con el riesgo de que una
// copia cambiara y la otra no.
//
// LAS DOS REGLAS
//   1. Dentro de un mundo, los niveles se abren en orden: el nivel 2
//      necesita que el nivel 1 esté completado.
//   2. Un mundo se abre cuando el mundo anterior está completo, es decir
//      cuando se terminó su último nivel (el nivel 2).
//
// Un nivel se considera completado si existe cualquier registro en
// student_progress para ese juego, sin importar el intento.

import type { Game } from '@/types'
import { GAMES_PER_WORLD, TOTAL_WORLDS } from './constants'

/** Estado de un nivel concreto para un estudiante */
export interface LevelStatus {
  game: Game
  /** Posición dentro de su mundo (1, 2, ...) */
  positionInWorld: number
  /** Número visible en todo el recorrido (1..6) */
  levelNumber: number
  isCompleted: boolean
  isUnlocked: boolean
}

/** Estado de un mundo completo para un estudiante */
export interface WorldProgress {
  /** Número del mundo (1, 2, 3) */
  order: number
  levels: LevelStatus[]
  /** Cuántos niveles del mundo ya completó */
  completed: number
  /** true si completó todos los niveles del mundo */
  isComplete: boolean
  isUnlocked: boolean
}

/**
 * Construye el estado de los tres mundos y sus niveles.
 *
 * @param games            filas de la tabla `games` (solo las activas)
 * @param completedGameIds ids de juegos con al menos un registro de progreso
 */
export function buildProgression(
  games: Game[],
  completedGameIds: number[]
): WorldProgress[] {
  const worlds: WorldProgress[] = []

  for (let order = 1; order <= TOTAL_WORLDS; order++) {
    const worldGames = games
      .filter(game => game.world_id === order)
      .sort((a, b) => a.order_index - b.order_index)

    // Regla 2: el mundo anterior debe estar completo.
    // Se exige que tenga niveles para que un mundo sin datos no abra
    // por accidente todo lo que viene después.
    const previousWorld = worlds[order - 2]
    const isUnlocked =
      order === 1 ||
      (!!previousWorld && previousWorld.levels.length > 0 && previousWorld.isComplete)

    // Regla 1: dentro del mundo, cada nivel necesita el anterior.
    const levels: LevelStatus[] = worldGames.map((game, index) => {
      const isCompleted = completedGameIds.includes(game.id)
      const previousLevel = index === 0 ? undefined : worldGames[index - 1]
      const previousDone =
        index === 0 || (!!previousLevel && completedGameIds.includes(previousLevel.id))

      return {
        game,
        positionInWorld: index + 1,
        levelNumber: (order - 1) * GAMES_PER_WORLD + index + 1,
        isCompleted,
        isUnlocked: isUnlocked && previousDone,
      }
    })

    const completed = levels.filter(level => level.isCompleted).length

    worlds.push({
      order,
      levels,
      completed,
      // Se compara con los niveles reales del mundo, no con la constante,
      // para que siga funcionando si algún mundo tuviera otra cantidad.
      isComplete: levels.length > 0 && completed === levels.length,
      isUnlocked,
    })
  }

  return worlds
}

/** Busca el estado de un nivel por el id de su juego */
export function findLevelStatus(
  worlds: WorldProgress[],
  gameId: number
): LevelStatus | undefined {
  for (const world of worlds) {
    const level = world.levels.find(item => item.game.id === gameId)
    if (level) return level
  }
  return undefined
}

/**
 * Primer nivel jugable y sin completar: la "siguiente misión".
 * Recorre en orden de mundo y de nivel.
 */
export function findNextLevel(worlds: WorldProgress[]): LevelStatus | undefined {
  for (const world of worlds) {
    const level = world.levels.find(item => item.isUnlocked && !item.isCompleted)
    if (level) return level
  }
  return undefined
}
