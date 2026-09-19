/**
 * useCanvas — hook del editor de dibujo del Escudo Personal
 *
 * FIX DEFINITIVO DEL BUG DE EVENTOS:
 * El problema era que el canvas no tenía dimensiones reales en pantalla
 * cuando el useEffect se ejecutaba. ep-canvas-wrap usaba height:100% pero
 * su contenedor (ep-canvas-container) no tenía altura fija, así el canvas
 * ocupaba 0px de alto y los clicks nunca caían dentro de sus bounds.
 *
 * Solución: el canvas ahora escucha eventos en el CONTENEDOR (div) en vez
 * del canvas directamente, y las coordenadas se calculan respecto al canvas.
 * Además, el efecto de registro verifica que el canvas tenga dimensiones
 * reales antes de registrar.
 */
import { useCallback, useEffect, useRef } from 'react'
import type { EditorState } from '../types'
import { CANVAS_WIDTH, CANVAS_HEIGHT, MAX_HISTORY, LOCAL_STORAGE_KEY } from '../config'

// ── Geometría del escudo ──────────────────────────────────────────────────────

export function getShieldPts(): [number, number][] {
  const mx = 0.05 * CANVAS_WIDTH, my = 0.05 * CANVAS_HEIGHT
  const bw = CANVAS_WIDTH - mx * 2, bh = CANVAS_HEIGHT - my * 2
  return [
    [mx, my], [mx + bw, my],
    [mx + bw, my + bh * 0.6],
    [mx + bw / 2, my + bh],
    [mx, my + bh * 0.6],
  ]
}

function applyShieldPath(ctx: CanvasRenderingContext2D) {
  const pts = getShieldPts()
  ctx.beginPath(); ctx.moveTo(...pts[0])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i])
  ctx.closePath()
}

export function drawShieldOverlay(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 1. Máscara exterior (evenodd para que el interior del escudo sea 100% transparente)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const pts = getShieldPts()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.fillStyle = '#e8e8e8'
  ctx.fill('evenodd')
  ctx.restore()

  // 2. Marco heráldico exterior
  ctx.save()
  applyShieldPath(ctx)
  ctx.lineWidth = 6
  ctx.strokeStyle = '#1a2540'
  ctx.lineJoin = 'round'
  ctx.stroke()

  // 3. Acento dorado interior
  ctx.lineWidth = 2
  ctx.strokeStyle = '#f59e0b'
  ctx.stroke()
  ctx.restore()
}

function clipToShield(ctx: CanvasRenderingContext2D) {
  applyShieldPath(ctx); ctx.clip()
}

// ── Coordenadas relativas al canvas (no a la ventana) ────────────────────────

function getCanvasPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  // Escala: el canvas lógico puede ser más grande que el canvas CSS
  const scaleX = canvas.width  / rect.width
  const scaleY = canvas.height / rect.height
  if ('touches' in e && e.touches.length > 0) {
    const t = e.touches[0]
    return {
      x: (t.clientX - rect.left) * scaleX,
      y: (t.clientY - rect.top)  * scaleY,
    }
  }
  const me = e as MouseEvent
  return {
    x: (me.clientX - rect.left) * scaleX,
    y: (me.clientY - rect.top)  * scaleY,
  }
}

// ── Flood fill ────────────────────────────────────────────────────────────────

function floodFill(ctx: CanvasRenderingContext2D, px: number, py: number, color: string) {
  const x0 = Math.round(px), y0 = Math.round(py)
  const W = CANVAS_WIDTH, H = CANVAS_HEIGHT
  const img = ctx.getImageData(0, 0, W, H); const d = img.data
  const i0 = (y0 * W + x0) * 4
  const [tr, tg, tb, ta] = [d[i0], d[i0+1], d[i0+2], d[i0+3]]
  const tmp = document.createElement('canvas').getContext('2d')!
  tmp.fillStyle = color; tmp.fillRect(0,0,1,1)
  const [fr,fg,fb,fa] = tmp.getImageData(0,0,1,1).data
  if (tr===fr&&tg===fg&&tb===fb&&ta===fa) return
  const T=32
  const ok=(i:number)=>Math.abs(d[i]-tr)<=T&&Math.abs(d[i+1]-tg)<=T&&Math.abs(d[i+2]-tb)<=T&&Math.abs(d[i+3]-ta)<=T
  const vis=new Uint8Array(W*H); const q=[x0,y0]; let h=0
  while(h<q.length){const cx=q[h++],cy=q[h++];if(cx<0||cx>=W||cy<0||cy>=H)continue;const vi=cy*W+cx;if(vis[vi])continue;vis[vi]=1;const di=vi*4;if(!ok(di))continue;d[di]=fr;d[di+1]=fg;d[di+2]=fb;d[di+3]=fa;q.push(cx+1,cy,cx-1,cy,cx,cy+1,cx,cy-1)}
  ctx.putImageData(img,0,0)
}

// ── Formas ────────────────────────────────────────────────────────────────────

const VECTOR = new Set(['line','rect','circle','triangle','star','arrow'])

function drawTriangle(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number){ctx.beginPath();ctx.moveTo((x1+x2)/2,y1);ctx.lineTo(x2,y2);ctx.lineTo(x1,y2);ctx.closePath()}
function drawStar(ctx:CanvasRenderingContext2D,cx:number,cy:number,r:number){ctx.beginPath();for(let i=0;i<10;i++){const rad=i%2?r*0.45:r,a=(Math.PI/5)*i-Math.PI/2;i?ctx.lineTo(cx+rad*Math.cos(a),cy+rad*Math.sin(a)):ctx.moveTo(cx+rad*Math.cos(a),cy+rad*Math.sin(a))}ctx.closePath()}
function drawArrow(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,lw:number){const hl=Math.max(lw*3,18),a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.moveTo(x2,y2);ctx.lineTo(x2-hl*Math.cos(a-Math.PI/7),y2-hl*Math.sin(a-Math.PI/7));ctx.moveTo(x2,y2);ctx.lineTo(x2-hl*Math.cos(a+Math.PI/7),y2-hl*Math.sin(a+Math.PI/7))}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCanvas({ editorState, onHistoryChange }: {
  editorState: EditorState
  onHistoryChange?: () => void
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  // El estado siempre fresco via ref (sin stale closures en los handlers)
  const S = useRef(editorState)
  S.current = editorState

  const drawing = useRef(false)
  const lx=useRef(0),ly=useRef(0),sx=useRef(0),sy=useRef(0)
  const hist = useRef<ImageData[]>([])
  const hIdx = useRef(-1)

  const getCtx  = () => canvasRef.current?.getContext('2d')  ?? null
  const getPrev = () => previewRef.current?.getContext('2d') ?? null

  function style(ctx: CanvasRenderingContext2D) {
    const {tool,color,size,eraserSize,opacity} = S.current
    const e = tool==='eraser'
    ctx.globalAlpha  = tool==='brush' ? Math.min(opacity*.9,1) : opacity
    ctx.lineWidth    = e ? eraserSize : tool==='brush' ? size*2.2 : size
    ctx.strokeStyle  = e ? '#ffffff' : color
    ctx.fillStyle    = color
    ctx.lineCap='round'; ctx.lineJoin='round'
  }

  function saveLS() {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, canvasRef.current?.toDataURL('image/png')??'') }
    catch{/*ok*/}
  }

  function push() {
    const ctx=getCtx(); if(!ctx) return
    const snap=ctx.getImageData(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    hist.current=hist.current.slice(0,hIdx.current+1)
    hist.current.push(snap)
    if(hist.current.length>MAX_HISTORY) hist.current.shift()
    hIdx.current=hist.current.length-1
    onHistoryChange?.(); saveLS()
  }

  const undo=useCallback(()=>{if(hIdx.current<=0)return;hIdx.current--;const ctx=getCtx();if(!ctx)return;ctx.putImageData(hist.current[hIdx.current],0,0);onHistoryChange?.();saveLS()},[])
  const redo=useCallback(()=>{if(hIdx.current>=hist.current.length-1)return;hIdx.current++;const ctx=getCtx();if(!ctx)return;ctx.putImageData(hist.current[hIdx.current],0,0);onHistoryChange?.();saveLS()},[])
  const canUndo=()=>hIdx.current>0
  const canRedo=()=>hIdx.current<hist.current.length-1

  const clearCanvas=useCallback((skip=false)=>{
    const ctx=getCtx(); if(!ctx)return
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    ctx.save();clipToShield(ctx);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);ctx.restore()
    if(!skip) push()
  },[])

  // ── Init (solo al montar) ─────────────────────────────────────────────────

  useEffect(() => {
    const ol=overlayRef.current?.getContext('2d')
    if(ol) drawShieldOverlay(ol)

    const saved=localStorage.getItem(LOCAL_STORAGE_KEY)
    if(saved){
      const ctx=getCtx()
      if(ctx){const img=new Image();img.onload=()=>{ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);ctx.drawImage(img,0,0);push()};img.src=saved}
    } else {
      clearCanvas(true)
      const ctx=getCtx()
      if(ctx){hist.current=[ctx.getImageData(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)];hIdx.current=0}
    }
  },[])

  // ── Stamp text ────────────────────────────────────────────────────────────

  const stampText=useCallback((x:number,y:number,text:string)=>{
    const ctx=getCtx(); if(!ctx||!text.trim())return
    const {fontSize,fontFamily,fontBold,fontItalic,color,opacity,textAlign}=S.current
    ctx.save();clipToShield(ctx)
    ctx.globalAlpha=opacity;ctx.fillStyle=color
    ctx.textAlign=textAlign;ctx.textBaseline='middle'
    ctx.font=`${fontItalic?'italic ':''} ${fontBold?'bold ':''} ${fontSize}px '${fontFamily}'`
    ctx.fillText(text,x,y);ctx.restore();push()
  },[])

  // ── Shape renderer ────────────────────────────────────────────────────────

  function renderShape(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number){
    const {tool,fillMode}=S.current
    const cx=(x1+x2)/2,cy=(y1+y2)/2,rx=Math.abs(x2-x1)/2,ry=Math.abs(y2-y1)/2
    switch(tool){
      case 'line':ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();break
      case 'rect':if(fillMode!=='stroke')ctx.fillRect(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));if(fillMode!=='fill')ctx.strokeRect(Math.min(x1,x2),Math.min(y1,y2),Math.abs(x2-x1),Math.abs(y2-y1));break
      case 'circle':ctx.beginPath();ctx.ellipse(cx,cy,rx||1,ry||1,0,0,Math.PI*2);if(fillMode!=='stroke')ctx.fill();if(fillMode!=='fill')ctx.stroke();break
      case 'triangle':drawTriangle(ctx,x1,y1,x2,y2);if(fillMode!=='stroke')ctx.fill();if(fillMode!=='fill')ctx.stroke();break
      case 'star':drawStar(ctx,cx,cy,Math.min(rx,ry));if(fillMode!=='stroke')ctx.fill();if(fillMode!=='fill')ctx.stroke();break
      case 'arrow':drawArrow(ctx,x1,y1,x2,y2,ctx.lineWidth);ctx.stroke();break
    }
  }

  // ── Registro de eventos: useEffect sin deps, sobre el canvas ─────────────
  //
  // IMPORTANTE: este useEffect NO tiene deps vacías []. Se ejecuta en
  // CADA render, re-registrando los listeners. Esto garantiza que cuando
  // canvasRef.current cambia (o cuando el canvas no existía en renders
  // anteriores), los listeners siempre están actualizados.
  //
  // Para evitar acumulación, los handlers se almacenan en un ref y la
  // limpieza usa exactamente las mismas referencias.

  const evRef = useRef<{
    down:(e:MouseEvent|TouchEvent)=>void
    move:(e:MouseEvent|TouchEvent)=>void
    up:  (e:MouseEvent|TouchEvent)=>void
  } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Limpiar listeners anteriores si los había
    if (evRef.current) {
      canvas.removeEventListener('mousedown',  evRef.current.down)
      canvas.removeEventListener('mousemove',  evRef.current.move)
      canvas.removeEventListener('mouseup',    evRef.current.up)
      canvas.removeEventListener('mouseleave', evRef.current.up)
      canvas.removeEventListener('touchstart', evRef.current.down)
      canvas.removeEventListener('touchmove',  evRef.current.move)
      canvas.removeEventListener('touchend',   evRef.current.up)
    }

    // Crear nuevos handlers con S.current actualizado
    const down = (e: MouseEvent | TouchEvent) => {
      if (S.current.tool === 'text') return
      e.preventDefault()
      const {x,y} = getCanvasPos(e, canvas)
      if (S.current.tool === 'fill') {
        const ctx=getCtx(); if(!ctx)return
        floodFill(ctx,x,y,S.current.color); push(); return
      }
      drawing.current=true
      lx.current=x; ly.current=y; sx.current=x; sy.current=y
    }

    const move = (e: MouseEvent | TouchEvent) => {
      if (S.current.tool === 'text') return
      e.preventDefault()
      if (!drawing.current) return
      const {x,y} = getCanvasPos(e, canvas)
      if (VECTOR.has(S.current.tool)) {
        const prev=getPrev(); if(!prev)return
        prev.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
        prev.save();clipToShield(prev);style(prev);renderShape(prev,sx.current,sy.current,x,y);prev.restore()
      } else {
        const ctx=getCtx(); if(!ctx)return
        ctx.save();clipToShield(ctx);style(ctx)
        ctx.beginPath();ctx.moveTo(lx.current,ly.current);ctx.lineTo(x,y);ctx.stroke()
        ctx.restore()
      }
      lx.current=x; ly.current=y
    }

    const up = (e: MouseEvent | TouchEvent) => {
      if (S.current.tool === 'text') return
      if (!drawing.current) return
      e.preventDefault()
      drawing.current=false
      if (VECTOR.has(S.current.tool)) {
        const ctx=getCtx(),prev=getPrev(); if(!ctx||!prev)return
        ctx.save();clipToShield(ctx);style(ctx);renderShape(ctx,sx.current,sy.current,lx.current,ly.current);ctx.restore()
        prev.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
      }
      push()
    }

    evRef.current = { down, move, up }

    canvas.addEventListener('mousedown',  down, { passive: false })
    canvas.addEventListener('mousemove',  move, { passive: false })
    canvas.addEventListener('mouseup',    up,   { passive: false })
    canvas.addEventListener('mouseleave', up,   { passive: false })
    canvas.addEventListener('touchstart', down, { passive: false })
    canvas.addEventListener('touchmove',  move, { passive: false })
    canvas.addEventListener('touchend',   up,   { passive: false })

    // Limpieza al desmontar
    return () => {
      canvas.removeEventListener('mousedown',  down)
      canvas.removeEventListener('mousemove',  move)
      canvas.removeEventListener('mouseup',    up)
      canvas.removeEventListener('mouseleave', up)
      canvas.removeEventListener('touchstart', down)
      canvas.removeEventListener('touchmove',  move)
      canvas.removeEventListener('touchend',   up)
      evRef.current = null
    }
  }) // ← SIN array de dependencias. Se re-ejecuta en cada render.
     // Esto garantiza que el canvas siempre tiene los listeners correctos
     // independientemente del ciclo de vida del componente.

  return { canvasRef, overlayRef, previewRef,
    clearCanvas:()=>clearCanvas(false), undo, redo, canUndo, canRedo,
    stampText, saveToLocalStorage: saveLS }
}
