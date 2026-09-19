// =====================================================
// Tipos del juego "Banco del tiempo"
// Mundo 2, Nivel 2
// =====================================================
//
// El nivel es un escenario 2D en vista superior. El estudiante mueve un
// avatar con el teclado, recorre el camino, se encuentra con dos bancos
// interactivos y termina en la zona meta.

/** Punto o vector en unidades del mundo (no píxeles) */
export interface Vec2 {
  x: number
  y: number
}

/** Rectángulo en unidades del mundo */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Etapas del nivel. Controlan qué banco puede activarse y cuándo se
 * habilita la meta, así que el progreso siempre va en orden y nunca se
 * pueden abrir los dos bancos a la vez.
 */
export type BankOfTimeStage =
  | 'exploring_to_bank_1'
  | 'bank_1'
  | 'exploring_to_bank_2'
  | 'bank_2'
  | 'exploring_to_finish'
  | 'completed'

/** Hacia dónde mira el avatar (para la animación) */
export type Facing = 'up' | 'down' | 'left' | 'right'

/** Identificador de cada banco */
export type BenchId = 'bank_1' | 'bank_2'

/** Un banco interactivo del escenario */
export interface Bench {
  id: BenchId
  /** Centro del banco en unidades del mundo */
  position: Vec2
  /** Distancia a la que aparece el aviso "Presiona E" */
  interactionRadius: number
  /** Título que se muestra en el panel al interactuar */
  title: string
}

// ─────────────────────────────────────────────────────
// MISIÓN DEL BANCO 1 — "Comparte una habilidad"
// ─────────────────────────────────────────────────────

/**
 * Categoría de habilidad que el estudiante puede enseñar.
 * El id se guardará en la base de datos, así que no debe cambiarse.
 */
export type SkillCategoryId =
  | 'musica'
  | 'deporte'
  | 'cocina'
  | 'magia'
  | 'arte'
  | 'curiosa'
  | 'baile'

/** Una de las siete categorías de habilidad */
export interface SkillCategory {
  id: SkillCategoryId
  /** Nombre visible. Ej: "Música" */
  label: string
  /** Nombre para el título de la misión. Ej: "MÚSICA" */
  missionName: string
  emoji: string
  /** Descripción breve que ayuda a elegir */
  description: string
  /** Ejemplos concretos de qué puede enseñar en esta categoría */
  examples: string[]
  /** Color de acento */
  color: string
  /** Fondo suave */
  background: string
}

/**
 * Sub-etapas de la misión del banco 1.
 *
 * briefing    → presentación de la misión
 * choosing    → selector de las 7 categorías
 * mission     → misión personalizada según la categoría
 * outside     → aviso de que la actividad ocurre fuera de la pantalla
 * active      → contador + evidencia opcional + recordatorio de compartir
 * celebration → animación de cierre
 */
export type Bank1SubStage =
  | 'briefing'
  | 'choosing'
  | 'mission'
  | 'outside'
  | 'active'
  | 'celebration'

/**
 * Estado de la misión del banco 1.
 *
 * Vive en el componente del nivel y se guarda en sessionStorage, porque
 * el estudiante va a salir de la aplicación para enseñar su habilidad y
 * al volver debe encontrar su misión donde la dejó.
 */
export interface Bank1State {
  subStage: Bank1SubStage
  /** Categoría elegida, null hasta que la selecciona */
  skillId: SkillCategoryId | null
  /**
   * Momento (epoch en ms) en que arrancó el contador, o null si aún no.
   * Se guarda el instante de inicio, no los segundos restantes, para que
   * el contador siga siendo correcto aunque se recargue la página.
   */
  timerStartedAt: number | null
  /** Si marcó que guardó evidencia (opcional, no bloquea nada) */
  evidenceSaved: boolean
  /** Si ya cerró la misión con "MISIÓN COMPLETADA" */
  completed: boolean
}

/** Estado inicial de la misión del banco 1 */
export const INITIAL_BANK1_STATE: Bank1State = {
  subStage: 'briefing',
  skillId: null,
  timerStartedAt: null,
  evidenceSaved: false,
  completed: false,
}

// ─────────────────────────────────────────────────────
// MISIÓN DEL BANCO 2 — "Ahora aprendo"
// ─────────────────────────────────────────────────────

/**
 * Cómo está la persona de confianza que va a enseñar.
 * Solo adapta los textos de las pantallas siguientes: no crea perfiles
 * ni sistemas sociales, es una elección de presentación.
 */
export type PresenceMode = 'together' | 'remote'

/**
 * Sub-etapas de la misión del banco 2.
 *
 * briefing            → presentación de la misión
 * choosing_presence   → ¿cómo está tu compañero? (junto / a distancia)
 * presence_explained  → explicación según la opción elegida
 * choosing_skill      → selector de las 7 categorías (elige el compañero)
 * mission             → misión personalizada según la categoría
 * outside             → aviso de que la actividad ocurre fuera de la pantalla
 * active              → contador + mensajes motivacionales + evidencia opcional
 * closing             → agradecimiento + cierre del intercambio
 */
export type Bank2SubStage =
  | 'briefing'
  | 'choosing_presence'
  | 'presence_explained'
  | 'choosing_skill'
  | 'mission'
  | 'outside'
  | 'active'
  | 'closing'

/**
 * Estado de la misión del banco 2.
 *
 * Igual que el banco 1, se guarda en sessionStorage porque el
 * intercambio ocurre fuera de la aplicación y el estudiante debe
 * encontrar su misión donde la dejó al volver.
 */
export interface Bank2State {
  subStage: Bank2SubStage
  /** Cómo está la persona que va a enseñar, null hasta que se elige */
  presenceMode: PresenceMode | null
  /** Categoría que el compañero eligió enseñar */
  skillId: SkillCategoryId | null
  /** Instante (epoch en ms) en que arrancó el contador, o null */
  timerStartedAt: number | null
  /** Si marcó que guardó evidencia (opcional, no bloquea nada) */
  evidenceSaved: boolean
  /** Si ya cerró el intercambio */
  completed: boolean
}

/** Estado inicial de la misión del banco 2 */
export const INITIAL_BANK2_STATE: Bank2State = {
  subStage: 'briefing',
  presenceMode: null,
  skillId: null,
  timerStartedAt: null,
  evidenceSaved: false,
  completed: false,
}

/** Tipos de decoración disponibles en el escenario */
export type DecorKind = 'tree' | 'flower' | 'rock' | 'bush' | 'lamp'

/** Un elemento decorativo (no bloquea, es ambiente) */
export interface Decor {
  kind: DecorKind
  position: Vec2
  /** Escala relativa para que no todos se vean idénticos */
  scale?: number
}
