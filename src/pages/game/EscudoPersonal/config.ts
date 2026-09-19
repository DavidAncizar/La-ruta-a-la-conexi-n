// =====================================================
// Configuración del juego "Escudo personal"
// Mundo 3, Nivel 2
// =====================================================

/** Nombre del logro que se otorgará al completar el nivel */
export const ACHIEVEMENT_NAME = 'Escudo personal'

/**
 * XP de respaldo. El valor real viene de la base de datos
 * (200 para este nivel).
 */
export const FALLBACK_XP_REWARD = 200

// ─────────────────────────────────────────────────────
// CANVAS
// ─────────────────────────────────────────────────────

/**
 * Dimensiones internas del canvas en píxeles lógicos.
 * La relación 3:4 encaja bien con la forma de escudo y deja espacio
 * suficiente para dibujar sin agobiar. El CSS lo escala para que quepa
 * en cualquier pantalla sin deformar el contenido.
 */
export const CANVAS_WIDTH  = 600
export const CANVAS_HEIGHT = 800

// ─────────────────────────────────────────────────────
// HERRAMIENTAS
// ─────────────────────────────────────────────────────

export const DEFAULT_COLOR       = '#1a2540'
export const DEFAULT_SIZE        = 6
export const MIN_SIZE            = 2
export const MAX_SIZE            = 40
export const ERASER_MIN_SIZE     = 10
export const ERASER_DEFAULT_SIZE = 24
export const DEFAULT_OPACITY     = 1.0
export const DEFAULT_FONT_SIZE   = 24
export const MIN_FONT_SIZE       = 10
export const MAX_FONT_SIZE       = 72

/** Pasos máximos del historial undo/redo */
export const MAX_HISTORY = 40

/** Clave de localStorage para el guardado local de seguridad */
export const LOCAL_STORAGE_KEY = 'escudo_personal_canvas'

/** Colores de acceso rápido en la paleta */
export const PALETTE_COLORS = [
  '#1a2540',
  '#3366CC',
  '#FFCC00',
  '#e11d48',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ffffff',
  '#6b7280',
  '#000000',
] as const
