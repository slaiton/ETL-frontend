export const ALL_MODULES = [
  { key: "dashboard",    label: "Dashboard" },
  { key: "certificates", label: "Certificados" },
  { key: "invoices",     label: "Facturas" },
  { key: "users",        label: "Usuarios" },
  { key: "roles",        label: "Roles" },
] as const;

export type ModuleKey = (typeof ALL_MODULES)[number]["key"];

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  permissions: ModuleKey[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: ModuleKey[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: ModuleKey[];
}
