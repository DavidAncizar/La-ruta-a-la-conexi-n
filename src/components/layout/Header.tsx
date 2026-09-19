import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { session, profile, loading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Un usuario está logueado si hay sesión activa
  const isLoggedIn = !!session
  const isAdmin = profile?.role === 'admin'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg eq-navbar" aria-label="Navegación principal">
      <div className="container">

        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🎮</span>
          <span>La ruta hacia la conexión</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="navbarMain"
          style={{ filter: 'invert(1)' }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin">🛠️ Panel Admin</NavLink>
                  </li>
                ) : (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/dashboard" end>🏠 Inicio</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/worlds">🗺️ Mundos</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/profile">👤 Mi Perfil</NavLink>
                    </li>
                  </>
                )}
              </>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end>Inicio</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            {loading ? (
              <span className="text-white-50 small">...</span>
            ) : isLoggedIn ? (
              <>
                {!isAdmin && profile && (
                  <div className="user-badge d-none d-lg-flex">
                    <span>⚡ {profile.xp} XP</span>
                    <span className="level-pill">Nv. {profile.level}</span>
                  </div>
                )}
                <span className="text-white-50 d-none d-lg-inline"
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {profile?.full_name ?? session?.user?.email ?? ''}
                </span>
                <button className="btn btn-outline-light btn-sm fw-semibold" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm fw-semibold">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="btn btn-sm fw-bold"
                  style={{ background: 'var(--gov-yellow)', color: '#1a2540', border: 'none', borderRadius: '0.45rem' }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
