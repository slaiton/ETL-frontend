import { axiosClient } from "../shared/api/axiosClient";

interface LoginParams {
  user: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  owner_id?: string;
  id_rol?: string;
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
    if (error.response?.status === 401) {
      throw new Error("Credenciales inválidas");
    }
    throw new Error(
      error.response?.data?.message || "Error al conectar con el servidor"
    );
  }
};

export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("person");
  localStorage.removeItem("profile");
  localStorage.removeItem("email");
  window.location.href = "/login";
};
