import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

interface PageWrapperProps {
  children: ReactNode
  /**
   * fullscreen = true → pantalla auth (sin Header/Footer)
   */
  fullscreen?: boolean
  /** Clase CSS adicional para el <main> */
  mainClass?: string
}

export default function PageWrapper({
  children,
  fullscreen = false,
  mainClass = '',
}: PageWrapperProps) {
  if (fullscreen) {
    return (
      <div className="eq-auth-bg page-fade">
        <div className="eq-auth-main">
          <div className="container w-100">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className={`flex-grow-1 py-4 page-fade ${mainClass}`}>
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
