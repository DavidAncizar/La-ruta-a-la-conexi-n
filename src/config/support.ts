/**
 * ═══════════════════════════════════════════════════════════════════
 *  CONFIGURACIÓN DE LA PESTAÑA "¿Quieres hablar con alguien?"
 *  ─────────────────────────────────────────────────────────────────
 *  ➜ EDITA ESTE ARCHIVO cuando tengas el formulario y el nombre.
 *  Solo necesitas cambiar los dos valores marcados con ✏️.
 * ═══════════════════════════════════════════════════════════════════
 */

/** ✏️ Nombre de la psico-orientadora del colegio (ej. "Ana María Pérez") */
export const PSYCHOLOGIST_NAME = 'NOMBRE DE LA PSICO-ORIENTADORA'

/**
 * ✏️ Enlace del formulario (Google Forms, Microsoft Forms, etc.).
 * Mientras valga '' (vacío) el botón del formulario aparece desactivado
 * con el aviso "Muy pronto".
 */
export const SUPPORT_FORM_URL = ''

/** Líneas de ayuda de Colombia (verificadas en icbf.gov.co y policia.gov.co) */
export const HELP_LINES: { name: string; number: string; detail: string }[] = [
  { name: 'Línea 141 del ICBF', number: '141', detail: 'Gratuita. Para niñas, niños y adolescentes que necesitan orientación o están en riesgo.' },
  { name: 'Emergencias', number: '123', detail: 'Si tú o alguien más está en peligro ahora mismo.' },
]
