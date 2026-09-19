import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Profile, AcademicPeriod } from '@/types'
import { TOTAL_WORLDS, GAMES_PER_WORLD, WORLD_NAMES } from '@/lib/constants'

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

interface StudentRow extends Profile {
  games_completed: number
  worlds_completed: number
}

type AdminSection = 'dashboard' | 'students' | 'ranking'

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdminPage() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  // Datos
  const [students, setStudents]         = useState<StudentRow[]>([])
  const [periods, setPeriods]           = useState<AcademicPeriod[]>([])
  const [loadingData, setLoadingData]   = useState(true)

  // Navegación de secciones
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')

  // Filtros (sección estudiantes)
  const [filterPeriod, setFilterPeriod]       = useState<number | 'all'>('all')
  const [filterGrade, setFilterGrade]         = useState<string>('all')
  const [filterClassroom, setFilterClassroom] = useState<string>('all')
  const [filterStatus, setFilterStatus]       = useState<string>('all')
  const [searchTerm, setSearchTerm]           = useState('')

  // Estado de eliminación
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<StudentRow | null>(null)
  const [deleteError, setDeleteError]   = useState<string | null>(null)

  // ── Cargar datos ────────────────────────────────────────────────────────────
  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoadingData(true)

    const { data: periodsData } = await supabase
      .from('academic_periods')
      .select('*')
      .order('id', { ascending: false })
    setPeriods(periodsData ?? [])

    const { data: studentsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    const { data: progressData } = await supabase
      .from('student_progress')
      .select('student_id, game_id')

    const progressMap = new Map<string, Set<number>>()
    if (progressData) {
      for (const p of progressData) {
        const existing = progressMap.get(p.student_id) ?? new Set<number>()
        existing.add(p.game_id)
        progressMap.set(p.student_id, existing)
      }
    }

    const rows: StudentRow[] = (studentsData ?? []).map(s => {
      const completedGames = progressMap.get(s.id) ?? new Set<number>()
      const gamesCompleted = completedGames.size
      let worldsCompleted = 0
      if (gamesCompleted >= GAMES_PER_WORLD)     worldsCompleted = 1
      if (gamesCompleted >= GAMES_PER_WORLD * 2) worldsCompleted = 2
      if (gamesCompleted >= GAMES_PER_WORLD * 3) worldsCompleted = 3
      return { ...s, games_completed: gamesCompleted, worlds_completed: worldsCompleted }
    })

    setStudents(rows)
    setLoadingData(false)
  }

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (filterPeriod !== 'all' && s.academic_period_id !== filterPeriod) return false
      if (filterGrade !== 'all' && s.grade !== filterGrade) return false
      if (filterClassroom !== 'all' && s.classroom !== filterClassroom) return false
      if (filterStatus === 'active' && !s.is_active) return false
      if (filterStatus === 'archived' && s.is_active) return false
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return s.full_name.toLowerCase().includes(term) ||
               (s.classroom?.toLowerCase().includes(term) ?? false)
      }
      return true
    })
  }, [students, filterPeriod, filterGrade, filterClassroom, filterStatus, searchTerm])

  // ── Ranking: todos los estudiantes ordenados por XP desc ─────────────────
  const rankedStudents = useMemo(() => {
    return [...students]
      .filter(s => s.is_active)
      .sort((a, b) => b.xp - a.xp || b.level - a.level)
  }, [students])

  // ── Estadísticas ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const activeStudents = students.filter(s => s.is_active)
    const activeCount = activeStudents.length || 1
    const avgXp = activeStudents.length > 0
      ? Math.round(activeStudents.reduce((sum, s) => sum + s.xp, 0) / activeStudents.length)
      : 0

    // % de activos que completaron cada mundo
    const worldProgress = [1, 2, 3].map(w => {
      const done = activeStudents.filter(s => s.worlds_completed >= w).length
      return { world: w, done, pct: Math.round((done / activeCount) * 100) }
    })

    // Top 3 para el mini-podio del dashboard
    const top3 = [...activeStudents]
      .sort((a, b) => b.xp - a.xp || b.level - a.level)
      .slice(0, 3)

    return {
      total: students.length,
      active: activeStudents.length,
      archived: students.length - activeStudents.length,
      activePeriod: new Date().getFullYear().toString(),
      avgXp,
      worldProgress,
      top3,
    }
  }, [students])

  const uniqueClassrooms = useMemo(() => {
    const set = new Set(students.map(s => s.classroom).filter(Boolean))
    return Array.from(set).sort() as string[]
  }, [students])

  // ── Acciones ───────────────────────────────────────────────────────────────

  async function handleToggleStatus(studentId: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', studentId)
    if (!error) {
      setStudents(prev =>
        prev.map(s => s.id === studentId ? { ...s, is_active: !currentStatus } : s)
      )
    }
  }

  /**
   * Eliminación en cascada (opción A — frontend con anon key).
   * Borra: student_avatar_pieces → student_progress → profiles
   * El usuario de auth queda huérfano pero no puede iniciar sesión
   * porque ProtectedRoute verifica la existencia del profile.
   */
  async function handleDeleteStudent(student: StudentRow) {
    setDeletingId(student.id)
    setDeleteError(null)

    try {
      // 1. Piezas de avatar del estudiante
      const { error: piecesErr } = await supabase
        .from('student_avatar_pieces')
        .delete()
        .eq('student_id', student.id)
      if (piecesErr) throw new Error(`Piezas avatar: ${piecesErr.message}`)

      // 2. Progreso del estudiante
      const { error: progressErr } = await supabase
        .from('student_progress')
        .delete()
        .eq('student_id', student.id)
      if (progressErr) throw new Error(`Progreso: ${progressErr.message}`)

      // 3. Perfil del estudiante (última fila — FK constraints ya resueltas)
      const { error: profileErr } = await supabase
        .from('profiles')
        .delete()
        .eq('id', student.id)
      if (profileErr) throw new Error(`Perfil: ${profileErr.message}`)

      // Actualizar estado local sin recargar toda la tabla
      setStudents(prev => prev.filter(s => s.id !== student.id))
      setDeleteConfirm(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error desconocido al eliminar.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <LoadingSpinner mensaje="Cargando panel de administración..." />
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      {/* ════════ MODAL DE CONFIRMACIÓN DE BORRADO ════════ */}
      {deleteConfirm && (
        <div className="admin-delete-overlay" onClick={() => { setDeleteConfirm(null); setDeleteError(null) }}>
          <div className="admin-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-delete-modal__icon">🗑️</div>
            <h5 className="admin-delete-modal__title">Eliminar cuenta</h5>
            <p className="admin-delete-modal__body">
              Vas a eliminar permanentemente la cuenta de{' '}
              <strong>{deleteConfirm.full_name}</strong>.
              <br />
              Se borrarán su perfil, todo su progreso y sus piezas de avatar.
              <br />
              <span style={{ color: '#ef4444', fontWeight: 700 }}>Esta acción no se puede deshacer.</span>
            </p>

            {deleteError && (
              <div className="alert alert-danger py-2 small mb-3">{deleteError}</div>
            )}

            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => { setDeleteConfirm(null); setDeleteError(null) }}
                disabled={deletingId !== null}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteStudent(deleteConfirm)}
                disabled={deletingId !== null}
              >
                {deletingId ? (
                  <><span className="spinner-border spinner-border-sm me-1" /> Eliminando…</>
                ) : (
                  '🗑️ Sí, eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout__body">

        {/* ════════ SIDEBAR ════════ */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__header">
            <span style={{ fontSize: '1.5rem' }}>🎮</span>
            <div>
              <div className="admin-sidebar__title">Panel Admin</div>
              <div className="admin-sidebar__subtitle">La ruta hacia la conexión</div>
            </div>
          </div>

          <nav className="admin-sidebar__nav">
            <button
              className={`admin-sidebar__link ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`admin-sidebar__link ${activeSection === 'students' ? 'active' : ''}`}
              onClick={() => setActiveSection('students')}
            >
              👥 Estudiantes
            </button>
            <button
              className={`admin-sidebar__link ${activeSection === 'ranking' ? 'active' : ''}`}
              onClick={() => setActiveSection('ranking')}
            >
              🏆 Ranking
            </button>
          </nav>

          <div className="admin-sidebar__footer">
            <div className="small mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {profile?.full_name}
            </div>
            <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ════════ CONTENIDO PRINCIPAL ════════ */}
        <main className="admin-main">

          {/* ══ SECCIÓN: DASHBOARD ══ */}
          {activeSection === 'dashboard' && (
            <>
              <div className="admin-main__header mb-4">
                <div>
                  <h1 className="admin-main__title">Dashboard</h1>
                  <p className="admin-main__desc">Gestiona los estudiantes y monitorea su progreso</p>
                </div>
                <span
                  className="badge"
                  style={{ background: 'var(--eq-primary)', color: '#fff', fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                >
                  Generación: {stats.activePeriod}
                </span>
              </div>

              <div className="row g-3 mb-5">
                {[
                  { icon: '👥', label: 'Total estudiantes', value: stats.total,    color: '#dbeafe' },
                  { icon: '✅', label: 'Activos',           value: stats.active,   color: '#d1fae5' },
                  { icon: '📦', label: 'Archivados',        value: stats.archived, color: '#fef3c7' },
                  { icon: '⚡', label: 'XP promedio',       value: stats.avgXp,    color: '#ede9fe' },
                ].map(s => (
                  <div key={s.label} className="col-6 col-lg-3">
                    <div className="admin-stat-card">
                      <div className="admin-stat-card__icon" style={{ background: s.color }}>{s.icon}</div>
                      <div>
                        <div className="admin-stat-card__value">{s.value}</div>
                        <div className="admin-stat-card__label">{s.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Bloque 5: Top 3 del momento ── */}
              <h5 className="admin-dash-section-title">👑 Top 3 del momento</h5>
              {stats.top3.length === 0 ? (
                <p className="text-muted small mb-5">Aún no hay estudiantes con XP registrado.</p>
              ) : (
                <div className="row g-3 mb-5">
                  {stats.top3.map((s, idx) => {
                    const meta = [
                      { emoji: '🥇', bg: '#fffbe6', ring: '#f59e0b' },
                      { emoji: '🥈', bg: '#f1f5f9', ring: '#94a3b8' },
                      { emoji: '🥉', bg: '#fff7ed', ring: '#f97316' },
                    ][idx]
                    return (
                      <div key={s.id} className="col-12 col-md-4">
                        <div
                          className="admin-dash-podium-card"
                          style={{ borderTop: `4px solid ${meta.ring}`, background: meta.bg }}
                        >
                          <div className="admin-dash-podium-card__medal">{meta.emoji}</div>
                          <CharacterAvatar avatarConfig={s.avatar_config} size={56} className="admin-dash-podium-card__avatar" />
                          <div className="admin-dash-podium-card__name">{s.full_name}</div>
                          <div className="admin-dash-podium-card__course">
                            {s.classroom ?? '—'} · Grado {s.grade ?? '—'}°
                          </div>
                          <div className="admin-dash-podium-card__stats">
                            <span className="admin-dash-podium-card__xp">⚡ {s.xp} XP</span>
                            <span className="admin-dash-podium-card__level">Nv. {s.level}</span>
                          </div>
                          <div className="admin-dash-podium-card__games">
                            🎮 {s.games_completed}/{TOTAL_WORLDS * GAMES_PER_WORLD} juegos
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Bloque 1: Progreso por mundo ── */}
              <h5 className="admin-dash-section-title">🗺️ Progreso por mundo</h5>
              <p className="text-muted small mb-3">
                Porcentaje de estudiantes activos que completaron cada mundo.
              </p>
              <div className="d-flex flex-column gap-3 mb-4">
                {stats.worldProgress.map(({ world, done, pct }) => (
                  <div key={world} className="admin-dash-world-bar">
                    <div className="admin-dash-world-bar__header">
                      <span className="admin-dash-world-bar__name">
                        <span className="me-2" style={{ fontSize: '1.1rem' }}>
                          {['🌐', '🔗', '✨'][world - 1]}
                        </span>
                        Mundo {world} — {WORLD_NAMES[world]}
                      </span>
                      <span className="admin-dash-world-bar__meta">
                        {done}/{stats.active} · {pct}%
                      </span>
                    </div>
                    <div className="admin-dash-world-bar__track">
                      <div
                        className="admin-dash-world-bar__fill"
                        style={{ width: `${pct}%`, background: ['#3b82f6', '#10b981', '#f59e0b'][world - 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ══ SECCIÓN: ESTUDIANTES ══ */}
          {activeSection === 'students' && (
            <>
              <div className="admin-main__header mb-4">
                <div>
                  <h1 className="admin-main__title">Estudiantes</h1>
                  <p className="admin-main__desc">Consulta, archiva o elimina cuentas de estudiantes</p>
                </div>
              </div>

              {/* Filtros */}
              <div className="admin-filters mb-3">
                <div className="row g-2 align-items-end">
                  <div className="col-12 col-md-3">
                    <label className="form-label small fw-semibold">🔍 Buscar</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Nombre o curso..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold">Generación</label>
                    <select
                      className="form-select form-select-sm"
                      value={filterPeriod === 'all' ? 'all' : filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    >
                      <option value="all">Todas</option>
                      {periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold">Grado</label>
                    <select className="form-select form-select-sm" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                      <option value="all">Todos</option>
                      <option value="8">8°</option>
                      <option value="9">9°</option>
                      <option value="10">10°</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold">Curso</label>
                    <select className="form-select form-select-sm" value={filterClassroom} onChange={(e) => setFilterClassroom(e.target.value)}>
                      <option value="all">Todos</option>
                      {uniqueClassrooms.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label small fw-semibold">Estado</label>
                    <select className="form-select form-select-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="all">Todos</option>
                      <option value="active">Activos</option>
                      <option value="archived">Archivados</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-1 text-end">
                    <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                      {filteredStudents.length} resultado{filteredStudents.length !== 1 && 's'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="admin-table-wrapper">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <div style={{ fontSize: '2.5rem' }} className="mb-2">📭</div>
                    <p className="fw-semibold mb-1">No se encontraron estudiantes</p>
                    <p className="small">Ajusta los filtros o espera a que se registren estudiantes.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th style={{ minWidth: 180 }}>Nombre</th>
                          <th>Grado</th>
                          <th>Curso</th>
                          <th>Generación</th>
                          <th>XP</th>
                          <th>Nivel</th>
                          <th>Mundos</th>
                          <th>Juegos</th>
                          <th>Estado</th>
                          <th style={{ minWidth: 160 }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map(student => {
                          const periodName = periods.find(p => p.id === student.academic_period_id)?.name ?? new Date().getFullYear().toString()
                          return (
                            <tr key={student.id}>
                              <td>
                                <div className="fw-semibold" style={{ fontSize: '0.88rem' }}>{student.full_name}</div>
                              </td>
                              <td>{student.grade ? `${student.grade}°` : '—'}</td>
                              <td>{student.classroom ?? '—'}</td>
                              <td>
                                <span className="badge bg-light text-dark" style={{ fontSize: '0.75rem' }}>
                                  {periodName}
                                </span>
                              </td>
                              <td>
                                <span className="fw-bold" style={{ color: 'var(--eq-primary)' }}>{student.xp}</span>
                              </td>
                              <td>
                                <span className="badge" style={{ background: 'var(--gov-yellow)', color: '#1a2540', fontWeight: 700, fontSize: '0.75rem' }}>
                                  Nv. {student.level}
                                </span>
                              </td>
                              <td>{student.worlds_completed}/{TOTAL_WORLDS}</td>
                              <td>{student.games_completed}/{TOTAL_WORLDS * GAMES_PER_WORLD}</td>
                              <td>
                                {student.is_active
                                  ? <span className="badge bg-success" style={{ fontSize: '0.72rem' }}>Activo</span>
                                  : <span className="badge bg-secondary" style={{ fontSize: '0.72rem' }}>Archivado</span>
                                }
                              </td>
                              <td>
                                <div className="d-flex gap-1 flex-wrap">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    title="Ver detalle"
                                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                    onClick={() => alert(`Detalle de ${student.full_name}\nXP: ${student.xp}\nNivel: ${student.level}\nJuegos: ${student.games_completed}/6\nMundos: ${student.worlds_completed}/3`)}
                                  >
                                    👁️ Ver
                                  </button>
                                  <button
                                    className={`btn btn-sm ${student.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                    title={student.is_active ? 'Archivar' : 'Reactivar'}
                                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                    onClick={() => handleToggleStatus(student.id, student.is_active)}
                                  >
                                    {student.is_active ? '📦' : '✅'}
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Eliminar cuenta permanentemente"
                                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                    onClick={() => { setDeleteError(null); setDeleteConfirm(student) }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══ SECCIÓN: RANKING ══ */}
          {activeSection === 'ranking' && (
            <>
              <div className="admin-main__header mb-4">
                <div>
                  <h1 className="admin-main__title">🏆 Ranking de estudiantes</h1>
                  <p className="admin-main__desc">
                    Todos los estudiantes activos ordenados por XP acumulado — actualizado en tiempo real con la BD.
                  </p>
                </div>
                <span
                  className="badge"
                  style={{ background: 'var(--eq-primary)', color: '#fff', fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                >
                  {rankedStudents.length} estudiante{rankedStudents.length !== 1 && 's'}
                </span>
              </div>

              {rankedStudents.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <div style={{ fontSize: '2.5rem' }} className="mb-2">🏆</div>
                  <p className="fw-semibold">Aún no hay estudiantes activos.</p>
                </div>
              ) : (
                <div className="admin-ranking-list">
                  {/* Cabecera de columnas */}
                  <div className="admin-ranking-list__header">
                    <span className="admin-ranking-list__col-pos">Pos.</span>
                    <span className="admin-ranking-list__col-name">Estudiante</span>
                    <span className="admin-ranking-list__col-course">Curso</span>
                    <span className="admin-ranking-list__col-xp">XP</span>
                    <span className="admin-ranking-list__col-level">Nivel</span>
                    <span className="admin-ranking-list__col-games">Juegos</span>
                  </div>

                  {rankedStudents.map((student, idx) => {
                    const rank = idx + 1
                    const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
                    const rowClass = rank <= 3 ? `admin-ranking-list__row top-${rank}` : 'admin-ranking-list__row'

                    return (
                      <div key={student.id} className={rowClass}>
                        <span className="admin-ranking-list__col-pos">
                          {medalEmoji
                            ? <span className="admin-ranking-medal">{medalEmoji}</span>
                            : <span className="admin-ranking-num">#{rank}</span>
                          }
                        </span>
                        <span className="admin-ranking-list__col-name">
                          <CharacterAvatar avatarConfig={student.avatar_config} size={32} className="admin-ranking-avatar" />
                          <span className="admin-ranking-name">{student.full_name}</span>
                        </span>
                        <span className="admin-ranking-list__col-course">
                          {student.classroom ?? '—'}
                        </span>
                        <span className="admin-ranking-list__col-xp">
                          <span className="admin-ranking-xp">⚡ {student.xp}</span>
                        </span>
                        <span className="admin-ranking-list__col-level">
                          <span
                            className="badge"
                            style={{ background: 'var(--gov-yellow)', color: '#1a2540', fontWeight: 700, fontSize: '0.72rem' }}
                          >
                            Nv. {student.level}
                          </span>
                        </span>
                        <span className="admin-ranking-list__col-games">
                          {student.games_completed}/{TOTAL_WORLDS * GAMES_PER_WORLD}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  )
}
