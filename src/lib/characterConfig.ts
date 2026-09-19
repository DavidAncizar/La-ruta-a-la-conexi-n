// =====================================================
// Sistema de Avatar — Personajes completos (foto de perfil)
// Reemplaza el antiguo sistema de accesorios por partes (Kenney).
// Las imágenes viven en /public/characters y siguen el patrón
// "<mundo>_mundo_<personaje>.jpg". El prefijo del archivo determina
// en qué mundo se desbloquea (ver WORLD_META más abajo).
//
// Nota: se respetan tal cual algunos nombres de archivo con errores
// de tipeo reales en disco (p. ej. "blanlca", "blacno", "blancaa")
// para que las rutas sigan apuntando al archivo correcto.
// =====================================================

const BASE = '/characters'

export type CharacterWorld = 1 | 2 | 3

export interface CharacterOption {
  /** Identificador único, igual al nombre de archivo sin extensión */
  id: string
  /** Nombre real del archivo en /public/characters (puede incluir typos de origen) */
  file: string
  /** Etiqueta legible mostrada en la tarjeta */
  label: string
  /** Mundo temático al que pertenece (1, 2 o 3) */
  world: CharacterWorld
  /** Mundos que deben estar completados para desbloquear este personaje */
  worldRequired: 0 | 1 | 2
}

/** Mundos completados necesarios para desbloquear cada grupo */
const WORLD_REQUIRED: Record<CharacterWorld, 0 | 1 | 2> = {
  1: 0, // Personajes iniciales: disponibles desde el primer día
  2: 1, // Se desbloquean al completar el Mundo 1
  3: 2, // Se desbloquean al completar el Mundo 2
}

function mk(file: string, label: string, world: CharacterWorld): CharacterOption {
  return {
    id: file.replace(/\.jpg$/i, ''),
    file,
    label,
    world,
    worldRequired: WORLD_REQUIRED[world],
  }
}

// ─── Catálogo completo (52 personajes) ────────────────────────────────────────

export const CHARACTERS: CharacterOption[] = [
  // ══ MUNDO 1 — 4 avatares iniciales, siempre disponibles ══
  mk('primero_mundo_chicaBlanca.jpg', 'Chica', 1),
  mk('primero_mundo_chicaMorena.jpg', 'Chica', 1),
  mk('primero_mundo_chicoBlanco.jpg', 'Chico', 1),
  mk('primero_mundo_chicoMoreno.jpg', 'Chico', 1),

  // ══ MUNDO 2 — profesiones, se desbloquean al completar el Mundo 1 ══
  mk('segundo_mundo_abogado_blanca.jpg', 'Abogada', 2),
  mk('segundo_mundo_abogado_blanco.jpg', 'Abogado', 2),
  mk('segundo_mundo_abogado_morena.jpg', 'Abogada', 2),
  mk('segundo_mundo_abogado_moreno.jpg', 'Abogado', 2),
  mk('segundo_mundo_astronauta_blanco.jpg', 'Astronauta', 2),
  mk('segundo_mundo_astronauta_blanlca.jpg', 'Astronauta', 2),
  mk('segundo_mundo_astronauta_morena.jpg', 'Astronauta', 2),
  mk('segundo_mundo_astronauta_moreno.jpg', 'Astronauta', 2),
  mk('segundo_mundo_chef_blanca.jpg', 'Chef', 2),
  mk('segundo_mundo_chef_blanco.jpg', 'Chef', 2),
  mk('segundo_mundo_chef_morena.jpg', 'Chef', 2),
  mk('segundo_mundo_chef_moreno.jpg', 'Chef', 2),
  mk('segundo_mundo_danzante_blacno.jpg', 'Danzante', 2),
  mk('segundo_mundo_danzante_blanca.jpg', 'Danzante', 2),
  mk('segundo_mundo_danzante_morena.jpg', 'Danzante', 2),
  mk('segundo_mundo_danzante_moreno.jpg', 'Danzante', 2),
  mk('segundo_mundo_deportista_blancaa.jpg', 'Deportista', 2),
  mk('segundo_mundo_deportista_blanco.jpg', 'Deportista', 2),
  mk('segundo_mundo_deportista_morena.jpg', 'Deportista', 2),
  mk('segundo_mundo_deportista_moreno.jpg', 'Deportista', 2),
  mk('segundo_mundo_ingeniera_blanca.jpg', 'Ingeniera', 2),
  mk('segundo_mundo_ingeniera_morena.jpg', 'Ingeniera', 2),
  mk('segundo_mundo_ingeniero_blanco.jpg', 'Ingeniero', 2),
  mk('segundo_mundo_ingeniero_moreno.jpg', 'Ingeniero', 2),
  mk('segundo_mundo_maga_blanca.jpg', 'Maga', 2),
  mk('segundo_mundo_maga_morena.jpg', 'Maga', 2),
  mk('segundo_mundo_mago_blanco.jpg', 'Mago', 2),
  mk('segundo_mundo_mago_moreno.jpg', 'Mago', 2),
  mk('segundo_mundo_medica_blanca.jpg', 'Médica', 2),
  mk('segundo_mundo_medica_morena.jpg', 'Médica', 2),
  mk('segundo_mundo_medico_blanco.jpg', 'Médico', 2),
  mk('segundo_mundo_medico_moreno.jpg', 'Médico', 2),
  mk('segundo_mundo_militar_blanca.jpg', 'Militar', 2),
  mk('segundo_mundo_militar_blanco.jpg', 'Militar', 2),
  mk('segundo_mundo_militar_morena.jpg', 'Militar', 2),
  mk('segundo_mundo_militar_moreno.jpg', 'Militar', 2),
  mk('segundo_mundo_musico_blanco.jpg', 'Músico', 2),
  mk('segundo_mundo_musico_moreno.jpg', 'Músico', 2),
  mk('segundo_mundo_musico_mujer_blanco.jpg', 'Música', 2),
  mk('segundo_mundo_musico_mujer_morena.jpg', 'Música', 2),
  mk('segundo_mundo_veterinaria_blanca.jpg', 'Veterinaria', 2),
  mk('segundo_mundo_veterinaria_morena.jpg', 'Veterinaria', 2),
  mk('segundo_mundo_veterinario_blanco.jpg', 'Veterinario', 2),
  mk('segundo_mundo_veterinario_moreno.jpg', 'Veterinario', 2),

  // ══ MUNDO 3 — caballeros, se desbloquean al completar el Mundo 2 ══
  mk('tercer_mundo_caballero_dorado_blanca.jpg', 'Caballera Dorada', 3),
  mk('tercer_mundo_caballero_dorado_blanco.jpg', 'Caballero Dorado', 3),
  mk('tercer_mundo_caballero_dorado_morena.jpg', 'Caballera Dorada', 3),
  mk('tercer_mundo_caballero_dorado_moreno.jpg', 'Caballero Dorado', 3),
  mk('tercer_mundo_caballero_gris_blanca.jpg', 'Caballera Gris', 3),
  mk('tercer_mundo_caballero_gris_blanco.jpg', 'Caballero Gris', 3),
  mk('tercer_mundo_caballero_gris_morena.jpg', 'Caballera Gris', 3),
  mk('tercer_mundo_caballero_gris_moreno.jpg', 'Caballero Gris', 3),
]

export const CHARACTERS_BY_WORLD: Record<CharacterWorld, CharacterOption[]> = {
  1: CHARACTERS.filter(c => c.world === 1),
  2: CHARACTERS.filter(c => c.world === 2),
  3: CHARACTERS.filter(c => c.world === 3),
}

/** Metadatos visuales de cada pestaña de mundo */
export const WORLD_META: Record<CharacterWorld, { label: string; icon: string; worldRequired: 0 | 1 | 2 }> = {
  1: { label: 'Mundo 1', icon: '🌱', worldRequired: WORLD_REQUIRED[1] },
  2: { label: 'Mundo 2', icon: '💼', worldRequired: WORLD_REQUIRED[2] },
  3: { label: 'Mundo 3', icon: '⚔️', worldRequired: WORLD_REQUIRED[3] },
}

export const WORLD_UNLOCK_LABELS: Record<1 | 2, string> = {
  1: '🌐 Completa el Mundo 1 para desbloquear',
  2: '🔗 Completa el Mundo 2 para desbloquear',
}

// ─── Selección persistida ─────────────────────────────────────────────────────

export interface CharacterSelection {
  characterId: string
}

/**
 * Personaje inicial cuando el estudiante todavía no ha elegido ninguno:
 * el primero de la lista del Mundo 1 (no depende del género, para no asumir
 * una identidad que el estudiante no ha elegido).
 */
export function getDefaultCharacterId(): string {
  return CHARACTERS_BY_WORLD[1][0].id
}

export function getCharacterById(id: string | null | undefined): CharacterOption | undefined {
  if (!id) return undefined
  return CHARACTERS.find(c => c.id === id)
}

export function getCharacterPath(character: CharacterOption): string {
  return `${BASE}/${character.file}`
}

/**
 * Extrae el id del personaje elegido a partir del jsonb `avatar_config` de un
 * perfil (propio o de otro estudiante). Si no ha elegido ninguno, o el id
 * guardado ya no existe en el catálogo, cae al personaje por defecto.
 */
export function getCharacterIdFromConfig(
  avatarConfig: Record<string, string> | null | undefined
): string {
  const id = avatarConfig?.characterId
  return id && getCharacterById(id) ? id : getDefaultCharacterId()
}

/** Resuelve la ruta de imagen a partir de un id, con fallback seguro al personaje por defecto */
export function resolveCharacterPath(id: string | null | undefined): string {
  const found = getCharacterById(id) ?? getCharacterById(getDefaultCharacterId())!
  return getCharacterPath(found)
}
