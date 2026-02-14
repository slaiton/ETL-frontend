import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";
import type { JSX } from "react";


export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div>Cargando sesión...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};