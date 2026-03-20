import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "@/api/client";

// global auth state
// stores logged-in user info, provide login/logout functions, persists across page navigation
// uses JWT tokens stored in localStorage

interface User {
    id: number;
    full_name: string;
    email: string;
    login_type: "LOCAL" | "OAUTH";
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoggedIn: false,
    loading: true,
    login: () => {},
    logout: async () => {},
    refreshUser: async () => {}
});



export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const {data} = await api.get("/auth/profile");

            setUser({
                id: data.id,
                full_name: data.full_name,
                email: data.email,
                login_type: data.login_type
            });

        } catch {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // handle Google OAuth callback: token passed as ?token= query param
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("token");
        if (tokenFromUrl) {
            localStorage.setItem("access_token", tokenFromUrl);
            // clean URL without reload
            window.history.replaceState({}, "", window.location.pathname);
        }

        refreshUser();
    }, []);


    const login = (userData: User, accessToken: string, refreshToken: string) => {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // ignore logout errors
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
    };



    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout, refreshUser }} >
            {children}
        </AuthContext.Provider>
    )
}