import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import PageWrapper from '@/components/layout/PageWrapper'

// ─── Datos ────────────────────────────────────────────────────────────────────

const STATIC_STATS = [
  { key: 'mundos', number: '3', label: 'Mundos temáticos' },
  { key: 'juegos', number: '6', label: 'Juegos en total' },
  { key: 'estudiantes', number: null, label: 'Estudiantes' },
  { key: 'avatar', number: '+50', label: 'avatares a elegir' },
]

const HOW_IT_WORKS = [
  { step: '1', icon: '📝', title: 'Créate una cuenta', desc: 'Regístrate con tu correo y el código de clase que te dará tu docente.' },
  { step: '2', icon: '🗺️', title: 'Entra al primer mundo', desc: 'El Mundo 1 está desbloqueado desde el inicio. Completa sus 2 juegos para avanzar.' },
  { step: '3', icon: '⚡', title: 'Gana XP y sube de nivel', desc: 'Cada juego te da puntos de experiencia. No hay techo: sigue jugando y sube de nivel sin límite.' },
  { step: '4', icon: '🧑‍🎤', title: 'Elige tu avatar', desc: 'Al terminar cada mundo recibes un avatar !Completa los 3 mundos para desbloquear mas de 50 avatares!' },
]

const GAME_TYPES = [
  { icon: '🎯', name: 'El poder de tu decisión', sub: 'Mundo 1 · Nivel 1' },
  { icon: '🗺️', name: 'Nueva conexión', sub: 'Mundo 1 · Nivel 2' },
  { icon: '🌿', name: 'Explorador de experiencias', sub: 'Mundo 2 · Nivel 1' },
  { icon: '⏱️', name: 'Banco del tiempo', sub: 'Mundo 2 · Nivel 2' },
  { icon: '🎭', name: 'Sé auténtico, más allá de un like', sub: 'Mundo 3 · Nivel 1' },
  { icon: '🛡️', name: 'Escudo personal', sub: 'Mundo 3 · Nivel 2' },
]

// ─── Modal (renderizado en document.body via Portal) ─────────────────────────

type ModalKey = 'que' | 'para' | 'dev'

function InfoModal({ open, onClose }: { open: ModalKey | null; onClose: () => void }) {
  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="lp-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="lp-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera con degradado */}
        <div className="lp-modal__header">
          <span className="lp-modal__icon">
            {open === 'que' && '🔍'}
            {open === 'para' && '🎯'}
            {open === 'dev' && '👨‍💻'}
          </span>
          <h4 className="lp-modal__title">
            {open === 'que' && '¿Qué es La ruta hacia la conexión?'}
            {open === 'para' && '¿Para qué sirve?'}
            {open === 'dev' && 'Conócenos'}
          </h4>
          <button className="lp-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Cuerpo desplazable */}
        <div className="lp-modal__body">

          {open === 'que' && (
            <>
              <div className="lp-modal__section">
                <div className="lp-modal__badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Entorno web</div>
                <p>
                  La presente página web muestra un entorno a la estrategia realizada en el proyecto.
                  Está diseñada para que el usuario pueda interactuar de manera sostenible, generando
                  estabilidad en la página de forma funcional, con la posibilidad de explorar y jugar
                  en cualquier momento del día desde cualquier dispositivo.
                </p>
              </div>
              <div className="lp-modal__section">
                <div className="lp-modal__badge" style={{ background: '#fef3c7', color: '#92400e' }}>Sentimiento de soledad y redes sociales</div>
                <p>
                  El sentimiento de soledad es la desconexión o el vacío que sientes cuando percibes 
                  que nadie te comprende o que te falta un afecto sincero, incluso rodeado de personas. 
                  En un mundo donde las redes sociales facilitan conectar con un clic pero no siempre 
                  garantizan empatía real, comprender este sentimiento te ayuda a cuidar tu salud emocional 
                  y a buscar interacciones auténticas dentro y fuera de la pantalla.
                </p>
              </div>
              <div className="lp-modal__section">
                <div className="lp-modal__badge" style={{ background: '#d1fae5', color: '#065f46' }}>Los mundos</div>
                <p>
                 Los mundos son dinámicas gamificadas preparadas para cada campo a tratar. Es una forma interactiva 
                 y atractiva para que te intereses por conocer qué hay detrás de cada mundo y desarrolles nivel por 
                 nivel, obteniendo puntuaciones en un entorno digital que interactúa con el entorno real.
                </p>
              </div>
            </>
          )}

          {open === 'para' && (
            <>
              <div className="lp-modal__section">
                <div className="lp-modal__badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Colegio Ciudad de Pasto</div>
                <p>
                  En el presente colegio hay más de 150 estudiantes por grado escolar. La alta tasa de
                  estudiantes matriculados entre 14 y 17 años permite generar un impacto en la población
                  estudiantil, además de la gran diversidad de entornos sociales donde los estudiantes
                  desempeñan diferentes habilidades y gustos que pueden ser explorados en un entorno de confianza.
                </p>
              </div>
              <div className="lp-modal__section">
                <div className="lp-modal__badge" style={{ background: '#d1fae5', color: '#065f46' }}>Objetivos de la estrategia gamificada</div>
                <div className="lp-modal__world-item">
                  <span className="lp-modal__world-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Mundo 1</span>
                  <strong>Conexión en un entorno real</strong>
                  <p>Te incentiva a desarrollar habilidades sociales ejerciendo una conversación agradable ya sea con una persona de confianza o con quien puedas crear un nuevo vínculo, además de establecer límites creando un criterio propio.</p>
                </div>
                <div className="lp-modal__world-item">
                  <span className="lp-modal__world-badge" style={{ background: '#d1fae5', color: '#065f46' }}>Mundo 2</span>
                  <strong>Buen uso del tiempo libre</strong>
                  <p>Te incentivará a realizar actividades que ya conoces para compartir con los demás y conocerás nuevas que te harán pasar un momento agradable solo o acompañado.</p>
                </div>
                <div className="lp-modal__world-item">
                  <span className="lp-modal__world-badge" style={{ background: '#fef3c7', color: '#92400e' }}>Mundo 3</span>
                  <strong>Autoestima e identidad personal</strong>
                  <p>Explorarás todas las cualidades que tienes dentro de ti demostrando tus gustos para hacerlos conocer, además conocerás lo que los demás perciben de ti.</p>
                </div>
              </div>
            </>
          )}

          {open === 'dev' && (
            <>
              <div className="lp-modal__section">
                <div className="lp-modal__badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>Sobre el proyecto</div>
                <p>
                  <em>"La ruta hacia la conexión"</em> es un micrositio web con una estrategia gamificada
                  desarrollada como proyecto de grado:{' '}
                  <strong>"Impacto del uso de redes sociales en el sentimiento de soledad: caso de estudio
                    estudiantes de grados 8°, 9° y 10° del Colegio Ciudad de Pasto, año 2024"</strong>,
                  programa de Ingeniería de Sistemas — Universidad Mariana.
                </p>
              </div>
              <div className="lp-modal__section">
                <div className="lp-modal__badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Equipo</div>
                <div className="lp-modal__team">
                  <div className="lp-modal__team-member">
                    <div className="lp-modal__team-avatar" style={{ background: '#dbeafe' }}>💻</div>
                    <div>
                      <div className="lp-modal__team-name">David Ancizar Castro Benítez</div>
                      <div className="lp-modal__team-role">Desarrollador · Ingeniero de Sistemas en formación.</div>
                    </div>
                  </div>
                  <div className="lp-modal__team-member">
                    <div className="lp-modal__team-avatar" style={{ background: '#d1fae5' }}>🎓</div>
                    <div>
                      <div className="lp-modal__team-name">Wilson Andrés Castillo Castro</div>
                      <div className="lp-modal__team-role">Asesor · Ingeniero en Sistemas</div>
                    </div>
                  </div>
                  <div className="lp-modal__team-member">
                    <div className="lp-modal__team-avatar" style={{ background: '#fce7f3' }}>🧠</div>
                    <div>
                      <div className="lp-modal__team-name">Karina Alvarado</div>
                      <div className="lp-modal__team-role">Coinvestigadora · Psicóloga</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lp-modal__institution">
                🎓 Universidad Mariana — Ingeniería de Sistemas · 2024 - 2026
              </div>
            </>
          )}

        </div>

        {/* Pie */}
        <div className="lp-modal__footer">
          <button className="lp-modal__close-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LandingPage() {
  const [studentCount, setStudentCount] = useState<string | null>(null)
  const [infoModal, setInfoModal] = useState<ModalKey | null>(null)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student')
      .eq('is_active', true)
      .then(({ count, error }) => {
        setStudentCount(!error && count !== null && count > 0 ? String(count) : '★')
      })
  }, [])

  const STATS = STATIC_STATS.map(s =>
    s.key === 'estudiantes' ? { ...s, number: studentCount ?? '…' } : s
  )

  return (
    <PageWrapper>

      {/* Portal modal — fuera del flujo de la página */}
      <InfoModal open={infoModal} onClose={() => setInfoModal(null)} />

      {/* ══════════════ HERO ══════════════ */}
      <div className="eq-hero rounded-4 mb-5 page-fade">
        <div className="container position-relative">
          <div className="row align-items-center gy-4">

            <div className="col-12 col-lg-7">
              <span
                className="badge mb-3 px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.18)', fontSize: '0.82rem', fontWeight: 600 }}
              >
                🎓 Colegio Ciudad de Pasto · Grados 8°, 9°, 10° y 11°
              </span>

              <h1 className="display-title mb-3">
                <span style={{ color: 'var(--gov-yellow)' }}>El sentimiento de soledad</span>
                {' '}y el buen uso de las{' '}
                <span style={{ color: 'var(--gov-yellow)' }}>redes sociales</span>
              </h1>

              <p className="lead-text mb-4" style={{ textAlign: 'justify' }}>
                <strong>La ruta hacia la conexión</strong> es una aventura de 3 mundos donde
                conectarás con tu entorno real por medio de una estrategia entretenida,
                con el fin de reforzar el buen uso de las redes sociales junto con
                conocer y fortalecer vínculos sociales, mitigando ese sentimiento de
                soledad que puede estar presente en la vida estudiantil y adolescente.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="btn btn-lg fw-bold px-4"
                  style={{ background: 'var(--gov-yellow)', color: '#1a2540', borderRadius: '0.75rem', border: 'none' }}
                >
                  🚀 Comenzar aventura
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-4" style={{ borderRadius: '0.75rem' }}>
                  Ya tengo cuenta
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div className="row g-3">
                {STATS.map((s) => (
                  <div key={s.label} className="col-6">
                    <div className="hero-stat">
                      <div className="hero-stat__number">{s.number}</div>
                      <div className="hero-stat__label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════ TARJETAS INFORMATIVAS ══════════════ */}
      <section className="mb-5 fade-up">
        <div className="row g-4 justify-content-center">

          <div className="col-12 col-md-4">
            <div className="info-card" onClick={() => setInfoModal('que')}>
              <div className="info-card__glow" style={{ background: 'radial-gradient(circle at 50% 0%, #3b82f622 0%, transparent 70%)' }} />
              <div className="info-card__icon-wrap" style={{ background: '#dbeafe', color: '#1d4ed8' }}>🔍</div>
              <h5 className="info-card__title">¿Qué es?</h5>
              <p className="info-card__desc">Conoce de qué trata este proyecto y la propuesta que hay detrás de cada misión.</p>
              <span className="info-card__cta">Ver más <span className="info-card__arrow">→</span></span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="info-card info-card--featured" onClick={() => setInfoModal('para')}>
              <div className="info-card__glow" style={{ background: 'radial-gradient(circle at 50% 0%, #f59e0b33 0%, transparent 70%)' }} />
              <div className="info-card__icon-wrap" style={{ background: '#fef3c7', color: '#b45309' }}>🎯</div>
              <h5 className="info-card__title">¿Para qué?</h5>
              <p className="info-card__desc">Descubre el objetivo del proyecto y cómo puede impactar tu bienestar emocional y social.</p>
              <span className="info-card__cta">Ver más <span className="info-card__arrow">→</span></span>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="info-card" onClick={() => setInfoModal('dev')}>
              <div className="info-card__glow" style={{ background: 'radial-gradient(circle at 50% 0%, #8b5cf622 0%, transparent 70%)' }} />
              <div className="info-card__icon-wrap" style={{ background: '#ede9fe', color: '#6d28d9' }}>👨‍💻</div>
              <h5 className="info-card__title">Conócenos</h5>
              <p className="info-card__desc">Conoce al equipo y la entidad que hace posible esta experiencia gamificada.</p>
              <span className="info-card__cta">Ver más <span className="info-card__arrow">→</span></span>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════ LOS 6 JUEGOS ══════════════ */}
      <section className="mb-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Los 6 juegos de la ruta</h2>
          <p className="text-muted">Una aventura distinta en cada nivel</p>
        </div>

        <div className="row g-3 justify-content-center">
          {GAME_TYPES.map((g, i) => (
            <div key={g.name} className="col-6 col-sm-4 col-md-2 fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <div
                className="text-center p-3 rounded-3 h-100 d-flex flex-column align-items-center justify-content-center"
                style={{ background: '#fff', border: '1px solid var(--eq-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{g.icon}</div>
                <div className="fw-bold" style={{ color: 'var(--eq-text)', fontSize: '0.78rem', lineHeight: 1.4, marginBottom: '0.25rem' }}>{g.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>{g.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ CÓMO FUNCIONA ══════════════ */}
      <section className="mb-5">
        <div className="rounded-4 p-4 p-md-5" style={{ background: '#f8f7ff', border: '1px solid #e0e7ff' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>¿Cómo funciona?</h2>
            <p className="text-muted mb-0">4 pasos simples para completar tu ruta</p>
          </div>

          <div className="row g-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="col-12 col-sm-6 col-lg-3 fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="d-flex flex-column align-items-center text-center">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle fw-bold mb-3"
                    style={{ width: 48, height: 48, background: 'var(--eq-primary)', color: '#fff', fontFamily: 'Montserrat, sans-serif', fontSize: '1.1rem', fontWeight: 800 }}
                  >
                    {item.step}
                  </div>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <h6 className="fw-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{item.title}</h6>
                  <p className="text-muted small mb-0" style={{ lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <section className="text-center py-4 mb-4">
        <div
          className="rounded-4 p-4 p-md-5"
          style={{
            background: 'linear-gradient(135deg, var(--eq-primary) 0%, #1a3f80 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(to right, #FCD116 33.3%, #003893 33.3%, #003893 66.6%, #CE1126 66.6%)' }} />
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎮</div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>¿Listo para iniciar tu ruta?</h3>
          <p className="mb-4 opacity-75">Únete a tus compañeros de grado y descubre todo lo que hay detrás de las redes sociales.</p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link
              to="/register"
              className="btn btn-lg fw-bold px-5"
              style={{ background: 'var(--gov-yellow)', color: '#1a2540', border: 'none', borderRadius: '0.75rem' }}
            >
              🚀 Crear mi cuenta
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-4" style={{ borderRadius: '0.75rem' }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

    </PageWrapper>
  )
}
