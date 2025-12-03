import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi } from '../services/auth';

interface AuthContextType {
    token: string | null;
    login: (u: string, p: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const login = async (username, password) => {
        const data = await loginApi(username, password);
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
