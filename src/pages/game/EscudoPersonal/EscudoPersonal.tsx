import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { GameResult } from '@/types'
import { calculateXpForAttempt } from '@/lib/constants'
import type { EscudoPhase } from './types'
import ShieldIntro      from './components/ShieldIntro'
import ShieldEditor     from './components/ShieldEditor'
import ShieldShare      from './components/ShieldShare'
import ShieldCompletion from './components/ShieldCompletion'

// ─── Props ───────────────────────────────────────────────────────────────────

interface EscudoPersonalProps {
  gameTitle:    string
  attemptNumber: number
  xpReward:     number
  currentXp:    number
  currentLevel: number
  onComplete:   (result: GameResult) => Promise<boolean>
  saving:       boolean
}

/**
 * Escudo personal — Mundo 3, Nivel 2.
 *
 * Máquina de estados completa:
 *   intro → editor → share → finished
 *
 * · El estudiante crea su escudo en el editor.
 * · Al pulsar "Listo" pasa a la pantalla de compartir/guardar.
 * · Al pulsar "Finalizar" allí se guarda el progreso y se abre el logro.
 * · Los botones de salida esperan a que Supabase confirme.
 *
 * NOTA: "Seguir editando" desde share vuelve al editor SIN perder el
 * dibujo (el canvas no se desmonta porque EscudoPersonal no cambia de
 * fase a 'intro', sino que ShieldEditor permanece montado con display:none).
 * Para simplificar la arquitectura, la imagen se pasa como dataURL de
 * fase en fase y se reconstruye si hace falta.
 */
export default function EscudoPersonal({
  gameTitle,
  attemptNumber,
  xpReward,
  currentXp,
  currentLevel,
  onComplete,
  saving,
}: EscudoPersonalProps) {
  const [phase, setPhase]             = useState<EscudoPhase>('intro')
  const [imageDataUrl, setImageDataUrl] = useState('')

  // ── Estado del guardado ──
  const [saveResult, setSaveResult]   = useState<boolean | null>(null)
  const saveAttempted                 = useRef(false)
  const [saveTick, setSaveTick]       = useState(0)
  const [finishedXp, setFinishedXp]   = useState(0)
  const [finishedIsReplay, setFinishedIsReplay] = useState(false)

  const navigate      = useNavigate()
  const finalXpEarned = calculateXpForAttempt(xpReward, attemptNumber)

  // ── Guardado automático al entrar a 'finished' ──
  useEffect(() => {
    if (phase !== 'finished') return
    if (saveAttempted.current) return

    saveAttempted.current = true
    setFinishedXp(finalXpEarned)
    setFinishedIsReplay(attemptNumber > 1)

    onComplete({
      xpEarned: finalXpEarned,
      score: null,
      metadata: { shieldCreated: true },
    }).then(ok => {
      setSaveResult(ok)
      if (!ok) saveAttempted.current = false
    })
  }, [phase, saveTick])

  function handleRetrySave() {
    saveAttempted.current = false
    setSaveResult(null)
    setSaveTick(t => t + 1)
  }

  // ── Transiciones ──────────────────────────────────

  function handleStart()             { setPhase('editor') }
  function handleBackToIntro()       { setPhase('intro') }
  function handleEditorDone(url: string) {
    setImageDataUrl(url)
    setPhase('share')
  }

  /** Desde share → volver al editor SIN borrar el dibujo */
  function handleBackToEditor()      { setPhase('editor') }

  /** Desde share → finalizar y guardar XP */
  function handleFinish()            { setPhase('finished') }

  // ── Render ───────────────────────────────────────

  if (phase === 'finished') {
    return (
      <ShieldCompletion
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

  if (phase === 'share') {
    return (
      <ShieldShare
        imageDataUrl={imageDataUrl}
        onEdit={handleBackToEditor}
        onFinish={handleFinish}
        saving={saving}
      />
    )
  }

  if (phase === 'editor') {
    return (
      <ShieldEditor
        onBack={handleBackToIntro}
        onDone={handleEditorDone}
      />
    )
  }

  // phase === 'intro'
  return <ShieldIntro gameTitle={gameTitle} onStart={handleStart} />
}
