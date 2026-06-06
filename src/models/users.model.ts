export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role_id: number;
  is_active?: boolean;
  created_at?: string;
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  role_id: number;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  role_id?: number;
}

// Roles estáticos — actualizar cuando el backend exponga /v1/roles/
export const STATIC_ROLES: Role[] = [
  { id: 1, name: "Administrador",  description: "Acceso total al sistema" },
  { id: 2, name: "Operador",       description: "Gestión de certificados y facturas" },
  { id: 3, name: "Consultor",      description: "Solo lectura" },
];
