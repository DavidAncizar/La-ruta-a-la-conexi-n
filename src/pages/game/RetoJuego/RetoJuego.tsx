import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CHALLENGES } from './data/challenges'
import { CHALLENGES_PER_GAME, XP_PER_CHALLENGE } from './config'
import { calculateXpForAttempt } from '@/lib/constants'
import type { GameResult } from '@/types'
import { selectRandomChallenges } from './utils/challengeSelection'
import type { Challenge, ChallengeStepStatus, GamePhase } from './types/challenge'
import GameIntro from './components/GameIntro'
import ChallengeProgress from './components/ChallengeProgress'
import ChallengeCard from './components/ChallengeCard'
import GameCompletion from './components/GameCompletion'

// ─── Persistencia en sessionStorage ──────────────────────────────────────────
// Evita que el progreso de la partida se pierda si el estudiante abre una
// pestaña nueva (ej. para subir evidencia a Drive) y la app se remonta.

const STORAGE_KEY = 'reto_juego_state'

interface SavedState {
  phase: GamePhase
  queueIds: number[]
  reserveIds: number[]
  statuses: ChallengeStepStatus[]
  currentIndex: number
  completedCount: number
}

function saveState(state: SavedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded o modo privado sin storage — no pasa nada */ }
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

/** Recupera los Challenge completos a partir de sus IDs */
function hydrateFromIds(ids: number[]): Challenge[] {
  return ids
    .map(id => CHALLENGES.find(c => c.id === id))
    .filter((c): c is Challenge => c !== undefined)
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface RetoJuegoProps {
  gameTitle: string
  attemptNumber: number
  /** XP base del juego, leído de games.xp_reward en Supabase */
  xpReward: number
  /** XP total acumulado del estudiante (para mostrar el progreso general) */
  currentXp: number
  /** Nivel actual del estudiante */
  currentLevel: number
  /**
   * Se llama al cerrar la partida. GamePage.tsx es el único responsable
   * de persistir en Supabase. `xpEarned` ya viene con el multiplicador
   * de reintento aplicado. Devuelve true si el guardado fue exitoso.
   */
  onComplete: (result: GameResult) => Promise<boolean>
  saving: boolean
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function RetoJuego({ gameTitle, attemptNumber, xpReward: _xpReward, currentXp, currentLevel, onComplete, saving }: RetoJuegoProps) {
  const navigate = useNavigate()
  const [phase, setPhase]             = useState<GamePhase>('intro')
  const [queue, setQueue]             = useState<Challenge[]>([])
  const [reserve, setReserve]         = useState<Challenge[]>([])
  const [statuses, setStatuses]       = useState<ChallengeStepStatus[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [restored, setRestored]       = useState(false)

  // ── Estado del guardado ──
  /** null = sin intentar, true = guardado, false = falló */
  const [saveResult, setSaveResult]   = useState<boolean | null>(null)
  const saveAttempted                 = useRef(false)
  const [saveTick, setSaveTick]       = useState(0)
  /** Valores congelados para que no cambien cuando GamePage avanza el intento */
  const [finishedXp, setFinishedXp]   = useState(0)
  const [finishedIsReplay, setFinishedIsReplay] = useState(false)

  // ── Restaurar estado guardado al montar ──
  useEffect(() => {
    const saved = loadState()
    if (saved && saved.phase !== 'intro') {
      setPhase(saved.phase)
      setQueue(hydrateFromIds(saved.queueIds))
      setReserve(hydrateFromIds(saved.reserveIds))
      setStatuses(saved.statuses)
      setCurrentIndex(saved.currentIndex)
      setCompletedCount(saved.completedCount)
    }
    setRestored(true)
  }, [])

  // ── Guardar estado cada vez que cambia algo relevante ──
  const persistState = useCallback(() => {
    if (phase === 'intro') return // no guardar la intro
    saveState({
      phase,
      queueIds: queue.map(c => c.id),
      reserveIds: reserve.map(c => c.id),
      statuses,
      currentIndex,
      completedCount,
    })
  }, [phase, queue, reserve, statuses, currentIndex, completedCount])

  useEffect(() => {
    if (restored) persistState()
  }, [restored, persistState])

  // ── Acciones ──

  function handleStart() {
    const shuffled = selectRandomChallenges(CHALLENGES, CHALLENGES.length)
    const initialQueue = shuffled.slice(0, CHALLENGES_PER_GAME)
    const initialReserve = shuffled.slice(CHALLENGES_PER_GAME)

    setQueue(initialQueue)
    setReserve(initialReserve)
    setStatuses(Array(initialQueue.length).fill('pending'))
    setCurrentIndex(0)
    setCompletedCount(0)
    setPhase('playing')
  }

  function updateStatus(index: number, status: ChallengeStepStatus) {
    setStatuses(prev => {
      const next = [...prev]
      next[index] = status
      return next
    })
  }

  function handleAccept() {
    const challenge = queue[currentIndex]
    updateStatus(currentIndex, challenge.evidenceRequired ? 'awaiting_evidence' : 'accepted')
  }

  function handleReject() {
    updateStatus(currentIndex, 'rejected')
  }

  function handleSkip() {
    if (reserve.length === 0) return

    const [nextChallenge, ...restReserve] = reserve
    setReserve(restReserve)

    setQueue(prev => {
      const next = [...prev]
      next[currentIndex] = nextChallenge
      return next
    })
    updateStatus(currentIndex, 'pending')
  }

  function handleConfirmEvidence() {
    updateStatus(currentIndex, 'completed')
    setCompletedCount(prev => prev + 1)

    const isLast = currentIndex === queue.length - 1
    if (isLast) {
      setPhase('finished')
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const rawXpEarned = completedCount * XP_PER_CHALLENGE
  const finalXpEarned = calculateXpForAttempt(rawXpEarned, attemptNumber)

  // ── Guardado automático al entrar a 'finished' ──
  // Mismo patrón que niveles 2-5: congela XP, guarda, deshabilita botones.
  useEffect(() => {
    if (phase !== 'finished') return
    if (saveAttempted.current) return

    saveAttempted.current = true

    // Congelar los valores ANTES de que GamePage avance el intento
    setFinishedXp(finalXpEarned)
    setFinishedIsReplay(attemptNumber > 1)

    onComplete({
      xpEarned: finalXpEarned,
      score: completedCount,
    }).then(ok => {
      setSaveResult(ok)
      if (ok) clearState()
      else saveAttempted.current = false  // permite reintentar
    })
  }, [phase, saveTick])

  function handleRetrySave() {
    saveAttempted.current = false
    setSaveResult(null)
    setSaveTick(t => t + 1)
  }

  function handleBackToGames() {
    navigate('/worlds')
  }

  // ── Render ──

  // No renderizar nada hasta que se haya intentado restaurar
  if (!restored) return null

  if (phase === 'intro') {
    return (
      <GameIntro
        gameTitle={gameTitle}
        attemptNumber={attemptNumber}
        onStart={handleStart}
      />
    )
  }

  if (phase === 'finished') {
    return (
      <GameCompletion
        challengesCompleted={completedCount}
        challengesTotal={queue.length}
        xpEarned={finishedXp}
        isReplay={finishedIsReplay}
        currentXp={currentXp}
        currentLevel={currentLevel}
        saveResult={saveResult}
        saving={saving}
        onRetrySave={handleRetrySave}
        onBackToGames={handleBackToGames}
      />
    )
  }

  // phase === 'playing'
  const currentChallenge = queue[currentIndex]
  const currentStatus = statuses[currentIndex] ?? 'pending'

  if (!currentChallenge) return null

  return (
    <div className="reto-playing">
      <ChallengeProgress current={currentIndex + 1} total={queue.length} />
      <ChallengeCard
        challenge={currentChallenge}
        stepNumber={currentIndex + 1}
        status={currentStatus}
        canSkip={reserve.length > 0}
        onAccept={handleAccept}
        onReject={handleReject}
        onSkip={handleSkip}
        onConfirmEvidence={handleConfirmEvidence}
      />
    </div>
  )
}
