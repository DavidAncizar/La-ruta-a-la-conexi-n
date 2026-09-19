import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { calculateLevel } from '@/lib/helpers'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import DriveInfoModal from '@/components/ui/DriveInfoModal'
import RetoJuego from './RetoJuego/RetoJuego'
import NuevaConexion from './NuevaConexion/NuevaConexion'
import Explorador from './Explorador/Explorador'
import BancoDelTiempo from './BancoDelTiempo/BancoDelTiempo'
import SeAutentico from './SeAutentico/SeAutentico'
import EscudoPersonal from './EscudoPersonal/EscudoPersonal'
import { buildProgression, findLevelStatus } from '@/lib/progression'
import type { LevelStatus } from '@/lib/progression'
import type { Game, GameResult } from '@/types'

// ─── Unlock automático de piezas de avatar ────────────────────────────────────
//
// Al completar los 2 juegos de un mundo por primera vez, se inserta una fila
// en student_avatar_pieces. La tabla tiene UNIQUE(student_id, avatar_piece_id,
// academic_period_id) así que un segundo intento de INSERT se ignora sin error.
//
// Flujo:
//   1. Se obtienen todos los juegos completados del estudiante (incluyendo el actual)
//   2. Se cuenta cuántos juegos del mundo actual están completados
//   3. Si son 2/2 → se busca la pieza de avatar que corresponde a ese mundo
//   4. Se intenta INSERT (el UNIQUE evita duplicados silenciosamente)

interface UnlockParams {
  studentId:        string
  gameWorldId:      number
  academicPeriodId: number
  completedGameIds: number[]
  allGames:         { id: number; world_id: number }[]
}

async function tryUnlockAvatarPiece({
  studentId,
  gameWorldId,
  academicPeriodId,
  completedGameIds,
  allGames,
}: UnlockParams): Promise<void> {
  // Juegos que pertenecen al mundo que acaba de jugarse
  const worldGames = allGames.filter(g => g.world_id === gameWorldId)
  if (worldGames.length === 0) return

  // ¿Están todos completados?
  const allDone = worldGames.every(g => completedGameIds.includes(g.id))
  if (!allDone) return

  // Buscar la pieza de avatar asociada a este mundo
  const { data: piece } = await supabase
    .from('avatar_pieces')
    .select('id')
    .eq('world_id', gameWorldId)
    .limit(1)
    .maybeSingle()

  if (!piece) return

  // Intentar insertar — el UNIQUE constraint evita duplicados sin lanzar error
  // si se usa ON CONFLICT DO NOTHING (simulado con upsert ignoreSomeErrors)
  const { error } = await supabase
    .from('student_avatar_pieces')
    .insert({
      student_id:        studentId,
      avatar_piece_id:   piece.id,
      academic_period_id: academicPeriodId,
    })

  // El código 23505 es violación de UNIQUE — ya estaba desbloqueado, no es error
  if (error && error.code !== '23505') {
    console.warn('No se pudo desbloquear la pieza de avatar:', error.message)
  }
}

/**
 * Extrae un mensaje de error legible sin importar la forma del error.
 * Los errores de Supabase NO son instancias de `Error` (son objetos
 * planos con `.message` / `.code` / `.details`), por lo que un simple
 * `err instanceof Error` los deja pasar como "Error desconocido".
 * Esta función también detecta el caso de migración pendiente
 * (columna attempt_number inexistente) y da un mensaje claro.
 */
function buildSaveErrorMessage(err: unknown): string {
  console.error('Error al guardar el progreso:', err)

  const raw =
    (typeof err === 'object' && err !== null && 'message' in err
      ? String((err as { message?: unknown }).message)
      : null) ??
    (err instanceof Error ? err.message : null) ??
    String(err)

  if (raw.includes('attempt_number') || raw.includes('academic_period_id')) {
    return (
      'Falta aplicar una actualización a la base de datos ' +
      '(supabase-migration-replay.sql). Contacta al administrador del sistema.'
    )
  }

  if (raw.includes('metadata')) {
    return (
      'Falta aplicar una actualización a la base de datos ' +
      '(supabase-migration-metadata.sql). Contacta al administrador del sistema.'
    )
  }

  return `No se pudo guardar tu progreso: ${raw}`
}

/**
 * ¿El error se debe a que la columna `student_progress.metadata` todavía
 * no existe en la base de datos (migración pendiente)?
 *
 * Supabase/PostgREST responde con el código PGRST204 cuando la columna no
 * está en su caché de esquema, y Postgres con 42703 (undefined_column).
 */
function isMissingMetadataColumn(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false

  const { code, message } = err as { code?: unknown; message?: unknown }
  const text = String(message ?? '')

  if (!text.includes('metadata')) return false

  return (
    code === 'PGRST204' ||
    code === '42703' ||
    text.includes('column') ||
    text.includes('schema')
  )
}

/**
 * GamePage — Carga el juego real desde Supabase y decide qué componente
 * de juego renderizar según su `mechanic`.
 *
 * IMPORTANTE: Toda la lógica visual/interactiva vive en los componentes
 * de juego (RetoJuego, NuevaConexion, etc.). Aquí SOLO se conecta con
 * Supabase para:
 *   - contar cuántas veces el estudiante ya jugó este juego (attemptNumber)
 *   - persistir el resultado final (student_progress)
 *   - actualizar XP y nivel del estudiante (profiles)
 *
 * TODOS los juegos permiten volver a jugarse. El primer intento otorga
 * el XP completo; desde el segundo intento se otorga la mitad
 * (ver XP_REPLAY_MULTIPLIER en src/lib/constants.ts).
 */
export default function GamePage() {
  const { activityId } = useParams()
  const { profile, refreshProfile } = useAuth()

  const [game, setGame]           = useState<Game | null>(null)
  const [attemptNumber, setAttemptNumber] = useState(1)
  /**
   * Metadata de los intentos anteriores de este juego por parte del
   * estudiante. Es genérico: cada juego interpreta su propia estructura.
   * Por ejemplo, "Nueva Conexión" lo usa para marcar en el mapa qué
   * rutas ya completó.
   */
  const [previousAttempts, setPreviousAttempts] = useState<Record<string, unknown>[]>([])
  /** Con valor si el estudiante llegó a un nivel que todavía no puede jugar */
  const [lockedLevel, setLockedLevel] = useState<LevelStatus | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showDriveModal, setShowDriveModal] = useState(false)

  /**
   * Carga el juego una sola vez por estudiante y actividad.
   *
   * IMPORTANTE: depende de `profile?.id`, NO del objeto `profile` completo.
   * Al terminar una partida se llama a refreshProfile() para actualizar el
   * XP, y eso crea un objeto de perfil NUEVO. Si el efecto dependiera del
   * objeto, se volvería a ejecutar loadGame(), que pone loading en true,
   * desmonta el componente del juego y borra su pantalla final (el juego
   * parecía reiniciarse justo después de ganar el XP).
   */
  useEffect(() => {
    if (profile?.id && activityId) loadGame()
  }, [profile?.id, activityId])

  async function loadGame() {
    setLoading(true)

    const gameId = Number(activityId)

    // NOTA: la consulta de intento NO filtra por academic_period_id.
    // El progreso guardado usa el periodo activo como respaldo cuando el
    // perfil no tiene uno asignado, así que filtrar aquí por
    // profile.academic_period_id podía no coincidir con lo realmente
    // guardado y hacía que siempre se calculara "intento 1" (bug: el
    // XP no se reducía a la mitad en reintentos y el INSERT chocaba
    // con la fila ya existente). Lo que importa es cuántas veces el
    // estudiante ya jugó este juego en total, sin importar el periodo.
    type ProgressRow = {
      attempt_number: number
      metadata?: Record<string, unknown> | null
    }

    const [gameRes, progressRes, allGamesRes, allProgressRes] = await Promise.all([
      supabase.from('games').select('*').eq('id', gameId).single(),
      supabase
        .from('student_progress')
        .select('attempt_number, metadata')
        .eq('student_id', profile!.id)
        .eq('game_id', gameId)
        .order('attempt_number', { ascending: false }),
      // Las dos consultas siguientes sirven para comprobar que este nivel
      // esté realmente desbloqueado. Sin esto, cualquiera podía entrar a un
      // nivel bloqueado escribiendo la URL /game/<id> a mano.
      supabase.from('games').select('*').eq('is_active', true),
      supabase.from('student_progress').select('game_id').eq('student_id', profile!.id),
    ])

    if (gameRes.error) {
      console.error('Error al cargar el juego:', gameRes.error)
    }

    let progressRows: ProgressRow[] = []

    if (progressRes.error) {
      // La columna `metadata` puede no existir todavía (migración pendiente).
      // En ese caso se reintenta sin ella para no bloquear la partida:
      // el juego funciona igual, solo sin los datos de intentos previos.
      console.error(
        'No se pudo leer metadata del progreso (¿falta ejecutar ' +
        'supabase-migration-metadata.sql?):',
        progressRes.error
      )

      const fallbackRes = await supabase
        .from('student_progress')
        .select('attempt_number')
        .eq('student_id', profile!.id)
        .eq('game_id', gameId)
        .order('attempt_number', { ascending: false })

      if (fallbackRes.error) {
        console.error(
          'No se pudo determinar el número de intento (¿falta ejecutar ' +
          'supabase-migration-replay.sql?):',
          fallbackRes.error
        )
      }

      progressRows = (fallbackRes.data as ProgressRow[] | null) ?? []
    } else {
      progressRows = (progressRes.data as ProgressRow[] | null) ?? []
    }

    setGame(gameRes.data ?? null)

    // ── ¿Está desbloqueado este nivel? ──
    const allGames = (allGamesRes.data as Game[] | null) ?? []
    const completedGameIds = [
      ...new Set(
        ((allProgressRes.data as { game_id: number }[] | null) ?? []).map(row => row.game_id)
      ),
    ]

    const levelStatus = findLevelStatus(buildProgression(allGames, completedGameIds), gameId)

    // Si no se encuentra el nivel (datos incompletos) no se bloquea nada:
    // es preferible dejar jugar que dejar al estudiante encerrado.
    setLockedLevel(levelStatus && !levelStatus.isUnlocked ? levelStatus : null)

    // El siguiente intento es el último registrado + 1 (o 1 si nunca ha jugado).
    // Las filas vienen ordenadas de mayor a menor, así que la primera es el
    // último intento.
    setAttemptNumber((progressRows[0]?.attempt_number ?? 0) + 1)

    // Metadata de todos los intentos anteriores, sin los nulos
    setPreviousAttempts(
      progressRows
        .map(row => row.metadata)
        .filter((meta): meta is Record<string, unknown> => !!meta)
    )

    setLoading(false)
  }

  /**
   * Se llama cuando el estudiante termina la partida (pantalla final).
   * Persiste el resultado en student_progress y actualiza XP/nivel en profiles.
   *
   * NOTA DE SEGURIDAD: esta operación queda protegida por las políticas
   * RLS de Supabase (student_progress solo admite student_id = auth.uid()).
   * Más adelante puede reemplazarse por una función segura (RPC) que
   * valide el resultado en el servidor antes de otorgar XP.
   */
  async function handleGameComplete(result: GameResult): Promise<boolean> {
    if (!profile || !game) return false

    setSaving(true)
    setSaveError('')

    try {
      // 0. student_progress.academic_period_id es NOT NULL. Si el perfil
      //    no tiene un periodo asignado (por ejemplo, cuentas antiguas),
      //    usamos el periodo académico activo como respaldo.
      let academicPeriodId = profile.academic_period_id

      if (!academicPeriodId) {
        const { data: activePeriod } = await supabase
          .from('academic_periods')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()

        academicPeriodId = activePeriod?.id ?? null
      }

      if (!academicPeriodId) {
        throw new Error(
          'No se encontró un periodo académico activo. Contacta al administrador.'
        )
      }

      // 1. result.xpEarned ya viene con el multiplicador de reintento
      //    aplicado por el propio componente de juego, para que el XP que
      //    el estudiante vio en pantalla coincida con el que se guarda.

      // 2. Registrar el progreso de este intento específico
      const progressPayload: Record<string, unknown> = {
        student_id: profile.id,
        game_id: game.id,
        academic_period_id: academicPeriodId,
        attempt_number: attemptNumber,
        xp_earned: result.xpEarned,
        score: result.score ?? null,
      }

      // `metadata` solo se incluye si el juego la envía. Así los juegos que
      // no la usan (como el Nivel 1) siguen funcionando incluso si la
      // migración de esa columna todavía no se ha aplicado.
      if (result.metadata) {
        progressPayload.metadata = result.metadata
      }

      let { error: progressError } = await supabase
        .from('student_progress')
        .insert(progressPayload)

      // Si el INSERT falló solo porque la columna `metadata` todavía no
      // existe, se reintenta sin ella. El estudiante no debe perder su XP
      // por una migración pendiente: lo único que no queda registrado es
      // el detalle del recorrido (por ejemplo, qué ruta eligió).
      if (progressError && isMissingMetadataColumn(progressError)) {
        console.warn(
          'La columna student_progress.metadata no existe todavía, se guarda ' +
          'el progreso sin ella. Ejecuta supabase-migration-metadata.sql en ' +
          'Supabase para registrar también el detalle de cada juego.'
        )

        delete progressPayload.metadata

        const retry = await supabase
          .from('student_progress')
          .insert(progressPayload)

        progressError = retry.error
      }

      if (progressError) throw progressError

      // 3. Sumar el XP de este intento al XP acumulado del estudiante
      const newXp = profile.xp + result.xpEarned
      const newLevel = calculateLevel(newXp)

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // 4. Refrescar el perfil en el contexto global (XP visible en navbar, etc.)
      await refreshProfile()

      // 5. Verificar si este juego completó un mundo y desbloquear la pieza de avatar
      //    Solo se intenta en el primer intento (attemptNumber === 1) para no
      //    duplicar unlocks al repetir juegos.
      if (attemptNumber === 1 && academicPeriodId) {
        await tryUnlockAvatarPiece({
          studentId:         profile.id,
          gameWorldId:       game.world_id,
          academicPeriodId,
          completedGameIds:  [...new Set([
            // Juegos ya completados antes de esta partida
            ...((await supabase
              .from('student_progress')
              .select('game_id')
              .eq('student_id', profile.id)
            ).data ?? []).map((r: { game_id: number }) => r.game_id),
            game.id, // este juego que acaba de completarse
          ])],
          allGames: (await supabase
            .from('games')
            .select('id, world_id')
            .eq('is_active', true)
          ).data ?? [],
        })
      }

      // 6. Avanzar el intento en memoria, sin recargar desde Supabase.
      //    Si el estudiante vuelve a jugar sin recargar la página, el
      //    siguiente INSERT necesita un attempt_number distinto: la tabla
      //    tiene UNIQUE (student_id, game_id, academic_period_id,
      //    attempt_number). También se suma esta partida a los intentos
      //    anteriores para que el juego la reconozca como completada.
      setAttemptNumber(prev => prev + 1)

      if (result.metadata) {
        const savedMetadata = result.metadata as Record<string, unknown>
        setPreviousAttempts(prev => [...prev, savedMetadata])
      }

      // NOTA: aquí NO se navega. Cada juego decide qué mostrar después de
      // guardar (por ejemplo, su pantalla de logro con el XP actualizado).
      setSaving(false)
      return true
    } catch (err) {
      setSaveError(buildSaveErrorMessage(err))
      setSaving(false)
      return false
    }
  }

  // ── Estados de carga y error ──

  // El spinner a pantalla completa solo se muestra en la carga inicial.
  // Si el juego ya está cargado, una recarga posterior no debe desmontarlo:
  // el estudiante podría estar a mitad de la partida o viendo su logro.
  if (!profile || (loading && !game)) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <LoadingSpinner mensaje="Cargando el juego..." />
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center flex-column gap-3">
          <p className="text-muted">No se encontró este juego.</p>
          <Link to="/worlds" className="btn btn-primary">Volver a mundos</Link>
        </div>
      </div>
    )
  }

  // Nivel bloqueado: se avisa y se devuelve al mapa, sin dejarlo jugar.
  if (lockedLevel) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center py-5 px-3">
            <div style={{ fontSize: '3rem' }} className="mb-3">🔒</div>
            <h3 className="fw-bold mb-2">Este nivel todavía está bloqueado</h3>
            <p className="text-muted mb-4">
              Para jugar «{game.title}» primero tienes que completar el nivel{' '}
              {lockedLevel.levelNumber - 1}.
            </p>
            <Link to="/worlds" className="btn btn-primary">Ir al mapa de mundos</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  /**
   * Elige el componente de juego según la mecánica definida en la tabla
   * `games` de Supabase. Cada nivel nuevo se registra aquí añadiendo un
   * caso más, sin tocar la lógica de guardado ni de XP.
   */
  function renderGameByMechanic() {
    if (!game) return null

    switch (game.mechanic) {
      // Mundo 1 · Nivel 1 — El poder de tu decisión
      // La mecánica correcta es 'roulette': así está registrado este juego
      // en la tabla `games` (world_id 1, order_index 1). Antes aquí figuraba
      // 'disconnect_challenge', que en la base de datos pertenece al Mundo 2
      // Nivel 1 ("Explorador de experiencias"), y por eso este juego aparecía
      // en el nivel equivocado.
      case 'roulette':
        return (
          <RetoJuego
            gameTitle={game.title}
            attemptNumber={attemptNumber}
            xpReward={game.xp_reward}
            currentXp={profile?.xp ?? 0}
            currentLevel={profile?.level ?? 1}
            onComplete={handleGameComplete}
            saving={saving}
          />
        )

      // Mundo 1 · Nivel 2 — Nueva Conexión
      case 'interactive_map':
        return (
          <NuevaConexion
            gameTitle={game.title}
            attemptNumber={attemptNumber}
            xpReward={game.xp_reward}
            previousAttempts={previousAttempts}
            currentXp={profile?.xp ?? 0}
            currentLevel={profile?.level ?? 1}
            onComplete={handleGameComplete}
            saving={saving}
          />
        )

      // Mundo 2 · Nivel 1 — Explorador de experiencias
      case 'disconnect_challenge':
        return (
          <Explorador
            gameTitle={game.title}
            attemptNumber={attemptNumber}
            xpReward={game.xp_reward}
            currentXp={profile?.xp ?? 0}
            currentLevel={profile?.level ?? 1}
            onComplete={handleGameComplete}
            saving={saving}
          />
        )

      // Mundo 2 · Nivel 2 — Banco del tiempo
      case 'quiz':
        return (
          <BancoDelTiempo
            gameTitle={game.title}
            attemptNumber={attemptNumber}
            xpReward={game.xp_reward}
            currentXp={profile?.xp ?? 0}
            currentLevel={profile?.level ?? 1}
            onComplete={handleGameComplete}
            saving={saving}
          />
        )

      // Mundo 3 · Nivel 1 — Sé auténtico, más allá de un like
      case 'decision_simulator':
        return (
          <SeAutentico
            gameTitle={game.title}
            attemptNumber={attemptNumber}
            xpReward={game.xp_reward}
            currentXp={profile?.xp ?? 0}
            currentLevel={profile?.level ?? 1}
            onComplete={handleGameComplete}
            saving={saving}
          />
        )

      // Mundo 3 · Nivel 2 — Escudo personal
      case 'reflection':
        return (
          <EscudoPersonal
            gameTitle={game.title}
            attemptNumber={attemptNumber}
            xpReward={game.xp_reward}
            currentXp={profile?.xp ?? 0}
            currentLevel={profile?.level ?? 1}
            onComplete={handleGameComplete}
            saving={saving}
          />
        )

      default:
        return (
          <div className="text-center py-5">
            <div style={{ fontSize: '2.5rem' }} className="mb-3">🚧</div>
            <h3 className="fw-bold mb-2">Este nivel está en construcción</h3>
            <p className="text-muted mb-4">
              Pronto podrás jugar «{game.title}».
            </p>
            <Link to="/worlds" className="btn btn-primary">Volver a mundos</Link>
          </div>
        )
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100 reto-page">
      {showDriveModal && (
        <DriveInfoModal onClose={() => setShowDriveModal(false)} />
      )}

      <main className="flex-grow-1 py-4">
        <div className="container" style={{ maxWidth: 720 }}>

          {/* ── Botón ¿Por qué subir a Drive? ── */}
          <div className="drive-info-bar">
            <button
              className="drive-info-bar__btn"
              onClick={() => setShowDriveModal(true)}
              type="button"
            >
              <svg width="20" height="18" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
              <span>
                <span className="drive-info-bar__btn-main">¿Por qué subir a Drive?</span>
                <span className="drive-info-bar__btn-sub">Guarda tu evidencia · es opcional</span>
              </span>
            </button>
          </div>

          {saveError && (
            <div className="alert alert-danger" role="alert">
              ⚠️ {saveError}
            </div>
          )}

          {renderGameByMechanic()}
        </div>
      </main>

      <Footer />
    </div>
  )
}
