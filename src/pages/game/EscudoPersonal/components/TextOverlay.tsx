import { useEffect, useRef, useState } from 'react'
import type { EditorState } from '../types'

interface TextOverlayProps {
  /** Posición sobre el canvas donde se ancla el texto (ya en % del wrapper) */
  xPercent:   number
  yPercent:   number
  editorState: EditorState
  /** Fija el texto al canvas y cierra el overlay */
  onStamp: (text: string) => void
  /** Cancela sin añadir nada */
  onCancel: () => void
}

/**
 * Campo de texto flotante que se muestra encima del canvas.
 *
 * El estudiante escribe aquí y al confirmar (Enter o botón) el texto
 * se vuelca al canvas con `stampText`. Así el texto queda integrado en
 * el dibujo, no como capa separada de HTML.
 *
 * La posición se expresa como porcentaje del wrapper del canvas para
 * que funcione correctamente en pantallas de cualquier tamaño.
 */
export default function TextOverlay({
  xPercent,
  yPercent,
  editorState,
  onStamp,
  onCancel,
}: TextOverlayProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const { fontSize, fontFamily, fontBold, fontItalic, color } = editorState
  const style: React.CSSProperties = {
    left: `${xPercent}%`,
    top:  `${yPercent}%`,
    fontSize: `${Math.round(fontSize * 0.9)}px`, // aproximación visual
    fontFamily,
    fontWeight: fontBold ? 700 : 400,
    fontStyle:  fontItalic ? 'italic' : 'normal',
    color,
    minWidth: '8ch',
    maxWidth: '80%',
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); onStamp(value) }
    if (e.key === 'Escape') { e.preventDefault(); onCancel() }
  }

  return (
    <div className="ep-text-overlay" style={{ left: style.left, top: style.top }}>
      <input
        ref={inputRef}
        className="ep-text-input"
        style={style}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe aquí…"
        aria-label="Escribe el texto que aparecerá en el escudo"
      />
      <div className="ep-text-actions">
        <button type="button" className="ep-text-btn ep-text-btn--ok"
          onClick={() => onStamp(value)}>✓</button>
        <button type="button" className="ep-text-btn ep-text-btn--cancel"
          onClick={onCancel}>✕</button>
      </div>
    </div>
  )
}
