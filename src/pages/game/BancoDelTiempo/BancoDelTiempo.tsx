import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameResult } from '@/types'
import { calculateXpForAttempt } from '@/lib/constants'
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_SPEED,
  PLAYER_HALF_SIZE,
  STORAGE_KEY,
} from './config'
import {
  SPAWN_POINT,
  WALKABLE_AREAS,
  BENCHES,
  GOAL_AREA,
} from './data/worldMap'
import { distance, pointInRect } from './utils/geometry'
import { usePlayerMovement } from './hooks/usePlayerMovement'
import type { TouchDirections } from './hooks/usePlayerMovement'
import { INITIAL_BANK1_STATE, INITIAL_BANK2_STATE } from './types'
import type { BankOfTimeStage, BenchId, Bank1State, Bank2State } from './types'
import BankIntro from './components/BankIntro'
import Scenery from './components/Scenery'
import LevelCompletion from './components/LevelCompletion'
import Bank1Mission from './components/bank1/Bank1Mission'
import Bank2Mission from './components/bank2/Bank2Mission'
import MobileControls from './components/MobileControls'

// ─── Persistencia en sessionStorage ──────────────────────────────────────────
// El estudiante va a salir de la aplicación para enseñar su habilidad a
// otra persona. Al volver debe encontrar su misión y su contador donde
// los dejó, así que el progreso del nivel se guarda en el navegador.

interface SavedState {
  visitedBenches: BenchId[]
  bank1: Bank1State
  bank2: Bank2State
}

function saveState(state: SavedState) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ok */ }
}

function loadState(): SavedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedState) : null
  } catch { return null }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface BancoDelTiempoProps {
  gameTitle: string
  /** Número de intento de este juego (1 = primera vez) */
  attemptNumber: number
  /** XP base del juego, leído de games.xp_reward en Supabase */
  xpReward: number
  /** XP total acumulado del estudiante */
  currentXp: number
  /** Nivel actual del estudiante */
  currentLevel: number
  /**
   * Persiste el resultado. GamePage.tsx es el único que habla con
   * Supabase. Devuelve true si el guardado fue exitoso.
   */
  onComplete: (result: GameResult) => Promise<boolean>
  /** true mientras GamePage está escribiendo en Supabase */
  saving: boolean
}

/** Etapa en la que cada banco puede activarse */
const BENCH_STAGE: Record<BenchId, BankOfTimeStage> = {
  bank_1: 'exploring_to_bank_1',
  bank_2: 'exploring_to_bank_2',
}

/** Texto del objetivo actual, para el HUD */
const OBJECTIVE_TEXT: Record<BankOfTimeStage, string> = {
  exploring_to_bank_1: 'Busca el Banco 1',
  bank_1:              'Estás en el Banco 1',
  exploring_to_bank_2: 'Busca el Banco 2',
  bank_2:              'Estás en el Banco 2',
  exploring_to_finish: 'Llega a la meta',
  completed:           'Recorrido completado',
}

/**
 * Banco del tiempo — Mundo 2, Nivel 2.
 *
 * Escenario 2D en vista superior. El estudiante mueve un avatar con el
 * teclado, recorre el parque, interactúa con dos bancos y llega a la meta.
 *
 * ETAPAS
 *   exploring_to_bank_1 → bank_1 → exploring_to_bank_2 → bank_2
 *   → exploring_to_finish → completed
 *
 * La etapa decide qué banco es interactivo, así que nunca se pueden
 * activar los dos a la vez ni saltarse el orden.
 *
 * XP: mismo sistema que los demás niveles. El primer intento otorga el
 * XP completo (games.xp_reward) y desde el segundo intento se otorga la
 * mitad (calculateXpForAttempt, la misma regla global de todos los
 * juegos). El guardado en Supabase ocurre automáticamente al llegar a la
 * meta, igual que en "Nueva Conexión" y "Explorador de experiencias".
 */
export default function BancoDelTiempo({
  gameTitle,
  attemptNumber,
  xpReward,
  currentXp,
  currentLevel,
  onComplete,
  saving,
}: BancoDelTiempoProps) {
  /** false hasta que el estudiante entra al escenario desde la intro */
  const [started, setStarted] = useState(false)
  const [stage, setStage] = useState<BankOfTimeStage>('exploring_to_bank_1')
  const [visitedBenches, setVisitedBenches] = useState<BenchId[]>([])
  const [bank1, setBank1] = useState<Bank1State>(INITIAL_BANK1_STATE)
  const [bank2, setBank2] = useState<Bank2State>(INITIAL_BANK2_STATE)
  /** false hasta que se intentó restaurar el progreso guardado */
  const [restored, setRestored] = useState(false)

  // ── Estado del guardado en Supabase ──
  /** null = aún no se ha intentado, true = guardado, false = falló */
  const [saveResult, setSaveResult] = useState<boolean | null>(null)
  /** Evita guardar dos veces (React ejecuta los efectos dos veces en dev) */
  const saveAttempted = useRef(false)
  /** Contador para relanzar el guardado al reintentar */
  const [saveTick, setSaveTick] = useState(0)
  /** XP realmente ganado en la partida que se acaba de cerrar (valor congelado) */
  const [finishedXp, setFinishedXp] = useState(0)
  /** ¿Esa partida fue una repetición? (valor congelado) */
  const [finishedAsReplay, setFinishedAsReplay] = useState(false)

  /**
   * Detección de dispositivo táctil.
   * Se usa para mostrar/ocultar el d-pad. Se detecta una sola vez al montar
   * y también cuando el primer toque ocurre (cubre iPads con teclado externo).
   */
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true)
    }
    function onFirstTouch() {
      setIsTouchDevice(true)
      window.removeEventListener('touchstart', onFirstTouch)
    }
    window.addEventListener('touchstart', onFirstTouch, { passive: true })
    return () => window.removeEventListener('touchstart', onFirstTouch)
  }, [])

  /**
   * Ref al Set de direcciones táctiles activas.
   * MobileControls escribe aquí; usePlayerMovement lo lee en el bucle rAF.
   * No es estado React para no añadir latencia al movimiento.
   */
  const touchDirections = useRef<TouchDirections>(new Set())

  const navigate = useNavigate()

  const isReplay = attemptNumber > 1
  const finalXpEarned = calculateXpForAttempt(xpReward, attemptNumber)

  // ── Restaurar el progreso guardado al montar ──
  useEffect(() => {
    const saved = loadState()

    if (saved) {
      setVisitedBenches(saved.visitedBenches ?? [])
      setBank1({ ...INITIAL_BANK1_STATE, ...saved.bank1 })
      setBank2({ ...INITIAL_BANK2_STATE, ...saved.bank2 })

      // La etapa se deduce de los bancos ya completados, así no puede
      // quedar desincronizada con el progreso real.
      const done = saved.visitedBenches ?? []
      if (done.includes('bank_2'))      setStage('exploring_to_finish')
      else if (done.includes('bank_1')) setStage('exploring_to_bank_2')
    }

    setRestored(true)
  }, [])

  // ── Guardar el progreso cuando cambia ──
  useEffect(() => {
    if (!restored) return
    saveState({ visitedBenches, bank1, bank2 })
  }, [restored, visitedBenches, bank1, bank2])

  /** Aplica un cambio parcial al estado de la misión del banco 1 */
  const patchBank1 = useCallback((patch: Partial<Bank1State>) => {
    setBank1(prev => ({ ...prev, ...patch }))
  }, [])

  /** Aplica un cambio parcial al estado de la misión del banco 2 */
  const patchBank2 = useCallback((patch: Partial<Bank2State>) => {
    setBank2(prev => ({ ...prev, ...patch }))
  }, [])

  /** Hay un panel abierto cuando la etapa es la de un banco */
  const isDialogOpen = stage === 'bank_1' || stage === 'bank_2'

  /** El avatar solo camina si está en el escenario y sin paneles abiertos */
  const canWalk = started && !isDialogOpen && stage !== 'completed'

  const { position, facing, isMoving, reset: resetPlayer } = usePlayerMovement({
    spawn: SPAWN_POINT,
    areas: WALKABLE_AREAS,
    speed: PLAYER_SPEED,
    halfSize: PLAYER_HALF_SIZE,
    enabled: canWalk,
    touchDirections,
  })

  /**
   * Banco al alcance AHORA MISMO, si es el que toca según la etapa.
   * Devuelve undefined si no hay ninguno cerca o si el banco cercano no
   * corresponde a esta etapa (por ejemplo, volver al banco 1 ya visitado).
   */
  const benchInRange = useMemo(() => {
    if (!canWalk) return undefined

    return BENCHES.find(bench => {
      const isItsTurn = BENCH_STAGE[bench.id] === stage
      if (!isItsTurn) return false
      return distance(position, bench.position) <= bench.interactionRadius
    })
  }, [position, stage, canWalk])

  /** Abre el banco: pasa a la etapa de su panel */
  function openBench(benchId: BenchId) {
    if (BENCH_STAGE[benchId] !== stage) return
    setStage(benchId)
  }

  /** Marca el banco como completado y deja seguir el recorrido */
  function completeBench(benchId: BenchId) {
    setVisitedBenches(prev => (prev.includes(benchId) ? prev : [...prev, benchId]))
    setStage(benchId === 'bank_1' ? 'exploring_to_bank_2' : 'exploring_to_finish')
  }

  /**
   * Cierra el banco SIN completarlo.
   *
   * El progreso de la misión se conserva (incluido el contador), así que
   * el estudiante puede salir al mapa, ir a enseñar su habilidad y volver
   * al banco para retomar exactamente donde lo dejó.
   */
  function leaveBench(benchId: BenchId) {
    setStage(BENCH_STAGE[benchId])
  }

  // ── Tecla E para interactuar ──
  useEffect(() => {
    if (!benchInRange) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'e') return
      event.preventDefault()
      if (benchInRange) openBench(benchInRange.id)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [benchInRange])

  // ── Detección de la zona meta ──
  // Solo cuenta cuando ya visitó los dos bancos (etapa final).
  useEffect(() => {
    if (stage !== 'exploring_to_finish') return
    if (!pointInRect(position.x, position.y, GOAL_AREA)) return
    setStage('completed')
  }, [position, stage])

  /**
   * Guarda el resultado en Supabase en cuanto se llega a la meta. Así el
   * XP y el progreso ya están actualizados cuando el estudiante ve la
   * pantalla de logro, igual que en los otros niveles.
   */
  useEffect(() => {
    if (stage !== 'completed') return
    if (saveAttempted.current) return

    saveAttempted.current = true

    // Se congela lo que va a mostrar la pantalla de logro. Tras guardar,
    // GamePage avanza el número de intento, así que finalXpEarned pasaría
    // a valer la mitad: el estudiante debe seguir viendo el XP que ganó.
    setFinishedXp(finalXpEarned)
    setFinishedAsReplay(isReplay)

    const metadata = {
      bank1SkillId: bank1.skillId,
      bank2SkillId: bank2.skillId,
      bank2PresenceMode: bank2.presenceMode,
    }

    onComplete({
      xpEarned: finalXpEarned,
      score: null,
      metadata: metadata as unknown as Record<string, unknown>,
    }).then(ok => {
      setSaveResult(ok)
      if (!ok) {
        // Si falló, se permite reintentar el guardado
        saveAttempted.current = false
      }
    })
  }, [stage, saveTick])

  /** Reintenta el guardado si la primera vez falló */
  function handleRetrySave() {
    saveAttempted.current = false
    setSaveResult(null)
    setSaveTick(tick => tick + 1)
  }

  /** Vuelve a empezar el recorrido desde el inicio */
  function handleWalkAgain() {
    setVisitedBenches([])
    setBank1(INITIAL_BANK1_STATE)
    setBank2(INITIAL_BANK2_STATE)
    setStage('exploring_to_bank_1')
    // El avatar debe volver al punto de partida: el hook conserva su
    // posición porque este componente no se desmonta.
    resetPlayer()
    setStarted(false)

    // Rearmar el guardado: si vuelve a recorrer el parque y llega de
    // nuevo a la meta, esa partida también debe persistirse.
    saveAttempted.current = false
    setSaveResult(null)
  }

  function handleBackToGames() {
    navigate('/worlds')
  }

  // ── Render ──

  if (!started) {
    return (
      <BankIntro
        gameTitle={gameTitle}
        attemptNumber={attemptNumber}
        onStart={() => setStarted(true)}
      />
    )
  }

  if (stage === 'completed') {
    return (
      <LevelCompletion
        xpEarned={finishedXp}
        isReplay={finishedAsReplay}
        currentXp={currentXp}
        currentLevel={currentLevel}
        saveResult={saveResult}
        saving={saving}
        onRetrySave={handleRetrySave}
        onWalkAgain={handleWalkAgain}
        onBackToGames={handleBackToGames}
      />
    )
  }

  return (
    <div className="bt-screen page-fade">
      {/* HUD: objetivo y progreso de bancos */}
      <div className="bt-hud">
        <span className="bt-hud__objective">🎯 {OBJECTIVE_TEXT[stage]}</span>
        <span className="bt-hud__benches">
          🪑 {visitedBenches.length}/2 bancos
        </span>
      </div>

      {/* Escenario */}
      <div className="bt-stage">
        <Scenery goalActive={stage === 'exploring_to_finish'} />

        {/* Los dos bancos */}
        {BENCHES.map((bench, index) => {
          const isVisited = visitedBenches.includes(bench.id)
          const isTheirTurn = BENCH_STAGE[bench.id] === stage
          const isHighlighted = benchInRange?.id === bench.id

          return (
            <button
              key={bench.id}
              type="button"
              className={[
                'bt-bench',
                isVisited ? 'is-visited' : '',
                isTheirTurn ? 'is-active' : '',
                isHighlighted ? 'is-near' : '',
              ].filter(Boolean).join(' ')}
              style={{
                left: `${(bench.position.x / WORLD_WIDTH) * 100}%`,
                top:  `${(bench.position.y / WORLD_HEIGHT) * 100}%`,
              }}
              // También se puede interactuar con clic, no solo con la tecla E
              onClick={() => openBench(bench.id)}
              disabled={!isTheirTurn}
              aria-label={`Banco ${index + 1}`}
            >
              <span className="bt-bench__icon" aria-hidden="true">🪑</span>
              {isVisited && <span className="bt-bench__check" aria-hidden="true">✓</span>}
            </button>
          )
        })}

        {/* Avatar */}
        <div
          className={[
            'bt-player',
            `bt-player--${facing}`,
            isMoving ? 'is-walking' : 'is-idle',
          ].join(' ')}
          style={{
            left: `${(position.x / WORLD_WIDTH) * 100}%`,
            top:  `${(position.y / WORLD_HEIGHT) * 100}%`,
          }}
        >
          <span className="bt-player__sprite" aria-hidden="true">🧑</span>
          <span className="bt-player__shadow" aria-hidden="true" />
        </div>

        {/* Aviso de interacción, anclado sobre el banco cercano */}
        {benchInRange && (
          <div
            className="bt-prompt"
            style={{
              left: `${(benchInRange.position.x / WORLD_WIDTH) * 100}%`,
              top:  `${(benchInRange.position.y / WORLD_HEIGHT) * 100}%`,
            }}
          >
            <span className="bt-prompt__title">🪑 BANCO DEL TIEMPO</span>
            <span className="bt-prompt__hint">
              {isTouchDevice
                ? <>Pulsa <strong>E</strong> en los controles</>
                : <>Presiona <strong>E</strong> para interactuar</>
              }
            </span>
          </div>
        )}
      </div>

      {/* Recordatorio de controles bajo el escenario */}
      {isTouchDevice ? (
        /* Controles digitales en móvil */
        <MobileControls
          touchDirections={touchDirections}
          canInteract={!!benchInRange}
          onInteract={() => { if (benchInRange) openBench(benchInRange.id) }}
        />
      ) : (
        /* Recordatorio de teclado en desktop */
        <p className="bt-screen__controls">
          Muévete con <strong>WASD</strong> o las <strong>flechas</strong> · Interactúa
          con <strong>E</strong> o haciendo clic
        </p>
      )}

      {/* Misión del banco 1: "Comparte una habilidad" */}
      {stage === 'bank_1' && (
        <div
          className="bt-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Banco del tiempo"
        >
          <Bank1Mission
            state={bank1}
            onChange={patchBank1}
            onFinish={() => completeBench('bank_1')}
            onLeave={() => leaveBench('bank_1')}
          />
        </div>
      )}

      {/* Misión del banco 2: "Ahora aprendo" */}
      {stage === 'bank_2' && (
        <div
          className="bt-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Banco del tiempo"
        >
          <Bank2Mission
            state={bank2}
            onChange={patchBank2}
            onFinish={() => completeBench('bank_2')}
            onLeave={() => leaveBench('bank_2')}
          />
        </div>
      )}
    </div>
  )
}
