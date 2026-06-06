import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./shared/context/AuthContext";
import { NotificationProvider } from "./shared/context/NotificationContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { setupInterceptors } from "./shared/api/interceptor";
import { setupAuthInterceptor } from "./shared/api/authInterceptor";
import "./index.css";
import App from "./App.tsx";

setupAuthInterceptor();
setupInterceptors();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
