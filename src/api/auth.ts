import { axiosClient } from "../shared/api/axiosClient";

interface LoginParams {
  user: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  role_id?: number;
  permissions?: string[];
}

export const authenticateUser = async (
  credentials: LoginParams,
  remember: boolean = false
): Promise<AuthResponse> => {
  try {
    const response = await axiosClient.post<AuthResponse>(
      "auth/login",
      { email: credentials.user, password: credentials.password },
      {
        headers: { "Content-Type": "application/json" },
        params: { remember },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) throw new Error("Credenciales inválidas");
    if (error.response?.status === 403) throw new Error(error.response?.data?.detail ?? "Usuario desactivado");
    throw new Error(error.response?.data?.message || "Error al conectar con el servidor");
  }
};

export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  localStorage.removeItem("role_id");
  localStorage.removeItem("permissions");
  window.location.href = "/login";
};
