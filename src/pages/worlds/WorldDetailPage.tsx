import { useParams } from 'react-router-dom'
import PageWrapper from '@/components/layout/PageWrapper'

export default function WorldDetailPage() {
  const { worldId } = useParams()

  return (
    <PageWrapper>
      <h1 className="mb-4">Mundo #{worldId}</h1>
      <div className="alert alert-info">
        Las actividades de este mundo aparecerán aquí.
      </div>
    </PageWrapper>
  )
}
