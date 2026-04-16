import React, { createContext, useContext, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [role, setRole] = useState(localStorage.getItem('role') || null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const login = async (roleType) => {
        try {
            // Determine credentials based on UI button click for now
            const email = roleType === 'student' ? 'student@uni.edu' : 'admin@uni.edu';
            const res = await api.post('/auth/login', { email, password: 'password123' });
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.role);
            setToken(res.data.token);
            setRole(res.data.role);
            return true;
        } catch (err) {
            console.error("Login failed", err);
            alert("Login failed! Backend might be down.");
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ role, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
