/**
 * ShieldEditor — Editor de dibujo del Escudo Personal (Nivel 6)
 *
 * Arquitectura robusta:
 * - Capa 1 (main): Lienzo de dibujo activo con fondo blanco inicial dentro del escudo.
 * - Capa 2 (preview): Previsualización en tiempo real de formas geométricas durante el arrastre.
 * - Capa 3 (overlay): Marco heráldico con acento dorado y máscara exterior neutral (interior 100% transparente).
 * - Pointer Events unificados (mouse, stylus y táctil con setPointerCapture).
 * - Pila completa de Deshacer / Rehacer (Undo/Redo) con atajos de teclado (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z).
 * - Flood fill (relleno de cubeta) de alto rendimiento delimitado matemáticamente al interior del escudo.
 * - Herramienta de texto flotante con tipografía, tamaño y alineación configurables.
 * - Exportación de alta calidad al pulsar "Listo" combinando capas en un PNG nítido.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DEFAULT_COLOR,
  DEFAULT_SIZE,
  ERASER_DEFAULT_SIZE,
  DEFAULT_OPACITY,
  DEFAULT_FONT_SIZE,
  LOCAL_STORAGE_KEY,
} from '../config'
import type { EditorState, FillMode } from '../types'
import Toolbar from './Toolbar'

interface ShieldEditorProps {
  onBack: () => void
  onDone: (dataUrl: string) => void
}

// ── Geometría del escudo ──────────────────────────────────────────────────────

export function shieldPts(): [number, number][] {
  const mx = 0.05 * CANVAS_WIDTH
  const my = 0.05 * CANVAS_HEIGHT
  const bw = CANVAS_WIDTH - mx * 2
  const bh = CANVAS_HEIGHT - my * 2
  return [
    [mx, my],
    [mx + bw, my],
    [mx + bw, my + bh * 0.6],
    [mx + bw / 2, my + bh],
    [mx, my + bh * 0.6],
  ]
}

export function isPointInShield(x: number, y: number): boolean {
  const pts = shieldPts()
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0]
    const yi = pts[i][1]
    const xj = pts[j][0]
    const yj = pts[j][1]
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

export function clipShield(ctx: CanvasRenderingContext2D) {
  const pts = shieldPts()
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1])
  }
  ctx.closePath()
  ctx.clip()
}

/**
 * Dibuja la máscara exterior y el marco heráldico.
 * El interior del escudo queda 100% transparente para permitir ver todo lo dibujado en la capa principal.
 */
export function drawOverlay(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 1. Máscara exterior neutral usando regla evenodd
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const pts = shieldPts()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1])
  }
  ctx.closePath()
  ctx.fillStyle = '#e8e8e8'
  ctx.fill('evenodd')
  ctx.restore()

  // 2. Marco exterior heráldico (borde azul oscuro profundo)
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1])
  }
  ctx.closePath()
  ctx.lineWidth = 6
  ctx.strokeStyle = '#1a2540'
  ctx.lineJoin = 'round'
  ctx.stroke()

  // 3. Acento interior dorado de honor
  ctx.lineWidth = 2
  ctx.strokeStyle = '#f59e0b'
  ctx.stroke()
  ctx.restore()
}

// ── Formas geométricas ────────────────────────────────────────────────────────

const SHAPES = new Set(['line', 'rect', 'circle', 'triangle', 'star', 'arrow'])

function drawShape(
  ctx: CanvasRenderingContext2D,
  tool: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  fm: FillMode
) {
  const cx = (x1 + x2) / 2
  const cy = (y1 + y2) / 2
  const rx = Math.abs(x2 - x1) / 2
  const ry = Math.abs(y2 - y1) / 2

  if (tool === 'line') {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    return
  }

  if (tool === 'rect') {
    const rxMin = Math.min(x1, x2)
    const ryMin = Math.min(y1, y2)
    const rw = Math.abs(x2 - x1)
    const rh = Math.abs(y2 - y1)
    if (fm !== 'stroke') ctx.fillRect(rxMin, ryMin, rw, rh)
    if (fm !== 'fill') ctx.strokeRect(rxMin, ryMin, rw, rh)
    return
  }

  if (tool === 'circle') {
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2)
    if (fm !== 'stroke') ctx.fill()
    if (fm !== 'fill') ctx.stroke()
    return
  }

  if (tool === 'triangle') {
    ctx.beginPath()
    ctx.moveTo(cx, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x1, y2)
    ctx.closePath()
    if (fm !== 'stroke') ctx.fill()
    if (fm !== 'fill') ctx.stroke()
    return
  }

  if (tool === 'star') {
    const r = Math.min(rx, ry)
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r
      const a = (Math.PI / 5) * i - Math.PI / 2
      if (i === 0) ctx.moveTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
      else ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
    }
    ctx.closePath()
    if (fm !== 'stroke') ctx.fill()
    if (fm !== 'fill') ctx.stroke()
    return
  }

  if (tool === 'arrow') {
    const hl = Math.max(ctx.lineWidth * 3, 18)
    const a = Math.atan2(y2 - y1, x2 - x1)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - hl * Math.cos(a - Math.PI / 7), y2 - hl * Math.sin(a - Math.PI / 7))
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - hl * Math.cos(a + Math.PI / 7), y2 - hl * Math.sin(a + Math.PI / 7))
    ctx.stroke()
  }
}

// ── Flood Fill de alto rendimiento ────────────────────────────────────────────

function floodFill(ctx: CanvasRenderingContext2D, px: number, py: number, fillColor: string) {
  const x0 = Math.round(px)
  const y0 = Math.round(py)
  if (!isPointInShield(x0, y0)) return

  const W = CANVAS_WIDTH
  const H = CANVAS_HEIGHT
  const img = ctx.getImageData(0, 0, W, H)
  const d = img.data

  const i0 = (y0 * W + x0) * 4
  const tr = d[i0]
  const tg = d[i0 + 1]
  const tb = d[i0 + 2]
  const ta = d[i0 + 3]

  // Obtener componentes RGB del color de relleno
  const tmp = document.createElement('canvas').getContext('2d')!
  tmp.fillStyle = fillColor
  tmp.fillRect(0, 0, 1, 1)
  const [fr, fg, fb, fa] = tmp.getImageData(0, 0, 1, 1).data

  // Si ya es del mismo color, no hacer nada
  if (Math.abs(tr - fr) < 4 && Math.abs(tg - fg) < 4 && Math.abs(tb - fb) < 4 && Math.abs(ta - fa) < 4) {
    return
  }

  const tolerance = 32
  const matchTarget = (idx: number) => {
    return (
      Math.abs(d[idx] - tr) <= tolerance &&
      Math.abs(d[idx + 1] - tg) <= tolerance &&
      Math.abs(d[idx + 2] - tb) <= tolerance &&
      Math.abs(d[idx + 3] - ta) <= tolerance
    )
  }

  const queue = new Int32Array(W * H * 2)
  let head = 0
  let tail = 0
  const visited = new Uint8Array(W * H)

  queue[tail++] = x0
  queue[tail++] = y0
  visited[y0 * W + x0] = 1

  while (head < tail) {
    const cx = queue[head++]
    const cy = queue[head++]
    const vi = cy * W + cx
    const di = vi * 4

    d[di] = fr
    d[di + 1] = fg
    d[di + 2] = fb
    d[di + 3] = fa

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ]

    for (let n = 0; n < 4; n++) {
      const nx = neighbors[n][0]
      const ny = neighbors[n][1]

      if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
        const nvi = ny * W + nx
        if (!visited[nvi] && isPointInShield(nx, ny)) {
          visited[nvi] = 1
          const ndi = nvi * 4
          if (matchTarget(ndi)) {
            queue[tail++] = nx
            queue[tail++] = ny
          }
        }
      }
    }
  }

  ctx.putImageData(img, 0, 0)
}

// ── Estado Inicial ────────────────────────────────────────────────────────────

const INIT: EditorState = {
  tool: 'pencil',
  color: DEFAULT_COLOR,
  size: DEFAULT_SIZE,
  eraserSize: ERASER_DEFAULT_SIZE,
  opacity: DEFAULT_OPACITY,
  fillMode: 'both',
  fontSize: DEFAULT_FONT_SIZE,
  fontFamily: 'Arial',
  fontBold: false,
  fontItalic: false,
  textAlign: 'center',
}

export default function ShieldEditor({ onBack, onDone }: ShieldEditorProps) {
  const mainRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  const [st, setSt] = useState<EditorState>(INIT)
  const [showClear, setShowClear] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingText, setPendingText] = useState<{
    x: number
    y: number
    xp: number
    yp: number
  } | null>(null)
  const [textVal, setTextVal] = useState('')

  // Control de dibujo en curso
  const drawing = useRef(false)
  const lx = useRef(0)
  const ly = useRef(0)
  const sx = useRef(0)
  const sy = useRef(0)

  // Pila de historial para Deshacer / Rehacer
  const historyRef = useRef<ImageData[]>([])
  const historyIdxRef = useRef<number>(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Guardar en localStorage
  const saveLS = useCallback((canvas: HTMLCanvasElement) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, canvas.toDataURL('image/png'))
    } catch {
      /* ok */
    }
  }, [])

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIdxRef.current > 0)
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1)
  }, [])

  const pushHistory = useCallback(() => {
    const canvas = mainRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const snap = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1)
    historyRef.current.push(snap)
    if (historyRef.current.length > 40) {
      historyRef.current.shift()
    }
    historyIdxRef.current = historyRef.current.length - 1
    updateHistoryState()
    saveLS(canvas)
  }, [saveLS, updateHistoryState])

  const handleUndo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    const canvas = mainRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.putImageData(historyRef.current[historyIdxRef.current], 0, 0)
    updateHistoryState()
    saveLS(canvas)
  }, [saveLS, updateHistoryState])

  const handleRedo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    const canvas = mainRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.putImageData(historyRef.current[historyIdxRef.current], 0, 0)
    updateHistoryState()
    saveLS(canvas)
  }, [saveLS, updateHistoryState])

  // ── Inicialización ──────────────────────────────────────────────────────────

  useEffect(() => {
    const main = mainRef.current
    const overlay = overlayRef.current
    if (!main || !overlay) return

    // Capa 3: Overlay heráldico con máscara exterior
    const oc = overlay.getContext('2d')
    if (oc) {
      drawOverlay(oc)
    }

    // Capa 1: Principal
    const mc = main.getContext('2d')
    if (!mc) return

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      const img = new Image()
      img.onload = () => {
        mc.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        mc.drawImage(img, 0, 0)
        historyRef.current = [mc.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)]
        historyIdxRef.current = 0
        updateHistoryState()
      }
      img.src = saved
    } else {
      mc.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      mc.save()
      clipShield(mc)
      mc.fillStyle = '#ffffff'
      mc.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      mc.restore()

      historyRef.current = [mc.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)]
      historyIdxRef.current = 0
      updateHistoryState()
    }
  }, [updateHistoryState])

  // ── Aplicar estilos al trazo ────────────────────────────────────────────────

  function applyStyle(ctx: CanvasRenderingContext2D, s: EditorState) {
    const isEraser = s.tool === 'eraser'
    ctx.globalAlpha = s.tool === 'brush' ? Math.min(s.opacity * 0.9, 1) : s.opacity
    ctx.lineWidth = isEraser ? s.eraserSize : s.tool === 'brush' ? s.size * 2.2 : s.size
    ctx.strokeStyle = isEraser ? '#ffffff' : s.color
    ctx.fillStyle = isEraser ? '#ffffff' : s.color
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  // ── Coordenadas precisas del canvas ─────────────────────────────────────────

  function getCanvasCoords(e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
    const r = canvas.getBoundingClientRect()
    const scaleX = CANVAS_WIDTH / r.width
    const scaleY = CANVAS_HEIGHT / r.height
    return {
      x: Math.max(0, Math.min(CANVAS_WIDTH, (e.clientX - r.left) * scaleX)),
      y: Math.max(0, Math.min(CANVAS_HEIGHT, (e.clientY - r.top) * scaleY)),
      pctX: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
      pctY: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
    }
  }

  // ── Manejadores de eventos de puntero ───────────────────────────────────────

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = mainRef.current
    if (!canvas) return
    e.preventDefault()

    // Capturar puntero para no perder trazos rápidos
    try {
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* ok */
    }

    const { x, y, pctX, pctY } = getCanvasCoords(e, canvas)

    // Herramienta de texto: abrir input flotante
    if (st.tool === 'text') {
      setPendingText({ x, y, xp: pctX, yp: pctY })
      setTextVal('')
      return
    }

    // Herramienta de relleno (balde)
    if (st.tool === 'fill') {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      floodFill(ctx, x, y, st.color)
      pushHistory()
      return
    }

    // Iniciar dibujo o forma
    drawing.current = true
    lx.current = x
    ly.current = y
    sx.current = x
    sy.current = y

    // Si es lápiz, pincel o borrador: pintar un punto inmediato para responder a clics simples
    if (st.tool === 'pencil' || st.tool === 'brush' || st.tool === 'eraser') {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.save()
      clipShield(ctx)
      applyStyle(ctx, st)
      ctx.beginPath()
      const radius =
        st.tool === 'eraser'
          ? st.eraserSize / 2
          : st.tool === 'brush'
          ? (st.size * 2.2) / 2
          : st.size / 2
      ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = mainRef.current
    if (!canvas) return
    const { x, y } = getCanvasCoords(e, canvas)

    if (SHAPES.has(st.tool)) {
      // Previsualizar la forma en la capa 2
      const prev = previewRef.current?.getContext('2d')
      if (!prev) return
      prev.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      prev.save()
      clipShield(prev)
      applyStyle(prev, st)
      drawShape(prev, st.tool, sx.current, sy.current, x, y, st.fillMode)
      prev.restore()
    } else {
      // Trazar línea libre en la capa principal
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.save()
      clipShield(ctx)
      applyStyle(ctx, st)
      ctx.beginPath()
      ctx.moveTo(lx.current, ly.current)
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.restore()
    }

    lx.current = x
    ly.current = y
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return
    e.preventDefault()
    drawing.current = false

    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ok */
    }

    const canvas = mainRef.current
    if (!canvas) return
    const { x, y } = getCanvasCoords(e, canvas)

    if (SHAPES.has(st.tool)) {
      const ctx = canvas.getContext('2d')
      const prev = previewRef.current?.getContext('2d')
      if (ctx) {
        ctx.save()
        clipShield(ctx)
        applyStyle(ctx, st)
        drawShape(ctx, st.tool, sx.current, sy.current, x, y, st.fillMode)
        ctx.restore()
      }
      prev?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    pushHistory()
  }

  // ── Estampar Texto ──────────────────────────────────────────────────────────

  function stampText() {
    if (!pendingText || !textVal.trim()) {
      setPendingText(null)
      return
    }
    const canvas = mainRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    clipShield(ctx)
    ctx.globalAlpha = st.opacity
    ctx.fillStyle = st.color
    ctx.textAlign = st.textAlign
    ctx.textBaseline = 'middle'
    ctx.font = `${st.fontItalic ? 'italic ' : ''}${st.fontBold ? 'bold ' : ''}${st.fontSize}px '${st.fontFamily}'`
    ctx.fillText(textVal, pendingText.x, pendingText.y)
    ctx.restore()

    setPendingText(null)
    setTextVal('')
    pushHistory()
  }

  // ── Acciones de Edición ─────────────────────────────────────────────────────

  function doClear() {
    const canvas = mainRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.save()
    clipShield(ctx)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.restore()
    pushHistory()
    setShowClear(false)
  }

  function getCompositeUrl(): string {
    const main = mainRef.current
    const overlay = overlayRef.current
    if (!main || !overlay) return ''

    const m = document.createElement('canvas')
    m.width = CANVAS_WIDTH
    m.height = CANVAS_HEIGHT
    const c = m.getContext('2d')
    if (!c) return ''

    // Fondo blanco nítido
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Dibujo principal + marco exterior
    c.drawImage(main, 0, 0)
    c.drawImage(overlay, 0, 0)
    return m.toDataURL('image/png')
  }

  function doPreview() {
    const url = getCompositeUrl()
    if (url) setPreviewUrl(url)
  }

  function doReady() {
    const url = getCompositeUrl()
    if (url) onDone(url)
  }

  // ── Atajos de teclado (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z, Ctrl+S) ────────────────

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault()
          if (e.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault()
          handleRedo()
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault()
          doPreview()
        }
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleRedo, handleUndo])

  const patch = (v: Partial<EditorState>) => setSt(s => ({ ...s, ...v }))

  return (
    <div className="ep-editor page-fade">
      {/* ── Header ── */}
      <div className="ep-editor__header">
        <h2 className="ep-editor__title">🛡️ Mi Escudo Personal</h2>
        <div className="ep-editor__actions">
          <button className="nc-btn nc-btn--outline" onClick={onBack} type="button">
            ← Volver
          </button>
          <button
            className="nc-btn nc-btn--outline"
            onClick={doPreview}
            type="button"
            title="Ver vista previa (Ctrl+S)"
          >
            👁️ Ver
          </button>
          <button className="nc-btn nc-btn--primary" onClick={doReady} type="button">
            ✅ Listo
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ep-editor__body">
        {/* Barra de herramientas modular */}
        <Toolbar
          state={st}
          onChange={patch}
          onClear={() => setShowClear(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* Contenedor del lienzo */}
        <div className="ep-canvas-container">
          <div className="ep-canvas-wrap">
            {/* Capa 1: Principal activa con eventos Pointer */}
            <canvas
              ref={mainRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="ep-canvas ep-canvas--main"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none' }}
            />

            {/* Capa 2: Previsualización de formas geométricas */}
            <canvas
              ref={previewRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="ep-canvas ep-canvas--preview"
              aria-hidden="true"
            />

            {/* Capa 3: Marco heráldico y máscara exterior */}
            <canvas
              ref={overlayRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="ep-canvas ep-canvas--overlay"
              aria-hidden="true"
            />

            {/* Editor de texto flotante */}
            {pendingText && st.tool === 'text' && (
              <div
                className="ep-text-overlay"
                style={{
                  left: `${pendingText.xp}%`,
                  top: `${pendingText.yp}%`,
                  transform:
                    st.textAlign === 'center'
                      ? 'translate(-50%, -50%)'
                      : st.textAlign === 'right'
                      ? 'translate(-100%, -50%)'
                      : 'translate(0, -50%)',
                }}
              >
                <input
                  autoFocus
                  className="ep-text-input"
                  value={textVal}
                  onChange={e => setTextVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') stampText()
                    if (e.key === 'Escape') {
                      setPendingText(null)
                      setTextVal('')
                    }
                  }}
                  placeholder="Escribe aquí tu lema o valor…"
                  style={{
                    fontFamily: st.fontFamily,
                    fontSize: `${Math.round(st.fontSize * 0.9)}px`,
                    fontWeight: st.fontBold ? 700 : 400,
                    fontStyle: st.fontItalic ? 'italic' : 'normal',
                    color: st.color,
                    textAlign: st.textAlign,
                  }}
                />
                <div className="ep-text-actions">
                  <button
                    type="button"
                    className="ep-text-btn ep-text-btn--ok"
                    onClick={stampText}
                    title="Insertar texto"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="ep-text-btn ep-text-btn--cancel"
                    onClick={() => {
                      setPendingText(null)
                      setTextVal('')
                    }}
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal de Confirmación de Limpieza ── */}
      {showClear && (
        <div className="ep-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="ep-confirm">
            <p className="ep-confirm__text">
              ¿Borrar todo el dibujo del escudo? Podrás deshacer esta acción si lo necesitas.
            </p>
            <div className="ep-confirm__actions">
              <button
                className="nc-btn nc-btn--outline"
                onClick={() => setShowClear(false)}
                type="button"
                autoFocus
              >
                Cancelar
              </button>
              <button className="nc-btn nc-btn--primary" onClick={doClear} type="button">
                🗑️ Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Previsualización ── */}
      {previewUrl && (
        <div className="ep-confirm-backdrop" role="dialog" aria-modal="true">
          <div className="ep-preview-modal">
            <h3 className="ep-preview-modal__title">🛡️ Vista previa de tu Escudo</h3>
            <img src={previewUrl} alt="Escudo personal" className="ep-preview-modal__img" />
            <div className="ep-preview-modal__actions">
              <button
                className="nc-btn nc-btn--outline"
                onClick={() => setPreviewUrl(null)}
                type="button"
              >
                ← Seguir editando
              </button>
              <button
                className="nc-btn nc-btn--primary"
                onClick={() => onDone(previewUrl)}
                type="button"
              >
                ✅ Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
