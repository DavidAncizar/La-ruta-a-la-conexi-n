import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONNECTION_ROUTES, findRouteById } from '../data/routes'
import type { ConnectionRouteId } from '../types/connection'

interface RouteMapProps {
  /** Rutas que el estudiante ya completó en intentos anteriores */
  completedRouteIds: ConnectionRouteId[]
  /** Se llama al confirmar la ruta con el botón "COMENZAR CONEXIÓN" */
  onStartRoute: (routeId: ConnectionRouteId) => void
}

/**
 * Posición de cada parada dentro del tablero, en porcentaje.
 *
 * Hay dos disposiciones para que las cinco paradas quepan en pantalla
 * sin necesidad de hacer scroll en ningún formato:
 *   - `x` / `y`   → escritorio: onda horizontal de izquierda a derecha
 *   - `mx` / `my` → móvil: zigzag descendente
 *
 * En móvil el nombre se coloca al lado del círculo (en el lado libre,
 * indicado por `side`) para que no se solape con la parada siguiente.
 *
 * El orden del array corresponde al de CONNECTION_ROUTES.
 */
const STATION_LAYOUT = [
  { x: 10, y: 38, mx: 26, my: 10, side: 'right' },
  { x: 30, y: 70, mx: 72, my: 30, side: 'left'  },
  { x: 50, y: 34, mx: 28, my: 50, side: 'right' },
  { x: 70, y: 70, mx: 74, my: 70, side: 'left'  },
  { x: 90, y: 38, mx: 30, my: 90, side: 'right' },
] as const

/**
 * Trazado del camino que une las paradas. Las coordenadas coinciden con
 * STATION_LAYOUT, y las curvas entran y salen de cada parada en la misma
 * dirección para que el recorrido se lea de un vistazo.
 */
const ROAD_DESKTOP =
  'M10,38 C18,68 22,70 30,70 C40,70 42,34 50,34 ' +
  'C58,34 62,70 70,70 C78,70 82,38 90,38'

const ROAD_MOBILE =
  'M26,10 C26,22 72,18 72,30 C72,42 28,38 28,50 ' +
  'C28,62 74,58 74,70 C74,82 30,78 30,90'

/**
 * Mapa interactivo — pantalla principal del juego "Nueva Conexión".
 *
 * Presenta las cinco rutas como paradas de un tablero unido por un
 * camino. El estudiante elige UNA (nunca varias a la vez), lee la
 * introducción de esa misión y confirma con el botón principal.
 *
 * Las rutas que ya completó se muestran con un check y su color relleno,
 * pero siguen siendo seleccionables por si quiere repetirlas.
 */
export default function RouteMap({ completedRouteIds, onStartRoute }: RouteMapProps) {
  // Solo puede haber UNA ruta seleccionada a la vez
  const [selectedRouteId, setSelectedRouteId] = useState<ConnectionRouteId | null>(null)

  const selectedRoute = selectedRouteId ? findRouteById(selectedRouteId) : undefined

  /** ¿La ruta que está mirando ahora ya la completó antes? */
  const isSelectedCompleted = selectedRouteId
    ? completedRouteIds.includes(selectedRouteId)
    : false

  // Progreso del recorrido completo (las cinco paradas)
  const totalRoutes = CONNECTION_ROUTES.length
  const completedCount = CONNECTION_ROUTES.filter(route =>
    completedRouteIds.includes(route.id)
  ).length
  const progressPercent = Math.round((completedCount / totalRoutes) * 100)

  /**
   * Primera parada sin completar. Se anima suavemente para invitar a
   * tocarla, pero no bloquea: el estudiante puede elegir la que quiera.
   */
  const suggestedRouteId =
    CONNECTION_ROUTES.find(route => !completedRouteIds.includes(route.id))?.id ?? null

  function handleSelect(routeId: ConnectionRouteId) {
    // Volver a tocar la misma ruta la deselecciona
    setSelectedRouteId(prev => (prev === routeId ? null : routeId))
  }

  function handleStart() {
    if (selectedRouteId) onStartRoute(selectedRouteId)
  }

  return (
    <div className="nc-mapscreen page-fade">

      {/* ══════════ Encabezado ══════════ */}
      <header className="nc-mapscreen__header">
        <h1 className="nc-mapscreen__title">Nueva Conexión</h1>
        <p className="nc-mapscreen__subtitle">
          Cinco caminos, una misión. Elige por dónde vas a empezar.
        </p>

        <div className="nc-mapscreen__score">
          <div
            className="nc-mapscreen__score-bar"
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalRoutes}
            aria-label="Caminos recorridos"
          >
            <div
              className="nc-mapscreen__score-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="nc-mapscreen__score-text">
            {completedCount} de {totalRoutes} caminos recorridos
          </span>
        </div>
      </header>

      {/* ══════════ Tablero ══════════ */}
      <div className="nc-board" role="group" aria-label="Caminos disponibles">

        {/* Decoración de ambiente (no aporta información) */}
        <div className="nc-board__deco" aria-hidden="true">
          <span className="nc-board__blob nc-board__blob--a" />
          <span className="nc-board__blob nc-board__blob--b" />
          <span className="nc-board__blob nc-board__blob--c" />
          <span className="nc-board__spark nc-board__spark--a">✨</span>
          <span className="nc-board__spark nc-board__spark--b">💫</span>
          <span className="nc-board__spark nc-board__spark--c">⭐</span>
        </div>

        {/*
          Camino. El viewBox es 0-100 en los dos ejes y se estira con el
          tablero (preserveAspectRatio="none"); vectorEffect mantiene el
          grosor del trazo constante para que no se deforme.
          Se dibujan los dos trazados y el CSS muestra el que toca.
        */}
        <svg
          className="nc-board__road"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="nc-road__base nc-road--desktop"
            d={ROAD_DESKTOP}
            pathLength={100}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="nc-road__dash nc-road--desktop"
            d={ROAD_DESKTOP}
            pathLength={100}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="nc-road__base nc-road--mobile"
            d={ROAD_MOBILE}
            pathLength={100}
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="nc-road__dash nc-road--mobile"
            d={ROAD_MOBILE}
            pathLength={100}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Paradas */}
        {CONNECTION_ROUTES.map((route, index) => {
          const position    = STATION_LAYOUT[index]
          const isCompleted = completedRouteIds.includes(route.id)
          const isSelected  = selectedRouteId === route.id
          // Solo se sugiere si no hay nada elegido todavía
          const isSuggested = !selectedRouteId && suggestedRouteId === route.id

          return (
            <button
              key={route.id}
              type="button"
              className={[
                'nc-station',
                `nc-station--label-${position.side}`,
                isSelected  ? 'is-selected'  : '',
                isCompleted ? 'is-completed' : '',
                isSuggested ? 'is-suggested' : '',
              ].filter(Boolean).join(' ')}
              style={{
                '--route-color': route.color,
                '--route-bg': route.background,
                '--x': `${position.x}%`,
                '--y': `${position.y}%`,
                '--mx': `${position.mx}%`,
                '--my': `${position.my}%`,
                // Las paradas van apareciendo una tras otra
                '--delay': `${0.15 + index * 0.09}s`,
              } as React.CSSProperties}
              onClick={() => handleSelect(route.id)}
              aria-pressed={isSelected}
              aria-label={`${route.label}${isCompleted ? ', ya completado' : ''}`}
            >
              <span className="nc-station__dot">
                <span className="nc-station__emoji" aria-hidden="true">{route.emoji}</span>
                <span className="nc-station__num" aria-hidden="true">{index + 1}</span>
                {isCompleted && (
                  <span className="nc-station__check" aria-hidden="true">✓</span>
                )}
              </span>

              <span className="nc-station__name">{route.shortLabel}</span>
            </button>
          )
        })}
      </div>

      {/* ══════════ Panel de la ruta elegida ══════════ */}
      <section
        className={`nc-progress ${selectedRoute ? 'is-active' : ''}`}
        style={
          selectedRoute
            ? ({
                '--route-color': selectedRoute.color,
                '--route-bg': selectedRoute.background,
              } as React.CSSProperties)
            : undefined
        }
        aria-live="polite"
      >
        <h2 className="nc-progress__title">Tu conexión</h2>

        {!selectedRoute ? (
          <p className="nc-progress__empty">
            👆 Toca una parada del mapa para ver su misión.
          </p>
        ) : (
          <div className="nc-progress__mission">
            <div className="nc-progress__chosen">
              <span className="nc-progress__chosen-icon">{selectedRoute.emoji}</span>
              <span className="nc-progress__chosen-label">{selectedRoute.label}</span>
            </div>

            {/* Estado de la ruta: completada o pendiente */}
            {isSelectedCompleted && (
              <p className="nc-progress__done">
                ✅ <strong>Conexión completada</strong> — ya recorriste este camino.
                Puedes repetirlo si quieres, esta vez ganarás la mitad de XP.
              </p>
            )}

            <p className="nc-progress__intro">{selectedRoute.missionIntro}</p>
          </div>
        )}
      </section>

      {/* ══════════ Acciones ══════════ */}
      <div className="nc-mapscreen__actions">
        <button
          type="button"
          className="nc-btn nc-btn--primary nc-btn--lg nc-btn--full"
          onClick={handleStart}
          disabled={!selectedRouteId}
        >
          {isSelectedCompleted ? 'REVISAR CONEXIÓN' : 'COMENZAR CONEXIÓN'}
        </button>

        <Link to="/worlds" className="nc-back-link">
          ← Volver a mundos
        </Link>
      </div>

    </div>
  )
}
