import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "@/api/client";

// global auth state
// stores logged-in user info, provide login/logout functions, persists across page navigation

interface User {
    full_name: string;
    email: string;
    login_type: "LOCAL" | "OAUTH";
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    loading: boolean;
    login: (user: User) => void;
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
            const {data} = await api.get("/auth/me");

            setUser({
                full_name: data.full_name,
                email: data.email,
                login_type: data.login_type
            });

        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);


    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    };



    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout, refreshUser }} >
            {children}
        </AuthContext.Provider>
    )
}