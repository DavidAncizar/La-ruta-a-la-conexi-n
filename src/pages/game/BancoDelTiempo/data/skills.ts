// =====================================================
// CATEGORÍAS DE HABILIDAD — Banco 1 del "Banco del tiempo"
// =====================================================
//
// Las siete categorías entre las que el estudiante elige para enseñar
// algo que sabe hacer bien.
//
// ─────────────────────────────────────────────────────
// CÓMO EDITAR
//  - No cambies los `id`: se guardarán en la base de datos.
//  - `label`, `description`, `examples` y `missionName` son texto
//    visible y se pueden editar con tranquilidad.
//  - `examples` alimenta la lista de la pantalla de misión. Cuatro
//    ejemplos por categoría funcionan bien visualmente.
// ─────────────────────────────────────────────────────

import type { SkillCategory, SkillCategoryId } from '../types'

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'musica',
    label: 'Música',
    missionName: 'MÚSICA',
    emoji: '🎸',
    description: 'Tocar un instrumento, cantar, crear ritmos o enseñar una técnica musical.',
    examples: [
      'Tocar un instrumento',
      'Cantar una canción',
      'Crear un ritmo',
      'Enseñar un acorde',
    ],
    color: '#8b5cf6',
    background: '#ede9fe',
  },
  {
    id: 'deporte',
    label: 'Deporte',
    missionName: 'DEPORTE',
    emoji: '⚽',
    description: 'Un movimiento, ejercicio, técnica, regate o habilidad deportiva.',
    examples: [
      'Un regate o finta',
      'Un ejercicio de calentamiento',
      'Una técnica de tiro',
      'Un truco con el balón',
    ],
    color: '#10b981',
    background: '#d1fae5',
  },
  {
    id: 'cocina',
    label: 'Cocina',
    missionName: 'COCINA',
    emoji: '🍳',
    description: 'Una receta, preparación o técnica que conozcas.',
    examples: [
      'Una receta sencilla',
      'Una preparación rápida',
      'Una técnica de corte',
      'Un postre fácil',
    ],
    color: '#f59e0b',
    background: '#fef3c7',
  },
  {
    id: 'magia',
    label: 'Magia',
    missionName: 'MAGIA',
    emoji: '🎩',
    description: 'Un truco de magia, cartas, ilusión o juego de manos.',
    examples: [
      'Un truco con cartas',
      'Un juego de manos',
      'Una ilusión sencilla',
      'Un truco con monedas',
    ],
    color: '#6366f1',
    background: '#e0e7ff',
  },
  {
    id: 'arte',
    label: 'Arte',
    missionName: 'ARTE',
    emoji: '🎨',
    description: 'Dibujo, pintura, manualidades u otra habilidad artística.',
    examples: [
      'Dibujar un personaje',
      'Una técnica de pintura',
      'Una manualidad',
      'Hacer una figura de origami',
    ],
    color: '#ec4899',
    background: '#fce7f3',
  },
  {
    id: 'curiosa',
    label: 'Truco o habilidad curiosa',
    missionName: 'HABILIDAD CURIOSA',
    emoji: '🧠',
    description: 'Una habilidad poco común, un truco, destreza o conocimiento curioso.',
    examples: [
      'Una destreza poco común',
      'Un truco mental',
      'Algo que casi nadie sabe hacer',
      'Un dato curioso que sorprenda',
    ],
    color: '#0ea5e9',
    background: '#e0f2fe',
  },
  {
    id: 'baile',
    label: 'Baile',
    missionName: 'BAILE',
    emoji: '💃',
    description: 'Un paso, movimiento o pequeña coreografía.',
    examples: [
      'Un paso de baile',
      'Un movimiento concreto',
      'Una coreografía corta',
      'Un ritmo con el cuerpo',
    ],
    color: '#f43f5e',
    background: '#ffe4e6',
  },
]

/** Busca una categoría por su id. Devuelve undefined si no existe. */
export function findSkillById(id: SkillCategoryId | null): SkillCategory | undefined {
  if (!id) return undefined
  return SKILL_CATEGORIES.find(skill => skill.id === id)
}
