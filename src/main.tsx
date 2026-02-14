import React from 'react'
import { AuthProvider } from "./shared/context/AuthContext.tsx";
import { setupInterceptors } from "./shared/api/interceptor";
import { setupAuthInterceptor } from "./shared/api/authInterceptor";
import { NotificationProvider } from "./shared/context/NotificationContext";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

setupAuthInterceptor();
setupInterceptors();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
)
