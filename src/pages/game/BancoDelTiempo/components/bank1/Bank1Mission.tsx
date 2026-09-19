import { findSkillById } from '../../data/skills'
import type { Bank1State, SkillCategoryId } from '../../types'
import Bank1Briefing from './Bank1Briefing'
import SkillSelector from '../shared/SkillSelector'
import SkillMission from '../shared/SkillMission'
import OutsideNotice from '../shared/OutsideNotice'
import MissionRun from '../shared/MissionRun'
import SkillCelebration from './SkillCelebration'

interface Bank1MissionProps {
  state: Bank1State
  /** Aplica un cambio parcial al estado de la misión */
  onChange: (patch: Partial<Bank1State>) => void
  /** Cierra el banco marcándolo como completado */
  onFinish: () => void
  /** Cierra el banco SIN completarlo, conservando el progreso */
  onLeave: () => void
}

/**
 * Misión del banco 1 — "Comparte una habilidad".
 *
 * Este componente solo decide qué sub-pantalla toca y traduce las
 * acciones a cambios de estado. El estado real vive en el componente del
 * nivel, que es quien lo guarda en sessionStorage: así el estudiante
 * puede salir de la aplicación a enseñar su habilidad y al volver
 * encuentra su misión y su contador donde los dejó.
 *
 * FLUJO
 *   briefing → choosing → mission → outside → active → celebration
 */
export default function Bank1Mission({
  state,
  onChange,
  onFinish,
  onLeave,
}: Bank1MissionProps) {
  const skill = findSkillById(state.skillId)

  function handleSelectSkill(id: SkillCategoryId) {
    onChange({ skillId: id })
  }

  // ── briefing ──
  if (state.subStage === 'briefing') {
    return (
      <Bank1Briefing
        onStart={() => onChange({ subStage: 'choosing' })}
        onLeave={onLeave}
      />
    )
  }

  // ── choosing ──
  if (state.subStage === 'choosing') {
    return (
      <SkillSelector
        selectedId={state.skillId}
        onSelect={handleSelectSkill}
        onConfirm={() => {
          if (!state.skillId) return
          onChange({ subStage: 'mission' })
        }}
        onLeave={onLeave}
      />
    )
  }

  // Desde aquí hace falta una habilidad elegida. Si no hay (por ejemplo,
  // un estado guardado incompleto), se vuelve al selector en lugar de
  // romper la pantalla.
  if (!skill) {
    return (
      <SkillSelector
        selectedId={state.skillId}
        onSelect={handleSelectSkill}
        onConfirm={() => onChange({ subStage: 'mission' })}
        onLeave={onLeave}
      />
    )
  }

  // ── mission ──
  if (state.subStage === 'mission') {
    return (
      <SkillMission
        skill={skill}
        onContinue={() => onChange({ subStage: 'outside' })}
        onChangeSkill={() => onChange({ subStage: 'choosing' })}
      />
    )
  }

  // ── outside ──
  if (state.subStage === 'outside') {
    return (
      <OutsideNotice
        skill={skill}
        onStartTimer={() =>
          onChange({
            subStage: 'active',
            // El contador arranca aquí. Si ya venía corriendo (el
            // estudiante volvió a entrar), se respeta el inicio original.
            timerStartedAt: state.timerStartedAt ?? Date.now(),
          })
        }
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
        onComplete={() => onChange({ subStage: 'celebration', completed: true })}
        onLeave={onLeave}
      />
    )
  }

  // ── celebration ──
  return <SkillCelebration skill={skill} onContinue={onFinish} />
}
