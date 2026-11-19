import { createContext, useContext, useEffect, useState } from "react";
import { authenticateUser } from "../../api/auth";
import type { ModuleKey } from "../../models/roles.model";
import { getHomePath } from "../../models/roles.model";
import {
  USER_PROFILE_KEY,
  readStoredProfile,
  type UserProfile,
} from "../utils/userProfile";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  roleId: number | null;
  permissions: ModuleKey[];
  homePage: string;
  user: UserProfile | null;
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
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const storedRole = localStorage.getItem("role_id");
    const storedPerms = localStorage.getItem("permissions");
    const storedHome = localStorage.getItem("home_page");

    setIsAuthenticated(!!token);
    setRoleId(storedRole ? Number(storedRole) : null);
    setPermissions(storedPerms ? (JSON.parse(storedPerms) as ModuleKey[]) : []);
    setHomePage(storedHome ?? "/home");
    setUser(token ? readStoredProfile() : null);
    setIsLoading(false);
  }, []);

  const login = async (login: string, password: string) => {
    const result = await authenticateUser({ user: login, password }, true);

    if (!result.access_token) throw new Error("Respuesta inválida del servidor");

    const perms: ModuleKey[] = (result.permissions as ModuleKey[]) ?? [];
    const role = result.role_id ?? null;
    const homeKey = result.home_page ?? "home";
    const homePath = getHomePath(homeKey);
    // El backend envía el perfil; si es una versión anterior, se usa el login.
    const profile: UserProfile = result.user ?? { email: login };

    localStorage.setItem("auth_token", result.access_token);
    localStorage.setItem("user", login);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    if (role !== null) localStorage.setItem("role_id", String(role));
    localStorage.setItem("permissions", JSON.stringify(perms));
    localStorage.setItem("home_page", homePath);

    setIsAuthenticated(true);
    setRoleId(role);
    setPermissions(perms);
    setHomePage(homePath);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem("role_id");
    localStorage.removeItem("permissions");
    localStorage.removeItem("home_page");
    setIsAuthenticated(false);
    setRoleId(null);
    setPermissions([]);
    setHomePage("/home");
    setUser(null);
  };

  const hasAccess = (module: ModuleKey) => permissions.includes(module);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, roleId, permissions, homePage, user, hasAccess, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
