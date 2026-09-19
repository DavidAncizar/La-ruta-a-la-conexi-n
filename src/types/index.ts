// =====================================================
// La ruta hacia la conexión — Tipos TypeScript
// Alineados con el modelo de datos de Supabase (7 tablas)
// =====================================================

// ─── Roles ───────────────────────────────────────────

export type UserRole = 'student' | 'admin'
export type AvatarGender = 'male' | 'female' | 'nonbinary'
export type PieceType = 'head' | 'body' | 'legs'

export type GameMechanic =
  | 'roulette'
  | 'interactive_map'
  | 'quiz'
  | 'disconnect_challenge'
  | 'decision_simulator'
  | 'reflection'

// ─── Tablas de la BD ─────────────────────────────────

export interface AcademicPeriod {
  id: number
  name: string
  description: string | null
  starts_at: string
  ends_at: string | null
  is_active: boolean
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  grade: string | null
  classroom: string | null
  academic_period_id: number | null
  xp: number
  level: number
  avatar_gender: AvatarGender
  /**
   * Personalización del avatar (jsonb en Supabase).
   * Guarda el personaje completo elegido: { characterId: string }
   * (ver src/lib/characterConfig.ts para el catálogo de personajes).
   */
  avatar_config: Record<string, string> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface World {
  id: number
  order_index: number
  title: string
  description: string
  image_url: string | null
  created_at: string
}

export interface Game {
  id: number
  world_id: number
  order_index: number
  title: string
  description: string
  mechanic: GameMechanic
  xp_reward: number
  content: Record<string, unknown> | null
  is_active: boolean
  created_at: string
}

export interface AvatarPiece {
  id: number
  world_id: number
  piece_type: PieceType
  name_male: string
  name_female: string
  image_male: string
  image_female: string
  created_at: string
}

export interface StudentProgress {
  id: number
  student_id: string
  game_id: number
  academic_period_id: number
  /** Número de intento del juego (1 = primera vez, 2 = segunda vez, etc.) */
  attempt_number: number
  xp_earned: number
  score: number | null
  /**
   * Datos propios de cada juego en formato flexible.
   * Ejemplo en "Nueva Conexión": { routeId, stepsCompleted, evidenceConfirmed }.
   * No contiene datos personales de terceros.
   */
  metadata: Record<string, unknown> | null
  completed_at: string
}

export interface StudentAvatarPiece {
  id: number
  student_id: string
  avatar_piece_id: number
  academic_period_id: number
  unlocked_at: string
  // Elecciones de personalización del estudiante (guardadas en la fila del mundo 1)
  chosen_skin?:  string | null
  chosen_face?:  string | null
  chosen_shirt?: string | null
  chosen_pants?: string | null
  chosen_shoes?: string | null
  chosen_hair?:  string | null
}

// ─── Tipos auxiliares (frontend) ─────────────────────

/**
 * Resultado que cualquier juego devuelve al terminar una partida.
 *
 * Es el contrato común entre los componentes de juego y GamePage.tsx,
 * que es el único responsable de persistir en Supabase. Así todos los
 * niveles (actuales y futuros) usan la misma interfaz sin importar su
 * mecánica.
 *
 * IMPORTANTE: `xpEarned` debe llegar ya con el multiplicador de reintento
 * aplicado (ver calculateXpForAttempt en src/lib/constants.ts), para que
 * el XP que el estudiante ve en pantalla coincida con el que se guarda.
 */
export interface GameResult {
  /** XP final de la partida, con el multiplicador de reintento ya aplicado */
  xpEarned: number
  /** Puntaje opcional, con significado propio de cada juego */
  score?: number | null
  /** Datos propios del juego que se guardan en student_progress.metadata */
  metadata?: Record<string, unknown> | null
}

/** Umbrales de XP para cada nivel */
export interface LevelThreshold {
  level: number
  xp_required: number
}

/** Estado de desbloqueo de un mundo para un estudiante */
export interface WorldStatus {
  world: World
  games: Game[]
  is_unlocked: boolean
  games_completed: number
  total_games: number
  avatar_piece: AvatarPiece | null
  piece_unlocked: boolean
}
