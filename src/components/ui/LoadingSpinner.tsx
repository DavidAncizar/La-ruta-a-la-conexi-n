interface LoadingSpinnerProps {
  mensaje?: string
}

export default function LoadingSpinner({ mensaje = 'Cargando...' }: LoadingSpinnerProps) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Cargando</span>
      </div>
      <p className="text-muted">{mensaje}</p>
    </div>
  )
}
