import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SafeHoodApp from './SafeHoodApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SafeHoodApp />
  </StrictMode>,
)
