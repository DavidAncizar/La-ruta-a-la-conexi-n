// =====================================================
// MAPA DEL NIVEL — Mundo 2, Nivel 2: "Banco del tiempo"
// =====================================================
//
// El escenario se define con datos, no con código de dibujo, para poder
// reacomodarlo sin tocar los componentes.
//
// ─────────────────────────────────────────────────────
// CÓMO FUNCIONA EL CAMINO
// ─────────────────────────────────────────────────────
// WALKABLE_AREAS es la lista de rectángulos por los que el avatar SÍ
// puede pasar (el camino y las plazas). Todo lo que quede fuera es
// césped con decoración y funciona como muro: el jugador no lo atraviesa.
//
// IMPORTANTE: dos zonas contiguas deben SOLAPARSE unas unidades. Si solo
// se tocan por el borde, se abre una costura por la que el avatar se
// queda atascado.
//
// ─────────────────────────────────────────────────────
// RECORRIDO
// ─────────────────────────────────────────────────────
//   INICIO (izquierda)
//     ↓ camino principal
//   CRUCE 1 ── arriba: callejón sin salida
//     ↓ abajo: plaza del BANCO 1
//     ↓ camino principal
//   CRUCE 2 ── abajo: callejón sin salida
//     ↓ arriba: plaza del BANCO 2
//     ↓ camino final
//   META (derecha)

import type { Bench, Decor, Rect, Vec2 } from '../types'

/** Punto donde aparece el avatar al empezar */
export const SPAWN_POINT: Vec2 = { x: 13, y: 40 }

/**
 * Zonas por las que se puede caminar.
 * El orden no importa: el avatar puede estar en cualquiera de ellas.
 */
export const WALKABLE_AREAS: Rect[] = [
  // Plaza inicial (izquierda)
  { x: 4,   y: 32, w: 22, h: 16 },
  // Camino principal, primer tramo
  { x: 24,  y: 36, w: 32, h: 8  },
  // Cruce 1: corredor vertical
  { x: 48,  y: 14, w: 9,  h: 52 },
  // Callejón sin salida de arriba
  { x: 42,  y: 8,  w: 22, h: 12 },
  // Plaza del BANCO 1 (abajo)
  { x: 38,  y: 56, w: 30, h: 18 },
  // Camino principal, segundo tramo
  { x: 55,  y: 36, w: 36, h: 8  },
  // Cruce 2: corredor vertical
  { x: 84,  y: 10, w: 9,  h: 52 },
  // Plaza del BANCO 2 (arriba)
  { x: 74,  y: 6,  w: 28, h: 16 },
  // Callejón sin salida de abajo
  { x: 78,  y: 52, w: 24, h: 14 },
  // Camino final
  { x: 90,  y: 36, w: 26, h: 8  },
  // Plaza de la meta (derecha)
  { x: 104, y: 28, w: 14, h: 24 },
]

/** Los dos bancos interactivos */
export const BENCHES: Bench[] = [
  {
    id: 'bank_1',
    position: { x: 50, y: 68 },
    interactionRadius: 9,
    title: 'Banco del tiempo',
  },
  {
    id: 'bank_2',
    position: { x: 88, y: 14 },
    interactionRadius: 9,
    title: 'Banco del tiempo',
  },
]

/** Zona meta: al entrar aquí (y solo al final) el nivel se completa */
export const GOAL_AREA: Rect = { x: 106, y: 32, w: 11, h: 16 }

/**
 * Decoración ambiental. Va FUERA de las zonas transitables, así enmarca
 * el camino y orienta al jugador de forma natural.
 * No bloquea nada: los límites del camino ya hacen ese trabajo.
 */
export const DECORATIONS: Decor[] = [
  // ── Alrededor de la plaza inicial ──
  { kind: 'tree',   position: { x: 8,   y: 24 }, scale: 1.1 },
  { kind: 'tree',   position: { x: 19,  y: 22 } },
  { kind: 'bush',   position: { x: 30,  y: 26 } },
  { kind: 'flower', position: { x: 6,   y: 54 } },
  { kind: 'tree',   position: { x: 14,  y: 58 }, scale: 1.15 },
  { kind: 'rock',   position: { x: 26,  y: 55 } },
  { kind: 'flower', position: { x: 34,  y: 50 } },
  { kind: 'lamp',   position: { x: 22,  y: 31 } },

  // ── Cruce 1 y callejón de arriba ──
  { kind: 'tree',   position: { x: 38,  y: 16 }, scale: 1.05 },
  { kind: 'flower', position: { x: 68,  y: 12 } },
  { kind: 'rock',   position: { x: 70,  y: 22 } },
  { kind: 'bush',   position: { x: 40,  y: 28 } },
  { kind: 'flower', position: { x: 60,  y: 28 } },

  // ── Plaza del banco 1 ──
  { kind: 'tree',   position: { x: 34,  y: 66 }, scale: 1.2 },
  { kind: 'tree',   position: { x: 72,  y: 64 } },
  { kind: 'flower', position: { x: 42,  y: 52 } },
  { kind: 'flower', position: { x: 64,  y: 52 } },
  { kind: 'rock',   position: { x: 44,  y: 76 } },
  { kind: 'bush',   position: { x: 60,  y: 76 } },

  // ── Camino central ──
  { kind: 'bush',   position: { x: 66,  y: 32 } },
  { kind: 'flower', position: { x: 76,  y: 32 } },
  { kind: 'lamp',   position: { x: 80,  y: 47 } },
  { kind: 'rock',   position: { x: 70,  y: 48 } },

  // ── Plaza del banco 2 ──
  { kind: 'tree',   position: { x: 70,  y: 14 }, scale: 1.1 },
  { kind: 'tree',   position: { x: 106, y: 12 } },
  { kind: 'flower', position: { x: 78,  y: 26 } },
  { kind: 'flower', position: { x: 98,  y: 26 } },
  { kind: 'bush',   position: { x: 88,  y: 27 } },

  // ── Callejón de abajo ──
  { kind: 'rock',   position: { x: 76,  y: 70 } },
  { kind: 'tree',   position: { x: 104, y: 60 } },
  { kind: 'flower', position: { x: 90,  y: 70 } },
  { kind: 'bush',   position: { x: 74,  y: 48 } },

  // ── Meta ──
  { kind: 'tree',   position: { x: 100, y: 40 }, scale: 0.95 },
  { kind: 'flower', position: { x: 110, y: 24 } },
  { kind: 'flower', position: { x: 114, y: 56 } },
  { kind: 'lamp',   position: { x: 102, y: 30 } },
]

/** Carteles que orientan al jugador dentro del propio escenario */
export const SIGNPOSTS: { position: Vec2; text: string }[] = [
  { position: { x: 13,  y: 46 }, text: 'INICIO' },
  { position: { x: 52,  y: 58 }, text: '🪑 Banco 1' },
  { position: { x: 88,  y: 20 }, text: '🪑 Banco 2' },
  { position: { x: 111, y: 46 }, text: '🏁 META' },
]
