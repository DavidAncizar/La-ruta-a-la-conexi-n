import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { buildProgression } from '@/lib/progression'
import {
  CHARACTERS_BY_WORLD,
  WORLD_META,
  WORLD_UNLOCK_LABELS,
  getDefaultCharacterId,
  getCharacterPath,
  type CharacterWorld,
} from '@/lib/characterConfig'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Game, StudentProgress } from '@/types'

/** Clave de respaldo en el navegador si la columna todavía no existe */
const lsKey = (id: string) => `avatar_config_${id}`

/** ¿El error se debe a que la columna avatar_config no existe todavía? */
function isMissingConfigColumn(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false
  const msg = String(err.message ?? '')
  return err.code === 'PGRST204' || err.code === '42703' || msg.includes('avatar_config')
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profile, signOut, refreshProfile } = useAuth()

  const [games, setGames]       = useState<Game[]>([])
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState<{ kind: 'ok' | 'warn' | 'err'; text: string } | null>(null)

  const [characterId, setCharacterId] = useState<string>('')
  const [activeWorld, setActiveWorld] = useState<CharacterWorld>(1)

  // ── Carga inicial ───────────────────────────────────────────────────────────
  useEffect(() => { if (profile) loadData() }, [profile?.id])

  async function loadData() {
    const [gamesRes, progressRes] = await Promise.all([
      supabase.from('games').select('*').eq('is_active', true).order('world_id').order('order_index'),
      supabase.from('student_progress').select('*').eq('student_id', profile!.id),
    ])
    setGames(gamesRes.data ?? [])
    setProgress(progressRes.data ?? [])

    // Prioridad: columna en Supabase → respaldo del navegador → valor por defecto
    let restored: string | null = null
    const config = profile!.avatar_config as { characterId?: string } | null

    if (config?.characterId) {
      restored = config.characterId
    } else {
      try {
        const raw = localStorage.getItem(lsKey(profile!.id))
        if (raw) {
          const parsed = JSON.parse(raw)
          restored = parsed?.characterId ?? null
        }
      } catch { /* respaldo corrupto, se ignora */ }
    }

    setCharacterId(restored ?? getDefaultCharacterId())
    setLoading(false)
  }

  // ── Progreso de mundos ──────────────────────────────────────────────────────
  const completedGameIds = [...new Set(progress.map(p => p.game_id))]
  const worldsData       = buildProgression(games, completedGameIds)
  const worldsCompleted  = worldsData.filter(w => w.isComplete).length

  // ── Guardado ────────────────────────────────────────────────────────────────
  //
  // Se guarda en profiles.avatar_config (una sola fila que siempre existe y
  // cuya política RLS de UPDATE ya está activa: es la misma que usa el XP).
  const persist = useCallback(async (nextCharacterId: string) => {
    if (!profile) return
    setSaving(true)
    setSaveMsg(null)

    const next = { characterId: nextCharacterId }

    // Respaldo local inmediato: la elección nunca se pierde
    try { localStorage.setItem(lsKey(profile.id), JSON.stringify(next)) } catch { /* sin espacio */ }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_config: next })
      .eq('id', profile.id)

    if (!error) {
      setSaveMsg({ kind: 'ok', text: '✓ Guardado' })
      // Refresca el perfil compartido para que el navbar y el resto de
      // pantallas de esta misma sesión muestren el nuevo avatar al instante.
      void refreshProfile()
    } else if (isMissingConfigColumn(error)) {
      setSaveMsg({ kind: 'warn', text: '⚠ Guardado solo en este equipo' })
      console.warn(
        'Falta la columna profiles.avatar_config en Supabase. Ejecuta:\n' +
        'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_config jsonb;'
      )
    } else {
      setSaveMsg({ kind: 'err', text: '✕ No se pudo guardar' })
      console.error('Error al guardar el avatar:', error)
    }

    setSaving(false)
    setTimeout(() => setSaveMsg(null), 2400)
  }, [profile, refreshProfile])

  function handleSelect(id: string) {
    setCharacterId(id)     // feedback inmediato en el avatar
    void persist(id)       // guardado en segundo plano
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!profile || loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <LoadingSpinner mensaje="Cargando tu avatar..." />
        </div>
      </div>
    )
  }

  const worldOrder: CharacterWorld[] = [1, 2, 3]
  const activeMeta   = WORLD_META[activeWorld]
  const isLocked     = activeMeta.worldRequired > worldsCompleted
  const totalUnlocked = worldOrder.filter(w => WORLD_META[w].worldRequired <= worldsCompleted).length

  return (
    <div className="game-layout">
      <nav className="game-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <CharacterAvatar avatarConfig={profile.avatar_config} size={44} className="game-navbar__avatar" />
            <div>
              <div className="game-navbar__name">{profile.full_name}</div>
              <div className="game-navbar__info">Nivel {profile.level} · ⚡ {profile.xp} XP</div>
            </div>
          </div>
          <button className="btn btn-outline-light btn-sm" onClick={() => signOut()}>Salir</button>
        </div>
      </nav>

      <div className="game-tabs">
        <div className="container">
          <div className="d-flex gap-1">
            <Link to="/dashboard" className="game-tab">🏠 Inicio</Link>
            <Link to="/worlds"    className="game-tab">🗺️ Mundos</Link>
            <Link to="/profile"   className="game-tab active">🧑‍🎤 Avatar</Link>
            <Link to="/ranking"   className="game-tab">🏆 Ranking</Link>
          </div>
        </div>
      </div>

      <main className="game-main">
        <div className="container">

          {/* ═══ HEADER ═══ */}
          <div className="av-header page-fade">
            <div>
              <h2 className="av-header__title">🧑‍🎤 Mi Avatar</h2>
              <p className="av-header__sub">
                {totalUnlocked}/3 mundos de personajes desbloqueados ·
                {' '}{worldsCompleted}/3 mundos completados
              </p>
            </div>
            {saveMsg && (
              <div className={`av-save-toast ${saveMsg.kind}`}>{saveMsg.text}</div>
            )}
          </div>

          {/* ═══ LAYOUT: Avatar + Selector ═══ */}
          <div className="av-layout fade-up">

            {/* ──── Avatar en vivo ──── */}
            <div className="av-preview-col">
              <div className="av-preview-card av-preview-card--hero">
                <div className="av-preview-card__bg" />
                <span className="av-preview-card__sparkle av-preview-card__sparkle--1">✦</span>
                <span className="av-preview-card__sparkle av-preview-card__sparkle--2">✧</span>
                <span className="av-preview-card__sparkle av-preview-card__sparkle--3">✦</span>

                <div className="char-avatar-wrap">
                  <CharacterAvatar
                    avatarConfig={{ characterId }}
                    size={240}
                    className="av-preview-card__avatar"
                  />
                  <div className="av-level-badge">⭐ Nivel {profile.level}</div>
                </div>

                {saving && (
                  <div className="av-preview-card__saving">
                    <span className="spinner-border spinner-border-sm" />
                  </div>
                )}
              </div>

              <div className="av-profile-info">
                <div className="av-profile-info__row">
                  <span>🏫</span><span>Grado {profile.grade}° · {profile.classroom}</span>
                </div>
                <div className="av-profile-info__row">
                  <span>⚡</span><span>{profile.xp} XP · Nivel {profile.level}</span>
                </div>
              </div>
            </div>

            {/* ──── Selector de personajes ──── */}
            <div className="av-inventory-col">

              <div className="av-cat-tabs av-cat-tabs--worlds">
                {worldOrder.map(w => {
                  const meta = WORLD_META[w]
                  const locked = meta.worldRequired > worldsCompleted
                  return (
                    <button
                      key={w}
                      className={`av-cat-tab ${activeWorld === w ? 'active' : ''} ${locked ? 'locked' : ''}`}
                      onClick={() => setActiveWorld(w)}
                      title={locked ? WORLD_UNLOCK_LABELS[meta.worldRequired as 1 | 2] : meta.label}
                    >
                      <span className="av-cat-tab__icon">{meta.icon}</span>
                      <span className="av-cat-tab__label">{meta.label}</span>
                      {locked && <span className="av-cat-tab__lock">🔒</span>}
                    </button>
                  )
                })}
              </div>

              <div className="av-options-panel">
                <div className="av-options-panel__header">
                  <span className="av-options-panel__icon">{activeMeta.icon}</span>
                  <div>
                    <div className="av-options-panel__title">{activeMeta.label}</div>
                    <div className="av-options-panel__desc">
                      Elige el avatar con el que quieres jugar.
                    </div>
                  </div>
                  {!isLocked && (
                    <span className="av-options-panel__count">
                      {CHARACTERS_BY_WORLD[activeWorld].length} personajes
                    </span>
                  )}
                </div>

                {isLocked ? (
                  <div className="av-locked-state">
                    <div className="av-locked-state__icon">🔒</div>
                    <div className="av-locked-state__title">Todavía bloqueado</div>
                    <div className="av-locked-state__hint">
                      {WORLD_UNLOCK_LABELS[activeMeta.worldRequired as 1 | 2]} y desbloquea estos
                      avatares.
                    </div>
                    <Link to="/worlds" className="btn btn-primary btn-sm mt-2 px-3" style={{ borderRadius: '0.6rem' }}>
                      Ir a los mundos →
                    </Link>
                  </div>
                ) : (
                  <div className="av-options-grid av-options-grid--characters">
                    {CHARACTERS_BY_WORLD[activeWorld].map(char => {
                      const isSelected = characterId === char.id
                      return (
                        <button
                          key={char.id}
                          className={`av-option-card av-option-card--character ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(char.id)}
                          title={char.label}
                        >
                          <div className="av-option-card__img-wrap av-option-card__img-wrap--character">
                            <img src={getCharacterPath(char)} alt={char.label} className="av-option-card__img" />
                          </div>
                          <div className="av-option-card__label">{char.label}</div>
                          {isSelected && <div className="av-option-card__check">✓</div>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
