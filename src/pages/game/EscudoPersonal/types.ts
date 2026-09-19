// =====================================================
// Tipos del juego "Escudo personal" — Mundo 3, Nivel 2
// =====================================================

/** Herramientas disponibles en el editor */
export type DrawingTool =
  | 'pencil'    // lápiz fino
  | 'brush'     // pincel grueso
  | 'eraser'    // borrador
  | 'fill'      // cubeta de relleno
  | 'text'      // texto
  | 'line'      // línea recta
  | 'rect'      // rectángulo
  | 'circle'    // elipse
  | 'triangle'  // triángulo
  | 'star'      // estrella de 5 puntas
  | 'arrow'     // flecha

/** Modo de relleno de las formas */
export type FillMode = 'stroke' | 'fill' | 'both'

/** Fuentes seguras disponibles en todos los navegadores */
export type FontFamily =
  | 'Arial'
  | 'Georgia'
  | 'Courier New'
  | 'Verdana'
  | 'Trebuchet MS'

/** Estado global del editor.
 *
 * IMPORTANTE: Solo el mínimo de estado que necesita React para
 * re-renderizar la barra de herramientas. El dibujo real y el
 * historial de undo/redo viven en useRef dentro del hook para
 * no generar renders mientras el estudiante dibuja.
 */
export interface EditorState {
  tool:       DrawingTool
  color:      string
  size:       number
  eraserSize: number
  opacity:    number      // 0.1 – 1.0
  fillMode:   FillMode
  // Texto
  fontSize:   number
  fontFamily: FontFamily
  fontBold:   boolean
  fontItalic: boolean
  textAlign:  CanvasTextAlign
}

/** Un elemento de texto flotante antes de fijarlo al canvas */
export interface FloatingText {
  x:      number
  y:      number
  value:  string
}

/** Fases del nivel */
export type EscudoPhase = 'intro' | 'editor' | 'share' | 'finished'
