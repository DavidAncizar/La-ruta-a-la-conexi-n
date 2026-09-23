import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { WORLD_NAMES, GAMES_PER_WORLD } from '@/lib/constants'
import { buildProgression } from '@/lib/progression'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GuideToast from '@/components/ui/GuideToast'
import type { Game, StudentProgress } from '@/types'

const WORLD_EMOJIS = ['🌐', '🔗', '✨']
const WORLD_COLORS = ['#3b82f6', '#10b981', '#f59e0b']
const WORLD_BG = ['#dbeafe', '#d1fae5', '#fef3c7']

export default function WorldsPage() {
  const { profile, signOut } = useAuth()
  const [games, setGames]       = useState<Game[]>([])
  const [progress, setProgress] = useState<StudentProgress[]>([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  async function loadData() {
    const [gamesRes, progressRes] = await Promise.all([
      supabase.from('games').select('*').eq('is_active', true).order('world_id').order('order_index'),
      supabase.from('student_progress').select('*').eq('student_id', profile!.id),
    ])
    setGames(gamesRes.data ?? [])
    setProgress(progressRes.data ?? [])
    setLoading(false)
  }

  if (!profile || loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <LoadingSpinner mensaje="Cargando mundos..." />
        </div>
      </div>
    )
  }

  // Un mismo juego puede tener varios registros (uno por cada intento,
  // ya que todos los juegos permiten volver a jugarse). Se deduplica con
  // un Set para que el conteo de progreso no se infle con reintentos.
  const completedGameIds = [...new Set(progress.map(p => p.game_id))]

  // Las reglas de desbloqueo viven en src/lib/progression.ts para que
  // esta página y el panel de inicio no puedan contradecirse.
  const worldsData = buildProgression(games, completedGameIds)

  // ── Tip contextual según el estado del mapa de mundos ────────────────────
  const guideToast = (() => {
    const allComplete = worldsData.every(w => w.isComplete)

    // 1. Todos los mundos completados → felicitación y sugerencia de avatar
    if (allComplete) {
      return {
        icon: '🏆',
        title: '¡Ruta completada!',
        message: 'Has terminado los 3 mundos. Ahora ve a "🧑‍🎤 Avatar" para ver todos tus avatares desbloqueados, o mira el ranking para ver tu posición.',
        actionLabel: 'Ver mi avatar',
        onAction: () => navigate('/profile'),
        storageKey: 'guide_worlds_all_done',
      }
    }

    // 2. Está en Mundo 1, primer juego sin empezar
    const w1 = worldsData.find(w => w.order === 1)
    if (w1 && w1.isUnlocked && w1.completed === 0) {
      return {
        icon: '🌐',
        title: '¡Empieza por el Mundo 1!',
        message: 'Pulsa "Jugar ▶" en el primer nivel del Mundo 1 para arrancar tu aventura. Los demás mundos se irán desbloqueando al completar los juegos.',
        storageKey: 'guide_worlds_w1_start',
      }
    }

    // 3. Completó el primer juego del Mundo 1, le falta el segundo
    if (w1 && w1.isUnlocked && w1.completed === 1) {
      return {
        icon: '💡',
        title: 'Completa el Mundo 1',
        message: 'Ya terminaste el nivel 1 del Mundo 1. Ahora juega el nivel 2 para completarlo y desbloquear el Mundo 2.',
        storageKey: 'guide_worlds_w1_half',
      }
    }

    // 4. Mundo 1 completo, Mundo 2 recién desbloqueado
    const w2 = worldsData.find(w => w.order === 2)
    if (w1?.isComplete && w2?.isUnlocked && w2.completed === 0) {
      return {
        icon: '🔗',
        title: '¡Mundo 2 desbloqueado!',
        message: 'Excelente. El Mundo 2 ya está disponible. Desplázate hacia abajo y pulsa "Jugar ▶" en su primer nivel para continuar.',
        storageKey: 'guide_worlds_w2_start',
      }
    }

    // 5. Está a mitad del Mundo 2
    if (w2?.isUnlocked && w2.completed === 1) {
      return {
        icon: '⏱️',
        title: 'Un juego más en el Mundo 2',
        message: 'Ya llevas un juego en el Mundo 2. Completa el segundo para desbloquear el Mundo 3, el último de la ruta.',
        storageKey: 'guide_worlds_w2_half',
      }
    }

    // 6. Mundo 2 completo, Mundo 3 recién desbloqueado
    const w3 = worldsData.find(w => w.order === 3)
    if (w2?.isComplete && w3?.isUnlocked && w3.completed === 0) {
      return {
        icon: '✨',
        title: '¡Último mundo desbloqueado!',
        message: 'Estás en el Mundo 3, el final de la ruta. Completa sus 2 juegos para terminar la aventura y ver tu resultado final.',
        storageKey: 'guide_worlds_w3_start',
      }
    }

    // 7. A mitad del Mundo 3
    if (w3?.isUnlocked && w3.completed === 1) {
      return {
        icon: '🛡️',
        title: '¡Ya casi terminas!',
        message: 'Solo te falta el último juego del Mundo 3. Complétalo para terminar La ruta hacia la conexión. ¡Ánimo!',
        storageKey: 'guide_worlds_w3_half',
      }
    }

    return null
  })()

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
            <Link to="/worlds"    className="game-tab active">🗺️ Mundos</Link>
            <Link to="/profile"   className="game-tab">🧑‍🎤 Avatar</Link>
            <Link to="/ranking"   className="game-tab">🏆 Ranking</Link>
          </div>
        </div>
      </div>

      <main className="game-main">
        <div className="container">

          <h2 className="fw-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            🗺️ Mapa de Mundos
          </h2>
          <p className="text-muted mb-4">
            Completa cada mundo para desbloquear el siguiente y ganar una pieza de tu avatar.
          </p>

          <div className="d-flex flex-column gap-4">
            {worldsData.map((w) => (
              <div
                key={w.order}
                className={`game-world-card ${w.isComplete ? 'complete' : w.isUnlocked ? 'unlocked' : 'locked'}`}
                style={{ '--world-color': WORLD_COLORS[w.order - 1], '--world-bg': WORLD_BG[w.order - 1] } as React.CSSProperties}
              >
                {/* Header del mundo */}
                <div className="game-world-card__header">
                  <div className="game-world-card__emoji">
                    {w.isComplete ? '✅' : w.isUnlocked ? WORLD_EMOJIS[w.order - 1] : '🔒'}
                  </div>
                  <div>
                    <div className="game-world-card__number">Mundo {w.order}</div>
                    <div className="game-world-card__title">{WORLD_NAMES[w.order]}</div>
                  </div>
                  <div className="game-world-card__status">
                    {w.isComplete ? (
                      <span className="badge bg-success">Completado 🏆</span>
                    ) : w.isUnlocked ? (
                      <span className="badge" style={{ background: 'var(--world-color)', color: '#fff' }}>
                        {w.completed}/{GAMES_PER_WORLD} juegos
                      </span>
                    ) : (
                      <span className="badge bg-secondary">Bloqueado 🔒</span>
                    )}
                  </div>
                </div>

                {/* Juegos del mundo */}
                {w.isUnlocked && (
                  <div className="game-world-card__games">
                    {w.levels.map(level => {
                      const { game, isCompleted, isUnlocked, levelNumber } = level

                      return (
                        <div
                          key={game.id}
                          className={[
                            'game-level-card',
                            isCompleted ? 'done' : '',
                            !isUnlocked ? 'locked' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          <div className="game-level-card__number">
                            {isCompleted ? '✅' : !isUnlocked ? '🔒' : levelNumber}
                          </div>
                          <div className="game-level-card__info">
                            <div className="game-level-card__title">{game.title}</div>
                            <div className="game-level-card__desc">{game.description}</div>
                            <div className="game-level-card__xp">+{game.xp_reward} XP</div>

                            {/* Acción: dentro del bloque info para alinearse bien en móvil */}
                            <div className="game-level-card__action mt-2">
                              {isCompleted ? (
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <span className="game-level-card__badge-done">✅ Completado</span>
                                  <Link
                                    to={`/game/${game.id}`}
                                    className="game-level-card__btn game-level-card__btn--replay"
                                  >
                                    🔁 Jugar de nuevo
                                  </Link>
                                </div>
                              ) : isUnlocked ? (
                                <Link to={`/game/${game.id}`} className="game-level-card__btn">
                                  Jugar ▶
                                </Link>
                              ) : (
                                <span className="game-level-card__locked-note">
                                  🔒 Termina el nivel {levelNumber - 1} para desbloquearlo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Recompensa */}
                {w.order <= 2 && (
                  <div className="game-world-card__reward">
                    <span>{w.isComplete ? '🎁' : '🔒'}</span>
                    <span className="small">
                      Recompensa: {w.order === 1 ? '🎨 Avatar de profesión' : '⚔️ Avatar de caballeros del zodiaco'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* ── Tip de orientación contextual ── */}
      {guideToast && (
        <GuideToast
          icon={guideToast.icon}
          title={guideToast.title}
          message={guideToast.message}
          actionLabel={'actionLabel' in guideToast ? guideToast.actionLabel : undefined}
          onAction={'onAction' in guideToast ? guideToast.onAction : undefined}
          storageKey={guideToast.storageKey}
          delay={1000}
        />
      )}

      <Footer />
    </div>
  )
}
