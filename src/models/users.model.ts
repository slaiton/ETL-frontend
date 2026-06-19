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
