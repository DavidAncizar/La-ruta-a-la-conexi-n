import { Link } from 'react-router-dom'

interface SupportButtonProps {
  /** true cuando el estudiante ya está en la pestaña de apoyo */
  active?: boolean
}

/**
 * Botón del header (junto al nombre) que lleva a la pestaña de apoyo
 * emocional (/support). Es el mismo en todas las pantallas con navbar.
 */
export default function SupportButton({ active = false }: SupportButtonProps) {
  return (
    <Link
      to="/support"
      className={`support-btn ${active ? 'support-btn--active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <span aria-hidden="true">💬</span>
      <span className="support-btn__label">¿Quieres hablar con alguien?</span>
    </Link>
  )
}
