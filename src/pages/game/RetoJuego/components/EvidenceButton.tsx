import { useEffect, useState } from 'react'
import { EVIDENCE_DRIVE_URL, isEvidenceUrlConfigured } from '@/lib/evidence'

interface EvidenceButtonProps {
  onConfirm: () => void
}

/** Ideas rápidas que rotan para inspirar cómo capturar el momento */
const CAPTURE_IDEAS = [
  '📸 Toma tu captura o evidencia de que hiciste el reto',
  '🎥 Grábate un video cortico',
  '🖼️ Guarda una captura de pantalla',
  '📝 Escribe una nota de cómo te fue',
]

/**
 * Zona de evidencia del reto: un recordatorio, siempre OPCIONAL, para
 * guardar un recuerdo de la actividad, y el botón para cerrar el reto.
 *
 * PRIVACIDAD: la aplicación no almacena fotos ni vídeos. Todo se
 * gestiona externamente en Drive, por elección del propio estudiante.
 *
 * Se usa una etiqueta <a> real (en vez de window.open) porque es el
 * método más confiable para abrir una pestaña nueva sin que el
 * bloqueador de popups del navegador termine navegando en la misma
 * pestaña y reinicie el estado del juego.
 */
export default function EvidenceButton({ onConfirm }: EvidenceButtonProps) {
  const [ideaIndex, setIdeaIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Rota la idea de captura cada pocos segundos, con un fundido suave.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setVisible(false)
      window.setTimeout(() => {
        setIdeaIndex(prev => (prev + 1) % CAPTURE_IDEAS.length)
        setVisible(true)
      }, 250)
    }, 3200)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="reto-capture">
      {/* Cápsula de recuerdo, estilo polaroid */}
      <div className="reto-capture__card">
        <span className="reto-capture__camera" aria-hidden="true">📷</span>
        <span className="reto-capture__flash" aria-hidden="true" />

        <p className="reto-capture__title">Guarda tu recuerdo</p>
        <p
          className={`reto-capture__idea ${visible ? 'is-visible' : ''}`}
          aria-live="polite"
        >
          {CAPTURE_IDEAS[ideaIndex]}
        </p>

        <span className="reto-capture__badge">100% opcional</span>
      </div>

      {isEvidenceUrlConfigured ? (
        <a
          href={EVIDENCE_DRIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="reto-btn reto-btn--outline reto-capture__drive"
        >
          📤 Guardar mi recuerdo en Drive
        </a>
      ) : (
        <button
          className="reto-btn reto-btn--outline reto-capture__drive"
          type="button"
          disabled
          title="Falta definir VITE_EVIDENCE_DRIVE_URL en el archivo .env"
        >
          📤 Guardar mi recuerdo en Drive (enlace no configurado)
        </button>
      )}

      <button
        className="reto-btn reto-btn--success"
        onClick={onConfirm}
        type="button"
      >
        ✅ Ya completé mi reto
      </button>
    </div>
  )
}
