import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameResult } from '@/types'
import { calculateXpForAttempt } from '@/lib/constants'
import { REQUIRE_EVIDENCE_TO_FINISH } from './config'
import { findRouteById } from './data/routes'
import { buildGuide } from './utils/guideBuilder'
import type {
  ConnectionPhase,
  ConnectionRouteId,
  ConnectionMetadata,
  GuideStage,
} from './types/connection'
import GameIntro from './components/GameIntro'
import RouteMap from './components/RouteMap'
import StepCard from './components/StepCard'
import ConversationGuide from './components/ConversationGuide'
import GameCompletion from './components/GameCompletion'

// ─── Persistencia en sessionStorage ──────────────────────────────────────────
// Evita que el progreso se pierda si el estudiante abre una pestaña nueva
// (por ejemplo para subir su evidencia a Drive) y la app se vuelve a montar.
// Usa una clave propia para no chocar con la del Nivel 1.

const STORAGE_KEY = 'nueva_conexion_state'

interface SavedState {
  phase: ConnectionPhase
  routeId: ConnectionRouteId | null
  selectedOptionIds: string[]
  currentStepIndex: number
  /** Sub-fase dentro de 'guide' (reviewing → transition → confirming → evidence) */
  guideStage: GuideStage
  /** Si el estudiante confirmó haber realizado la conversación en la vida real */
  conversationDone: boolean
  evidenceConfirmed: boolean
}

function saveState(state: SavedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* sin storage disponible (modo privado o cuota) — no pasa nada */ }
}

function loadState(): SavedState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedState
  } catch {
    return null
  }
}

function clearState() {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ok */ }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface NuevaConexionProps {
  gameTitle: string
  /** Número de intento de este juego (1 = primera vez) */
  attemptNumber: number
  /** XP base del juego, leído de games.xp_reward en Supabase */
  xpReward: number
  /**
   * Metadata de los intentos anteriores del estudiante en este juego.
   * Se usa para marcar en el mapa qué rutas ya completó.
   */
  previousAttempts: Record<string, unknown>[]
  /** XP total acumulado del estudiante (para mostrar el progreso general) */
  currentXp: number
  /** Nivel actual del estudiante */
  currentLevel: number
  /**
   * Se llama al cerrar la misión. GamePage.tsx es el único responsable
   * de persistir el resultado en Supabase. Este componente no habla
   * con Supabase directamente. Devuelve true si el guardado fue exitoso.
   */
  onComplete: (result: GameResult) => Promise<boolean>
  /** true mientras GamePage está guardando en Supabase */
  saving: boolean
}

/**
 * Extrae los ids de ruta que el estudiante ya completó en intentos
 * anteriores, a partir de la metadata guardada en Supabase.
 * Ignora cualquier registro con forma inesperada.
 */
function extractCompletedRouteIds(attempts: Record<string, unknown>[]): ConnectionRouteId[] {
  const ids = attempts
    .map(meta => meta.routeId)
    .filter((id): id is ConnectionRouteId => typeof id === 'string')

  return [...new Set(ids)]
}

// ─── Componente ──────────────────────────────────────────────────────────────

/**
 * NuevaConexion — Orquestador del juego "Nueva Conexión" (Mundo 1, Nivel 2).
 *
 * Máquina de estados del flujo:
 *   intro → map → steps → guide → finished
 *
 * El estudiante elige UNA de las cinco rutas y construye su propia guía
 * de conversación para iniciar una nueva conexión social en la vida real.
 *
 * La lógica visual e interactiva vive 100% en React. Supabase solo se
 * usa fuera de este componente, en GamePage.tsx.
 */
export default function NuevaConexion({
  gameTitle,
  attemptNumber,
  xpReward,
  previousAttempts,
  currentXp,
  currentLevel,
  onComplete,
  saving,
}: NuevaConexionProps) {
  const [phase, setPhase]                       = useState<ConnectionPhase>('intro')
  const [routeId, setRouteId]                   = useState<ConnectionRouteId | null>(null)
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [guideStage, setGuideStage]             = useState<GuideStage>('reviewing')
  const [conversationDone, setConversationDone] = useState(false)
  const [evidenceConfirmed, setEvidenceConfirmed] = useState(false)
  const [restored, setRestored]                 = useState(false)

  // ── Estado del guardado en Supabase ──
  /** null = aún no se ha intentado, true = guardado, false = falló */
  const [saveResult, setSaveResult] = useState<boolean | null>(null)
  /** Evita guardar dos veces (React ejecuta los efectos dos veces en dev) */
  const saveAttempted = useRef(false)
  /** Contador para relanzar el guardado al reintentar */
  const [saveTick, setSaveTick] = useState(0)
  /** Ruta que se acaba de completar en esta sesión, para marcarla en el mapa */
  const [justCompletedRouteId, setJustCompletedRouteId] =
    useState<ConnectionRouteId | null>(null)
  /** XP realmente ganado en la partida que se acaba de cerrar (valor congelado) */
  const [finishedXp, setFinishedXp] = useState(0)
  /** ¿Esa partida fue una repetición? (valor congelado) */
  const [finishedAsReplay, setFinishedAsReplay] = useState(false)

  const navigate = useNavigate()

  // ── Restaurar estado guardado al montar ──
  useEffect(() => {
    const saved = loadState()
    if (saved && saved.phase !== 'intro') {
      setPhase(saved.phase)
      setRouteId(saved.routeId)
      setSelectedOptionIds(saved.selectedOptionIds)
      setCurrentStepIndex(saved.currentStepIndex)
      // Los campos siguientes se añadieron después. Se leen con defaults
      // para que estados guardados antiguos no rompan la restauración.
      setGuideStage(saved.guideStage ?? 'reviewing')
      setConversationDone(saved.conversationDone ?? false)
      setEvidenceConfirmed(saved.evidenceConfirmed)
    }
    setRestored(true)
  }, [])

  // ── Guardar estado cuando cambia algo relevante ──
  const persistState = useCallback(() => {
    if (phase === 'intro') return
    saveState({
      phase,
      routeId,
      selectedOptionIds,
      currentStepIndex,
      guideStage,
      conversationDone,
      evidenceConfirmed,
    })
  }, [phase, routeId, selectedOptionIds, currentStepIndex, guideStage, conversationDone, evidenceConfirmed])

  useEffect(() => {
    if (restored) persistState()
  }, [restored, persistState])

  // Ruta activa (se recalcula desde el id para sobrevivir a recargas)
  const route = routeId ? findRouteById(routeId) : undefined

  // Rutas completadas: las de intentos anteriores (Supabase) más la que
  // se acaba de completar en esta sesión, para que el mapa la muestre ya
  // marcada sin tener que recargar la página.
  const completedRouteIds = useMemo(() => {
    const previous = extractCompletedRouteIds(previousAttempts)
    if (justCompletedRouteId && !previous.includes(justCompletedRouteId)) {
      return [...previous, justCompletedRouteId]
    }
    return previous
  }, [previousAttempts, justCompletedRouteId])

  /**
   * Condiciones que definen el nivel como completado. La evidencia es
   * siempre opcional (REQUIRE_EVIDENCE_TO_FINISH): se recomienda pero
   * nunca bloquea el cierre de la misión.
   */
  const isMissionComplete = Boolean(
    routeId &&                                                   // 1. eligió ruta
    route &&
    route.steps.every((_, i) => Boolean(selectedOptionIds[i])) && // 2. 4 pasos
    conversationDone &&                                          // 3. conversación
    (!REQUIRE_EVIDENCE_TO_FINISH || evidenceConfirmed)           // 4. evidencia (opcional)
  )

  /**
   * ¿El estudiante ya había completado este nivel antes?
   *
   * Una fila en student_progress solo se crea al completar la misión,
   * así que si el siguiente intento es el 2 o mayor, ya lo terminó
   * al menos una vez.
   */
  const isReplay = attemptNumber > 1

  /**
   * XP final de esta partida, con el multiplicador de reintento que
   * define el sistema (100% la primera vez, la mitad al repetir).
   * Es el mismo valor que se muestra en pantalla y que se persiste.
   */
  const finalXpEarned = calculateXpForAttempt(xpReward, attemptNumber)

  // ── Acciones ──

  function handleStart() {
    setPhase('map')
  }

  /**
   * Se llama cuando el estudiante confirma su ruta con el botón
   * "COMENZAR CONEXIÓN" del mapa. La selección previa la maneja el
   * propio mapa, así que aquí solo se arranca la misión.
   */
  function handleStartRoute(selectedId: ConnectionRouteId) {
    setRouteId(selectedId)
    setSelectedOptionIds([])
    setCurrentStepIndex(0)
    // Reset del sub-flujo de la fase 'guide' por si viene de una ruta anterior
    setGuideStage('reviewing')
    setConversationDone(false)
    setEvidenceConfirmed(false)
    setPhase('steps')
  }

  /**
   * Marca la opción elegida en el paso actual, SIN avanzar. El estudiante
   * puede cambiar de elección antes de confirmar con "Continuar".
   */
  function handleSelectOption(optionId: string) {
    if (!route) return
    const nextSelections = [...selectedOptionIds]
    nextSelections[currentStepIndex] = optionId
    setSelectedOptionIds(nextSelections)
  }

  /**
   * Avanza al siguiente paso (o a la guía si era el último). El botón
   * "Continuar" del StepCard solo se habilita cuando hay una opción
   * seleccionada, así que aquí no hace falta volver a validar.
   */
  function handleContinue() {
    if (!route) return
    const isLastStep = currentStepIndex === route.steps.length - 1
    if (isLastStep) {
      // Al entrar a la fase 'guide' siempre se empieza por 'reviewing'
      setGuideStage('reviewing')
      setPhase('guide')
    } else {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  // ── Sub-flujo dentro de la fase 'guide' ──
  //   reviewing → transition → confirming → (sí) evidence
  //                                       → (no) reviewing (mensaje alentador)

  /** El estudiante toca "IR A CREAR MI CONEXIÓN" en la guía */
  function handleGoToAction() {
    setGuideStage('transition')
  }

  /** El estudiante toca "Continuar" en la pantalla de transición */
  function handleContinueAfterTransition() {
    setGuideStage('confirming')
  }

  /** Sí, ya realicé la conversación → pasa a la evidencia */
  function handleConfirmConversationDone() {
    setConversationDone(true)
    setGuideStage('evidence')
  }

  /** Todavía no → vuelve a la guía para consultar de nuevo */
  function handleConversationPending() {
    setGuideStage('reviewing')
  }

  /** Enlace "← Ver mi guía de nuevo" desde la vista de evidencia */
  function handleBackToReviewing() {
    setGuideStage('reviewing')
  }

  function handleBackFromStep() {
    if (currentStepIndex === 0) {
      // Volver al mapa para cambiar de ruta
      setRouteId(null)
      setSelectedOptionIds([])
      setPhase('map')
    } else {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  /**
   * "Cambiar mis respuestas" desde la vista de guía: vuelve al último
   * paso para que pueda modificar su elección. Solo se ofrece cuando la
   * sub-fase actual es 'reviewing' (aún no ha ido a la acción real).
   */
  function handleBackFromGuide() {
    if (!route) return
    setCurrentStepIndex(Math.max(0, route.steps.length - 1))
    setPhase('steps')
  }

  function handleToggleEvidence() {
    setEvidenceConfirmed(prev => !prev)
  }

  /**
   * Cierra la misión y pasa a la pantalla de logro.
   *
   * Las cuatro condiciones para completar el nivel deben cumplirse:
   *   1. eligió una ruta
   *   2. completó los 4 pasos
   *   3. marcó que realizó la conversación
   *   4. confirmó que subió la evidencia
   *
   * La interfaz ya impide llegar aquí sin cumplirlas, pero se vuelve a
   * comprobar por seguridad para que nunca se otorgue XP sin merecerla.
   */
  function handleFinishMission() {
    if (!isMissionComplete) return
    setPhase('finished')
  }

  /**
   * Guarda el resultado en Supabase en cuanto se entra a la pantalla de
   * logro. Así el XP y el progreso ya están actualizados cuando el
   * estudiante los ve, y no dependen de que pulse otro botón.
   */
  useEffect(() => {
    if (phase !== 'finished') return
    if (saveAttempted.current) return
    if (!routeId || !isMissionComplete) return

    saveAttempted.current = true

    // Se congela lo que va a mostrar la pantalla de logro. Tras guardar,
    // GamePage avanza el número de intento, así que finalXpEarned pasaría a
    // valer la mitad: el estudiante debe seguir viendo el XP que ganó.
    setFinishedXp(finalXpEarned)
    setFinishedAsReplay(isReplay)

    const metadata: ConnectionMetadata = {
      routeId,
      stepsCompleted: selectedOptionIds.filter(Boolean).length,
      conversationDone,
      evidenceConfirmed,
    }

    onComplete({
      xpEarned: finalXpEarned,
      score: metadata.stepsCompleted,
      metadata: metadata as unknown as Record<string, unknown>,
    }).then(ok => {
      setSaveResult(ok)
      if (ok) {
        // El progreso ya está en Supabase: se libera el borrador local
        // y se marca la ruta como completada para el mapa.
        clearState()
        setJustCompletedRouteId(routeId)
      } else {
        // Si falló, se permite reintentar el guardado
        saveAttempted.current = false
      }
    })
  }, [phase, saveTick])

  /** Reintenta el guardado si la primera vez falló */
  function handleRetrySave() {
    saveAttempted.current = false
    setSaveResult(null)
    // Sube el contador para que el efecto de guardado se vuelva a ejecutar
    // sin tener que salir de la pantalla de logro.
    setSaveTick(tick => tick + 1)
  }

  /** "VOLVER AL MAPA": vuelve al mapa dentro del juego, ya con la ruta completada */
  function handleBackToMap() {
    setRouteId(null)
    setSelectedOptionIds([])
    setCurrentStepIndex(0)
    setGuideStage('reviewing')
    setConversationDone(false)
    setEvidenceConfirmed(false)
    setPhase('map')

    // Se rearma el guardado: si el estudiante recorre otra ruta y la
    // termina, esa partida también debe persistirse.
    saveAttempted.current = false
    setSaveResult(null)
  }

  /** "VOLVER A JUEGOS": sale del juego hacia el mapa de mundos */
  function handleBackToGames() {
    navigate('/worlds')
  }

  // ── Render por fase ──

  /** El mapa se renderiza en varios puntos, así que se centraliza aquí */
  function renderMap() {
    return (
      <RouteMap
        completedRouteIds={completedRouteIds}
        onStartRoute={handleStartRoute}
      />
    )
  }

  // Esperar a que termine el intento de restauración para no parpadear
  if (!restored) return null

  if (phase === 'intro') {
    return (
      <GameIntro
        gameTitle={gameTitle}
        attemptNumber={attemptNumber}
        xpReward={finalXpEarned}
        onStart={handleStart}
      />
    )
  }

  if (phase === 'map') {
    return renderMap()
  }

  // Desde aquí en adelante se necesita una ruta válida.
  // Si por alguna razón no existe (datos corruptos en storage), se
  // vuelve al mapa en lugar de romper la pantalla.
  if (!route) {
    return renderMap()
  }

  if (phase === 'steps') {
    const step = route.steps[currentStepIndex]
    if (!step) return renderMap()

    return (
      <StepCard
        route={route}
        step={step}
        stepIndex={currentStepIndex}
        totalSteps={route.steps.length}
        selectedOptionId={selectedOptionIds[currentStepIndex]}
        selectedOptionIds={selectedOptionIds}
        onSelectOption={handleSelectOption}
        onContinue={handleContinue}
        onBack={handleBackFromStep}
      />
    )
  }

  if (phase === 'guide') {
    return (
      <ConversationGuide
        route={route}
        lines={buildGuide(route, selectedOptionIds)}
        guideStage={guideStage}
        evidenceConfirmed={evidenceConfirmed}
        onGoToAction={handleGoToAction}
        onContinueAfterTransition={handleContinueAfterTransition}
        onConfirmConversationDone={handleConfirmConversationDone}
        onConversationPending={handleConversationPending}
        onBackToReviewing={handleBackToReviewing}
        onConfirmEvidence={handleToggleEvidence}
        onFinish={handleFinishMission}
        onBackToSteps={handleBackFromGuide}
        saving={saving}
      />
    )
  }

  // phase === 'finished'
  return (
    <GameCompletion
      route={route}
      xpEarned={finishedXp}
      isReplay={finishedAsReplay}
      currentXp={currentXp}
      currentLevel={currentLevel}
      saveResult={saveResult}
      saving={saving}
      onRetrySave={handleRetrySave}
      onBackToMap={handleBackToMap}
      onBackToGames={handleBackToGames}
    />
  )
}
