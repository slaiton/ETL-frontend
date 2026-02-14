import { axiosClient } from "./axiosClient";
import { notificationStore } from "./notificationStore";


type ApiRule = {
  status: number;
  action: () => void;
};

const rules: ApiRule[] = [
  {
    status: 401,
    action: () => {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    },
  }
];

const SUCCESS_METHODS = ["post", "put", "patch", "delete"];

export const setupInterceptors = () => {
  axiosClient.interceptors.response.use(
    /* ✅ RESPUESTAS OK */
    (response) => {
      const status = response.status;
      const method = response.config.method?.toLowerCase();

      if (
        status >= 200 &&
        status < 300 &&
        method &&
        SUCCESS_METHODS.includes(method) &&
        response.data?.message
      ) {
        notificationStore.success(response.data.message);
      }

      return response;
    },

    (error) => {
      const status = error.response?.status;
      const data = error.response?.data;

      /* Ejecutar regla por status */
      if (status) {
        const rule = rules.find((r) => r.status === status);
        rule?.action();
      }

      /* Mensaje fallback */
      const message =
        data?.detail ||
        data?.message ||
        "Ocurrió un error inesperado";

      notificationStore.error(message);

      return Promise.reject(error);
    }
  );
};