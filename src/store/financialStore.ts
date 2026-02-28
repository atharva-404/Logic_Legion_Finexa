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
            healthScore: 65,
            goals: defaultGoals,
            habits: defaultHabits,
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
                set(state => {
                    const habit = state.habits.find(h => h.id === id);
                    if (!habit) return state;
                    const isNowCompleted = !habit.completed;

                    // Each protocol impacts health score by 4-6 points
                    const scoreAdjustment = isNowCompleted ? 5 : -5;

                    return {
                        habits: state.habits.map(h =>
                            h.id === id ? { ...h, completed: isNowCompleted, streak: isNowCompleted ? h.streak + 1 : h.streak } : h
                        ),
                        healthScore: Math.max(0, Math.min(100, state.healthScore + scoreAdjustment))
                    };
                }),

            toggleEli15: () => set(state => ({ eli15Mode: !state.eli15Mode })),

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
                healthScore: 50, goals: defaultGoals, habits: defaultHabits,
                eli15Mode: false, aiCredits: 100000, creditLog: [],
            }),
        }),
        { name: 'finexa-v2-state' }
    )
);
