import { useCallback } from 'react'
import type { RefObject } from 'react'
import type { TouchDirections } from '../hooks/usePlayerMovement'
import type { Facing } from '../types'

interface Props {
  /** Ref al Set de direcciones activas — compartido con usePlayerMovement */
  touchDirections: RefObject<TouchDirections>
  /** true cuando el avatar está cerca de un banco interactivo */
  canInteract: boolean
  /** Callback para abrir el banco al pulsar el botón de acción */
  onInteract: () => void
}

/**
 * Controles digitales para móvil.
 *
 * D-pad de 4 botones + botón de acción (E).
 * Usa onPointerDown / onPointerUp / onPointerLeave en lugar de touch
 * events para que funcione igual en iOS Safari, Android Chrome y desktop
 * con pantalla táctil.
 *
 * No pasa por estado React: escribe directamente en el ref
 * touchDirections para no añadir latencia al bucle rAF del movimiento.
 */
export default function MobileControls({
  touchDirections,
  canInteract,
  onInteract,
}: Props) {
  const press = useCallback((dir: Facing) => {
    touchDirections.current?.add(dir)
  }, [touchDirections])

  const release = useCallback((dir: Facing) => {
    touchDirections.current?.delete(dir)
  }, [touchDirections])

  /** Suelta TODAS las direcciones (cuando el dedo sale del botón) */
  const releaseAll = useCallback(() => {
    touchDirections.current?.clear()
  }, [touchDirections])

  function dpadBtn(dir: Facing, label: string, icon: string) {
    return (
      <button
        type="button"
        className={`bt-dpad__btn bt-dpad__btn--${dir}`}
        aria-label={label}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); press(dir) }}
        onPointerUp={() => release(dir)}
        onPointerLeave={() => release(dir)}
        onPointerCancel={releaseAll}
        // Evitar que el menú contextual aparezca al mantener presionado en móvil
        onContextMenu={e => e.preventDefault()}
      >
        {icon}
      </button>
    )
  }

  return (
    <div className="bt-mobile-controls" aria-label="Controles de movimiento">
      {/* D-pad izquierdo */}
      <div className="bt-dpad">
        {dpadBtn('up',    'Arriba',     '▲')}
        <div className="bt-dpad__row">
          {dpadBtn('left',  'Izquierda',  '◀')}
          <div className="bt-dpad__center" aria-hidden="true" />
          {dpadBtn('right', 'Derecha',    '▶')}
        </div>
        {dpadBtn('down',  'Abajo',      '▼')}
      </div>

      {/* Botón de acción (interactuar con banco) */}
      <button
        type="button"
        className={`bt-action-btn ${canInteract ? 'is-active' : ''}`}
        aria-label="Interactuar"
        disabled={!canInteract}
        onPointerDown={e => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerUp={() => { if (canInteract) onInteract() }}
        onContextMenu={e => e.preventDefault()}
      >
        <span className="bt-action-btn__key">E</span>
        <span className="bt-action-btn__label">Interactuar</span>
      </button>
    </div>
  )
}
