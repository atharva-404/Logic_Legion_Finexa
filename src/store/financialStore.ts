import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultGoals, defaultHabits, Goal, HabitChallenge } from '../lib/mockData';

interface FinancialState {
    monthlyIncome: number;
    monthlyExpenses: number;
    emergencySavings: number;
    healthScore: number;
    goals: Goal[];
    habits: HabitChallenge[];
    totalPoints: number;
    eli15Mode: boolean;
    aiCredits: number;

    // Financial actions
    setIncome: (income: number) => void;
    setExpenses: (expenses: number) => void;
    setSavings: (savings: number) => void;
    setHealthScore: (score: number) => void;
    addGoal: (goal: Goal) => void;
    updateGoalProgress: (id: string, amount: number) => void;
    removeGoal: (id: string) => void;
    toggleHabit: (id: string) => void;
    toggleEli15: () => void;
    addPoints: (pts: number) => void;
    deleteAllData: () => void;

    // AI Credits
    useCredits: (amount: number, reason?: string) => boolean; // returns false if insufficient
    addCredits: (amount: number) => void;
    creditLog: Array<{ reason: string; amount: number; ts: number; type: 'use' | 'add' }>;
}

export const useFinancialStore = create<FinancialState>()(
    persist(
        (set, get) => ({
            monthlyIncome: 85000,
            monthlyExpenses: 54500,
            emergencySavings: 120000,
            healthScore: 50,
            goals: defaultGoals,
            habits: defaultHabits,
            totalPoints: 175,
            eli15Mode: false,
            aiCredits: 100000,
            creditLog: [],

            setIncome: (income) => set({ monthlyIncome: income }),
            setExpenses: (expenses) => set({ monthlyExpenses: expenses }),
            setSavings: (savings) => set({ emergencySavings: savings }),
            setHealthScore: (score) => set({ healthScore: score }),

            addGoal: (goal) => set(state => ({ goals: [...state.goals, goal] })),
            updateGoalProgress: (id, amount) =>
                set(state => ({
                    goals: state.goals.map(g =>
                        g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
                    ),
                })),
            removeGoal: (id) => set(state => ({ goals: state.goals.filter(g => g.id !== id) })),

            toggleHabit: (id) =>
                set(state => ({
                    habits: state.habits.map(h =>
                        h.id === id ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak } : h
                    ),
                    totalPoints: state.habits.find(h => h.id === id)?.completed
                        ? state.totalPoints - (state.habits.find(h => h.id === id)?.points ?? 0)
                        : state.totalPoints + (state.habits.find(h => h.id === id)?.points ?? 0),
                })),

            toggleEli15: () => set(state => ({ eli15Mode: !state.eli15Mode })),
            addPoints: (pts) => set(state => ({ totalPoints: state.totalPoints + pts })),

            // AI Credits
            useCredits: (amount, reason = 'AI Feature') => {
                const { aiCredits, creditLog } = get();
                if (aiCredits < amount) return false;
                set({
                    aiCredits: aiCredits - amount,
                    creditLog: [
                        { reason, amount, ts: Date.now(), type: 'use' },
                        ...creditLog.slice(0, 49),
                    ],
                });
                return true;
            },

            addCredits: (amount) =>
                set(state => ({
                    aiCredits: state.aiCredits + amount,
                    creditLog: [
                        { reason: 'Credits purchased', amount, ts: Date.now(), type: 'add' },
                        ...state.creditLog.slice(0, 49),
                    ],
                })),

            deleteAllData: () => set({
                monthlyIncome: 85000, monthlyExpenses: 54500, emergencySavings: 120000,
                healthScore: 50, goals: defaultGoals, habits: defaultHabits, totalPoints: 0,
                eli15Mode: false, aiCredits: 100000, creditLog: [],
            }),
        }),
        { name: 'finexa-v2-state' }
    )
);
