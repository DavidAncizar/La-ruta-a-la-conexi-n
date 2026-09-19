// =====================================================
// Tipos del juego "Nueva Conexión"
// Mundo 1, Nivel 2
// =====================================================
//
// El juego funciona como un MAPA INTERACTIVO: el estudiante elige uno de
// cinco contextos (rutas) y luego construye paso a paso una guía de
// conversación para iniciar una nueva conexión social en la vida real.

/**
 * Identificador de cada una de las cinco rutas disponibles.
 * Se usa como valor estable (se guarda en la base de datos), así que
 * no debe cambiarse una vez publicado el juego.
 */
export type ConnectionRouteId =
  | 'curso'         // Alguien de tu curso
  | 'otro_curso'    // Alguien de otro curso
  | 'otro_grado'    // Alguien de otro grado
  | 'barrio'        // Alguien de tu barrio
  | 'red_social'    // Alguien de tu red social

/**
 * Una opción que el estudiante puede elegir dentro de un paso.
 * Cada opción aporta una frase (`guideText`) que se irá acumulando
 * para armar la guía de conversación final.
 */
export interface ConnectionOption {
  id: string
  /** Texto corto que se muestra en el botón de la opción */
  label: string
  /** Frase que esta opción aporta a la guía personalizada final */
  guideText: string
}

/**
 * Un paso en la construcción de la guía de conversación.
 * El estudiante elige una opción por paso.
 */
export interface ConnectionStep {
  id: string
  /** Pregunta o instrucción del paso. Ej: "¿Cómo vas a iniciar?" */
  title: string
  /** Explicación breve que orienta la elección */
  description: string
  /** Rótulo de la sección que esta elección ocupará en la guía final */
  guideLabel: string
  options: ConnectionOption[]
}

/**
 * Una de las cinco rutas del mapa interactivo.
 * Cada ruta representa un contexto social distinto y contiene sus
 * propios pasos de construcción de la guía.
 */
export interface ConnectionRoute {
  id: ConnectionRouteId
  /** Nombre visible de la ruta. Ej: "Alguien de tu curso" */
  label: string
  /**
   * Nombre corto para el mapa. Las paradas del mapa son pequeñas y el
   * nombre completo no cabe sin romper el diseño. Ej: "Tu curso"
   */
  shortLabel: string
  /** Emoji representativo del contexto */
  emoji: string
  /** Descripción breve que ayuda a elegir esta ruta */
  description: string
  /**
   * Introducción de la misión. Se muestra en el mapa cuando el
   * estudiante selecciona esta ruta, antes de comenzar.
   */
  missionIntro: string
  /**
   * Aviso de seguridad opcional. Si está presente, se muestra como
   * banner destacado en el primer paso de la ruta. Se usa, por ejemplo,
   * en la ruta de red social para recordar buenas prácticas digitales.
   */
  safetyNote?: string
  /** Color de acento de la ruta (usado en bordes y fondos) */
  color: string
  /** Fondo suave de la ruta (usado en tarjetas y badges) */
  background: string
  /** Pasos que el estudiante recorrerá al elegir esta ruta */
  steps: ConnectionStep[]
}

/**
 * Fases de la máquina de estados del juego.
 *
 * intro    → explica la misión
 * map      → el estudiante elige 1 de las 5 rutas
 * steps    → construye su guía eligiendo una opción por paso
 * guide    → ve su guía personalizada y registra su evidencia
 * finished → pantalla de cierre con el XP obtenido
 */
export type ConnectionPhase = 'intro' | 'map' | 'steps' | 'guide' | 'finished'

/**
 * Sub-fases dentro de la fase 'guide'.
 *
 * Cuando el estudiante termina los pasos entra a 'guide', y dentro de
 * esa fase recorre 4 sub-vistas antes de completar la misión:
 *
 *   reviewing   → ve su guía + sección "AHORA HAZLO EN LA VIDA REAL"
 *   transition  → pantalla breve que le invita a salir de la app
 *   confirming  → ¿ya realizaste la conversación? (sí / todavía no)
 *   evidence    → sube evidencia a Drive y cierra la misión
 *
 * Se guarda en sessionStorage para que el estudiante pueda salir a
 * realizar la conversación en la vida real y volver donde iba.
 */
export type GuideStage = 'reviewing' | 'transition' | 'confirming' | 'evidence'

/**
 * Una línea de la guía de conversación final ya armada.
 */
export interface GuideLine {
  /** Rótulo de la sección. Ej: "Cómo empezar" */
  label: string
  /** Frase concreta que el estudiante puede usar */
  text: string
}

/**
 * Datos que se guardan en student_progress.metadata al terminar.
 *
 * PRIVACIDAD: solo se registra el recorrido del propio estudiante.
 * No se guarda con quién habló, ni la conversación, ni ningún dato
 * personal de la otra persona.
 */
export interface ConnectionMetadata {
  /** Ruta que eligió el estudiante */
  routeId: ConnectionRouteId
  /** Cuántos pasos completó de la guía */
  stepsCompleted: number
  /** Si el estudiante marcó la conversación como realizada en la vida real */
  conversationDone: boolean
  /** Si confirmó haber subido su evidencia a Drive */
  evidenceConfirmed: boolean
}
