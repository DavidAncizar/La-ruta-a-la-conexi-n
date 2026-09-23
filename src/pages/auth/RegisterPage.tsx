import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'
import { supabase } from '@/lib/supabaseClient'
import { GRADES, SAMPLE_CLASSROOMS } from '@/lib/constants'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName:  '',
    email:     '',
    grade:     '',
    classroom: '',
    avatarGender: '',
    password:  '',
    confirm:   '',
  })
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  // Filtrar cursos disponibles según el grado seleccionado
  const availableClassrooms = SAMPLE_CLASSROOMS.filter(c => c.startsWith(form.grade))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const { fullName, email, grade, classroom, avatarGender, password, confirm } = form

    // ── Validaciones locales ──
    if (!fullName || !email || !grade || !classroom || !avatarGender || !password || !confirm) {
      setError('Por favor completa todos los campos.')
      return
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Ingresa un correo electrónico válido.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    // ── 1. Crear usuario en Supabase Auth ──
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (authError) {
      setLoading(false)
      if (authError.message.includes('already registered')) {
        setError('Ya existe una cuenta con ese correo electrónico.')
      } else {
        setError('Error al crear la cuenta. Intenta de nuevo.')
      }
      return
    }

    if (!authData.user) {
      setLoading(false)
      setError('Error inesperado al crear la cuenta.')
      return
    }

    // ── 2. Obtener o crear periodo académico del año actual ──
    const currentYear = new Date().getFullYear().toString()

    // Primero buscar si ya existe un periodo para este año
    let { data: period } = await supabase
      .from('academic_periods')
      .select('id')
      .eq('name', currentYear)
      .limit(1)
      .maybeSingle()

    // Si no existe, crearlo automáticamente
    if (!period) {
      const { data: newPeriod } = await supabase
        .from('academic_periods')
        .insert({
          name: currentYear,
          description: `Año lectivo ${currentYear}`,
          starts_at: `${currentYear}-01-15`,
          is_active: true,
        })
        .select('id')
        .single()

      period = newPeriod
    }

    // ── 3. Insertar perfil en tabla profiles ──
    // NOTA: role es SIEMPRE 'student' — hardcodeado, nunca viene del formulario
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id:                 authData.user.id,
        full_name:          fullName.trim(),
        role:               'student',
        grade:              grade,
        classroom:          classroom,
        academic_period_id: period?.id ?? null,
        xp:                 0,
        level:              1,
        avatar_gender:      avatarGender as 'male' | 'female' | 'nonbinary',
        is_active:          true,
      })

    setLoading(false)

    if (profileError) {
      console.error('Error al crear perfil:', profileError.message)
      setError('La cuenta se creó pero hubo un error al guardar tu perfil. Contacta al docente.')
      return
    }

    // ── Éxito ──
    // Cerrar la sesión que se creó automáticamente (el estudiante debe hacer login)
    await supabase.auth.signOut()
    setSuccess(true)
  }

  // ── Pantalla de éxito ──
  if (success) {
    return (
      <PageWrapper fullscreen>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5">
              <div className="eq-auth-card page-fade text-center">
                <div style={{ fontSize: '3.5rem' }} className="mb-3">🎉</div>
                <h3 className="fw-bold mb-2">¡Cuenta creada!</h3>
                <p className="text-muted mb-4">
                  Tu cuenta ha sido creada con éxito. Inicia sesión para
                  comenzar tu aventura en La ruta hacia la conexión.
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

  // ── Formulario de registro ──
  return (
    <PageWrapper fullscreen>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">

            <div className="eq-auth-card page-fade">

              {/* Logo */}
              <div className="text-center mb-4">
                <div className="eq-auth-logo">🎮</div>
                <h2 className="fw-bold mt-1 mb-1" style={{ color: 'var(--eq-primary)' }}>
                  Crear cuenta
                </h2>
                <p className="text-muted small">
                  Únete a La ruta hacia la conexión
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">

                  {/* Nombre completo */}
                  <div className="col-12">
                    <label htmlFor="fullName" className="form-label">
                      Nombre completo
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="form-control"
                      placeholder="Ej: María García López"
                      value={form.fullName}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label htmlFor="email" className="form-label">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="tucorreo@ejemplo.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Grado */}
                  <div className="col-6">
                    <label htmlFor="grade" className="form-label">
                      Grado
                    </label>
                    <select
                      id="grade"
                      name="grade"
                      className="form-select"
                      value={form.grade}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}°</option>
                      ))}
                    </select>
                  </div>

                  {/* Curso */}
                  <div className="col-6">
                    <label htmlFor="classroom" className="form-label">
                      Curso
                    </label>
                    <select
                      id="classroom"
                      name="classroom"
                      className="form-select"
                      value={form.classroom}
                      onChange={handleChange}
                      disabled={loading || !form.grade}
                      required
                    >
                      <option value="">
                        {form.grade ? 'Seleccionar...' : 'Elige grado primero'}
                      </option>
                      {availableClassrooms.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Género (para el avatar) */}
                  <div className="col-12">
                    <label className="form-label">
                      ¿Cómo quieres que sea tu avatar?
                    </label>
                    <div className="d-flex gap-2 flex-wrap">
                      {[
                        { value: 'male',      emoji: '🧑', label: 'Chico',      bg: '#eff6ff' },
                        { value: 'female',    emoji: '👩', label: 'Chica',      bg: '#fdf2f8' },
                        { value: 'nonbinary', emoji: '🧑‍🦲', label: 'No binarie', bg: '#f0fdf4' },
                      ].map((opt) => {
                        const selected = form.avatarGender === opt.value
                        return (
                          <label
                            key={opt.value}
                            className="d-flex flex-column align-items-center justify-content-center gap-1 px-2 py-2 rounded-3 flex-fill"
                            style={{
                              border: selected ? '2px solid var(--eq-primary)' : '1.5px solid var(--eq-border)',
                              cursor: loading ? 'not-allowed' : 'pointer',
                              background: selected ? opt.bg : '#fff',
                              transition: 'all 0.15s',
                              minWidth: 90,
                            }}
                          >
                            <input
                              type="radio"
                              name="avatarGender"
                              value={opt.value}
                              checked={selected}
                              onChange={handleChange}
                              disabled={loading}
                              className="d-none"
                            />
                            <span style={{ fontSize: '1.5rem' }}>{opt.emoji}</span>
                            <span className="fw-semibold small">{opt.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="col-12">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <div className="input-group">
                      <input
                        id="password"
                        name="password"
                        type={showPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        value={form.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPass(!showPass)}
                        aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        tabIndex={-1}
                      >
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="col-12">
                    <label htmlFor="confirm" className="form-label">
                      Confirmar contraseña
                    </label>
                    <input
                      id="confirm"
                      name="confirm"
                      type={showPass ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Repite tu contraseña"
                      value={form.confirm}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Botón */}
                  <div className="col-12 mt-1">
                    <button
                      type="submit"
                      className="btn btn-primary w-100 fw-semibold py-2"
                      style={{ borderRadius: '0.6rem' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                          Creando cuenta...
                        </>
                      ) : (
                        '✅ Crear mi cuenta'
                      )}
                    </button>
                  </div>

                </div>
              </form>

              <hr className="my-3" />

              <p className="text-center text-muted small mb-0">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="fw-semibold"
                  style={{ color: 'var(--eq-primary)' }}
                >
                  Inicia sesión
                </Link>
              </p>
            </div>

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
                ← Volver al inicio
              </Link>
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
