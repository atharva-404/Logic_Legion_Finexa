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
    financial_health_score?: number;
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
    addCredits: (amount: number) => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);
const STORAGE_KEY = 'finexa_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBackendAvailable, setIsBackendAvailable] = useState(false);

    // Check backend availability
    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${BASE_URL}/auth/me/`, {
                    signal: AbortSignal.timeout(2500),
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
            if (access && isBackendAvailable) {
                try {
                    const u = await AuthAPI.me();
                    setUser({
                        ...u,
                        ai_credits: u.ai_credits ?? u.credits ?? 100000,
                        income: u.income ? +u.income : 0,
                        financial_health_score: u.financial_health_score ?? 0,
                        onboarding_completed: u.onboarding_completed ?? false,
                    });
                    setIsLoading(false);
                    return;
                } catch {
                    AuthAPI.clearTokens();
                }
            }
            // Fallback: local user
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem(STORAGE_KEY); }
            }
            setIsLoading(false);
        };
        restore();
    }, [isBackendAvailable]);

    const refreshUser = async () => {
        try {
            const u = await AuthAPI.me();
            const ud = {
                ...u,
                ai_credits: u.ai_credits ?? u.credits ?? 100000,
                income: u.income ? +u.income : 0,
                financial_health_score: u.financial_health_score ?? 0,
                onboarding_completed: u.onboarding_completed ?? false,
            };
            setUser(ud);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ud));
        } catch { /* silent */ }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            if (isBackendAvailable) {
                const data = await AuthAPI.login({ email, password });
                AuthAPI.saveTokens(data.access, data.refresh);
                
                // Fetch full profile
                const full = await AuthAPI.me();
                const u = {
                    ...full,
                    ai_credits: full.ai_credits ?? full.credits ?? 100000,
                    income: full.income ? +full.income : 0,
                    financial_health_score: full.financial_health_score ?? 0,
                    onboarding_completed: full.onboarding_completed ?? false,
                };
                setUser(u);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                setIsLoading(false);
                return { success: true };
            }

            // Offline fallback: check local users
            const usersRaw = localStorage.getItem('finexa_local_users');
            const users: Array<UserProfile & { password: string }> = usersRaw ? JSON.parse(usersRaw) : [];
            const found = users.find(u => u.email === email && (u as any).password === password);
            if (!found) { setIsLoading(false); return { success: false, error: 'Invalid email or password' }; }
            const { password: _p, ...ud } = found;
            setUser(ud);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ud));
            setIsLoading(false);
            return { success: true };
        } catch (e: any) {
            setIsLoading(false);
            return { success: false, error: e.message || 'Login failed' };
        }
    };

    const signup = async (username: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            if (isBackendAvailable) {
                await AuthAPI.register({ username, email, password, password_confirm: password });
                const loginData = await AuthAPI.login({ email, password });
                AuthAPI.saveTokens(loginData.access, loginData.refresh);
                
                const u = {
                    ...loginData.user,
                    ai_credits: 100000,
                    onboarding_completed: false,
                };
                setUser(u);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
                setIsLoading(false);
                return { success: true };
            }

            // Offline
            const usersRaw = localStorage.getItem('finexa_local_users');
            const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
            if (users.find(u => u.email === email)) {
                setIsLoading(false);
                return { success: false, error: 'Email already registered' };
            }
            const newUser: UserProfile = { 
                id: Date.now(), 
                username, 
                email, 
                first_name: username, 
                ai_credits: 100000,
                financial_health_score: 50,
                onboarding_completed: false
            };
            users.push({ ...newUser, password });
            localStorage.setItem('finexa_local_users', JSON.stringify(users));
            setUser(newUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
            setIsLoading(false);
            return { success: true };
        } catch (e: any) {
            setIsLoading(false);
            return { success: false, error: e.message || 'Signup failed' };
        }
    };

    const addCredits = (amount: number) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ai_credits: (prev.ai_credits ?? 0) + amount };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            // Also update in local users list if offline
            const usersRaw = localStorage.getItem('finexa_local_users');
            if (usersRaw) {
                const users = JSON.parse(usersRaw);
                const idx = users.findIndex((u: any) => u.id === prev.id);
                if (idx !== -1) { users[idx] = { ...users[idx], ai_credits: updated.ai_credits }; }
                localStorage.setItem('finexa_local_users', JSON.stringify(users));
            }
            return updated;
        });
    };

    const logout = () => {
        AuthAPI.logout();
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isBackendAvailable, login, signup, logout, refreshUser, addCredits }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
