import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config'

interface DrawingCanvasProps {
  canvasRef:  React.RefObject<HTMLCanvasElement>
  overlayRef: React.RefObject<HTMLCanvasElement>
  previewRef: React.RefObject<HTMLCanvasElement>
}

/**
 * Área de dibujo: tres canvas apilados.
 *
 *   1. `main`    (abajo)  — el dibujo del estudiante, recibe eventos
 *   2. `preview` (medio)  — previsualización de formas vectoriales
 *   3. `overlay` (arriba) — borde del escudo, siempre visible
 *
 * El contenedor usa `position: relative` para que el TextOverlay
 * flotante se posicione correctamente sobre él.
 */
export default function DrawingCanvas({ canvasRef, overlayRef, previewRef }: DrawingCanvasProps) {
  return (
    <div className="ep-canvas-wrap">
      <canvas ref={canvasRef}  width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
        className="ep-canvas ep-canvas--main"
        aria-label="Área de dibujo del escudo personal" role="img" />
      <canvas ref={previewRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
        className="ep-canvas ep-canvas--preview" aria-hidden="true" />
      <canvas ref={overlayRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
        className="ep-canvas ep-canvas--overlay" aria-hidden="true" />
    </div>
  )
}
