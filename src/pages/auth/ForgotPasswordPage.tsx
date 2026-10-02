import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import { supabase } from '@/lib/supabaseClient'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }

    setLoading(true)

    const { error: sbError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        // Supabase redirigirá aquí después de que el usuario pulse el link
        redirectTo: `${window.location.origin}/reset-password`,
      }
    )

    setLoading(false)

    if (sbError) {
      setError('No se pudo enviar el correo. Intenta de nuevo.')
      return
    }

    setSent(true)
  }

  // ── Pantalla de confirmación ──
  if (sent) {
    return (
      <PageWrapper fullscreen>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5">
              <div className="eq-auth-card page-fade text-center">
                <div style={{ fontSize: '3rem' }} className="mb-3">📬</div>
                <h3 className="fw-bold mb-2">¡Revisa tu correo!</h3>
                <p className="text-muted mb-2">
                  Enviamos un enlace de recuperación a:
                </p>
                <p className="fw-bold mb-4" style={{ color: 'var(--eq-primary)' }}>
                  {email}
                </p>
                <p className="text-muted small mb-4">
                  Abre el correo y pulsa el enlace para crear una nueva contraseña.
                  El enlace expira en <strong>1 hora</strong>.
                </p>
                <p className="text-muted small mb-4">
                  Si no lo ves, revisa la carpeta de <strong>spam o correo no deseado</strong>.
                </p>
                <Link
                  to="/login"
                  className="btn btn-primary w-100 fw-semibold"
                  style={{ borderRadius: '0.6rem' }}
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // ── Formulario ──
  return (
    <PageWrapper fullscreen>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            <div className="eq-auth-card page-fade">

              {/* Encabezado */}
              <div className="text-center mb-4">
                <div className="eq-auth-logo">🔑</div>
                <h2 className="fw-bold mt-1 mb-1" style={{ color: 'var(--eq-primary)' }}>
                  Recuperar contraseña
                </h2>
                <p className="text-muted small">
                  Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-semibold py-2 mb-3"
                  style={{ borderRadius: '0.6rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Enviando...
                    </>
                  ) : (
                    '📩 Enviar enlace de recuperación'
                  )}
                </button>
              </form>

              <div className="text-center">
                <Link
                  to="/login"
                  style={{
                    color: '#e67e22',
                    fontWeight: 600,
                    fontSize: '0.9rem',
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
                  ← Volver al inicio de sesión
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
