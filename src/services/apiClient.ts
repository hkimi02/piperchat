import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios';
import { refreshToken } from './Auth/authService';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await refreshToken();
                const newToken = response.access_token;

                localStorage.setItem('token', newToken);

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('token');
                // Redirect to login page
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;