// =====================================================
// CATEGORÍAS DEL JUEGO — Mundo 2, Nivel 1: "Explorador de experiencias"
// =====================================================
//
// Este archivo es INDEPENDIENTE de los componentes visuales.
// Aquí se definen las seis categorías de la ruleta y las cuatro
// experiencias de cada una.
//
// ─────────────────────────────────────────────────────
// CÓMO EDITAR
//  - No cambies los `id` de las categorías ni de las experiencias:
//    se guardan en la base de datos.
//  - `label`, `description`, `emoji` y `tagline` son texto visible y
//    puedes editarlos con tranquilidad.
//  - Mantén SIEMPRE seis categorías y CUATRO experiencias por categoría:
//    la ruleta y la cuadrícula están pensadas para esas cantidades.
//
// El ORDEN de este array es el orden de los sectores de la ruleta,
// empezando arriba y girando en sentido horario.
// ─────────────────────────────────────────────────────

import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  // ══════════ 1 · Aire libre ══════════
  {
    id: 'aire_libre',
    label: 'Aire libre',
    emoji: '🌿',
    tagline: 'Sal, muévete y respira otro aire.',
    color: '#10b981',
    background: '#d1fae5',
    experiences: [
      {
        id: 'aire_libre_1',
        label: 'Camina y grábate',
        description: 'Sal a caminar y toma un video del lugar por donde vayas.',
        emoji: '🚶',
      },
      {
        id: 'aire_libre_2',
        label: 'Ejercicio en el parque',
        description: 'Busca el parque más cercano y grábate realizando cualquier ejercicio.',
        emoji: '🏃',
      },
      {
        id: 'aire_libre_3',
        label: 'Foto profesional',
        description: 'Toma una foto de manera profesional al objeto en la calle que más te llame la atención.',
        emoji: '📷',
      },
      {
        id: 'aire_libre_4',
        label: 'Paseo con compañía',
        description: 'Saca a pasear a tu mascota o sal a caminar con un amigo, puedes grabarte con él o ella.',
        emoji: '�',
      },
    ],
  },

  // ══════════ 2 · Cultura y entretenimiento ══════════
  {
    id: 'cultura',
    label: 'Cultura y entretenimiento',
    emoji: '🎭',
    tagline: 'Descubre algo nuevo que te inspire.',
    color: '#8b5cf6',
    background: '#ede9fe',
    experiences: [
      {
        id: 'cultura_1',
        label: 'Género distinto',
        description: 'Escucha música del género que menos te guste.',
        emoji: '🎵',
      },
      {
        id: 'cultura_2',
        label: 'Lectura y foto',
        description: 'Lee un artículo o revista y tómale foto a lo que más te gustó.',
        emoji: '📖',
      },
      {
        id: 'cultura_3',
        label: 'Tema de moda',
        description: 'Consulta sobre un tema de moda y sube una opinión de lo que crees.',
        emoji: '📰',
      },
      {
        id: 'cultura_4',
        label: 'Película compartida',
        description:
          'Mira una película ya sea virtual o presencialmente con un amigo de confianza y comparte opiniones sobre lo que vieron.',
        emoji: '�',
      },
    ],
  },

  // ══════════ 3 · Desarrollo personal ══════════
  {
    id: 'desarrollo',
    label: 'Desarrollo personal',
    emoji: '🌱',
    tagline: 'Haz algo hoy por la persona que quieres ser.',
    color: '#ec4899',
    background: '#fce7f3',
    experiences: [
      {
        id: 'desarrollo_1',
        label: 'Escrito de cómo te sientes',
        description: 'Haz un escrito de cómo te sientes hoy, publícalo si crees que es poético.',
        emoji: '📝',
      },
      {
        id: 'desarrollo_2',
        label: 'De casa al parque',
        description: 'Realiza una actividad que harías en casa, pero en un parque.',
        emoji: '🌳',
      },
      {
        id: 'desarrollo_3',
        label: 'Escrito investigativo',
        description: 'Haz un escrito de un tema investigativo que más te guste y publícalo.',
        emoji: '�',
      },
      {
        id: 'desarrollo_4',
        label: 'Cuestionario compartido',
        description: 'Crea un cuestionario de un tema que puedas investigar bien y compártelo a un amigo de confianza.',
        emoji: '❓',
      },
    ],
  },

  // ══════════ 4 · Retos personales ══════════
  {
    id: 'retos',
    label: 'Retos personales',
    emoji: '🎯',
    tagline: 'Atrévete a salir de tu zona cómoda.',
    color: '#f43f5e',
    background: '#ffe4e6',
    experiences: [
      {
        id: 'retos_1',
        label: 'Historia de 30 segundos',
        description: 'Graba una historia realizando algo en 30 segundos que jamás hayas subido.',
        emoji: '⏱️',
      },
      {
        id: 'retos_2',
        label: 'Tu canción favorita',
        description: 'Grábate escuchando tu canción favorita y fluye con ella.',
        emoji: '🎧',
      },
      {
        id: 'retos_3',
        label: 'Reseña de algo nuevo',
        description: 'Come algo nuevo con el fin de hacer una reseña pública.',
        emoji: '🍽️',
      },
      {
        id: 'retos_4',
        label: 'Récord de tu talento',
        description: 'Realiza un video en tiempo récord haciendo algo en lo que eres muy bueno, si gustas, publícalo.',
        emoji: '🏆',
      },
    ],
  },

  // ══════════ 5 · Creatividad ══════════
  {
    id: 'creatividad',
    label: 'Creatividad',
    emoji: '🎨',
    tagline: 'Crea algo que solo tú podrías hacer.',
    color: '#f59e0b',
    background: '#fef3c7',
    experiences: [
      {
        id: 'creatividad_1',
        label: 'Poema',
        description: 'Escribe un poema sobre algo que te guste.',
        emoji: '✍️',
      },
      {
        id: 'creatividad_2',
        label: 'Video de tu día',
        description: 'Haz un video contando tu día y edítalo como quieras.',
        emoji: '🎥',
      },
      {
        id: 'creatividad_3',
        label: 'Dibujo de un personaje',
        description: 'Dibuja el personaje que más te guste en hoja o lienzo.',
        emoji: '🖌️',
      },
      {
        id: 'creatividad_4',
        label: 'Fotos profesionales',
        description: 'Toma fotos de forma profesional con las herramientas que tengas a mano.',
        emoji: '📸',
      },
    ],
  },

  // ══════════ 6 · Social ══════════
  {
    id: 'social',
    label: 'Social',
    emoji: '👥',
    tagline: 'Comparte un momento con alguien.',
    color: '#3b82f6',
    background: '#dbeafe',
    experiences: [
      {
        id: 'social_1',
        label: 'Saludo pendiente',
        description: 'Saluda a alguien por cualquier red social con la que no hablas hace mucho.',
        emoji: '👋',
      },
      {
        id: 'social_2',
        label: 'Videollamada a gritos',
        description: 'Proponle a un amigo hacer una videollamada, pero tienen que gritar en lugar de hablar.',
        emoji: '📢',
      },
      {
        id: 'social_3',
        label: 'Conversación con imágenes',
        description: 'Pídele a un amigo que hablen con solo imágenes.',
        emoji: '🖼️',
      },
      {
        id: 'social_4',
        label: 'Video de tu día compartido',
        description: 'Dile a alguien de confianza que se envíen mutuamente un video contando su día hasta el momento.',
        emoji: '🤝',
      },
    ],
  },
]


export function findCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(category => category.id === id)
}
