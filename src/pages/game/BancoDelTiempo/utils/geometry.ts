// =====================================================
// Geometría del escenario: colisiones y distancias
// =====================================================
//
// Funciones puras, sin React ni DOM. Se pueden razonar y probar por
// separado de la parte visual.

import type { Rect, Vec2 } from '../types'

/** ¿El punto está dentro del rectángulo? (bordes incluidos) */
export function pointInRect(x: number, y: number, rect: Rect): boolean {
  return (
    x >= rect.x &&
    x <= rect.x + rect.w &&
    y >= rect.y &&
    y <= rect.y + rect.h
  )
}

/**
 * ¿El avatar cabe completo en el camino si su centro está en (cx, cy)?
 *
 * Se comprueban las cuatro esquinas de su caja: cada una debe caer en
 * alguna zona transitable. Como las zonas contiguas se solapan, una
 * esquina en una zona y otra en la vecina es válido, y el avatar cruza
 * los empalmes sin atascarse.
 */
export function canStandAt(
  cx: number,
  cy: number,
  halfSize: number,
  areas: Rect[]
): boolean {
  const corners: [number, number][] = [
    [cx - halfSize, cy - halfSize],
    [cx + halfSize, cy - halfSize],
    [cx - halfSize, cy + halfSize],
    [cx + halfSize, cy + halfSize],
  ]

  return corners.every(([x, y]) => areas.some(area => pointInRect(x, y, area)))
}

/**
 * Mueve el avatar respetando los muros.
 *
 * Los ejes se resuelven por separado: si el movimiento en X choca, se
 * intenta igualmente el de Y. Así, al caminar en diagonal contra una
 * pared, el avatar se desliza a lo largo de ella en lugar de quedarse
 * clavado, que es lo que se espera en un juego.
 */
export function resolveMovement(
  current: Vec2,
  deltaX: number,
  deltaY: number,
  halfSize: number,
  areas: Rect[]
): Vec2 {
  let { x, y } = current

  if (deltaX !== 0 && canStandAt(x + deltaX, y, halfSize, areas)) {
    x += deltaX
  }

  if (deltaY !== 0 && canStandAt(x, y + deltaY, halfSize, areas)) {
    y += deltaY
  }

  return { x, y }
}

/** Distancia entre dos puntos */
export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
