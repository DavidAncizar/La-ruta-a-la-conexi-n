import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { session, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const isLoggedIn = !!session
  const isAdmin = profile?.role === 'admin'

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="eq-navbar" aria-label="Navegación principal">
      <div className="container d-flex align-items-center justify-content-between gap-2 flex-wrap">

        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2 flex-shrink-0" to="/">
          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🎮</span>
          <span>La ruta hacia la conexión</span>
        </Link>

        {/* Navegación + acciones — siempre visible */}
        <div className="d-flex align-items-center gap-2 flex-wrap">

          {/* Links de navegación */}
          {isLoggedIn ? (
            isAdmin ? (
              <NavLink className="nav-link text-white fw-semibold" to="/admin">🛠️ Panel Admin</NavLink>
            ) : (
              <>
                <NavLink className="nav-link text-white fw-semibold" to="/dashboard" end>🏠 Inicio</NavLink>
                <NavLink className="nav-link text-white fw-semibold" to="/worlds">🗺️ Mundos</NavLink>
                <NavLink className="nav-link text-white fw-semibold" to="/profile">👤 Mi Perfil</NavLink>
              </>
            )
          ) : (
            <NavLink className="nav-link text-white fw-semibold" to="/" end>Inicio</NavLink>
          )}

          {/* Acciones de sesión */}
          {loading ? (
            <span className="text-white-50 small">...</span>
          ) : isLoggedIn ? (
            <>
              {!isAdmin && profile && (
                <div className="user-badge d-none d-sm-flex">
                  <span>⚡ {profile.xp} XP</span>
                  <span className="level-pill">Nv. {profile.level}</span>
                </div>
              )}
              <button className="btn btn-outline-light btn-sm fw-semibold" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm fw-semibold">
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="btn btn-sm fw-bold"
                style={{ background: 'var(--gov-yellow)', color: '#1a2540', border: 'none', borderRadius: '0.45rem' }}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}
