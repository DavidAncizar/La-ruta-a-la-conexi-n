import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameResult } from '@/types'
import { calculateXpForAttempt } from '@/lib/constants'
import { CATEGORIES, findCategoryById } from './data/categories'
import { SPIN_DURATION_MS, REQUIRE_EVIDENCE_TO_FINISH } from './config'
import type { CategoryId, ExplorerPhase, ExplorerMetadata } from './types'
import ExplorerIntro from './components/ExplorerIntro'
import Wheel from './components/Wheel'
import CategoryReveal from './components/CategoryReveal'
import ExperienceEvidence from './components/ExperienceEvidence'
import ExplorerCompletion from './components/ExplorerCompletion'

// ─── Persistencia en sessionStorage ──────────────────────────────────────────
// Usa una clave propia para no chocar con la de los otros niveles.

const STORAGE_KEY = 'explorador_state'

interface SavedState {
  phase: ExplorerPhase
  categoryId: CategoryId | null
  experienceId: string | null
  evidenceConfirmed: boolean
  rotation: number
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

function clearState() {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ok */ }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ExploradorProps {
  gameTitle: string
  /** Número de intento de este juego (1 = primera vez) */
  attemptNumber: number
  /** XP base del juego, leído de games.xp_reward en Supabase */
  xpReward: number
  /** XP total acumulado del estudiante (para el progreso general) */
  currentXp: number
  /** Nivel actual del estudiante */
  currentLevel: number
  /**
   * Persiste el resultado. GamePage.tsx es el único que habla con
   * Supabase. Devuelve true si el guardado fue exitoso.
   */
  onComplete: (result: GameResult) => Promise<boolean>
  /** true mientras GamePage está guardando en Supabase */
  saving: boolean
}

const SECTOR_ANGLE = 360 / CATEGORIES.length  // 60°

/**
 * Explorador de experiencias — Mundo 2, Nivel 1.
 *
 * Máquina de estados:
 *   intro → wheel → spinning → category → evidence → finished
 *
 * La ruleta gira, cae en una categoría, el estudiante elige una de sus
 * cuatro experiencias, la realiza y sube evidencia. Misma arquitectura
 * que "Nueva Conexión": la lógica visual vive aquí y Supabase solo se
 * toca desde GamePage. NO se recarga la página al guardar.
 */
export default function Explorador({
  gameTitle,
  attemptNumber,
  xpReward,
  currentXp,
  currentLevel,
  onComplete,
  saving,
}: ExploradorProps) {
  const [phase, setPhase]                     = useState<ExplorerPhase>('intro')
  const [categoryId, setCategoryId]           = useState<CategoryId | null>(null)
  const [experienceId, setExperienceId]       = useState<string | null>(null)
  const [evidenceConfirmed, setEvidenceConfirmed] = useState(false)
  const [rotation, setRotation]               = useState(0)
  const [restored, setRestored]               = useState(false)

  // ── Estado del guardado ──
  const [saveResult, setSaveResult] = useState<boolean | null>(null)
  const saveAttempted = useRef(false)
  const [saveTick, setSaveTick] = useState(0)
  /** Valores congelados para la pantalla de logro */
  const [finishedXp, setFinishedXp] = useState(0)
  const [finishedAsReplay, setFinishedAsReplay] = useState(false)

  const navigate = useNavigate()

  // ── Restaurar estado al montar ──
  useEffect(() => {
    const saved = loadState()
    if (saved && saved.phase !== 'intro') {
      // 'spinning' no se restaura: si la app se remonta a mitad de giro,
      // se deja la ruleta quieta lista para volver a girar.
      setPhase(saved.phase === 'spinning' ? 'wheel' : saved.phase)
      setCategoryId(saved.categoryId)
      setExperienceId(saved.experienceId)
      setEvidenceConfirmed(saved.evidenceConfirmed)
      setRotation(saved.rotation ?? 0)
    }
    setRestored(true)
  }, [])

  // ── Guardar estado cuando cambia algo relevante ──
  const persistState = useCallback(() => {
    if (phase === 'intro') return
    saveState({ phase, categoryId, experienceId, evidenceConfirmed, rotation })
  }, [phase, categoryId, experienceId, evidenceConfirmed, rotation])

  useEffect(() => {
    if (restored) persistState()
  }, [restored, persistState])

  const category = categoryId ? findCategoryById(categoryId) : undefined
  const experience = category?.experiences.find(exp => exp.id === experienceId)

  const isReplay = attemptNumber > 1
  const finalXpEarned = calculateXpForAttempt(xpReward, attemptNumber)

  // ── Acciones ──

  function handleStart() {
    setPhase('wheel')
  }

  /**
   * Gira la ruleta. Elige un sector al azar y calcula la rotación para
   * que ese sector quede bajo el puntero (arriba), sumando varias vueltas
   * para el efecto visual. Al terminar la animación pasa a 'category'.
   */
  function handleSpin() {
    if (phase === 'spinning') return

    const winnerIndex = Math.floor(Math.random() * CATEGORIES.length)

    // El puntero está arriba (0°). El centro del sector i está en
    // (i + 0.5) * SECTOR_ANGLE. Para llevarlo arriba hay que rotar el
    // disco el negativo de ese ángulo. Se añaden vueltas completas y se
    // parte de la rotación actual para que el giro sea siempre hacia
    // adelante, sin importar dónde quedó la vez anterior.
    const targetWithinTurn = 360 - (winnerIndex + 0.5) * SECTOR_ANGLE
    const fullTurns = 5 * 360
    const currentMod = ((rotation % 360) + 360) % 360
    const delta = fullTurns + ((targetWithinTurn - currentMod + 360) % 360)

    setPhase('spinning')
    setRotation(prev => prev + delta)

    window.setTimeout(() => {
      setCategoryId(CATEGORIES[winnerIndex].id)
      setExperienceId(null)
      setPhase('category')
    }, SPIN_DURATION_MS)
  }

  function handleSelectExperience(id: string) {
    setExperienceId(id)
  }

  function handleConfirmExperience() {
    if (!experienceId) return
    setEvidenceConfirmed(false)
    setPhase('evidence')
  }

  /** Vuelve a la ruleta para conseguir otra categoría */
  function handleSpinAgain() {
    setCategoryId(null)
    setExperienceId(null)
    setEvidenceConfirmed(false)
    setPhase('wheel')

    // Rearmar el guardado por si vuelve desde la pantalla de logro:
    // una segunda experiencia terminada también debe persistirse.
    saveAttempted.current = false
    setSaveResult(null)
  }

  function handleToggleEvidence() {
    setEvidenceConfirmed(prev => !prev)
  }

  function handleBackToCategory() {
    setPhase('category')
  }

  /**
   * Cierra la misión: necesita una experiencia elegida. La evidencia es
   * opcional (REQUIRE_EVIDENCE_TO_FINISH), nunca bloquea el cierre.
   */
  function handleFinishMission() {
    if (!experienceId) return
    if (REQUIRE_EVIDENCE_TO_FINISH && !evidenceConfirmed) return
    setPhase('finished')
  }

  // ── Guardado automático al entrar a 'finished' ──
  useEffect(() => {
    if (phase !== 'finished') return
    if (saveAttempted.current) return
    if (!categoryId || !experienceId) return
    if (REQUIRE_EVIDENCE_TO_FINISH && !evidenceConfirmed) return

    saveAttempted.current = true

    // Congelar lo que muestra la pantalla de logro (tras guardar, GamePage
    // avanza el intento y finalXpEarned pasaría a la mitad).
    setFinishedXp(finalXpEarned)
    setFinishedAsReplay(isReplay)

    const metadata: ExplorerMetadata = {
      categoryId,
      experienceId,
      evidenceConfirmed,
    }

    onComplete({
      xpEarned: finalXpEarned,
      score: null,
      metadata: metadata as unknown as Record<string, unknown>,
    }).then(ok => {
      setSaveResult(ok)
      if (ok) {
        clearState()
      } else {
        saveAttempted.current = false
      }
    })
  }, [phase, saveTick])

  function handleRetrySave() {
    saveAttempted.current = false
    setSaveResult(null)
    setSaveTick(tick => tick + 1)
  }

  function handleBackToGames() {
    navigate('/worlds')
  }

  // ── Render por fase ──

  if (!restored) return null

  if (phase === 'intro') {
    return (
      <ExplorerIntro
        gameTitle={gameTitle}
        attemptNumber={attemptNumber}
        xpReward={finalXpEarned}
        onStart={handleStart}
      />
    )
  }

  if (phase === 'wheel' || phase === 'spinning') {
    return (
      <div className="exp-wheelscreen page-fade">
        <header className="exp-wheelscreen__header">
          <h1 className="exp-wheelscreen__title">Gira la ruleta</h1>
          <p className="exp-wheelscreen__subtitle">
            Deja que el azar elija tu próxima experiencia. ¡Diviértete solo o con amigos!
          </p>
        </header>

        <Wheel
          rotation={rotation}
          spinning={phase === 'spinning'}
          spinDurationMs={SPIN_DURATION_MS}
          onSpin={handleSpin}
          disabled={phase === 'spinning'}
        />
      </div>
    )
  }

  // Desde aquí se necesita una categoría válida.
  if (!category) {
    // Datos inconsistentes: volver a la ruleta en lugar de romper.
    return (
      <div className="exp-wheelscreen page-fade">
        <Wheel
          rotation={rotation}
          spinning={false}
          spinDurationMs={SPIN_DURATION_MS}
          onSpin={handleSpin}
          disabled={false}
        />
      </div>
    )
  }

  if (phase === 'category') {
    return (
      <CategoryReveal
        category={category}
        selectedExperienceId={experienceId ?? undefined}
        onSelectExperience={handleSelectExperience}
        onConfirm={handleConfirmExperience}
        onSpinAgain={handleSpinAgain}
      />
    )
  }

  if (phase === 'evidence' && experience) {
    return (
      <ExperienceEvidence
        category={category}
        experience={experience}
        evidenceConfirmed={evidenceConfirmed}
        onToggleEvidence={handleToggleEvidence}
        onFinish={handleFinishMission}
        onBack={handleBackToCategory}
        saving={saving}
      />
    )
  }

  // phase === 'finished'
  if (!experience) {
    // Sin experiencia no debería llegar aquí; volver a la categoría.
    setPhase('category')
    return null
  }

  return (
    <ExplorerCompletion
      category={category}
      experience={experience}
      xpEarned={finishedXp}
      isReplay={finishedAsReplay}
      currentXp={currentXp}
      currentLevel={currentLevel}
      saveResult={saveResult}
      saving={saving}
      onRetrySave={handleRetrySave}
      onSpinAgain={handleSpinAgain}
      onBackToGames={handleBackToGames}
    />
  )
}
