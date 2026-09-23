import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { xpForNextLevel, xpProgressPercent } from '@/lib/helpers'
import { WORLD_NAMES, TOTAL_WORLDS, GAMES_PER_WORLD } from '@/lib/constants'
import { buildProgression, findNextLevel } from '@/lib/progression'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GuideToast from '@/components/ui/GuideToast'
import type { Game, StudentProgress } from '@/types'

export default function DashboardPage() {
  const { profile, signOut } = useAuth()
  const [games, setGames]               = useState<Game[]>([])
  const [progress, setProgress]         = useState<StudentProgress[]>([])
  const [loadingData, setLoadingData]   = useState(true)
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
    setLoadingData(false)
  }

  if (!profile || loadingData) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <LoadingSpinner mensaje="Cargando tu aventura..." />
        </div>
      </div>
    )
  }

  // Un mismo juego puede tener varios registros (uno por cada intento,
  // ya que todos los juegos permiten volver a jugarse). Se deduplica con
  // un Set para que "juegos completados" cuente cada juego una sola vez.
  const completedGameIds = [...new Set(progress.map(p => p.game_id))]
  const nextXp = xpForNextLevel(profile.xp)
  const xpPercent = xpProgressPercent(profile.xp)
  const totalGames = TOTAL_WORLDS * GAMES_PER_WORLD

  // Mundos info. Las reglas de desbloqueo viven en src/lib/progression.ts,
  // compartidas con la página de mundos.
  const worldsData = buildProgression(games, completedGameIds)

  const worldsCompleted = worldsData.filter(w => w.isComplete).length

  // ── Tip contextual según el estado del progreso ──────────────────────────
  // Se elige UN mensaje relevante según en qué punto está el estudiante.
  // storageKey único por condición para que cerrarlo no oculte el siguiente
  // mensaje cuando avance.
  const guideToast = (() => {
    // 1. Nunca ha jugado nada → invitar a empezar
    if (completedGameIds.length === 0) {
      return {
        icon: '👋',
        title: '¡Bienvenido a La ruta hacia la conexión!',
        message: 'Para comenzar ve a la pestaña "🗺️ Mundos" y pulsa "Jugar ▶" en el primer nivel del Mundo 1. ¡Tu aventura empieza ahora!',
        actionLabel: 'Ir a Mundos',
        onAction: () => navigate('/worlds'),
        storageKey: 'guide_dashboard_start',
      }
    }
    // 2. Completó toda la ruta → felicitación y sugerencia de avatar
    if (completedGameIds.length >= TOTAL_WORLDS * GAMES_PER_WORLD) {
      return {
        icon: '🏆',
        title: '¡Completaste toda la ruta!',
        message: 'Has terminado los 6 juegos. Revisa tu avatar en "🧑‍🎤 Avatar" — tienes todos los desbloqueados. También puedes ver tu posición en el ranking.',
        actionLabel: 'Ver mi avatar',
        onAction: () => navigate('/profile'),
        storageKey: 'guide_dashboard_finished',
      }
    }
    // 3. Completó un mundo completo → orientar al siguiente
    const justFinishedWorld = worldsData.find(w => w.isComplete && w.order < TOTAL_WORLDS)
    const nextWorld = justFinishedWorld
      ? worldsData.find(w => w.order === justFinishedWorld.order + 1)
      : null
    if (nextWorld && nextWorld.isUnlocked && nextWorld.completed === 0) {
      return {
        icon: '🎉',
        title: `¡Mundo ${justFinishedWorld!.order} completado!`,
        message: `Excelente trabajo. El Mundo ${nextWorld.order} ya está desbloqueado. Ve a "🗺️ Mundos" y continúa con el primer juego del Mundo ${nextWorld.order}.`,
        actionLabel: 'Ver Mundo ' + nextWorld.order,
        onAction: () => navigate('/worlds'),
        storageKey: `guide_dashboard_world${justFinishedWorld!.order}_done`,
      }
    }
    // 4. Tiene juegos pendientes en un mundo desbloqueado → recordar continuar
    const nextLevel = findNextLevel(worldsData)
    if (nextLevel) {
      return {
        icon: '🎯',
        title: '¡Tienes una misión pendiente!',
        message: `Continúa con "${nextLevel.game.title}" en el Mundo ${nextLevel.game.world_id}. Pulsa "¡Jugar ahora!" aquí abajo o ve a "🗺️ Mundos".`,
        storageKey: `guide_dashboard_next_${nextLevel.game.id}`,
      }
    }
    return null
  })()

  return (
    <div className="game-layout">
      {/* ── NAVBAR GAMIFICADA ── */}
      <nav className="game-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <CharacterAvatar avatarConfig={profile.avatar_config} size={44} className="game-navbar__avatar" />
            <div>
              <div className="game-navbar__name">{profile.full_name}</div>
              <div className="game-navbar__info">
                Grado {profile.grade}° · {profile.classroom}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="game-navbar__xp-badge">
              <span>⚡</span>
              <span className="fw-bold">{profile.xp} XP</span>
            </div>
            <div className="game-navbar__level-badge">
              Nv. {profile.level}
            </div>
            <button className="btn btn-outline-light btn-sm" onClick={() => signOut()}>
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* ── NAV TABS ── */}
      <div className="game-tabs">
        <div className="container">
          <div className="d-flex gap-1">
            <Link to="/dashboard" className="game-tab active">🏠 Inicio</Link>
            <Link to="/worlds"    className="game-tab">🗺️ Mundos</Link>
            <Link to="/profile"   className="game-tab">🧑‍🎤 Avatar</Link>
            <Link to="/ranking"   className="game-tab">🏆 Ranking</Link>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="game-main">
        <div className="container">

          {/* ═══ BANNER DE PROGRESO ═══ */}
          <div className="game-progress-banner mb-4 page-fade">
            <div className="row align-items-center gy-3">
              <div className="col-12 col-md-7">
                <h2 className="game-progress-banner__title">
                  ¡Hola, {profile.full_name.split(' ')[0]}! 🎮
                </h2>
                <p className="game-progress-banner__sub">
                  {completedGameIds.length === totalGames
                    ? '¡Has completado toda la ruta! Eres un campeón. 🏆'
                    : 'Continúa tu aventura y sigue subiendo de nivel.'
                  }
                </p>

                {/* Barra de XP */}
                <div className="game-xp-section">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="game-xp-label">⚡ Nivel {profile.level}</span>
                    <span className="game-xp-label">{profile.xp}/{nextXp} XP</span>
                  </div>
                  <div className="game-xp-track">
                    <div className="game-xp-fill" style={{ width: `${xpPercent}%` }} />
                  </div>
                  <p className="game-xp-hint">
                    Te faltan {nextXp - profile.xp} XP para el nivel {profile.level + 1}
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-5">
                <div className="game-progress-banner__avatar">
                  <CharacterAvatar avatarConfig={profile.avatar_config} size={110} />
                  <div className="game-progress-banner__level-ring">
                    Nivel {profile.level}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ STATS RÁPIDAS ═══ */}
          <div className="row g-3 mb-4">
            {[
              { icon: '🗺️', value: `${worldsCompleted}/${TOTAL_WORLDS}`, label: 'Mundos', color: '#dbeafe' },
              { icon: '🎮', value: `${completedGameIds.length}/${totalGames}`, label: 'Juegos', color: '#d1fae5' },
              { icon: '⚡', value: profile.xp, label: 'XP Total', color: '#fef3c7' },
            ].map(s => (
              <div key={s.label} className="col-12 col-sm-4">
                <div className="game-stat-card">
                  <div className="game-stat-card__icon" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <div className="game-stat-card__value">{s.value}</div>
                  <div className="game-stat-card__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ═══ MAPA DE MUNDOS (resumen) ═══ */}
          <h4 className="fw-bold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            🗺️ Tu ruta
          </h4>
          <div className="game-worlds-path mb-4">
            {worldsData.map((w) => (
              <div
                key={w.order}
                className={`game-world-node ${w.isComplete ? 'complete' : w.isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="game-world-node__icon">
                  {w.isComplete ? '✅' : w.isUnlocked ? ['🌐', '🔗', '✨'][w.order - 1] : '🔒'}
                </div>
                <div className="game-world-node__info">
                  <div className="game-world-node__title">
                    Mundo {w.order}
                  </div>
                  <div className="game-world-node__name">
                    {WORLD_NAMES[w.order]}
                  </div>
                  <div className="game-world-node__progress">
                    {w.completed}/{GAMES_PER_WORLD} juegos
                  </div>
                </div>
                {w.isUnlocked && !w.isComplete && (
                  <Link
                    to="/worlds"
                    className="game-world-node__btn"
                  >
                    Jugar →
                  </Link>
                )}
                {w.isComplete && (
                  <span className="game-world-node__badge">🏆</span>
                )}
              </div>
            ))}
          </div>

          {/* ═══ SIGUIENTE JUEGO RECOMENDADO ═══ */}
          {(() => {
            // El primer nivel desbloqueado y sin completar, en orden.
            // Antes solo comprobaba que el mundo estuviera abierto, así que
            // podía recomendar el nivel 2 sin haber hecho el nivel 1.
            const nextGame = findNextLevel(worldsData)?.game
            if (!nextGame) return null
            return (
              <div className="game-next-mission mb-4">
                <div className="game-next-mission__icon">🎯</div>
                <div className="game-next-mission__info">
                  <div className="game-next-mission__label">Siguiente misión</div>
                  <div className="game-next-mission__title">{nextGame.title}</div>
                  <div className="game-next-mission__sub">
                    {WORLD_NAMES[nextGame.world_id]} · +{nextGame.xp_reward} XP
                  </div>
                </div>
                <Link to={`/game/${nextGame.id}`} className="game-next-mission__btn">
                  ¡Jugar ahora!
                </Link>
              </div>
            )
          })()}

        </div>
      </main>

      {/* ── Tip de orientación contextual ── */}
      {guideToast && (
        <GuideToast
          icon={guideToast.icon}
          title={guideToast.title}
          message={guideToast.message}
          actionLabel={guideToast.actionLabel}
          onAction={guideToast.onAction}
          storageKey={guideToast.storageKey}
          delay={1200}
        />
      )}

      <Footer />
    </div>
  )
}
