import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import { supabase } from '@/lib/supabaseClient'

/**
 * Página /reset-password
 *
 * Supabase redirige aquí después de que el estudiante pulsa el enlace
 * del correo. El token viene en el hash de la URL como:
 *   /reset-password#access_token=...&type=recovery
 *
 * Supabase JS v2 detecta ese hash automáticamente al montar y dispara
 * el evento 'PASSWORD_RECOVERY' en onAuthStateChange. Solo hay que
 * escucharlo y habilitar el formulario.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [ready, setReady]       = useState(false)   // token válido detectado
  const [invalid, setInvalid]   = useState(false)   // token ausente o expirado
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  // ── Esperar a que Supabase procese el token del hash ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Si tras 4 segundos no se detectó el token, el link es inválido
    const timeout = setTimeout(() => {
      setInvalid(prev => {
        if (!ready) return true
        return prev
      })
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [ready])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    const { error: sbError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (sbError) {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
      return
    }

    // Cerrar sesión para que el estudiante entre con la nueva contraseña
    await supabase.auth.signOut()
    setDone(true)
  }

  // ── Contraseña actualizada ──
  if (done) {
    return (
      <PageWrapper fullscreen>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5">
              <div className="eq-auth-card page-fade text-center">
                <div style={{ fontSize: '3rem' }} className="mb-3">✅</div>
                <h3 className="fw-bold mb-2">¡Contraseña actualizada!</h3>
                <p className="text-muted mb-4">
                  Tu nueva contraseña quedó guardada. Ya puedes iniciar sesión.
                </p>
                <Link
                  to="/login"
                  className="btn btn-primary w-100 fw-semibold"
                  style={{ borderRadius: '0.6rem' }}
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // ── Enlace inválido o expirado ──
  if (invalid && !ready) {
    return (
      <PageWrapper fullscreen>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5">
              <div className="eq-auth-card page-fade text-center">
                <div style={{ fontSize: '3rem' }} className="mb-3">⏰</div>
                <h3 className="fw-bold mb-2">Enlace expirado</h3>
                <p className="text-muted mb-4">
                  Este enlace de recuperación ya no es válido. Los enlaces expiran en 1 hora.
                  Solicita uno nuevo.
                </p>
                <Link
                  to="/forgot-password"
                  className="btn btn-primary w-100 fw-semibold mb-3"
                  style={{ borderRadius: '0.6rem' }}
                >
                  Solicitar nuevo enlace
                </Link>
                <Link
                  to="/login"
                  style={{ color: '#e67e22', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  // ── Esperando token / formulario ──
  return (
    <PageWrapper fullscreen>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-7 col-lg-5">
            <div className="eq-auth-card page-fade">

              {/* Encabezado */}
              <div className="text-center mb-4">
                <div className="eq-auth-logo">🔒</div>
                <h2 className="fw-bold mt-1 mb-1" style={{ color: 'var(--eq-primary)' }}>
                  Nueva contraseña
                </h2>
                <p className="text-muted small">
                  Elige una contraseña segura para tu cuenta.
                </p>
              </div>

              {!ready ? (
                /* Verificando token */
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
                  <p className="text-muted small">Verificando enlace...</p>
                </div>
              ) : (
                /* Formulario */
                <>
                  {error && (
                    <div className="alert alert-danger py-2 small mb-3" role="alert">
                      ⚠️ {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Nueva contraseña
                      </label>
                      <div className="input-group">
                        <input
                          id="password"
                          type={showPass ? 'text' : 'password'}
                          className="form-control"
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={e => { setPassword(e.target.value); setError('') }}
                          disabled={loading}
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPass(p => !p)}
                          aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          tabIndex={-1}
                        >
                          {showPass ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirm" className="form-label">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        id="confirm"
                        type={showPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Repite tu contraseña"
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setError('') }}
                        disabled={loading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 fw-semibold py-2"
                      style={{ borderRadius: '0.6rem' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Guardando...
                        </>
                      ) : (
                        '✅ Guardar nueva contraseña'
                      )}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
