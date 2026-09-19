import { findSkillById } from '../../data/skills'
import { LEARNING_ENCOURAGEMENT_MESSAGES } from '../../data/encouragement'
import type { Bank2State, PresenceMode, SkillCategoryId } from '../../types'
import Bank2Briefing from './Bank2Briefing'
import PresenceSelector from './PresenceSelector'
import PresenceExplained from './PresenceExplained'
import SkillSelector from '../shared/SkillSelector'
import SkillMission from '../shared/SkillMission'
import OutsideNotice from '../shared/OutsideNotice'
import MissionRun from '../shared/MissionRun'
import LearningClosing from './LearningClosing'

interface Bank2MissionProps {
  state: Bank2State
  /** Aplica un cambio parcial al estado de la misión */
  onChange: (patch: Partial<Bank2State>) => void
  /** Cierra el banco marcándolo como completado */
  onFinish: () => void
  /** Cierra el banco SIN completarlo, conservando el progreso */
  onLeave: () => void
}

/**
 * Misión del banco 2 — "Ahora aprendo".
 *
 * Invierte la dinámica del banco 1: aquí una persona de confianza le
 * enseña algo nuevo al estudiante, presencial o a distancia. Reutiliza
 * los componentes compartidos con el banco 1 (selector de habilidad,
 * aviso de salir de la pantalla y contador) para que ambas misiones se
 * sientan parte del mismo juego, y solo añade sus propias pantallas:
 * la elección de presencia y su explicación, y el cierre con
 * agradecimiento.
 *
 * FLUJO
 *   briefing → choosing_presence → presence_explained → choosing_skill
 *   → mission → outside → active → closing
 */
export default function Bank2Mission({
  state,
  onChange,
  onFinish,
  onLeave,
}: Bank2MissionProps) {
  const skill = findSkillById(state.skillId)

  function handleSelectPresence(mode: PresenceMode) {
    onChange({ presenceMode: mode })
  }

  function handleSelectSkill(id: SkillCategoryId) {
    onChange({ skillId: id })
  }

  // ── briefing ──
  if (state.subStage === 'briefing') {
    return (
      <Bank2Briefing
        onStart={() => onChange({ subStage: 'choosing_presence' })}
        onLeave={onLeave}
      />
    )
  }

  // ── choosing_presence ──
  if (state.subStage === 'choosing_presence') {
    return (
      <PresenceSelector
        selected={state.presenceMode}
        onSelect={handleSelectPresence}
        onConfirm={() => {
          if (!state.presenceMode) return
          onChange({ subStage: 'presence_explained' })
        }}
        onLeave={onLeave}
      />
    )
  }

  // Desde aquí hace falta un modo de presencia elegido.
  if (!state.presenceMode) {
    return (
      <PresenceSelector
        selected={state.presenceMode}
        onSelect={handleSelectPresence}
        onConfirm={() => onChange({ subStage: 'presence_explained' })}
        onLeave={onLeave}
      />
    )
  }

  // ── presence_explained ──
  if (state.subStage === 'presence_explained') {
    return (
      <PresenceExplained
        mode={state.presenceMode}
        onContinue={() => onChange({ subStage: 'choosing_skill' })}
        onChangeMode={() => onChange({ subStage: 'choosing_presence' })}
      />
    )
  }

  // ── choosing_skill ──
  if (state.subStage === 'choosing_skill') {
    return (
      <SkillSelector
        selectedId={state.skillId}
        onSelect={handleSelectSkill}
        onConfirm={() => {
          if (!state.skillId) return
          onChange({ subStage: 'mission' })
        }}
        onLeave={onLeave}
        title="🎯 ELIGE QUÉ QUIERES APRENDER"
        text="Ahora pídele a tu amigo que elija una categoría."
        confirmLabel="APRENDER ESTA HABILIDAD"
      />
    )
  }

  // Desde aquí hace falta una categoría elegida.
  if (!skill) {
    return (
      <SkillSelector
        selectedId={state.skillId}
        onSelect={handleSelectSkill}
        onConfirm={() => onChange({ subStage: 'mission' })}
        onLeave={onLeave}
        title="🎯 ELIGE QUÉ QUIERES APRENDER"
        text="Ahora pídele a tu amigo que elija una categoría."
        confirmLabel="APRENDER ESTA HABILIDAD"
      />
    )
  }

  // ── mission ──
  if (state.subStage === 'mission') {
    return (
      <SkillMission
        skill={skill}
        onContinue={() => onChange({ subStage: 'outside' })}
        onChangeSkill={() => onChange({ subStage: 'choosing_skill' })}
        titlePrefix="MISIÓN: APRENDE"
        lead="Ahora deja que tu amigo te enseñe algo nuevo."
        text={`Puede enseñarte ${skill.examples.map(e => e.toLowerCase()).join(', ')}.`}
        changeSkillLabel="← Elegir otra categoría"
      />
    )
  }

  // ── outside ──
  if (state.subStage === 'outside') {
    const secondParagraph =
      state.presenceMode === 'together'
        ? 'Pídele que te enseñe y practica con él.'
        : 'Pídele que te enseñe utilizando el medio que normalmente utilicen para comunicarse.'

    return (
      <OutsideNotice
        skill={skill}
        onStartTimer={() =>
          onChange({
            subStage: 'active',
            timerStartedAt: state.timerStartedAt ?? Date.now(),
          })
        }
        paragraphs={[
          'Ahora realiza el intercambio con tu amigo.',
          secondParagraph,
          'Observa, intenta y practica lo que estás aprendiendo.',
        ]}
        objectiveText="Aprender algo nuevo de una persona de confianza."
      />
    )
  }

  // ── active ──
  if (state.subStage === 'active') {
    return (
      <MissionRun
        skill={skill}
        timerStartedAt={state.timerStartedAt}
        evidenceSaved={state.evidenceSaved}
        onToggleEvidence={() => onChange({ evidenceSaved: !state.evidenceSaved })}
        onComplete={() => onChange({ subStage: 'closing', completed: true })}
        onLeave={onLeave}
        timerTitle="⏱️ TIEMPO PARA APRENDER"
        runningText="Tienen aproximadamente 10 minutos para aprender algo nuevo."
        challengeText="Aprende algo que no sabías hacer."
        encouragementMessages={LEARNING_ENCOURAGEMENT_MESSAGES}
        shareTitle="🤝 CUANDO TERMINEN"
        shareText="Cuando termines, agradece a tu amigo y muéstrale lo que aprendiste."
      />
    )
  }

  // ── closing ──
  return <LearningClosing skill={skill} onContinue={onFinish} />
}
