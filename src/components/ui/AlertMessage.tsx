type AlertType = 'success' | 'danger' | 'warning' | 'info'

interface AlertMessageProps {
  type: AlertType
  mensaje: string
}

export default function AlertMessage({ type, mensaje }: AlertMessageProps) {
  return (
    <div className={`alert alert-${type} py-2`} role="alert">
      {mensaje}
    </div>
  )
}
