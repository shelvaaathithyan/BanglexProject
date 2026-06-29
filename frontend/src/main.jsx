import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupCustomAlert } from './CustomAlert.jsx'

// Initialize beautiful custom alerts globally
setupCustomAlert();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
