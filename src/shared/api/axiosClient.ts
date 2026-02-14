import axios from "axios";
import { notificationBus } from "./notificationBus";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosClient = axios.create({
  baseURL: API_URL,
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response.config.method !== "get") {
      notificationBus.emit({
        type: "success",
        title: "Operación exitosa",
      });
    }
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Ocurrió un error inesperado";

    notificationBus.emit({
      type: "error",
      title: "Error",
      message,
    });

    return Promise.reject(error);
  }
);