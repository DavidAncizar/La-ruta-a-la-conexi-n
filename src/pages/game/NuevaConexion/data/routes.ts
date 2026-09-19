// =====================================================
// RUTAS DEL JUEGO — Mundo 1, Nivel 2: "Nueva Conexión"
// =====================================================
//
// Este archivo es INDEPENDIENTE de los componentes visuales.
// Aquí se definen las cinco rutas (contextos) del mapa interactivo y
// los cuatro pasos que el estudiante recorre en cada una para armar
// su guía de conversación.
//
// ─────────────────────────────────────────────────────
// ESTRUCTURA COMÚN A LAS 5 RUTAS
// ─────────────────────────────────────────────────────
// Cada ruta tiene los mismos cuatro pasos, con opciones propias:
//
//     PASO 1 — ACÉRCATE
//     PASO 2 — PREGUNTA
//     PASO 3 — ENCUENTRA ALGO EN COMÚN
//     PASO 4 — DEJA ABIERTA LA CONVERSACIÓN
//
// El estudiante elige una opción por paso. Al terminar, esas cuatro
// opciones se convierten en su "Guía de tu conexión".
//
// NOTA IMPORTANTE
// Las frases son ejemplos naturales para practicar habilidades de
// iniciación, intercambio de información, búsqueda de intereses
// comunes, continuidad y cierre. No se presentan como frases
// "científicamente validadas" dentro de la aplicación.
//
// ─────────────────────────────────────────────────────
// CÓMO EDITAR
//  - No cambies los `id` de las rutas: se guardan en la base de datos.
//  - Los `id` de pasos y opciones deben ser únicos dentro de su ruta.
//  - `label` es la frase que se muestra como opción y también la que
//    aparece tal cual en la guía final (son la misma frase).
//  - `guideLabel` es el título de esa sección en la guía final.
//  - Puedes editar los textos con tranquilidad, pero mantén las cuatro
//    secciones (Acércate / Pregunta / Conexión / Continuidad).
// ─────────────────────────────────────────────────────

import type { ConnectionRoute, ConnectionStep } from '../types/connection'

// ─────────────────────────────────────────────────────
// Helper: construye los 4 pasos de una ruta a partir de las 3 opciones
// de cada uno. Todas las rutas comparten la misma estructura, así que
// solo cambian las frases.
// ─────────────────────────────────────────────────────
function buildSteps(config: {
  acercamiento: [string, string, string]
  pregunta:     [string, string, string]
  conexion:     [string, string, string]
  continuidad:  [string, string, string]
}): ConnectionStep[] {
  const toOptions = (phrases: [string, string, string]) =>
    phrases.map((phrase, i) => ({
      id: (['a', 'b', 'c'] as const)[i],
      // El texto de la opción y el que va a la guía final son el mismo:
      // la frase que el estudiante puede usar tal cual.
      label: phrase,
      guideText: phrase,
    }))

  return [
    {
      id: 'acercamiento',
      title: 'Acércate',
      description: 'Elige cómo vas a empezar la conversación.',
      guideLabel: 'CÓMO ACERCARTE',
      options: toOptions(config.acercamiento),
    },
    {
      id: 'pregunta',
      title: 'Pregunta',
      description: 'Elige qué le vas a preguntar para conocerle mejor.',
      guideLabel: 'QUÉ PREGUNTAR',
      options: toOptions(config.pregunta),
    },
    {
      id: 'conexion',
      title: 'Encuentra algo en común',
      description: 'Elige cómo vas a mostrar que tienen algo en común.',
      guideLabel: 'CÓMO ENCONTRAR LA CONEXIÓN',
      options: toOptions(config.conexion),
    },
    {
      id: 'continuidad',
      title: 'Deja abierta la conversación',
      description: 'Elige cómo vas a cerrar para que la conexión siga.',
      guideLabel: 'CÓMO CONTINUAR',
      options: toOptions(config.continuidad),
    },
  ]
}

// ─────────────────────────────────────────────────────
// LAS 5 RUTAS DEL JUEGO
// ─────────────────────────────────────────────────────
export const CONNECTION_ROUTES: ConnectionRoute[] = [
  // ══════════ RUTA 1 ══════════
  {
    id: 'curso',
    label: 'Alguien de tu curso',
    shortLabel: 'Tu curso',
    emoji: '👥',
    description: 'Alguien de tu salón con quien casi nunca hablas.',
    missionIntro:
      'Tienes compañeros de salón que ves todos los días pero con quienes nunca has ' +
      'hablado de verdad. Hoy vas a cambiar eso con una sola conversación.',
    color: '#3b82f6',
    background: '#dbeafe',
    steps: buildSteps({
      acercamiento: [
        '«Oye, ¿tú entendiste el punto 3 del taller? Es que no me quedó claro.»',
        '«¿Ya viste qué nos dejaron de tarea? Se me pasó anotarlo.»',
        '«Siempre te veo dibujando, ¿qué te gusta hacer?»',
      ],
      pregunta: [
        '«¿Qué música escuchas normalmente?»',
        '«¿Qué haces normalmente en tu tiempo libre?»',
        '«¿Qué cosas te gusta hacer?»',
      ],
      conexion: [
        '«¿En serio? A mí también me gusta.»',
        '«Qué coincidencia, yo también hago eso.»',
        '«Yo también estoy interesado en eso.»',
      ],
      continuidad: [
        '«Ah, bacano. En el próximo descanso seguimos hablando.»',
        '«Me pareció chévere hablar contigo.»',
        '«Cuando hagamos la próxima actividad podemos trabajar juntos.»',
      ],
    }),
  },

  // ══════════ RUTA 2 ══════════
  {
    id: 'otro_curso',
    label: 'Alguien de otro curso',
    shortLabel: 'Otro curso',
    emoji: '🧑‍🤝‍🧑',
    description: 'Una persona de otro curso que ves en el colegio.',
    missionIntro:
      'Sales de tu salón y el colegio se vuelve más grande. Vas a acercarte a alguien ' +
      'de otro curso al que reconoces, pero con quien nunca has cruzado palabra.',
    color: '#8b5cf6',
    background: '#ede9fe',
    steps: buildSteps({
      acercamiento: [
        '«Oye, creo que nunca habíamos hablado. ¿Tú también eres de este colegio?»',
        '«¿Ustedes también tienen examen de [materia] esta semana?»',
        '«¿Tu curso también está preparando algo para la próxima actividad?»',
      ],
      pregunta: [
        '«¿Qué hacen normalmente en los descansos?»',
        '«¿Qué actividad te gusta más del colegio?»',
        '«¿Qué cosas te gusta hacer fuera de clase?»',
      ],
      conexion: [
        '«A mí también me gusta eso.»',
        '«Qué coincidencia, a nosotros también nos interesa.»',
        '«Yo también hago eso.»',
      ],
      continuidad: [
        '«Ya que nos conocimos, nos saludamos cuando nos crucemos.»',
        '«Después me cuentas cómo les fue.»',
        '«Cuando nos volvamos a ver seguimos hablando.»',
      ],
    }),
  },

  // ══════════ RUTA 3 ══════════
  {
    id: 'otro_grado',
    label: 'Alguien de otro grado',
    shortLabel: 'Otro grado',
    emoji: '🪜',
    description: 'Alguien de un grado diferente al tuyo.',
    missionIntro:
      'Hablar con alguien de otro grado puede dar más nervios, y justo por eso vale ' +
      'la pena. Vas a descubrir que tienen más en común de lo que imaginas.',
    color: '#10b981',
    background: '#d1fae5',
    steps: buildSteps({
      acercamiento: [
        '«Oye, ¿cómo es estar en [grado]? Nosotros todavía no llegamos allá.»',
        '«¿Ustedes también tienen tanta tarea?»',
        '«Creo que nunca habíamos hablado, ¿cómo te llamas?»',
      ],
      pregunta: [
        '«¿Qué es lo que más te gusta de tu grado?»',
        '«¿Qué haces normalmente en los descansos?»',
        '«¿Qué actividades te gustan?»',
      ],
      conexion: [
        '«A nosotros también nos gusta eso.»',
        '«A mí también me interesa.»',
        '«Qué coincidencia, yo también hago eso.»',
      ],
      continuidad: [
        '«Cuando nos veamos otra vez nos saludamos.»',
        '«Después me cuentas más sobre eso.»',
        '«Nos vemos por aquí entonces.»',
      ],
    }),
  },

  // ══════════ RUTA 4 ══════════
  {
    id: 'barrio',
    label: 'Alguien de tu barrio',
    shortLabel: 'Tu barrio',
    emoji: '🏠',
    description: 'Una persona que encuentras cerca de donde vives.',
    missionIntro:
      'Tu barrio está lleno de personas que ves seguido sin conocer. Vas a dar el ' +
      'primer paso con alguien que vive cerca de ti.',
    color: '#f59e0b',
    background: '#fef3c7',
    steps: buildSteps({
      acercamiento: [
        '«Creo que siempre te veo por aquí, ¿vives cerca?»',
        '«¿Tú también vienes normalmente a este parque?»',
        '«Creo que nunca habíamos hablado, ¿cómo te llamas?»',
      ],
      pregunta: [
        '«¿Qué haces normalmente por aquí?»',
        '«¿Juegas algún deporte?»',
        '«¿Qué te gusta hacer en tu tiempo libre?»',
      ],
      conexion: [
        '«Yo también hago eso.»',
        '«Qué coincidencia, a mí también me gusta.»',
        '«También suelo venir por aquí.»',
      ],
      continuidad: [
        '«Cuando nos veamos por acá nos saludamos.»',
        '«La próxima vez que jueguen me avisas.»',
        '«Nos vemos por aquí entonces.»',
      ],
    }),
  },

  // ══════════ RUTA 5 ══════════
  {
    id: 'red_social',
    label: 'Alguien de tu red social',
    shortLabel: 'Red social',
    emoji: '💬',
    description: 'Alguien con quien compartes un interés en una red social.',
    missionIntro:
      'Tienes contactos con los que compartes gustos pero nunca has hablado en serio. ' +
      'Vas a convertir ese interés en común en una conversación real.',
    // Aviso de seguridad digital exclusivo de esta ruta.
    safetyNote:
      'Busca a alguien con quien compartas un interés dentro de un espacio digital ' +
      'apropiado. No compartas dirección, número de teléfono, contraseñas, información ' +
      'familiar ni imágenes privadas.',
    color: '#ec4899',
    background: '#fce7f3',
    steps: buildSteps({
      acercamiento: [
        '«Vi que también te gusta [tema], ¿qué es lo que más te gusta de eso?»',
        '«Vi que compartiste algo sobre [tema]. ¿Qué fue lo que más te llamó la atención?»',
        '«También me interesa [tema], ¿cómo empezaste a conocerlo?»',
      ],
      pregunta: [
        '«¿Hace cuánto te interesa ese tema?»',
        '«¿Qué es lo que más te gusta de eso?»',
        '«¿Qué contenido recomiendas sobre ese tema?»',
      ],
      conexion: [
        '«A mí también me gusta.»',
        '«Tenemos ese interés en común.»',
        '«No sabía que a alguien más de aquí también le interesaba.»',
      ],
      continuidad: [
        '«Estuvo chévere hablar sobre eso.»',
        '«Cuando vuelva a encontrar algo sobre ese tema lo compartiré.»',
        '«Si vuelven a hablar de eso, me gustaría participar.»',
      ],
    }),
  },
]

/** Busca una ruta por su id. Devuelve undefined si no existe. */
export function findRouteById(id: string): ConnectionRoute | undefined {
  return CONNECTION_ROUTES.find(route => route.id === id)
}
