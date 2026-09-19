// =====================================================
// Tipos del juego "Explorador de experiencias"
// Mundo 2, Nivel 1
// =====================================================
//
// El juego es una RULETA: el estudiante la gira, cae en una de seis
// categorías, y esa categoría despliega cuatro experiencias posibles.
// Elige una, la realiza en la vida real y sube su evidencia a Drive.

/**
 * Identificador estable de cada categoría de la ruleta.
 * Se guarda en la base de datos, así que no debe cambiarse una vez
 * publicado el juego (los textos visibles sí se pueden editar).
 */
export type CategoryId =
  | 'aire_libre'
  | 'cultura'
  | 'desarrollo'
  | 'retos'
  | 'creatividad'
  | 'social'

/** Una experiencia concreta dentro de una categoría */
export interface Experience {
  /** id único dentro de su categoría */
  id: string
  /** Texto que se muestra en la carta */
  label: string
  /** Descripción breve de la experiencia */
  description: string
  /** Emoji ilustrativo de la carta */
  emoji: string
}

/** Una de las seis categorías de la ruleta */
export interface Category {
  id: CategoryId
  /** Nombre visible. Ej: "Aire libre" */
  label: string
  /** Emoji representativo */
  emoji: string
  /** Frase corta que acompaña a la categoría al abrirse */
  tagline: string
  /** Color de acento (bordes, sector de la ruleta) */
  color: string
  /** Fondo suave (cartas y badges) */
  background: string
  /** Las cuatro experiencias de esta categoría */
  experiences: Experience[]
}

/**
 * Fases de la máquina de estados del juego.
 *
 * intro     → explica la misión
 * wheel     → la ruleta lista para girar
 * spinning  → la ruleta está girando (bloquea la interacción)
 * category  → cayó en una categoría, se muestran sus 4 experiencias
 * evidence  → el estudiante eligió una experiencia y sube su evidencia
 * finished  → pantalla de cierre con el XP obtenido
 */
export type ExplorerPhase =
  | 'intro'
  | 'wheel'
  | 'spinning'
  | 'category'
  | 'evidence'
  | 'finished'

/**
 * Datos que se guardan en student_progress.metadata al terminar.
 *
 * PRIVACIDAD: solo se registra qué categoría y experiencia eligió el
 * propio estudiante. No se guarda ninguna foto, dato personal ni
 * contenido de la evidencia.
 */
export interface ExplorerMetadata {
  /** Categoría en la que cayó la ruleta */
  categoryId: CategoryId
  /** Experiencia que el estudiante eligió */
  experienceId: string
  /** Si confirmó haber subido su evidencia a Drive */
  evidenceConfirmed: boolean
}
