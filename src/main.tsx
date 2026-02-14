import React from 'react'
import { AuthProvider } from "./shared/context/AuthContext.tsx";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
     <App />
    </AuthProvider>
  </React.StrictMode>,
)
