import { useState } from 'react'
import { EVIDENCE_DRIVE_URL, isEvidenceUrlConfigured } from '@/lib/evidence'

interface ShieldShareProps {
  /** DataURL PNG del escudo terminado */
  imageDataUrl: string
  /** Vuelve al editor sin perder el dibujo */
  onEdit: () => void
  /** Cierra el juego definitivamente */
  onFinish: () => void
  /** true mientras GamePage está guardando en Supabase */
  saving: boolean
}

// ─── Exportación PNG ────────────────────────────────────────────────────────

/**
 * Descarga el PNG del escudo en el dispositivo del estudiante.
 * Usa el método más compatible: crea un enlace temporal, lo hace clic
 * y lo borra. Funciona en todos los navegadores modernos de escritorio.
 * En iOS Safari la descarga puede abrirse en una nueva pestaña en lugar
 * de descargarse directamente — comportamiento del sistema, no un bug.
 */
function downloadPng(dataUrl: string) {
  const a    = document.createElement('a')
  a.href     = dataUrl
  a.download = 'Mi-Escudo-Personal.png'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ─── Compartir nativo ───────────────────────────────────────────────────────

async function shareShield(dataUrl: string): Promise<'shared' | 'download' | 'error'> {
  // Convertir dataURL a Blob para navigator.share
  const res  = await fetch(dataUrl)
  const blob = await res.blob()
  const file = new File([blob], 'Mi-Escudo-Personal.png', { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: 'Mi Escudo Personal',
        text:  'Creé mi escudo personal.',
        files: [file],
      })
      return 'shared'
    } catch {
      return 'error'   // el usuario canceló o el navegador rechazó
    }
  }

  // Fallback: descarga directa
  downloadPng(dataUrl)
  return 'download'
}

// ─── Componente ─────────────────────────────────────────────────────────────

/**
 * Pantalla de cierre del nivel "Escudo personal".
 *
 * Flujo:
 *   Ver el escudo terminado
 *   → Guardar PNG / Compartir (ambos opcionales)
 *   → Evidencia Drive (opcional, nunca bloquea)
 *   → Finalizar (otorga XP)
 */
export default function ShieldShare({
  imageDataUrl,
  onEdit,
  onFinish,
  saving,
}: ShieldShareProps) {
  const [shareStatus, setShareStatus]     = useState<'idle' | 'sharing' | 'done' | 'fallback'>('idle')
  const [canShareNative]                  = useState(() => {
    try {
      return typeof navigator.share === 'function'
    } catch {
      return false
    }
  })

  async function handleShare() {
    setShareStatus('sharing')
    const result = await shareShield(imageDataUrl)
    setShareStatus(result === 'shared' ? 'done' : 'fallback')
  }

  function handleDownload() {
    downloadPng(imageDataUrl)
  }

  return (
    <div className="ep-share page-fade">

      {/* ── Cabecera ── */}
      <div className="ep-share__hero">
        <span className="ep-share__icon" aria-hidden="true">🛡️</span>
        <h1 className="ep-share__title">¡TU ESCUDO ESTÁ LISTO!</h1>
        <p className="ep-share__lead">
          Este escudo representa algo de ti. Tú decides cómo quieres mostrarlo.
        </p>
      </div>

      {/* ── Imagen del escudo ── */}
      {imageDataUrl && (
        <div className="ep-share__preview-wrap">
          <img
            src={imageDataUrl}
            alt="Tu escudo personal"
            className="ep-share__preview-img"
          />
        </div>
      )}

      {/* ── ¿Quieres compartirlo? ── */}
      <div className="ep-share__ask">
        <p className="ep-share__ask-text">¿Quieres compartirlo con alguien?</p>
        <p className="ep-share__voluntary">Compartirlo es completamente voluntario.</p>
      </div>

      {/* Orientación social */}
      <div className="ep-share__hint">
        <span aria-hidden="true">💬</span>
        <span>
          Puedes enseñárselo a un compañero, compartirlo en tu grupo o
          publicarlo en tus redes si te nace hacerlo.
        </span>
      </div>

      {/* ── Acciones de compartir / guardar ── */}
      <div className="ep-share__actions">
        {/* Compartir nativo (o fallback con descarga) */}
        {canShareNative ? (
          <button
            type="button"
            className="ep-share-btn ep-share-btn--share"
            onClick={handleShare}
            disabled={shareStatus === 'sharing'}
          >
            📤 Compartir
          </button>
        ) : (
          <button
            type="button"
            className="ep-share-btn ep-share-btn--share"
            onClick={handleDownload}
          >
            📤 Compartir / Guardar
          </button>
        )}

        {/* Descarga directa siempre visible */}
        <button
          type="button"
          className="ep-share-btn ep-share-btn--download"
          onClick={handleDownload}
        >
          📥 Guardar imagen
        </button>
      </div>

      {/* Mensajes de estado del compartir */}
      {shareStatus === 'done' && (
        <p className="ep-share__status ep-share__status--ok" role="status">
          ✅ ¡Compartido!
        </p>
      )}

      {shareStatus === 'fallback' && (
        <p className="ep-share__status" role="status">
          Puedes guardar tu escudo y compartirlo donde quieras.
        </p>
      )}

      {/* ── Evidencia opcional en Drive ── */}
      <div className="ep-share__evidence">
        <p className="ep-share__evidence-title">📸 Evidencia (opcional)</p>
        <p className="ep-share__evidence-text">
          Si quieres guardar tu escudo como evidencia, súbelo a Google Drive.
          No es necesario para finalizar el juego.
        </p>

        {isEvidenceUrlConfigured ? (
          <a
            href={EVIDENCE_DRIVE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nc-btn nc-btn--outline nc-btn--full"
          >
            📤 Guardar evidencia en Drive (opcional)
          </a>
        ) : (
          <button
            className="nc-btn nc-btn--outline nc-btn--full"
            type="button"
            disabled
            title="Falta definir VITE_EVIDENCE_DRIVE_URL en el archivo .env"
          >
            📤 Guardar evidencia en Drive (enlace no configurado)
          </button>
        )}
      </div>

      {/* ── Botones de navegación ── */}
      <div className="ep-share__nav">
        <button
          type="button"
          className="nc-btn nc-btn--outline"
          onClick={onEdit}
        >
          ✏️ Seguir editando
        </button>

        <button
          type="button"
          className="nc-btn nc-btn--primary nc-btn--lg"
          onClick={onFinish}
          disabled={saving}
        >
          {saving ? 'Guardando…' : '✅ Finalizar'}
        </button>
      </div>

    </div>
  )
}
