// BANCO DE RETOS — Mundo 1, Nivel 1: "El poder de tu decisión"

// Este archivo es INDEPENDIENTE del componente visual.
// Aquí se define el banco completo de 12 retos del juego.

// En cada partida se seleccionan 5 retos al azar de este banco
  // (ver src/pages/game/RetoJuego/utils/challengeSelection.ts).

import type { Challenge } from '../types/challenge'

// AQUÍ SE REGISTRAN LOS 12 RETOS DEL JUEGO
export const CHALLENGES: Challenge[] = [
  {
    id: 1,
    category: 'placeholder',
    title: 'Reto 1',
    description: 'Saluda por cualquier red Social preferida a un amig@ con el que no hablas hace 1 mes.',
    evidenceRequired: true,
  },
  {
    id: 2,
    category: 'placeholder',
    title: 'Reto 2',
    description: 'Comparte una historia por tu red social preferida realizando la actividad que más te gusta.',
    evidenceRequired: true,
  },
  {
    id: 3,
    category: 'placeholder',
    title: 'Reto 3',
    description: 'Escribe un comentario en la foto de un amig@ de confianza en cualquier red social.',
    evidenceRequired: true,
  },
  {
    id: 4,
    category: 'placeholder',
    title: 'Reto 4',
    description: 'Comparte una historia en tu red social de confianza de ti sin usar filtro.',
    evidenceRequired: true,
  },
  {
    id: 5,
    category: 'placeholder',
    title: 'Reto 5',
    description: 'Comparte un comentario o una nota en tu red social preferida sobre algo que te disguste.',
    evidenceRequired: true,
  },
  {
    id: 6,
    category: 'placeholder',
    title: 'Reto 6',
    description: 'Comparte una historia de 15 segundos en tu red social preferida hablando de como estuvo tu día.',
    evidenceRequired: true,
  },
  {
    id: 7,
    category: 'placeholder',
    title: 'Reto 7',
    description: 'Comparte una historia en tu red social preferida realizando un logro personal (Deporte, juego, manualidad, curso).',
    evidenceRequired: true,
  },
  {
    id: 8,
    category: 'placeholder',
    title: 'Reto 8',
    description: 'Comparte en tu red social preferida una historia o nota preguntando la opinión de un tema que conozcas bien.',
    evidenceRequired: true,
  },
  {
    id: 9,
    category: 'placeholder',
    title: 'Reto 9',
    description: 'Comparte una publicación entretenida (meme) que más te gusta en un grupo social de tu red preferida.',
    evidenceRequired: true,
  },
  {
    id: 10,
    category: 'placeholder',
    title: 'Reto 10',
    description: 'Sube una publicación o historia en tu red social preferidad una foto con o de tu mejor amigo opinando de el.',
    evidenceRequired: true,
  },
  {
    id: 11,
    category: 'placeholder',
    title: 'Reto 11',
    description: 'Comparte en tu red social preferida una historia o publicación sobre algo que este de moda y no estes de acuerdo.',
    evidenceRequired: true,
  },
  {
    id: 12,
    category: 'placeholder',
    title: 'Reto 12',
    description: 'Comparte en tu red social preferida una foto de tu mascota ó de tu animal favorita opinando de el.',
    evidenceRequired: true,
  },
]
