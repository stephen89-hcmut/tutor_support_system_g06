import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RoleProvider } from './contexts/RoleContext.tsx'
import { Toaster } from './components/ui/toaster.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RoleProvider>
      <App />
      <Toaster />
    </RoleProvider>
  </React.StrictMode>,
)

