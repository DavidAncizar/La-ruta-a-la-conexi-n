interface Bank2BriefingProps {
  onStart: () => void
  /** Sale al mapa sin perder el progreso de la misión */
  onLeave: () => void
}

/**
 * Apertura del banco 2: misma calidad visual que el banco 1, pero con
 * la dinámica invertida — aquí el estudiante va a aprender, no a enseñar.
 */
export default function Bank2Briefing({ onStart, onLeave }: Bank2BriefingProps) {
  return (
    <div className="bt-m bt-m--briefing">
      <div className="bt-m__emblem" aria-hidden="true">
        <span className="bt-m__emblem-glow" />
        <span className="bt-m__emblem-icon">🪑</span>
      </div>

      <span className="bt-m__eyebrow">Banco 2 de 2</span>
      <h2 className="bt-m__title">BANCO DEL TIEMPO</h2>

      <p className="bt-m__lead">
        Ya compartiste algo que sabes hacer. Ahora es momento de aprender.
      </p>

      <p className="bt-m__text">
        Busca a una persona de confianza y pídele que te enseñe algo nuevo.
      </p>

      <button className="bt-m__cta" onClick={onStart} type="button" autoFocus>
        COMENZAR MISIÓN
      </button>

      <button className="bt-m__leave" onClick={onLeave} type="button">
        ← Volver al mapa
      </button>
    </div>
  )
}
