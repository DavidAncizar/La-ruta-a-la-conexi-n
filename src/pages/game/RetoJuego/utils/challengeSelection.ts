// Utilidad de selección aleatoria de retos
//
// Se encarga de elegir N retos al azar de un banco más grande,
// sin repetir ninguno dentro de la misma partida.

import type { Challenge } from '../types/challenge'

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Selecciona `count` retos aleatorios del banco completo, sin repetir.
 *
 * Esta función se debe llamar UNA VEZ al iniciar cada partida nueva
 * (por ejemplo, al presionar "Comenzar reto"). Cada llamada genera
 * una selección distinta e independiente.
 *
 * @param bank  
 * @param count 
 */
export function selectRandomChallenges(bank: Challenge[], count: number): Challenge[] {
  if (count >= bank.length) return shuffle(bank)
  return shuffle(bank).slice(0, count)
}
