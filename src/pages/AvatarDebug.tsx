/**
 * PÁGINA DE DEBUG DEL AVATAR
 * Ruta: /avatar-debug
 * 
 * Muestra el canvas con rectángulos de colores sobre cada parte del cuerpo
 * + las coordenadas exactas de cada una.
 * 
 * INSTRUCCIONES:
 * 1. Abre http://localhost:5173/avatar-debug
 * 2. Toma captura y pásala — con eso veo exactamente dónde está cada parte
 * 3. BORRA este archivo cuando termines el ajuste
 */

import { useEffect, useRef, useState } from 'react'

const S   = 0.42
const CW  = 240
const CH  = 360
const MX  = CW / 2

const DIM = {
  head:  { w: Math.round(173*S), h: Math.round(168*S) },
  neck:  { w: Math.round( 96*S), h: Math.round( 37*S) },
  shirt: { w: Math.round(153*S), h: Math.round(174*S) },
  arm:   { w: Math.round(118*S), h: Math.round( 96*S) },
  hand:  { w: Math.round( 61*S), h: Math.round( 71*S) },
  leg:   { w: Math.round( 93*S), h: Math.round(164*S) },
  pants: { w: Math.round(111*S), h: Math.round(166*S) },
  shoe:  { w: Math.round( 94*S), h: Math.round( 42*S) },
  hair:  { w: Math.round(160*S), h: Math.round(130*S) },
}

const PX = {
  hair:   87,
  head:   84,
  neck:  100,
  shirt:  88,
  // Brazos rotados: tras rotar 90°, ocupan armH de ancho y armW de alto
  // armL termina en xShirt=88 → xArmL = 88 - armH(40) = 48
  // armR empieza en xShirt+shirtW=152 → xArmR = 152
  armL:   48,
  armR:  152,
  handL:  19,   // extremo izquierdo del brazo izquierdo rotado
  handR: 192,   // extremo derecho del brazo derecho rotado
  legL:   80,
  legR:  121,
  pantsL: 80,   // mismo ancho que pierna
  pantsR: 121,
  shoeL:  80,
  shoeR: 121,
}

const PY = {
  hair:   8,
  head:  14,
  neck:  14 + DIM.head.h + 3,
  shirt: 14 + DIM.head.h + 3 + DIM.neck.h + 3,
  // Brazos al nivel del hombro, centrados verticalmente con el torso
  arm:   14 + DIM.head.h + 3 + DIM.neck.h + 3 + 8,
  // Manos: misma Y que los brazos, centradas verticalmente (armW de alto)
  hand:  14 + DIM.head.h + 3 + DIM.neck.h + 3 + 8 + (DIM.arm.w - DIM.hand.h) / 2,
  leg:   14 + DIM.head.h + 3 + DIM.neck.h + 3 + DIM.shirt.h - 4,
  shoe:  14 + DIM.head.h + 3 + DIM.neck.h + 3 + DIM.shirt.h - 4 + DIM.leg.h - 4,
}

// Cada parte con su color y datos
const PARTS = [
  { name: 'hair',   x: PX.hair,  y: PY.hair,  w: DIM.hair.w,  h: DIM.hair.h,  color: '#a855f7' },
  { name: 'head',   x: PX.head,  y: PY.head,  w: DIM.head.w,  h: DIM.head.h,  color: '#f97316' },
  { name: 'neck',   x: PX.neck,  y: PY.neck,  w: DIM.neck.w,  h: DIM.neck.h,  color: '#eab308' },
  { name: 'shirt',  x: PX.shirt, y: PY.shirt, w: DIM.shirt.w, h: DIM.shirt.h, color: '#3b82f6' },
  // Brazos rotados 90°: w y h se intercambian visualmente
  { name: 'armL',   x: PX.armL,  y: PY.arm,   w: DIM.arm.h,   h: DIM.arm.w,   color: '#22c55e' },
  { name: 'armR',   x: PX.armR,  y: PY.arm,   w: DIM.arm.h,   h: DIM.arm.w,   color: '#22c55e' },
  { name: 'handL',  x: PX.handL, y: PY.hand,  w: DIM.hand.w,  h: DIM.hand.h,  color: '#f43f5e' },
  { name: 'handR',  x: PX.handR, y: PY.hand,  w: DIM.hand.w,  h: DIM.hand.h,  color: '#f43f5e' },
  { name: 'legL',   x: PX.legL,  y: PY.leg,   w: DIM.leg.w,   h: DIM.leg.h,   color: '#06b6d4' },
  { name: 'legR',   x: PX.legR,  y: PY.leg,   w: DIM.leg.w,   h: DIM.leg.h,   color: '#06b6d4' },
  { name: 'shoeL',  x: PX.shoeL, y: PY.shoe,  w: DIM.shoe.w,  h: DIM.shoe.h,  color: '#64748b' },
  { name: 'shoeR',  x: PX.shoeR, y: PY.shoe,  w: DIM.shoe.w,  h: DIM.shoe.h,  color: '#64748b' },
]

export default function AvatarDebug() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [coords, setCoords] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CW, CH)

    // Línea central de referencia
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(MX, 0)
    ctx.lineTo(MX, CH)
    ctx.stroke()
    ctx.setLineDash([])

    // Dibujar rectángulos
    PARTS.forEach(p => {
      ctx.fillStyle = p.color + '55'
      ctx.fillRect(p.x, p.y, p.w, p.h)
      ctx.strokeStyle = p.color
      ctx.lineWidth = 1.5
      ctx.strokeRect(p.x, p.y, p.w, p.h)

      // Nombre de la parte
      ctx.fillStyle = '#fff'
      ctx.font = '8px monospace'
      ctx.fillText(p.name, p.x + 2, p.y + 10)
    })

    // Generar tabla de coordenadas
    const table = PARTS.map(p =>
      `${p.name.padEnd(8)} x=${String(Math.round(p.x)).padStart(3)} y=${String(Math.round(p.y)).padStart(3)} w=${String(p.w).padStart(3)} h=${String(p.h).padStart(3)}`
    ).join('\n')
    setCoords(table)

  }, [])

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, background: '#0f172a', minHeight: '100vh', alignItems: 'flex-start' }}>

      {/* Canvas */}
      <div>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
          Canvas {CW}×{CH} · escala {S} · CX={MX}
        </p>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          style={{
            background: '#1e3a5f',
            borderRadius: 12,
            display: 'block',
            border: '2px solid #3b82f6',
          }}
        />
      </div>

      {/* Tabla de coordenadas */}
      <div>
        <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>
          Coordenadas exactas — copia esto y pásalo
        </p>
        <pre style={{
          color: '#e2e8f0',
          fontSize: 11,
          background: '#1e293b',
          padding: 16,
          borderRadius: 8,
          lineHeight: 1.8,
          fontFamily: 'monospace',
        }}>
          {coords}
        </pre>

        {/* Leyenda de colores */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PARTS.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: p.color }} />
              <span style={{ color: '#cbd5e1', fontSize: 11, fontFamily: 'monospace' }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
