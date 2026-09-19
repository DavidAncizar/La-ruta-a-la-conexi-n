import { Link } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'

export default function NotFoundPage() {
  return (
    <PageWrapper fullscreen>
      <div className="text-center mt-5">
        <h1 className="display-1 text-muted">404</h1>
        <h2 className="mb-3">Página no encontrada</h2>
        <p className="text-muted mb-4">
          La página que buscas no existe o fue movida.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </PageWrapper>
  )
}
