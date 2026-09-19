import EscudoPersonal from '@/pages/game/EscudoPersonal/EscudoPersonal'

export default function EscudoDebug() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b1329', padding: '1rem' }}>
      <EscudoPersonal
        gameTitle="Escudo Personal"
        attemptNumber={1}
        xpReward={100}
        currentXp={250}
        currentLevel={2}
        onComplete={async (res) => {
          console.log('Completed Escudo with result:', res)
          return true
        }}
        saving={false}
      />
    </div>
  )
}
