/**
 * Finexa API Service Layer
 * Base URL: http://localhost:8000
 */

export const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

// ─── Token helpers ──────────────────────────────────────────────
function getTokens() {
    return {
        access: localStorage.getItem('finexa_access') || '',
        refresh: localStorage.getItem('finexa_refresh') || '',
    };
}
function saveTokens(access: string, refresh: string) {
    localStorage.setItem('finexa_access', access);
    localStorage.setItem('finexa_refresh', refresh);
}
function clearTokens() {
    localStorage.removeItem('finexa_access');
    localStorage.removeItem('finexa_refresh');
}

// ─── Core fetch wrapper ─────────────────────────────────────────
async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    requiresAuth = true,
    retry = true,
): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (requiresAuth) {
        const { access } = getTokens();
        if (access) headers['Authorization'] = `Bearer ${access}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    // Token expired — try refresh once
    if (res.status === 401 && retry) {
        const refreshed = await tryRefreshToken();
        if (refreshed) return apiFetch<T>(path, options, requiresAuth, false);
        clearTokens();
        // Don't hard-redirect — let components handle the error gracefully
        // Only redirect if there's no stored user session at all
        const storedUser = localStorage.getItem('finexa_user');
        if (!storedUser) {
            window.location.href = '/login';
        }
        throw new Error('Session expired — please log in again');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || err.detail || JSON.stringify(err));
    }

    // 204 No Content
    if (res.status === 204) return {} as T;
    return res.json();
}

async function tryRefreshToken(): Promise<boolean> {
    try {
        const { refresh } = getTokens();
        if (!refresh) return false;
        const res = await fetch(`${BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        saveTokens(data.access, refresh);
        return true;
    } catch {
        return false;
    }
}

// Multipart upload (no Content-Type so browser sets boundary)
async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
    const { access } = getTokens();
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${access}` },
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || err.detail || 'Upload failed');
    }
    return res.json();
}

// ─── Auth API ───────────────────────────────────────────────────
export const AuthAPI = {
    register: (data: { username: string; email: string; password: string; password_confirm: string }) =>
        apiFetch<{ message: string; user: any }>('/auth/register/', {
            method: 'POST', body: JSON.stringify(data),
        }, false),

    login: (data: { email: string; password: string }) =>
        apiFetch<{ user: any; access: string; refresh: string }>('/auth/login/', {
            method: 'POST', body: JSON.stringify(data),
        }, false),

    me: () => apiFetch<any>('/auth/me/'),

    updateProfile: (data: { first_name?: string; last_name?: string; income?: number }) =>
        apiFetch<any>('/auth/profile/update/', { method: 'PUT', body: JSON.stringify(data) }),

    logout: () => { clearTokens(); },

    saveTokens,
    getTokens,
    clearTokens,
};

// ─── Wallet API ─────────────────────────────────────────────────
export const WalletAPI = {
    getWallet: () =>
        apiFetch<{ id: number; balance: number; currency: string }>('/api/ai/wallet/'),

    addMoney: (amount: number, description = 'Deposit') =>
        apiFetch<any>('/api/ai/wallet/add-money/', {
            method: 'POST', body: JSON.stringify({ amount, description }),
        }),

    withdraw: (amount: number, description = 'Withdrawal') =>
        apiFetch<any>('/api/ai/wallet/withdraw/', {
            method: 'POST', body: JSON.stringify({ amount, description }),
        }),

    getTransactions: (page = 1) =>
        apiFetch<{ count: number; results: any[] }>(`/api/ai/wallet/transactions/?page=${page}`),

    getTimeline: () => apiFetch<any[]>('/api/ai/wallet/timeline/'),
};

// ─── Card API ───────────────────────────────────────────────────
export const CardAPI = {
    list: () =>
        apiFetch<{ id: number; last4: string; card_holder: string; expiry: string; card_type: string; gradient_index: number }[]>('/api/auth/cards/'),

    add: (data: { card_number: string; card_holder: string; expiry: string; card_type: string; gradient_index: number }) =>
        apiFetch<any>('/api/auth/cards/', {
            method: 'POST', body: JSON.stringify(data),
        }),

    remove: (id: number) =>
        apiFetch<any>(`/api/auth/cards/${id}/`, { method: 'DELETE' }),
};

// ─── Financial Health API ───────────────────────────────────────
export const HealthAPI = {
    getScore: () =>
        apiFetch<{ score: number; grade: string; trend: string }>('/api/ai/financial-health/score/'),

    getHistory: (period: 'week' | 'month' | 'year' = 'month') =>
        apiFetch<any[]>(`/api/ai/financial-health/history/?period=${period}`),

    getBreakdown: () => apiFetch<any>('/api/ai/financial-health/breakdown/'),

    recalculate: () =>
        apiFetch<any>('/api/ai/financial-health/recalculate/', { method: 'POST' }),

    getRecommendations: () => apiFetch<any[]>('/api/ai/financial-health/recommendations/'),
};

// ─── Transactions API ───────────────────────────────────────────
export const TransactionsAPI = {
    list: (page = 1, category?: string) => {
        const params = new URLSearchParams({ page: String(page) });
        if (category) params.set('category', category);
        return apiFetch<{ count: number; next: string | null; results: any[] }>(`/api/transactions/?${params}`);
    },

    summary: () => apiFetch<{
        month: string;
        profile_income: number;
        transaction_income: number;
        total_income: number;
        total_expense: number;
        savings: number;
        all_time_savings: number;
        categories: { name: string; amount: number }[];
    }>('/api/transactions/summary/'),

    create: (data: { amount: number; category: string; type: 'income' | 'expense'; description: string; date: string }) =>
        apiFetch<any>('/api/transactions/', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Goals API ──────────────────────────────────────────────────
export const GoalsAPI = {
    list: () => apiFetch<{ count: number; results: any[] }>('/api/goals/'),

    create: (data: {
        title: string; target_amount: number; current_amount: number;
        deadline: string; priority?: string; monthly_contribution?: number; icon?: string;
    }) => apiFetch<any>('/api/goals/', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: number, data: Partial<any>) =>
        apiFetch<any>(`/api/goals/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (id: number) =>
        apiFetch<void>(`/api/goals/${id}/`, { method: 'DELETE' }),

    getAIPlan: (refresh = false) =>
        apiFetch<any>(`/api/ai/goal-plan/${refresh ? '?refresh=true' : ''}`),

    simulateIncome: (changePct: number) =>
        apiFetch<any>('/api/ai/goal-plan/simulate/', {
            method: 'POST', body: JSON.stringify({ change_pct: changePct }),
        }),
};

// ─── Gamification API ───────────────────────────────────────────
export const GamificationAPI = {
    getData: () =>
        apiFetch<{ badges: any[]; total_points: number; level: number }>('/api/gamification/summary/'),

    // Challenges
    getChallenges: () =>
        apiFetch<{ count: number; results: any[] }>('/api/gamification/my-challenges/'),

    toggleChallenge: (id: number) =>
        apiFetch<any>(`/api/gamification/my-challenges/${id}/toggle/`, { method: 'POST' }),

    // Badges
    getBadges: () => apiFetch<any[]>('/api/gamification/badges/'),
    getMyBadges: () => apiFetch<any[]>('/api/gamification/my-badges/'),
};

// ─── Settings API ───────────────────────────────────────────────
export const SettingsAPI = {
    get: () => apiFetch<any>('/api/users/settings/'),

    update: (data: Record<string, any>) =>
        apiFetch<any>('/api/users/settings/', {
            method: 'PATCH', body: JSON.stringify(data),
        }),

    getFullProfile: () => apiFetch<any>('/api/users/profile/full/'),

    changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
        apiFetch<any>('/api/users/change-password/', {
            method: 'POST', body: JSON.stringify(data),
        }),

    exportData: () => apiFetch<any>('/api/users/export-data/', { method: 'POST' }),
};

// ─── AI API ─────────────────────────────────────────────────────
export const AIAPI = {
    processDocument: (file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return apiUpload<any>('/api/ai/document/process/', fd);
    },

    listDocuments: () => apiFetch<any[]>('/api/ai/documents/'),

    getDocumentContent: (id: number) =>
        apiFetch<{ text: string }>(`/api/ai/documents/${id}/content/`),

    getExpenseSummary: (mongoId: string) =>
        apiFetch<any>(`/api/ai/expense-document/${mongoId}/summary/`),

    getSuggestions: (mongoId: string) =>
        apiFetch<any>(`/api/ai/expense-document/${mongoId}/suggestions/`),

    getChatSessions: () => apiFetch<any>('/api/ai/chat-sessions/'),

    getChatMessages: (sessionId: string) =>
        apiFetch<any>(`/api/ai/chat-sessions/${sessionId}/messages/`),

    getSpendingAnalysis: (refresh = false) =>
        apiFetch<any>(`/api/ai/spending-analysis/${refresh ? '?refresh=true' : ''}`),

    getBudgetAdvice: () =>
        apiFetch<{ tips: { tip: string; category: string; save_per_month: number }[]; income?: number; expense?: number; savings?: number }>('/api/ai/budget-advice/'),
};

// ─── Notifications API ──────────────────────────────────────────
export const NotificationsAPI = {
    list: () => apiFetch<any[]>('/api/users/notifications/'),

    markRead: (id: number) =>
        apiFetch<any>(`/api/users/notifications/${id}/read/`, { method: 'POST' }),

    markAllRead: () =>
        apiFetch<any>('/api/users/notifications/mark-all-read/', { method: 'POST' }),

    deleteNotif: (id: number) =>
        apiFetch<void>(`/api/users/notifications/${id}/delete/`, { method: 'DELETE' }),
};

// ─── Onboarding API ─────────────────────────────────────────────
export interface OnboardingData {
    first_name: string;
    last_name?: string;
    monthly_income: number;
    spending: { category: string; amount: number; description?: string }[];
}

export const OnboardingAPI = {
    submit: (data: OnboardingData) =>
        apiFetch<any>('/api/users/onboarding/', {
            method: 'POST', body: JSON.stringify(data),
        }),
};

// ─── Credits API ────────────────────────────────────────────────
export const CreditsAPI = {
    purchase: (planId: string) =>
        apiFetch<{ success: boolean; plan: string; credits_added: number; total_credits: number }>(
            '/auth/purchase-credits/',
            { method: 'POST', body: JSON.stringify({ plan_id: planId }) },
        ),
};

// Helper: check if backend is available
export async function checkBackendAvailable(): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/auth/me/`, { signal: AbortSignal.timeout(2000) });
        return res.status !== 0;
    } catch {
        return false;
    }
}
