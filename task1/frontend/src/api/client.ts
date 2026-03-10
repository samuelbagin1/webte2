// axios instance with base URL, credentials and response interceptor fo 401 handling

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    withCredentials: true,  // sends php. session cookie with every request
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// response interceptor - handle expired sessions
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // if expired session redirect to login, but skip for profile check (initial auth)
        if (error.response?.status === 401 && !error.config?.url?.includes("/user/profile")) {
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;