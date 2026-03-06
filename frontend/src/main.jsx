import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Agentation: DEV-only visual feedback tool for AI agents
const AgentationDev = import.meta.env.DEV
  ? lazy(() => import('agentation').then(m => ({ default: m.Agentation })))
  : null;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {AgentationDev && (
      <Suspense fallback={null}>
        <AgentationDev />
      </Suspense>
    )}
  </StrictMode>,
)
