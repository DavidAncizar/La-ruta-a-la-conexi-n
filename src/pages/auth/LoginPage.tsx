import { Link } from 'react-router-dom'
import { useLoginForm } from '@/hooks/useLoginForm'

// ─── Íconos SVG inline (sin dependencias externas) ───────────────────────────

function IconEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

// ─── Panel decorativo izquierdo ───────────────────────────────────────────────

function AuthDecorPanel() {
  const items = [
    { icon: '🗺️', label: 'Explora los Mundos' },
    { icon: '⚡', label: 'Gana XP con cada nivel' },
    { icon: '🏆', label: 'Desbloquea nuevos accesorios para tu avatar' },
    { icon: '📊', label: 'Sigue tu progreso' },
  ]

  return (
    <div className="auth-decor-panel" aria-hidden="true">
      {/* Tricolor Colombia — acento superior */}
      <div className="auth-decor-panel__tricolor" />

      <div className="auth-decor-panel__content">
        {/* Logo grande */}
        <div className="auth-decor-panel__logo">🎮</div>
        <h2 className="auth-decor-panel__title">La ruta hacia la conexión</h2>
        <p className="auth-decor-panel__subtitle">
          La aventura del aprendizaje<br />comienza aquí
        </p>

        {/* Lista de características */}
        <ul className="auth-decor-panel__features">
          {items.map((item) => (
            <li key={item.label} className="auth-decor-panel__feature-item">
              <span className="auth-decor-panel__feature-icon">{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        {/* Etiqueta institucional */}
        <div className="auth-decor-panel__badge">
          🏫 Colegio Ciudad de Pasto · Grados 8°, 9°, 10° y 11°
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LoginPage() {
  const {
    fields,
    fieldErrors,
    serverError,
    showPassword,
    isLoading,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  } = useLoginForm()

  return (
    <div className="auth-layout">

      <div className="auth-layout__body">

        {/* ── Panel decorativo (solo escritorio) ── */}
        <div className="auth-layout__left d-none d-lg-flex">
          <AuthDecorPanel />
        </div>

        {/* ── Panel del formulario ── */}
        <div className="auth-layout__right">
          <div className="auth-form-wrapper page-fade">

            {/* Cabecera del card */}
            <div className="auth-form-wrapper__header">
              {/* Logo visible solo en móvil / tablet */}
              <div className="d-lg-none text-center mb-3">
                <span style={{ fontSize: '2.5rem' }}>🎮</span>
                <p className="fw-bold mb-0"
                  style={{ color: 'var(--eq-primary)', fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem' }}>
                  La ruta hacia la conexión
                </p>
              </div>

              <h1 className="auth-form-wrapper__title">Bienvenido</h1>
              <p className="auth-form-wrapper__desc">
                Ingresa tus datos para continuar tu aventura de aprendizaje
              </p>
            </div>

            {/* ── Error del servidor ── */}
            {serverError && (
              <div className="auth-alert auth-alert--error" role="alert">
                <IconAlert />
                <span>{serverError}</span>
              </div>
            )}

            {/* ── Formulario ── */}
            <form onSubmit={handleSubmit} noValidate aria-label="Formulario de inicio de sesión">

              {/* Campo: correo */}
              <div className="auth-field">
                <label htmlFor="login-email" className="auth-field__label">
                  Correo electrónico
                </label>
                <div className={`auth-field__input-wrap ${fieldErrors.email ? 'is-invalid' : ''}`}>
                  <span className="auth-field__icon">
                    <IconEmail />
                  </span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className="auth-field__input"
                    placeholder="tucorreo@ejemplo.com"
                    value={fields.email}
                    onChange={handleChange}
                    autoComplete="email"
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    aria-invalid={!!fieldErrors.email}
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="auth-field__error" role="alert">
                    <IconAlert /> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Campo: contraseña */}
              <div className="auth-field">
                <div className="auth-field__label-row">
                  <label htmlFor="login-password" className="auth-field__label">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="auth-link auth-link--small"
                    tabIndex={-1}
                    aria-label="Recuperar contraseña"
                    onClick={() => {
                      /* TODO: navegar a /forgot-password */
                      alert('Recuperación de contraseña disponible próximamente.')
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className={`auth-field__input-wrap ${fieldErrors.password ? 'is-invalid' : ''}`}>
                  <span className="auth-field__icon">
                    <IconLock />
                  </span>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-field__input auth-field__input--with-action"
                    placeholder="Tu contraseña"
                    value={fields.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    aria-invalid={!!fieldErrors.password}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="auth-field__toggle"
                    onClick={toggleShowPassword}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    tabIndex={-1}
                  >
                    <IconEye open={showPassword} />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" className="auth-field__error" role="alert">
                    <IconAlert /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

            </form>

            {/* ── Divisor ── */}
            <div className="auth-divider">
              <span>¿Eres nuevo en La ruta hacia la conexión?</span>
            </div>

            {/* ── Link al registro ── */}
            <Link to="/register" className="auth-register-link">
              Crea tu cuenta
            </Link>

            {/* ── Volver al inicio ── */}
            <div className="text-center mt-3">
              <Link
                to="/"
                style={{
                  color: '#e67e22',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  opacity: 0.85,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '1'
                  ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'
                  ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'
                }}
              >
                ← Volver a la página de inicio
              </Link>
            </div>

          </div>
        </div>

      </div>

      {/* Pie institucional mínimo */}
      <div className="auth-layout__footer">
        <span>© {new Date().getFullYear()} Colegio Ciudad de Pasto</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <a href="https://www.gov.co" target="_blank" rel="noopener noreferrer">
          GOV.CO
        </a>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Uso exclusivo institucional</span>
      </div>

    </div>
  )
}
