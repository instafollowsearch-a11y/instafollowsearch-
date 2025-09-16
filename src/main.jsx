import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics, trackPerformance, trackCoreWebVitals } from './utils/analytics.js'

// Initialize analytics and performance tracking
initAnalytics();
trackPerformance();
trackCoreWebVitals();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
