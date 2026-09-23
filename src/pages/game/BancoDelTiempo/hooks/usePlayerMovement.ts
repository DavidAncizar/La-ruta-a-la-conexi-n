import { useEffect, useRef, useState } from 'react'
import { resolveMovement } from '../utils/geometry'
import type { Facing, Rect, Vec2 } from '../types'

/** Teclas admitidas por dirección: WASD y flechas */
const KEY_MAP: Record<string, Facing> = {
  w: 'up',    arrowup:    'up',
  s: 'down',  arrowdown:  'down',
  a: 'left',  arrowleft:  'left',
  d: 'right', arrowright: 'right',
}

/**
 * Ref compartido con MobileControls para que el d-pad pueda
 * inyectar direcciones activas sin pasar por estado React
 * (evita re-renders en el loop de animación).
 */
export type TouchDirections = Set<Facing>

interface Options {
  /** Punto de partida del avatar */
  spawn: Vec2
  /** Zonas transitables del escenario */
  areas: Rect[]
  /** Velocidad en unidades de mundo por segundo */
  speed: number
  /** Medio ancho del avatar para las colisiones */
  halfSize: number
  /**
   * Si es false, el avatar se queda quieto y no responde al teclado.
   * Se usa mientras hay un panel abierto o el nivel ya terminó.
   */
  enabled: boolean
  /**
   * Ref al Set de direcciones táctiles activas.
   * MobileControls lo llena con touchstart/touchend;
   * el bucle rAF lo lee igual que pressedKeys.
   */
  touchDirections?: React.RefObject<TouchDirections>
}

interface MovementState {
  position: Vec2
  facing: Facing
  isMoving: boolean
  /** Devuelve el avatar al punto de partida */
  reset: () => void
}

/**
 * Movimiento del avatar con teclado.
 *
 * CÓMO FUNCIONA
 * Las teclas pulsadas se guardan en un Set dentro de un ref, y un bucle
 * de requestAnimationFrame mueve el avatar según el tiempo transcurrido
 * entre fotogramas (delta time). Usar delta time en lugar de una
 * cantidad fija por fotograma hace que la velocidad sea la misma en una
 * pantalla de 60 Hz y en una de 144 Hz.
 *
 * El movimiento diagonal se normaliza para que no sea más rápido que el
 * movimiento recto.
 */
export function usePlayerMovement({
  spawn,
  areas,
  speed,
  halfSize,
  enabled,
  touchDirections,
}: Options): MovementState {
  const [position, setPosition] = useState<Vec2>(spawn)
  const [facing, setFacing]     = useState<Facing>('down')
  const [isMoving, setIsMoving] = useState(false)

  /** Teclas de dirección pulsadas ahora mismo */
  const pressedKeys = useRef<Set<string>>(new Set())
  /** Posición real, para no depender del estado dentro del bucle */
  const positionRef = useRef<Vec2>(spawn)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  // ── Escucha del teclado ──
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      if (!KEY_MAP[key]) return

      // Las flechas y el espacio hacen scroll en la página: se anula
      // para que el juego no salte mientras se camina.
      event.preventDefault()
      pressedKeys.current.add(key)
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.current.delete(event.key.toLowerCase())
    }

    /** Si la pestaña pierde el foco, se sueltan todas las teclas */
    function handleBlur() {
      pressedKeys.current.clear()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // ── Bucle de movimiento ──
  useEffect(() => {
    if (!enabled) {
      // Al deshabilitar (panel abierto), se sueltan las teclas para que
      // el avatar no salga corriendo al volver.
      pressedKeys.current.clear()
      setIsMoving(false)
      return
    }

    lastTimeRef.current = performance.now()

    function tick(now: number) {
      const deltaSeconds = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      let dirX = 0
      let dirY = 0

      for (const key of pressedKeys.current) {
        const direction = KEY_MAP[key]
        if (direction === 'up')    dirY -= 1
        if (direction === 'down')  dirY += 1
        if (direction === 'left')  dirX -= 1
        if (direction === 'right') dirX += 1
      }

      // Inyectar también las direcciones táctiles del d-pad móvil
      if (touchDirections?.current) {
        for (const dir of touchDirections.current) {
          if (dir === 'up')    dirY -= 1
          if (dir === 'down')  dirY += 1
          if (dir === 'left')  dirX -= 1
          if (dir === 'right') dirX += 1
        }
      }

      const moving = dirX !== 0 || dirY !== 0

      if (moving) {
        // Normalizar la diagonal: sin esto, moverse en diagonal sería
        // 1.41 veces más rápido que en línea recta.
        const length = Math.hypot(dirX, dirY)
        const step = speed * deltaSeconds
        const stepX = (dirX / length) * step
        const stepY = (dirY / length) * step

        const next = resolveMovement(
          positionRef.current,
          stepX,
          stepY,
          halfSize,
          areas
        )

        // Solo se actualiza el estado si de verdad cambió la posición,
        // para no re-renderizar al empujar contra una pared.
        if (next.x !== positionRef.current.x || next.y !== positionRef.current.y) {
          positionRef.current = next
          setPosition(next)
        }

        // La dirección de la mirada prioriza el eje con más movimiento
        const nextFacing: Facing =
          Math.abs(dirX) >= Math.abs(dirY)
            ? (dirX < 0 ? 'left' : 'right')
            : (dirY < 0 ? 'up' : 'down')

        setFacing(prev => (prev === nextFacing ? prev : nextFacing))
      }

      setIsMoving(prev => (prev === moving ? prev : moving))

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameRef.current)
  }, [enabled, areas, speed, halfSize, touchDirections])

  /**
   * Vuelve a dejar el avatar en el punto de partida.
   *
   * Hace falta porque el hook no se desmonta al salir del escenario: sin
   * este reinicio, al volver a entrar el avatar aparecería donde lo dejó
   * (por ejemplo, encima de la meta).
   */
  function reset() {
    pressedKeys.current.clear()
    positionRef.current = spawn
    setPosition(spawn)
    setFacing('down')
    setIsMoving(false)
  }

  return { position, facing, isMoving, reset }
}
