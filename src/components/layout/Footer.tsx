import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="eq-footer" aria-label="Pie de página institucional">

      {/* ── Cuerpo principal del footer ── */}
      <div className="eq-footer__main">
        <div className="container">
          <div className="row gy-4">

            {/* Col 1 — Información de la institución */}
            <div className="col-12 col-md-4">
              <p className="eq-footer__title">🎮 La ruta hacia la conexión</p>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                Plataforma gamificada educativa del<br />
                <strong style={{ color: '#fff' }}>Colegio Ciudad de Pasto</strong><br />
                Institución Educativa Pública — Pasto, Nariño
              </p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Proyecto de tesis universitaria · Uso educativo
              </p>
            </div>

            {/* Col 2 — Navegación */}
            <div className="col-6 col-md-2">
              <p className="eq-footer__title">Navegación</p>
              <ul className="eq-footer__col-links">
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/login">Iniciar sesión</Link></li>
                <li><Link to="/register">Registrarse</Link></li>
              </ul>
            </div>

            {/* Col 3 — Accesibilidad y normas */}
            <div className="col-6 col-md-3">
              <p className="eq-footer__title">Transparencia</p>
              <ul className="eq-footer__col-links">
                <li>
                  <a href="https://www.gov.co" target="_blank" rel="noopener noreferrer">
                    Portal GOV.CO
                  </a>
                </li>
                <li>
                  <a href="https://www.mineducacion.gov.co" target="_blank" rel="noopener noreferrer">
                    MinEducación
                  </a>
                </li>
                <li>
                  <a href="https://www.mintic.gov.co" target="_blank" rel="noopener noreferrer">
                    MinTIC
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4 — Accesibilidad */}
            <div className="col-12 col-md-3">
              <p className="eq-footer__title">Accesibilidad</p>
              <p style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
                Este sitio cumple los lineamientos de accesibilidad
                web WCAG 2.1 nivel AA y la Estrategia Digital Gov.co.
              </p>
              <div className="d-flex gap-2 mt-2 flex-wrap">
                <span style={{
                  fontSize: '0.68rem', padding: '0.2rem 0.5rem',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '0.3rem', color: 'rgba(255,255,255,0.6)',
                }}>
                  WCAG 2.1 AA
                </span>
                <span style={{
                  fontSize: '0.68rem', padding: '0.2rem 0.5rem',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '0.3rem', color: 'rgba(255,255,255,0.6)',
                }}>
                  Gov.co
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Barra inferior de créditos ── */}
      <div className="eq-footer__bottom">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span>
              © {year} Colegio Ciudad de Pasto — Todos los derechos reservados
            </span>
            <span>
              República de Colombia · Ministerio de Educación Nacional
            </span>
          </div>
        </div>
      </div>

    </footer>
  )
}
