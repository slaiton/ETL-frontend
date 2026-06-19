import { createContext, useContext, useEffect, useState } from "react";
import { authenticateUser } from "../../api/auth";
import type { ModuleKey } from "../../models/roles.model";
import { getHomePath } from "../../models/roles.model";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  roleId: number | null;
  permissions: ModuleKey[];
  homePage: string;
  hasAccess: (module: ModuleKey) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<ModuleKey[]>([]);
  const [homePage, setHomePage] = useState<string>("/home");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const storedRole = localStorage.getItem("role_id");
    const storedPerms = localStorage.getItem("permissions");
    const storedHome = localStorage.getItem("home_page");

    setIsAuthenticated(!!token);
    setRoleId(storedRole ? Number(storedRole) : null);
    setPermissions(storedPerms ? (JSON.parse(storedPerms) as ModuleKey[]) : []);
    setHomePage(storedHome ?? "/home");
    setIsLoading(false);
  }, []);

  const login = async (user: string, password: string) => {
    const result = await authenticateUser({ user, password }, true);

    if (!result.access_token) throw new Error("Respuesta inválida del servidor");

    const perms: ModuleKey[] = (result.permissions as ModuleKey[]) ?? [];
    const role = result.role_id ?? null;
    const homeKey = result.home_page ?? "home";
    const homePath = getHomePath(homeKey);

    localStorage.setItem("auth_token", result.access_token);
    localStorage.setItem("user", user);
    if (role !== null) localStorage.setItem("role_id", String(role));
    localStorage.setItem("permissions", JSON.stringify(perms));
    localStorage.setItem("home_page", homePath);

    setIsAuthenticated(true);
    setRoleId(role);
    setPermissions(perms);
    setHomePage(homePath);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role_id");
    localStorage.removeItem("permissions");
    localStorage.removeItem("home_page");
    setIsAuthenticated(false);
    setRoleId(null);
    setPermissions([]);
    setHomePage("/home");
  };

  const hasAccess = (module: ModuleKey) => permissions.includes(module);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, roleId, permissions, homePage, hasAccess, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
