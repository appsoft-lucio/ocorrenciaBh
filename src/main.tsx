import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

document.documentElement.classList.toggle(
  'large-text',
  localStorage.getItem('accessibilityLargeText') === 'true',
)
document.documentElement.classList.toggle(
  'high-contrast',
  localStorage.getItem('accessibilityHighContrast') === 'true',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
