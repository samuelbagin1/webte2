// axios instance with base URL, JWT auth header and response interceptor for 401 handling

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// request interceptor - attach JWT Bearer token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// response interceptor - handle expired/invalid tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // if unauthorized redirect to login, but skip for profile check (initial auth)
        if (error.response?.status === 401 && !error.config?.url?.includes("/auth/")) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;