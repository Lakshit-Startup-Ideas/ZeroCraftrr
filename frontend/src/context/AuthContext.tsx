import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, login as loginApi, register as registerApi, type RegisterPayload } from '../services/auth';

interface UserProfile {
    id?: number;
    email: string;
    full_name?: string;
}

interface AuthContextType {
    token: string | null;
    user: UserProfile | null;
    initializing: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const TOKEN_KEY = 'zerocraftr_token';
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
    const [user, setUser] = useState<UserProfile | null>(null);
    const [initializing, setInitializing] = useState<boolean>(true);

    const persistToken = (value: string | null) => {
        setToken(value);
        if (value) {
            localStorage.setItem(TOKEN_KEY, value);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    };

    const hydrateUser = async (incomingToken?: string) => {
        try {
            if (incomingToken) {
                persistToken(incomingToken);
            }
            const profile = await fetchMe();
            setUser(profile);
        } catch (error) {
            console.error('Auth bootstrap failed', error);
            persistToken(null);
            setUser(null);
        } finally {
            setInitializing(false);
        }
    };

    useEffect(() => {
        if (!token) {
            setInitializing(false);
            return;
        }
        hydrateUser();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await loginApi(email, password);
        await hydrateUser(data.access_token);
    };

    const register = async (payload: RegisterPayload) => {
        await registerApi(payload);
        await login(payload.email, payload.password);
    };

    const logout = () => {
        persistToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        await hydrateUser();
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                initializing,
                isAuthenticated: Boolean(token && user),
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
