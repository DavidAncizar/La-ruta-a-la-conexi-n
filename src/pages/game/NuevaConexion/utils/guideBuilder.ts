// =====================================================
// Constructor de la guía de conversación personalizada
// =====================================================
//
// Toma la ruta elegida y las opciones que el estudiante seleccionó en
// cada paso, y arma la guía final que podrá usar en la interacción real.

import type { ConnectionRoute, GuideLine } from '../types/connection'

/**
 * Arma la guía de conversación a partir de las opciones elegidas.
 *
 * `selectedOptionIds` está alineado por índice con `route.steps`:
 * la posición 0 es la opción elegida en el paso 0, y así sucesivamente.
 *
 * Si una selección falta o no coincide con ninguna opción del paso, esa
 * línea simplemente se omite (la guía nunca queda en un estado roto).
 */
export function buildGuide(
  route: ConnectionRoute,
  selectedOptionIds: string[]
): GuideLine[] {
  const lines: GuideLine[] = []

  route.steps.forEach((step, index) => {
    const selectedId = selectedOptionIds[index]
    if (!selectedId) return

    const option = step.options.find(opt => opt.id === selectedId)
    if (!option) return

    lines.push({
      label: step.guideLabel,
      text: option.guideText,
    })
  })

  return lines
}

/**
 * Convierte la guía en texto plano, listo para copiar al portapapeles
 * o para que el estudiante lo lea de corrido.
 */
export function guideToPlainText(route: ConnectionRoute, lines: GuideLine[]): string {
  const header = `Mi guía para conectar con: ${route.label}`
  const body = lines
    .map((line, i) => `${i + 1}. ${line.label}: ${line.text}`)
    .join('\n')

  return `${header}\n\n${body}`
}

/**
 * Indica si el estudiante ya eligió una opción en todos los pasos
 * de la ruta, es decir, si su guía está completa.
 */
export function isGuideComplete(
  route: ConnectionRoute,
  selectedOptionIds: string[]
): boolean {
  if (route.steps.length === 0) return false

  return route.steps.every((step, index) => {
    const selectedId = selectedOptionIds[index]
    return !!selectedId && step.options.some(opt => opt.id === selectedId)
  })
}
