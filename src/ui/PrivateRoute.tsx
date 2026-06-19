import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";
import type { ModuleKey } from "../models/roles.model";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  module?: ModuleKey;
}

export const PrivateRoute = ({ children, module }: Props) => {
  const { isAuthenticated, isLoading, hasAccess, permissions } = useAuth();

  if (isLoading) return <div style={{ color: "#9CA3AF", padding: 32 }}>Cargando sesión...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Token sin permisos (sesión vieja) → forzar re-login
  if (permissions.length === 0) return <Navigate to="/logout" replace />;

  if (module && !hasAccess(module)) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", gap: 12, color: "#6B7280", fontFamily: "Inter, sans-serif",
      }}>
        <span style={{ fontSize: 40 }}>🔒</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#9CA3AF", margin: 0 }}>Acceso denegado</p>
        <p style={{ fontSize: 13, margin: 0 }}>No tienes permiso para acceder a este módulo.</p>
      </div>
    );
  }

  return children;
};
