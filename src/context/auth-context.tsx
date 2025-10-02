"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    isLoadingAuth: boolean;
    userId: string | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    // helper utk set token + userId
    const handleSetToken = useCallback((jwt: string) => {
        setToken(jwt);
        const decodedId = decodeUserId(jwt);
        setUserId(decodedId);
        localStorage.setItem("token", jwt);
    }, []);

    useEffect(() => {
        // ⏳ load token dari localStorage sekali saat awal
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            handleSetToken(savedToken);
        }
        setIsLoadingAuth(false);
    }, [handleSetToken]);

    const decodeUserId = (jwt: string): string | null => {
        try {
            const payloadBase64 = jwt.split(".")[1];
            const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));
            return payload.userId || payload.sub || payload.id || null;
        } catch (err) {
            console.error("Gagal decode JWT:", err);
            return null;
        }
    };



    // ✅ login function bisa di-await
    const login = async (jwt: string) => {
        return new Promise<void>((resolve) => {
            handleSetToken(jwt);
            resolve();
        });
    };

    const logout = () => {
        setToken(null);
        setUserId(null);
        localStorage.removeItem("token");
    };

    const value: AuthContextType = {
        token,
        isAuthenticated: !!token && !!userId,
        isLoadingAuth,
        userId,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
