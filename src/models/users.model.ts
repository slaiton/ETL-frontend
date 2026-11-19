export interface User {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  role_id: number;
  is_active?: boolean;
  created_at?: string;
  /** Cliente asociado (beneficiario de pólizas); null = usuario interno */
  client_id?: number | null;
  client_name?: string | null;
}

/** Cliente asignable a un usuario */
export interface ClientOption {
  client_id: number;
  name: string;
  document_number: string | null;
  policies: number;
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
  /** null desasocia el cliente */
  client_id?: number | null;
}
