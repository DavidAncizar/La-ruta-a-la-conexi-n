import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Footer from '@/components/layout/Footer'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SupportButton from '@/components/ui/SupportButton'
import { PSYCHOLOGIST_NAME, SUPPORT_FORM_URL, HELP_LINES } from '@/config/support'

/**
 * Pestaña "¿Quieres hablar con alguien?".
 * Invita al estudiante a completar un formulario para que la
 * psico-orientadora del colegio conozca su caso y lo contacte.
 *
 * El nombre y el enlace se editan en src/config/support.ts
 */
export default function SupportPage() {
  const { profile, signOut } = useAuth()

  if (!profile) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <LoadingSpinner mensaje="Cargando..." />
        </div>
      </div>
    )
  }

  const formReady = SUPPORT_FORM_URL.trim().length > 0

  return (
    <div className="game-layout">
      <nav className="game-navbar">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <CharacterAvatar avatarConfig={profile.avatar_config} size={44} className="game-navbar__avatar" />
            <div>
              <div className="game-navbar__name">{profile.full_name}</div>
              <div className="game-navbar__info">Nivel {profile.level} · ⚡ {profile.xp} XP</div>
            </div>
            <SupportButton active />
          </div>
          <button className="btn btn-outline-light btn-sm" onClick={() => signOut()}>Salir</button>
        </div>
      </nav>

      <div className="game-tabs">
        <div className="container">
          <div className="d-flex gap-1">
            <Link to="/dashboard" className="game-tab">🏠 Inicio</Link>
            <Link to="/worlds"    className="game-tab">🗺️ Mundos</Link>
            <Link to="/profile"   className="game-tab">🧑‍🎤 Avatar</Link>
            <Link to="/ranking"   className="game-tab">🏆 Ranking</Link>
          </div>
        </div>
      </div>

      <main className="game-main">
        <div className="container" style={{ maxWidth: 760 }}>

          {/* ═══ Mensaje principal ═══ */}
          <section className="support-hero page-fade">
            <div className="support-hero__icon" aria-hidden="true">🤝</div>
            <h2 className="support-hero__title">No estás solo</h2>
            <p className="support-hero__text">
              A veces pasan cosas que no nos dejan sentirnos bien: tristeza, estrés,
              problemas con compañeros, en casa, o simplemente un peso que no sabes
              cómo explicar. Pedir apoyo no es debilidad, es una forma valiente de
              cuidarte.
            </p>
            <p className="support-hero__text">
              Si quieres buscar apoyo emocional y hablar de lo que sucede, completa
              el siguiente formulario para comunicarte con la psico-orientadora{' '}
              <strong>{PSYCHOLOGIST_NAME}</strong>.
            </p>

            {formReady ? (
              <a
                className="support-cta"
                href={SUPPORT_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                📝 Completar el formulario
                <span className="support-cta__sub">Se abre en una pestaña nueva</span>
              </a>
            ) : (
              <button type="button" className="support-cta support-cta--disabled" disabled>
                📝 Completar el formulario
                <span className="support-cta__sub">Muy pronto estará disponible</span>
              </button>
            )}
          </section>

          {/* ═══ Qué esperar ═══ */}
          <h3 className="support-heading">¿Cómo funciona?</h3>
          <ol className="support-steps">
            <li className="support-step">
              <span className="support-step__num" aria-hidden="true">1</span>
              <div>
                <strong>Llenas el formulario</strong>
                <p>Cuéntale a la psico-orientadora lo que quieras compartir. Tú decides cuánto contar.</p>
              </div>
            </li>
            <li className="support-step">
              <span className="support-step__num" aria-hidden="true">2</span>
              <div>
                <strong>Ella lo lee</strong>
                <p>La psico-orientadora del colegio se entera de tu caso y lo revisa con cuidado.</p>
              </div>
            </li>
            <li className="support-step">
              <span className="support-step__num" aria-hidden="true">3</span>
              <div>
                <strong>Te contacta</strong>
                <p>Se comunicará contigo para escucharte y acompañarte, sin juzgarte.</p>
              </div>
            </li>
          </ol>

          {/* ═══ Tranquilidad ═══ */}
          <div className="support-reassure" role="note">
            <p className="support-reassure__title">💙 Antes de empezar</p>
            <ul>
              <li>No hay respuestas correctas ni incorrectas.</li>
              <li>No necesitas contar todo de una vez ni escribir bonito.</li>
              <li>Pedir ayuda no te quita puntos ni afecta tu progreso en el juego.</li>
              <li>Puedes hacerlo cuando te sientas listo; este botón siempre estará aquí.</li>
            </ul>
          </div>

          {/* ═══ Urgencias ═══ */}
          <div className="support-urgent" role="note">
            <p className="support-urgent__title">🚨 Si necesitas ayuda ahora mismo</p>
            <p className="support-urgent__text">
              Si estás en peligro o piensas en hacerte daño, no esperes al formulario:
              habla ya con un adulto de confianza o llama a una de estas líneas.
            </p>
            <ul className="support-urgent__list">
              {HELP_LINES.map(l => (
                <li key={l.number}>
                  <a className="support-urgent__number" href={`tel:${l.number}`}>📞 {l.number}</a>
                  <span><strong>{l.name}.</strong> {l.detail}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
