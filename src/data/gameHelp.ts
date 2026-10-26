/**
 * Ayuda "¿Cómo se juega?" de cada juego.
 *
 * Se indexa por `mechanic` (el mismo valor que usa GamePage para elegir el
 * componente de juego). Los textos están pensados para estudiantes de
 * 8° a 11°: frases cortas, un paso por línea y sin términos técnicos.
 */

export interface GameHelpStep {
  emoji: string
  text: string
}

export interface GameHelpContent {
  /** Nombre del juego tal como lo ve el estudiante */
  name: string
  emoji: string
  /** Una sola frase: de qué trata el juego */
  goal: string
  /** Pasos en orden, tal cual los vive el estudiante */
  steps: GameHelpStep[]
  /** Con quién se juega / qué hacer fuera de la app */
  withWhom: string
  /** Consejos para quien se queda trabado */
  stuckTips: string[]
}

/** Mensaje que se repite en TODOS los juegos (la app es un punto de partida) */
export const SOCIAL_REMINDER =
  'Todos los juegos se viven con otras personas: por redes sociales (chat, ' +
  'llamada o mensajes) o en persona con un amigo o en grupo. La app te da ' +
  'la idea y tú la haces en la vida real.'

export const GAME_HELP: Record<string, GameHelpContent> = {
  // Mundo 1 · Nivel 1 — Poder de decisión
  roulette: {
    name: 'El poder de tu decisión',
    emoji: '🎯',
    goal: 'Recibes retos cortos y tú decides cuáles aceptar. Ganas XP por los que sí haces.',
    steps: [
      { emoji: '🎲', text: 'Pulsa "Comenzar reto". La app te muestra un reto al azar.' },
      { emoji: '✋', text: 'Elige: aceptarlo, rechazarlo o cambiarlo por otro.' },
      { emoji: '🤝', text: 'Si lo aceptas, hazlo de verdad (con un amigo o por chat) y vuelve a la app.' },
      { emoji: '✅', text: 'Marca que lo completaste. Si quieres, sube una evidencia (es opcional).' },
      { emoji: '🏆', text: 'Repite hasta terminar todos los retos para ganar el XP completo.' },
    ],
    withWhom:
      'Haz los retos con un amigo en persona o escríbele por redes para cumplirlos juntos. En grupo es más divertido.',
    stuckTips: [
      'Si un reto no te convence, usa "Cambiar": no pierdes nada.',
      'No tienes que hacerlo todo en un día. Puedes salir y volver cuando estés con alguien.',
      'Solo ganas XP por lo que completas de verdad, así que acepta los que sí puedas hacer.',
    ],
  },

  // Mundo 1 · Nivel 2 — Nueva conexión
  interactive_map: {
    name: 'Nueva conexión',
    emoji: '🗺️',
    goal: 'Eliges a una persona con quien normalmente no hablas y empiezas una conversación real.',
    steps: [
      { emoji: '📍', text: 'En el mapa, elige a quién te quieres acercar.' },
      { emoji: '🧩', text: 'Arma tu guía de conversación paso a paso (qué decir para empezar).' },
      { emoji: '💬', text: 'Sal de la app y habla con esa persona: por chat, redes o en persona.' },
      { emoji: '📸', text: 'Vuelve, cuéntanos cómo te fue y, si quieres, sube tu evidencia.' },
    ],
    withWhom:
      'La conversación es con una persona real: puede ser por mensajes o en persona. Si te da pena, ve con un amigo que te acompañe.',
    stuckTips: [
      'La guía no es un guion: úsala como apoyo y habla con tus propias palabras.',
      '¿No sabes a quién elegir? Empieza por la opción que te parezca más fácil.',
      'Nada de lo que hablas se guarda en la app.',
    ],
  },

  // Mundo 2 · Nivel 1 — Explorador de experiencias
  disconnect_challenge: {
    name: 'Explorador de experiencias',
    emoji: '🎡',
    goal: 'Giras una ruleta, eliges una experiencia nueva y la vives fuera del celular.',
    steps: [
      { emoji: '🎡', text: 'Pulsa para girar la ruleta. Cae en una de las 6 categorías.' },
      { emoji: '👀', text: 'Verás 4 experiencias. Elige la que más te llame la atención.' },
      { emoji: '🧑‍🤝‍🧑', text: 'Hazla en la vida real con un amigo o en grupo. Si están lejos, planéenla por chat o videollamada.' },
      { emoji: '📸', text: 'Registra tu evidencia y termina el nivel.' },
    ],
    withWhom:
      'Inviten a un amigo o a varios compañeros. Se puede en persona o coordinando por redes sociales.',
    stuckTips: [
      'Si no te gusta la categoría, puedes volver a jugar el nivel y girar de nuevo.',
      'Elige algo fácil de hacer hoy, no lo más difícil.',
      'La evidencia es opcional: lo importante es que lo vivas.',
    ],
  },

  // Mundo 2 · Nivel 2 — Banco del tiempo
  quiz: {
    name: 'Banco del tiempo',
    emoji: '🪑',
    goal: 'Recorres un parque, encuentras dos bancos y haces una misión con otra persona en cada uno.',
    steps: [
      { emoji: '🚶', text: 'Muévete con W A S D o las flechas (en celular usa los botones en pantalla).' },
      { emoji: '🪑', text: 'Acércate a un banco y pulsa E (o toca el banco) para interactuar.' },
      { emoji: '📝', text: 'Lee la misión y elige lo que quieres compartir o aprender.' },
      { emoji: '🤝', text: 'Sal de la app, haz la misión con alguien y vuelve cuando termines.' },
      { emoji: '🏁', text: 'Repite con el segundo banco y camina hasta la meta.' },
    ],
    withWhom:
      'Cada misión es con otra persona: un amigo en persona, tu grupo o alguien a quien le escribas por redes.',
    stuckTips: [
      'Si no ves qué hacer, busca el banco más cercano: tiene un aviso encima.',
      'En el celular usa el D-pad táctil que aparece abajo.',
      'El temporizador es para acompañarte, no para presionarte.',
    ],
  },

  // Mundo 3 · Nivel 1 — Sé auténtico
  decision_simulator: {
    name: 'Sé auténtico, más allá de un like',
    emoji: '💬',
    goal: 'Comparas una reacción rápida (un like) con una conversación de verdad, y practicas la segunda.',
    steps: [
      { emoji: '👍', text: 'Mira la primera publicación y reacciona como lo harías normalmente.' },
      { emoji: '🧠', text: 'Luego verás otra forma: mostrar curiosidad y escribir algo real.' },
      { emoji: '🎯', text: 'Te proponemos un reto de conversación con una persona.' },
      { emoji: '💬', text: 'Habla con ella por redes o en persona y vuelve a contarnos.' },
    ],
    withWhom:
      'El reto final es con una persona real: puede ser un mensaje por redes o una charla en persona con un amigo.',
    stuckTips: [
      'No necesitas contar algo íntimo. Basta con mostrar interés genuino.',
      'Una pregunta simple como "¿cómo te fue hoy?" ya cuenta.',
      'Si no sabes cómo empezar, usa las frases de ánimo que aparecen en pantalla.',
    ],
  },

  // Mundo 3 · Nivel 2 — Escudo personal
  reflection: {
    name: 'Escudo personal',
    emoji: '🛡️',
    goal: 'Diseñas un escudo que represente algo de ti y lo compartes con otras personas.',
    steps: [
      { emoji: '🎨', text: 'Dibuja, escribe, borra y cambia colores con la barra de herramientas.' },
      { emoji: '✍️', text: 'Agrega texto para decir qué te representa (tus valores, gustos o fortalezas).' },
      { emoji: '💾', text: 'Cuando termines, guarda tu escudo.' },
      { emoji: '📤', text: 'Compártelo con un amigo o grupo y cuéntales qué significa.' },
    ],
    withWhom:
      'Compartan sus escudos por redes sociales o en persona. Pueden hacerlo juntos y comparar.',
    stuckTips: [
      'No hay escudo correcto o incorrecto: es tuyo.',
      'Empieza con una forma y un color, después agregas detalles.',
      'Si te equivocas, usa borrar. Puedes rehacerlo cuantas veces quieras.',
    ],
  },
}
