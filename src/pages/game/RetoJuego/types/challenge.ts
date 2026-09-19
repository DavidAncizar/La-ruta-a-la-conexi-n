// =====================================================
// Tipos del juego "El poder de tu decisión"
// Mundo 1, Nivel 1
// =====================================================

/**
 * Categoría del reto. Agrupa los retos por tipo de acción.
 * Puedes ampliar esta lista cuando definas los 12 retos reales.
 */
export type ChallengeCategory =
  | 'comunicacion'
  | 'reflexion'
  | 'entorno'
  | 'actividad'
  | string // permite categorías nuevas sin romper el tipo

/**
 * Estructura de un reto individual del banco de retos.
 */
export interface Challenge {
  id: number
  category: ChallengeCategory
  title: string
  description: string
  /** Si es true, el reto requiere registrar evidencia externa (Google Forms/Drive) */
  evidenceRequired: boolean
}

/**
 * Decisión que el estudiante toma frente a un reto mostrado.
 */
export type ChallengeDecision = 'accept' | 'reject' | 'skip'

/**
 * Resultado final de un reto dentro de una partida.
 * Se usa para calcular el XP total y para el resumen final.
 */
export interface ChallengeResult {
  challengeId: number
  completed: boolean
}

/**
 * Estados posibles de la máquina de estados del juego.
 */
export type GamePhase =
  | 'intro'        // Pantalla de introducción / explicación
  | 'playing'       // Mostrando un reto activo
  | 'finished'      // Pantalla de finalización (misión completada)

/**
 * Estado interno de un reto mientras se juega la partida.
 */
export type ChallengeStepStatus =
  | 'pending'           // Aún no se ha decidido
  | 'accepted'           // El estudiante aceptó, está en curso
  | 'awaiting_evidence'  // Aceptó y requiere evidencia antes de confirmar
  | 'completed'          // Confirmado como realizado
  | 'rejected'           // El estudiante decidió no hacerlo
