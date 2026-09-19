import { getCharacterIdFromConfig, getCharacterPath, getCharacterById, getDefaultCharacterId } from '@/lib/characterConfig'

interface CharacterAvatarProps {
  /** avatar_config (jsonb) del perfil — propio o de otro estudiante */
  avatarConfig: Record<string, string> | null | undefined
  size?: number
  className?: string
}

/**
 * Muestra la foto de perfil completa del personaje elegido por el estudiante.
 * Es la representación visual del estudiante en toda la app (navbar, ranking,
 * perfil): siempre refleja en tiempo real el personaje guardado en
 * `profiles.avatar_config`. Si el estudiante nunca ha elegido uno, muestra el
 * primer personaje del Mundo 1.
 */
export default function CharacterAvatar({
  avatarConfig,
  size = 180,
  className = '',
}: CharacterAvatarProps) {
  const characterId = getCharacterIdFromConfig(avatarConfig)
  const character = getCharacterById(characterId) ?? getCharacterById(getDefaultCharacterId())!
  const src = getCharacterPath(character)

  return (
    <div
      className={`char-avatar-frame ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt="Avatar del estudiante"
        className="char-avatar-frame__img"
        loading="eager"
      />
    </div>
  )
}
