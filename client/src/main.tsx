import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RoleProvider } from './contexts/RoleContext.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <RoleProvider>
        <App />
        <Toaster />
      </RoleProvider>
    </LanguageProvider>
  </React.StrictMode>,
)

