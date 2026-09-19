import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Estilos globales propios
import './index.css'

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
