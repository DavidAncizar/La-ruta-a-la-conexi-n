import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameResult } from '@/types'
import { calculateXpForAttempt } from '@/lib/constants'
import { SIMULATION_POSTS } from './config'
import type { ReplyOption, SeAutenticoPhase } from './types'
import GameIntro from './components/GameIntro'
import LikePost from './components/LikePost'
import LikeResult from './components/LikeResult'
import CuriosityPost from './components/CuriosityPost'
import CuriosityChat from './components/CuriosityChat'
import RealIntro from './components/RealIntro'
import RealGoal from './components/RealGoal'
import RealClosing from './components/RealClosing'
import RealChallenge from './components/RealChallenge'
import GameCompletion from './components/GameCompletion'

// ─── Props ───────────────────────────────────────────────────────────────────

interface SeAutenticoProps {
  gameTitle: string
  attemptNumber: number
  xpReward: number
  currentXp: number
  currentLevel: number
  onComplete: (result: GameResult) => Promise<boolean>
  saving: boolean
}

// ─── Datos fijos ──────────────────────────────────────────────────────────────

const REPLY_OPTIONS: ReplyOption[] = [
  { id: 'opt_generic_a',  text: 'Qué chévere.',                       isCorrect: false },
  { id: 'opt_generic_b',  text: 'A mí también.',                      isCorrect: false },
  { id: 'opt_curiosity',  text: '¿Qué te gustaría aprender primero?', isCorrect: true  },
]

const SIMULATED_REPLY =
  'Creo que me gustaría aprender fotografía de naturaleza. ' +
  'Siempre me ha llamado la atención.'

/**
 * Sé auténtico, más allá de un like — Mundo 3, Nivel 1.
 *
 * Máquina de estados (3 partes):
 *   intro → like_post → like_result
 *        → curiosity_post → curiosity_chat
 *        → real_intro → real_goal → real_closing
 *        → finished   ← guardado automático + pantalla de logro con XP
 *
 * SISTEMA DE XP — mismo patrón que los niveles 2, 3 y 4:
 * · Al entrar a 'finished' se dispara el guardado una sola vez.
 * · Los valores de XP y nivel se congelan antes de que GamePage
 *   avance el número de intento (evita que "+150" cambie a "+75").
 * · Los botones de salida se deshabilitan hasta que Supabase confirma.
 * · Si falla, "Reintentar guardado" relanza el efecto sin salir.
 */
export default function SeAutentico({
  gameTitle,
  attemptNumber,
  xpReward,
  currentXp,
  currentLevel,
  onComplete,
  saving,
}: SeAutenticoProps) {
  const [phase, setPhase]                 = useState<SeAutenticoPhase>('intro')
  const [chosenQuestion, setChosenQuestion] = useState('')

  // ── Estado del guardado ──
  /** null = aún no intentado, true = guardado, false = falló */
  const [saveResult, setSaveResult]       = useState<boolean | null>(null)
  /** Evita doble guardado (React ejecuta efectos dos veces en dev) */
  const saveAttempted                     = useRef(false)
  const [saveTick, setSaveTick]           = useState(0)
  /** Valores congelados para el logro: no cambian cuando GamePage avanza el intento */
  const [finishedXp, setFinishedXp]       = useState(0)
  const [finishedIsReplay, setFinishedIsReplay] = useState(false)

  const navigate = useNavigate()
  const post = SIMULATION_POSTS[0]
  const finalXpEarned = calculateXpForAttempt(xpReward, attemptNumber)

  // ── Guardado automático al entrar a 'finished' ──
  useEffect(() => {
    if (phase !== 'finished') return
    if (saveAttempted.current) return

    saveAttempted.current = true

    // Congelar los valores ANTES de que GamePage avance el intento.
    setFinishedXp(finalXpEarned)
    setFinishedIsReplay(attemptNumber > 1)

    onComplete({
      xpEarned: finalXpEarned,
      score: null,
      metadata: { parts_completed: 3 },
    }).then(ok => {
      setSaveResult(ok)
      if (!ok) saveAttempted.current = false  // permite reintentar
    })
  }, [phase, saveTick])

  function handleRetrySave() {
    saveAttempted.current = false
    setSaveResult(null)
    setSaveTick(t => t + 1)
  }

  // ── Transiciones de fase ──
  function handleStart()              { setPhase('like_post') }
  function handleLike()               { setPhase('like_result') }
  function handleAfterLikeResult()    { setPhase('curiosity_post') }
  function handleAfterCuriosityChat() { setPhase('real_intro') }
  function handleAfterRealIntro()     { setPhase('real_goal') }
  function handleAfterRealGoal()      { setPhase('real_closing') }
  function handleAfterRealClosing()   { setPhase('real_challenge') }
  function handleAfterChallenge()     { setPhase('finished') }

  function handleChooseReply(option: ReplyOption) {
    setChosenQuestion(option.text)
    setPhase('curiosity_chat')
  }

  // ── Render ──

  if (phase === 'intro') {
    return <GameIntro gameTitle={gameTitle} onStart={handleStart} />
  }

  if (phase === 'like_post') {
    return <LikePost post={post} onLike={handleLike} />
  }

  if (phase === 'like_result') {
    return <LikeResult postText={post.text} onContinue={handleAfterLikeResult} />
  }

  if (phase === 'curiosity_post') {
    return (
      <CuriosityPost
        post={post}
        options={REPLY_OPTIONS}
        onChoose={handleChooseReply}
      />
    )
  }

  if (phase === 'curiosity_chat') {
    return (
      <CuriosityChat
        question={chosenQuestion}
        reply={SIMULATED_REPLY}
        onContinue={handleAfterCuriosityChat}
      />
    )
  }

  if (phase === 'real_intro') {
    return <RealIntro onContinue={handleAfterRealIntro} />
  }

  if (phase === 'real_goal') {
    return <RealGoal onContinue={handleAfterRealGoal} />
  }

  if (phase === 'real_closing') {
    return <RealClosing onChallenge={handleAfterRealClosing} />
  }

  if (phase === 'real_challenge') {
    return <RealChallenge onFinish={handleAfterChallenge} />
  }

  // phase === 'finished'
  return (
    <GameCompletion
      xpEarned={finishedXp}
      isReplay={finishedIsReplay}
      currentXp={currentXp}
      currentLevel={currentLevel}
      saveResult={saveResult}
      saving={saving}
      onRetrySave={handleRetrySave}
      onBackToGames={() => navigate('/worlds')}
    />
  )
}
