import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthAPI, BASE_URL } from '../lib/api';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    ai_credits?: number;
    income?: number;
    onboarding_completed?: boolean;
}

interface AuthCtx {
    user: UserProfile | null;
    isLoading: boolean;
    isBackendAvailable: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBackendAvailable, setIsBackendAvailable] = useState(true);

    // Check backend availability
    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${BASE_URL}/auth/me/`, {
                    signal: AbortSignal.timeout(3000),
                    headers: { Authorization: `Bearer ${localStorage.getItem('finexa_access') || ''}` },
                });
                setIsBackendAvailable(res.status !== 0);
            } catch {
                setIsBackendAvailable(false);
            }
        };
        check();
    }, []);

    // Restore session on mount
    useEffect(() => {
        const restore = async () => {
            const { access } = AuthAPI.getTokens();
            if (access) {
                try {
                    const u = await AuthAPI.me();
                    setUser({
                        ...u,
                        ai_credits: u.ai_credits ?? u.credits ?? 0,
                        income: u.income ? +u.income : 0,
                        onboarding_completed: u.onboarding_completed ?? false,
                    });
                    setIsLoading(false);
                    return;
                } catch {
                    AuthAPI.clearTokens();
                }
            }
            setIsLoading(false);
        };
        restore();
    }, [isBackendAvailable]);

    const refreshUser = async () => {
        try {
            const u = await AuthAPI.me();
            setUser({
                ...u,
                ai_credits: u.ai_credits ?? u.credits ?? 0,
                income: u.income ? +u.income : 0,
                onboarding_completed: u.onboarding_completed ?? false,
            });
        } catch { /* silent */ }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await AuthAPI.login({ email, password });
            AuthAPI.saveTokens(data.access, data.refresh);
            const u = { ...data.user, ai_credits: data.user.ai_credits ?? data.user.credits ?? 0 };
            setUser(u);
            setIsLoading(false);
            // Now fetch full profile (login response may not include all fields)
            try {
                const full = await AuthAPI.me();
                setUser({
                    ...full,
                    ai_credits: full.ai_credits ?? full.credits ?? 0,
                    income: full.income ? +full.income : 0,
                    onboarding_completed: full.onboarding_completed ?? false,
                });
            } catch { /* ignore */ }
            return { success: true };
        } catch (e: any) {
            setIsLoading(false);
            return { success: false, error: e.message || 'Login failed. Please check your credentials.' };
        }
    };

    const signup = async (username: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await AuthAPI.register({ username, email, password, password_confirm: password });
            // Auto-login to get JWT tokens
            const loginData = await AuthAPI.login({ email, password });
            AuthAPI.saveTokens(loginData.access, loginData.refresh);
            const u = {
                ...loginData.user,
                ai_credits: loginData.user.ai_credits ?? loginData.user.credits ?? 0,
                onboarding_completed: false,                 // new user always
            };
            setUser(u);
            setIsLoading(false);
            return { success: true };
        } catch (e: any) {
            setIsLoading(false);
            return { success: false, error: e.message || 'Signup failed' };
        }
    };

    const logout = () => {
        AuthAPI.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isBackendAvailable, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
