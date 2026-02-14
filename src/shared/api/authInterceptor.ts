 import { axiosClient } from "./axiosClient";

export const setupAuthInterceptor = () => {
    axiosClient.interceptors.request.use((config) => {
        const token = localStorage.getItem("auth_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });
};