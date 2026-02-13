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

/**
 * Autentica al usuario enviando email y contraseña al backend.
 * @param credentials - Las credenciales del usuario.
 * @param remember - Si debe recordarse (puede usarse para lógica extra).
 * @returns Objeto con token e IDs relacionados.
 */

const API_URL = import.meta.env.VITE_API_URL;
export const authenticateUser = async (
  credentials: LoginParams,
  remember: boolean = false
): Promise<AuthResponse> => {
  console.log(credentials);
  
  try {
    const json = JSON.stringify({
      email: credentials.user,
      password: credentials.password,
    });
    const response = await axiosClient.post<AuthResponse>(
      `${API_URL}auth/login`,
      json,
      {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          remember,
        }
      }
    );

    return response.data;
  } catch (error: any) {
    // Lanza error para manejarlo en el contexto
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error("Credenciales inválidas");
      }
      throw new Error(error.response.data.message || "Error en el login");
    } else {
      throw new Error("Error al conectar con el servidor");
    }
  }
};

export const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("person");
    localStorage.removeItem("profile");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };