export const ALL_MODULES = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "certificates", label: "Certificados" },
  { key: "invoices",     label: "Facturas" },
  { key: "users",        label: "Usuarios" },
  { key: "roles",        label: "Roles" },
] as const;

export type ModuleKey = (typeof ALL_MODULES)[number]["key"];

export const HOME_PAGE_OPTIONS = [
  { key: "home",         label: "Inicio",        path: "/home" },
  { key: "dashboard",    label: "Dashboard",     path: "/" },
  { key: "certificates", label: "Certificados",  path: "/certificates" },
  { key: "invoices",     label: "Facturas",      path: "/invoices" },
  { key: "users",        label: "Usuarios",      path: "/users" },
  { key: "roles",        label: "Roles",         path: "/roles" },
] as const;

export function getHomePath(key: string | null | undefined): string {
  if (!key) return "/home";
  const found = (HOME_PAGE_OPTIONS as readonly { key: string; path: string }[]).find(o => o.key === key);
  return found?.path ?? "/home";
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  permissions: ModuleKey[];
  home_page?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: ModuleKey[];
  home_page?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: ModuleKey[];
  home_page?: string;
}
