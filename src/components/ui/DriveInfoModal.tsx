import { useState } from 'react'

// ─── Pasos del tutorial ───────────────────────────────────────────────────────

const TUTORIAL_STEPS = [
  {
    num: 1,
    title: 'Crea tu carpeta en Drive',
    desc: 'Abre Google Drive, haz clic en el botón "+ Nuevo" y selecciona "Nueva carpeta". Aparecerá un cuadro de diálogo donde escribirás el nombre.',
    img: '/drive-tutorial/paso1.png',
  },
  {
    num: 2,
    title: 'Nómbrala "EVIDENCIA – RUTA A LA CONEXIÓN"',
    desc: 'Escribe exactamente ese nombre en el campo de texto y haz clic en "Crear". Así tendrás un lugar organizado para todas tus evidencias.',
    img: '/drive-tutorial/paso2.png',
  },
  {
    num: 3,
    title: 'Sube tu archivo de evidencia',
    desc: 'Dentro de tu carpeta, haz clic en "+ Nuevo" → "Subir archivo". Elige la foto, captura de pantalla o documento que quieras guardar.',
    img: '/drive-tutorial/paso3.png',
  },
  {
    num: 4,
    title: '¡Tu evidencia está guardada!',
    desc: 'El archivo aparecerá en tu carpeta. Podrás ver y compartir tu progreso en cualquier momento. ¡Repite esto después de cada actividad!',
    img: '/drive-tutorial/paso4.png',
  },
]

interface DriveInfoModalProps {
  onClose: () => void
}

// ─── Logo Drive SVG ───────────────────────────────────────────────────────────
function DriveIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.87)} viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  )
}

export default function DriveInfoModal({ onClose }: DriveInfoModalProps) {
  const [step, setStep] = useState(0)
  const current = TUTORIAL_STEPS[step]
  const isFirst = step === 0
  const isLast  = step === TUTORIAL_STEPS.length - 1

  return (
    <div className="drive-modal-overlay" onClick={onClose}>
      <div className="drive-modal" onClick={e => e.stopPropagation()}>

        {/* ══ ENCABEZADO ══ */}
        <div className="drive-modal__header">
          <div className="drive-modal__header-icon">
            <DriveIcon size={30} />
          </div>
          <div className="drive-modal__header-text">
            <h5 className="drive-modal__title">Guarda tu evidencia en Drive</h5>
            <p className="drive-modal__subtitle">Es opcional pero muy valioso para tu proceso ✨</p>
          </div>
          <button className="drive-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* ══ BLOQUE TEÓRICO — solo visible en paso 1 ══ */}
        {isFirst && (
          <div className="drive-modal__theory">
            <div className="drive-modal__theory-header">
              <span className="drive-modal__theory-tag">📖 Soporte teórico</span>
            </div>
            <p className="drive-modal__theory-text">
              <strong>Harkin et al. (2016)</strong> demostraron que registrar el
              progreso de las actividades mejora significativamente el logro de metas,
              especialmente cuando ese registro es físico o tangible. Guardar una
              evidencia de lo que haces en esta experiencia gamificada es exactamente
              ese registro: te permite ver tu avance, reflexionar sobre él y crecer.
            </p>
          </div>
        )}

        {/* ══ PROGRESO VISUAL ══ */}
        <div className="drive-modal__progress-bar-wrap">
          <div
            className="drive-modal__progress-bar-fill"
            style={{ width: `${((step + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* ══ PASO ACTUAL ══ */}
        <div className="drive-modal__step">

          {/* Cabecera del paso */}
          <div className="drive-modal__step-header">
            <span className="drive-modal__step-badge">
              Paso {current.num} de {TUTORIAL_STEPS.length}
            </span>
          </div>

          <h6 className="drive-modal__step-title">{current.title}</h6>
          <p className="drive-modal__step-desc">{current.desc}</p>

          {/* Imagen */}
          <div className="drive-modal__img-wrap">
            <img
              src={current.img}
              alt={`Tutorial paso ${current.num}: ${current.title}`}
              className="drive-modal__img"
              onError={e => {
                const t = e.currentTarget
                t.style.display = 'none'
                const placeholder = t.nextElementSibling as HTMLElement | null
                if (placeholder) placeholder.style.display = 'flex'
              }}
            />
            <div className="drive-modal__img-placeholder" style={{ display: 'none' }}>
              <span style={{ fontSize: '2.5rem' }}>📂</span>
              <p className="small text-muted mt-2 mb-0">
                Pon la imagen aquí:<br />
                <code style={{ fontSize: '0.7rem' }}>public/drive-tutorial/paso{current.num}.png</code>
              </p>
            </div>
          </div>
        </div>

        {/* ══ DOTS ══ */}
        <div className="drive-modal__dots">
          {TUTORIAL_STEPS.map((_, i) => (
            <button
              key={i}
              className={`drive-modal__dot ${i === step ? 'active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Ir al paso ${i + 1}`}
            />
          ))}
        </div>

        {/* ══ NAVEGACIÓN ══ */}
        <div className="drive-modal__nav">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setStep(s => s - 1)}
            disabled={isFirst}
          >
            ← Anterior
          </button>

          <span className="drive-modal__nav-counter">
            {step + 1} / {TUTORIAL_STEPS.length}
          </span>

          {isLast ? (
            <button className="btn btn-success btn-sm fw-bold px-3" onClick={onClose}>
              ¡Entendido! ✓
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm fw-bold px-3"
              onClick={() => setStep(s => s + 1)}
            >
              Siguiente →
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
