import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Solo los campos que se muestran en el ranking (subset de Profile)
interface RankEntry {
  id: string
  full_name: string
  xp: number
  level: number
  avatar_config?: Record<string, string> | null
}

// ─── Mensajes motivadores según la posición del usuario ──────────────────────

function getMotivatoryMessage(myRank: number | null, myXp: number, leaderXp: number): string {
  if (myRank === null) return '¡Aún no tienes XP registrado! Completa tu primera misión y aparece en el ranking. 🚀'
  if (myRank === 1)    return '¡Eres el #1 del ranking! Sigue jugando para mantener tu corona. 👑'
  if (myRank === 2)    return `¡Estás muy cerca del primer lugar! Solo ${leaderXp - myXp} XP te separan de la cima. 🔥`
  if (myRank === 3)    return '¡Estás en el podio! Un poco más y escalarás posiciones. ⚡'
  if (myRank <= 5)     return `¡Top 5! Con esfuerzo llegarás al podio. Te faltan ${leaderXp - myXp} XP para el #1. 💪`
  if (myRank <= 10)    return `Estás en el top 10. ¡Juega más misiones y escala posiciones! 🎯`
  return `Estás en el puesto #${myRank}. ¡Cada misión te acerca más al podio! 🌟`
}

// ─── Datos del podio ──────────────────────────────────────────────────────────

const PODIUM_CONFIG = [
  { place: 1, label: '1°', emoji: '🥇', height: 130, color: '#FFD700', bg: 'linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%)', ring: '#f59e0b' },
  { place: 2, label: '2°', emoji: '🥈', height: 100, color: '#C0C0C0', bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', ring: '#94a3b8' },
  { place: 3, label: '3°', emoji: '🥉', height: 80,  color: '#CD7F32', bg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', ring: '#f97316' },
]

// Orden de visualización del podio: 2° izquierda · 1° centro · 3° derecha
const PODIUM_ORDER = [1, 0, 2] // índices en PODIUM_CONFIG

export default function RankingPage() {
  const { profile, signOut } = useAuth()
  const [topStudents, setTopStudents]   = useState<RankEntry[]>([])
  const [myRankEntry, setMyRankEntry]   = useState<{ rank: number; xp: number } | null>(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (profile) loadRanking()
  }, [profile])

  async function loadRanking() {
    setLoading(true)

    // Traer top 10 estudiantes activos ordenados por XP desc, luego nivel desc
    const { data: top, error } = await supabase
      .from('profiles')
      .select('id, full_name, xp, level, avatar_config')
      .eq('role', 'student')
      .eq('is_active', true)
      .order('xp', { ascending: false })
      .order('level', { ascending: false })
      .limit(10)

    // Si la columna avatar_config todavía no existe en Supabase, se repite
    // la consulta sin ella para no dejar el ranking vacío por ese error.
    let rows: RankEntry[] = (top ?? []) as RankEntry[]
    if (error) {
      const res = await supabase
        .from('profiles')
        .select('id, full_name, xp, level')
        .eq('role', 'student')
        .eq('is_active', true)
        .order('xp', { ascending: false })
        .order('level', { ascending: false })
        .limit(10)
      rows = (res.data ?? []) as RankEntry[]
    }

    setTopStudents(rows)

    // Encontrar la posición real del usuario actual en TODA la tabla
    // (aunque no esté en el top 10)
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student')
      .eq('is_active', true)
      .gt('xp', profile!.xp)

    const rank = (count ?? 0) + 1
    setMyRankEntry({ rank, xp: profile!.xp })

    setLoading(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!profile || loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <LoadingSpinner mensaje="Cargando ranking..." />
        </div>
      </div>
    )
  }

  const leaderXp   = topStudents[0]?.xp ?? 0
  const myRank     = myRankEntry?.rank ?? null
  const motivoMsg  = getMotivatoryMessage(myRank, profile.xp, leaderXp)
  const isInTop10  = topStudents.some(s => s.id === profile.id)

  const podiumStudents = topStudents.slice(0, 3)
  const listStudents   = topStudents.slice(3)

  return (
    <div className="game-layout">
      {/* ── NAVBAR ── */}
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

      {/* ── TABS ── */}
      <div className="game-tabs">
        <div className="container">
          <div className="d-flex gap-1">
            <Link to="/dashboard" className="game-tab">🏠 Inicio</Link>
            <Link to="/worlds"    className="game-tab">🗺️ Mundos</Link>
            <Link to="/profile"   className="game-tab">🧑‍🎤 Avatar</Link>
            <Link to="/ranking"   className="game-tab active">🏆 Ranking</Link>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO ── */}
      <main className="game-main">
        <div className="container">

          {/* ═══ ENCABEZADO ═══ */}
          <div className="ranking-header page-fade">
            <div className="ranking-header__crown">👑</div>
            <h2 className="ranking-header__title">Top 10 — Tabla de Honor</h2>
            <p className="ranking-header__sub">
              Los estudiantes con más XP acumulado. ¿Puedes llegar a la cima?
            </p>
          </div>

          {/* ═══ MENSAJE MOTIVADOR ═══ */}
          <div className="ranking-motivator fade-up">
            <span className="ranking-motivator__icon">⚡</span>
            <p className="ranking-motivator__text">{motivoMsg}</p>
          </div>

          {/* ═══ PODIO — top 3 ═══ */}
          {podiumStudents.length >= 1 && (
            <div className="ranking-podium fade-up">
              {PODIUM_ORDER.map(cfgIdx => {
                const cfg     = PODIUM_CONFIG[cfgIdx]
                const student = podiumStudents[cfgIdx]
                if (!student) return null
                const isMe = student.id === profile.id

                return (
                  <div
                    key={cfg.place}
                    className={`ranking-podium__slot ${isMe ? 'is-me' : ''}`}
                    style={{ '--podium-height': `${cfg.height}px`, '--podium-ring': cfg.ring } as React.CSSProperties}
                  >
                    {/* Número de lugar flotante */}
                    <div className="ranking-podium__place" style={{ color: cfg.color }}>
                      {cfg.emoji}
                    </div>

                    {/* Avatar circular */}
                    <div
                      className="ranking-podium__avatar-wrap"
                      style={{ boxShadow: `0 0 0 4px ${cfg.ring}, 0 4px 20px ${cfg.ring}55` }}
                    >
                      <CharacterAvatar avatarConfig={student.avatar_config} size={64} className="ranking-podium__avatar-img" />
                      {isMe && <div className="ranking-podium__you-badge">Tú</div>}
                    </div>

                    {/* Info del estudiante */}
                    <div className="ranking-podium__name">{student.full_name}</div>
                    <div className="ranking-podium__xp">⚡ {student.xp} XP</div>
                    <div className="ranking-podium__level">Nv. {student.level}</div>

                    {/* Base del podio */}
                    <div
                      className="ranking-podium__base"
                      style={{ height: `${cfg.height}px`, background: cfg.bg, borderTop: `4px solid ${cfg.ring}` }}
                    >
                      <span className="ranking-podium__base-label">{cfg.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ═══ LISTA 4–10 ═══ */}
          {listStudents.length > 0 && (
            <div className="ranking-list fade-up">
              {listStudents.map((student, idx) => {
                const rank = idx + 4
                const isMe = student.id === profile.id
                return (
                  <div key={student.id} className={`ranking-list__row ${isMe ? 'is-me' : ''}`}>
                    <div className="ranking-list__rank">#{rank}</div>
                    <CharacterAvatar avatarConfig={student.avatar_config} size={40} className="ranking-list__avatar" />
                    <div className="ranking-list__info">
                      <div className="ranking-list__name">
                        {student.full_name}
                        {isMe && <span className="ranking-list__you-tag">← Tú</span>}
                      </div>
                    </div>
                    <div className="ranking-list__stats">
                      <span className="ranking-list__xp">⚡ {student.xp} XP</span>
                      <span className="ranking-list__level">Nv. {student.level}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ═══ MI POSICIÓN (si no está en top 10) ═══ */}
          {!isInTop10 && myRankEntry && (
            <div className="ranking-mypos fade-up">
              <div className="ranking-mypos__label">Tu posición actual</div>
              <div className="ranking-mypos__row">
                <div className="ranking-mypos__rank">#{myRankEntry.rank}</div>
                <CharacterAvatar avatarConfig={profile.avatar_config} size={44} className="ranking-mypos__avatar" />
                <div className="ranking-mypos__name">{profile.full_name}</div>
                <div className="ranking-mypos__stats">
                  <span>⚡ {profile.xp} XP</span>
                  <span>Nv. {profile.level}</span>
                </div>
              </div>
              <p className="ranking-mypos__hint">
                ¡Juega más misiones para subir al top 10!
              </p>
            </div>
          )}

          {/* ═══ ESTADO VACÍO ═══ */}
          {topStudents.length === 0 && (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: '3rem' }}>🏆</div>
              <p className="mt-2">Aún no hay estudiantes en el ranking. ¡Sé el primero!</p>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
