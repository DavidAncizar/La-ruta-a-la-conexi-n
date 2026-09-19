import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()

  // Mientras carga la sesión, mostrar spinner
  if (loading) return <LoadingSpinner mensaje="Verificando sesión..." />

  // Si no hay sesión, ir a login
  if (!session) return <Navigate to="/login" replace />

  // Si se requiere un rol específico y el perfil ya cargó, verificar
  if (requiredRole && profile && profile.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  // Si se requiere un rol pero el perfil aún no cargó, esperar
  if (requiredRole && !profile) {
    return <LoadingSpinner mensaje="Cargando perfil..." />
  }

  return <>{children}</>
}
