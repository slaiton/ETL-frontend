import { createContext, useContext, useEffect, useState } from "react";
import { authenticateUser } from "../../api/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [idClient, setIdClient] = useState<string | null>(null);
  // const [idRole, setIdRole] = useState<string | null>(null);
  // const [user, setUser] = useState(null);

  // Cargar el estado de autenticación al iniciar la app
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    // const clientId = localStorage.getItem("client");
    // const idRole = localStorage.getItem("profile");

    setIsAuthenticated(!!token);
    // setIdClient(clientId);
    // setIdRole(idRole);

    setIsLoading(false);
  }, []);

  const login = async (user: string, password: string) => {
    try {
      const result = await authenticateUser({ user, password }, true);

      if (result.access_token) {
        localStorage.setItem("auth_token", result.access_token);
        setIsAuthenticated(true);
      }


      if (result.owner_id) {
        localStorage.setItem("person", result.owner_id);
        // setIdClient(result.id_client);
      }

      if (result.id_rol) {
        localStorage.setItem("profile", result.id_rol);
        // setIdRole( result.id_rol);
    
      }


    } catch (err) {
      let message = "Error al iniciar sesión";
      if (typeof err === "object" && err !== null) {
        // Try to access response.data.detail if available
        message =
          (err as any)?.response?.data?.detail ||
          (err as any)?.message ||
          message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, error, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};