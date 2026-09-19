import { useState } from 'react'
import type { DrawingTool, EditorState, FillMode, FontFamily } from '../types'
import {
  MIN_SIZE, MAX_SIZE,
  ERASER_MIN_SIZE,
  PALETTE_COLORS,
  MIN_FONT_SIZE, MAX_FONT_SIZE,
} from '../config'

interface ToolbarProps {
  state:     EditorState
  onChange:  (patch: Partial<EditorState>) => void
  onClear:   () => void
  onUndo:    () => void
  onRedo:    () => void
  canUndo:   boolean
  canRedo:   boolean
}

// ─── Grupos de herramientas ───────────────────────────────────────────────────

const DRAW_TOOLS: { id: DrawingTool; icon: string; label: string }[] = [
  { id: 'pencil', icon: '✏️',  label: 'Lápiz' },
  { id: 'brush',  icon: '🖌️', label: 'Pincel' },
  { id: 'eraser', icon: '🧽', label: 'Borrador' },
  { id: 'fill',   icon: '🪣',  label: 'Relleno' },
  { id: 'text',   icon: 'T',   label: 'Texto' },
]

const SHAPE_TOOLS: { id: DrawingTool; icon: string; label: string }[] = [
  { id: 'line',     icon: '╱',  label: 'Línea' },
  { id: 'rect',     icon: '▭',  label: 'Rectángulo' },
  { id: 'circle',   icon: '◯',  label: 'Círculo' },
  { id: 'triangle', icon: '△',  label: 'Triángulo' },
  { id: 'star',     icon: '★',  label: 'Estrella' },
  { id: 'arrow',    icon: '→',  label: 'Flecha' },
]

const FONTS: { value: FontFamily; label: string }[] = [
  { value: 'Arial',        label: 'Arial' },
  { value: 'Georgia',      label: 'Georgia' },
  { value: 'Courier New',  label: 'Courier' },
  { value: 'Verdana',      label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet' },
]

const FILL_MODES: { value: FillMode; label: string }[] = [
  { value: 'stroke', label: 'Contorno' },
  { value: 'fill',   label: 'Relleno' },
  { value: 'both',   label: 'Ambos' },
]

const SHAPE_TOOLS_SET = new Set(['rect', 'circle', 'triangle', 'star'])

/** Sección desplegable de la barra de herramientas */
function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="ep-section">
      <button
        type="button"
        className="ep-section__head"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="ep-section__title">{title}</span>
        <span className="ep-section__arrow" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="ep-section__body">{children}</div>}
    </div>
  )
}

export default function Toolbar({
  state, onChange, onClear, onUndo, onRedo, canUndo, canRedo,
}: ToolbarProps) {
  const isEraser     = state.tool === 'eraser'
  const isText       = state.tool === 'text'
  const isShapeFill  = SHAPE_TOOLS_SET.has(state.tool)
  const needsSize    = !isEraser && !isText

  return (
    <div className="ep-toolbar" role="toolbar" aria-label="Herramientas">

      {/* ── DIBUJO ── */}
      <Section title="Dibujo">
        <div className="ep-tool-grid">
          {DRAW_TOOLS.map(t => (
            <button
              key={t.id}
              type="button"
              title={t.label}
              aria-label={t.label}
              aria-pressed={state.tool === t.id}
              className={`ep-tool ${state.tool === t.id ? 'is-active' : ''}`}
              onClick={() => onChange({ tool: t.id })}
            >
              <span className="ep-tool__icon" aria-hidden="true">{t.icon}</span>
              <span className="ep-tool__label">{t.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── FORMAS ── */}
      <Section title="Formas">
        <div className="ep-tool-grid">
          {SHAPE_TOOLS.map(t => (
            <button
              key={t.id}
              type="button"
              title={t.label}
              aria-label={t.label}
              aria-pressed={state.tool === t.id}
              className={`ep-tool ${state.tool === t.id ? 'is-active' : ''}`}
              onClick={() => onChange({ tool: t.id })}
            >
              <span className="ep-tool__icon" aria-hidden="true">{t.icon}</span>
              <span className="ep-tool__label">{t.label}</span>
            </button>
          ))}
        </div>

        {isShapeFill && (
          <div className="ep-fill-row">
            {FILL_MODES.map(m => (
              <button
                key={m.value}
                type="button"
                className={`ep-fill-btn ${state.fillMode === m.value ? 'is-active' : ''}`}
                onClick={() => onChange({ fillMode: m.value })}
                aria-pressed={state.fillMode === m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* ── EDICIÓN ── */}
      <Section title="Edición">
        <div className="ep-tool-grid ep-tool-grid--edit">
          <button
            type="button" title="Deshacer (Ctrl+Z)"
            className="ep-tool"
            onClick={onUndo} disabled={!canUndo}
            aria-label="Deshacer"
          >
            <span className="ep-tool__icon" aria-hidden="true">↩</span>
            <span className="ep-tool__label">Deshacer</span>
          </button>
          <button
            type="button" title="Rehacer (Ctrl+Y)"
            className="ep-tool"
            onClick={onRedo} disabled={!canRedo}
            aria-label="Rehacer"
          >
            <span className="ep-tool__icon" aria-hidden="true">↪</span>
            <span className="ep-tool__label">Rehacer</span>
          </button>
        </div>
        <button type="button" className="ep-clear-btn" onClick={onClear}>
          🗑️ Limpiar todo
        </button>
      </Section>

      {/* ── ESTILO ── */}
      <Section title="Estilo">
        {/* Paleta de colores */}
        <div className="ep-palette" role="group" aria-label="Colores rápidos">
          {PALETTE_COLORS.map(hex => (
            <button
              key={hex}
              type="button"
              aria-label={`Color ${hex}`}
              aria-pressed={state.color === hex}
              className={`ep-swatch ${state.color === hex ? 'is-active' : ''}`}
              style={{ background: hex }}
              onClick={() => onChange({ color: hex })}
            />
          ))}
        </div>
        <div className="ep-color-row">
          <input
            id="ep-color-picker"
            type="color"
            value={state.color}
            onChange={e => onChange({ color: e.target.value })}
            className="ep-color-input"
            title="Color personalizado"
          />
          <span className="ep-color-preview" style={{ background: state.color }} aria-hidden="true" />
          <span className="ep-color-hex">{state.color}</span>
        </div>

        {/* Grosor */}
        {needsSize && (
          <div className="ep-control">
            <label className="ep-label" htmlFor="ep-size">
              Grosor: <strong>{state.size}px</strong>
            </label>
            <div className="ep-slider-row">
              <input id="ep-size" type="range" min={MIN_SIZE} max={MAX_SIZE}
                value={state.size} className="ep-slider"
                onChange={e => onChange({ size: +e.target.value })} />
              <span className="ep-size-dot"
                style={{ width: Math.min(state.size, 32), height: Math.min(state.size, 32) }}
                aria-hidden="true" />
            </div>
          </div>
        )}

        {/* Borrador */}
        {isEraser && (
          <div className="ep-control">
            <label className="ep-label" htmlFor="ep-eraser">
              Borrador: <strong>{state.eraserSize}px</strong>
            </label>
            <div className="ep-slider-row">
              <input id="ep-eraser" type="range" min={ERASER_MIN_SIZE} max={MAX_SIZE}
                value={state.eraserSize} className="ep-slider"
                onChange={e => onChange({ eraserSize: +e.target.value })} />
              <span className="ep-size-dot ep-size-dot--eraser"
                style={{ width: Math.min(state.eraserSize, 32), height: Math.min(state.eraserSize, 32) }}
                aria-hidden="true" />
            </div>
          </div>
        )}

        {/* Opacidad */}
        <div className="ep-control">
          <label className="ep-label" htmlFor="ep-opacity">
            Opacidad: <strong>{Math.round(state.opacity * 100)}%</strong>
          </label>
          <input id="ep-opacity" type="range" min={10} max={100}
            value={Math.round(state.opacity * 100)} className="ep-slider"
            onChange={e => onChange({ opacity: +e.target.value / 100 })} />
        </div>
      </Section>

      {/* ── TEXTO ── */}
      {isText && (
        <Section title="Texto">
          <div className="ep-control">
            <label className="ep-label" htmlFor="ep-font-size">
              Tamaño: <strong>{state.fontSize}px</strong>
            </label>
            <input id="ep-font-size" type="range"
              min={MIN_FONT_SIZE} max={MAX_FONT_SIZE}
              value={state.fontSize} className="ep-slider"
              onChange={e => onChange({ fontSize: +e.target.value })} />
          </div>

          <div className="ep-control">
            <label className="ep-label" htmlFor="ep-font-family">Fuente</label>
            <select id="ep-font-family" className="ep-select"
              value={state.fontFamily}
              onChange={e => onChange({ fontFamily: e.target.value as FontFamily })}>
              {FONTS.map(f => (
                <option key={f.value} value={f.value}
                  style={{ fontFamily: f.value }}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="ep-text-style-row">
            <button type="button"
              className={`ep-style-btn ${state.fontBold ? 'is-active' : ''}`}
              onClick={() => onChange({ fontBold: !state.fontBold })}
              aria-pressed={state.fontBold}><strong>B</strong></button>
            <button type="button"
              className={`ep-style-btn ${state.fontItalic ? 'is-active' : ''}`}
              onClick={() => onChange({ fontItalic: !state.fontItalic })}
              aria-pressed={state.fontItalic}><em>I</em></button>

            {(['left', 'center', 'right'] as CanvasTextAlign[]).map(a => (
              <button key={a} type="button"
                className={`ep-style-btn ${state.textAlign === a ? 'is-active' : ''}`}
                onClick={() => onChange({ textAlign: a })}
                aria-pressed={state.textAlign === a}
                title={`Alinear ${a}`}>
                {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
              </button>
            ))}
          </div>
        </Section>
      )}

    </div>
  )
}
