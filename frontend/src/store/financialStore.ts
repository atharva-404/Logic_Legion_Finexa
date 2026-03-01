import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultGoals, defaultHabits, Goal, HabitChallenge } from '../lib/mockData';

export interface CardInfo {
    id: string;
    number: string;
    last4: string;
    holder: string;
    expiry: string;
    cvv: string;
    type: 'Visa' | 'Mastercard' | 'Amex';
    gradient: string;
}

interface FinancialState {
    monthlyIncome: number;
    monthlyExpenses: number;
    emergencySavings: number;
    healthScore: number;
    goals: Goal[];
    habits: HabitChallenge[];
    eli15Mode: boolean;
    aiCredits: number;
    cards: CardInfo[];

    // Financial actions
    setIncome: (income: number) => void;
    setExpenses: (expenses: number) => void;
    setEmergencySavings: (savings: number) => void;
    setHealthScore: (score: number) => void;

    // Goals
    updateGoalProgress: (goalId: string, amount: number) => void;

    // Habits
    toggleHabit: (id: string) => void;

    // ELI-15
    toggleEli15: () => void;

    // Credits
    useCredits: (amount: number, reason?: string) => boolean; // returns false if insufficient
    addCredits: (amount: number) => void;
    creditLog: Array<{ reason: string; amount: number; ts: number; type: 'use' | 'add' }>;

    // Cards
    addCard: (card: Omit<CardInfo, 'id'>) => void;
    removeCard: (id: string) => void;

    deleteAllData: () => void;
}

export const useFinancialStore = create<FinancialState>()(
    persist(
        (set, get) => ({
            monthlyIncome: 50000,
            monthlyExpenses: 54500,
            emergencySavings: 120000,
            healthScore: 65,
            goals: defaultGoals,
            habits: defaultHabits,
            eli15Mode: false,
            aiCredits: 100000,
            creditLog: [],
            cards: [],

            setIncome: (income) => {
                const { useCredits } = get();
                useCredits(10, 'Update income');
                set({ monthlyIncome: income });
            },
            setExpenses: (expenses) => set({ monthlyExpenses: expenses }),
            setEmergencySavings: (savings) => set({ emergencySavings: savings }),
            setHealthScore: (score) => set({ healthScore: score }),

            updateGoalProgress: (goalId, amount) =>
                set(state => ({
                    goals: state.goals.map(g =>
                        g.id === goalId
                            ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
                            : g
                    ),
                })),

            toggleHabit: (id) =>
                set(state => ({
                    habits: state.habits.map(h =>
                        h.id === id
                            ? {
                                  ...h,
                                  completed: !h.completed,
                                  streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1),
                              }
                            : h
                    ),
                })),

            toggleEli15: () => set(state => ({ eli15Mode: !state.eli15Mode })),

            useCredits: (amount, reason = 'AI usage') => {
                const { aiCredits } = get();
                if (aiCredits < amount) return false;
                set(state => ({
                    aiCredits: state.aiCredits - amount,
                    creditLog: [
                        { reason, amount, ts: Date.now(), type: 'use' as const },
                        ...state.creditLog,
                    ],
                }));
                return true;
            },

            addCredits: (amount) =>
                set(state => ({
                    aiCredits: state.aiCredits + amount,
                    creditLog: [
                        { reason: 'Credit purchase', amount, ts: Date.now(), type: 'add' as const },
                        ...state.creditLog,
                    ],
                })),

            // Cards
            addCard: (card) => set(state => ({
                cards: [...state.cards, { ...card, id: `c_${Date.now()}` }]
            })),
            removeCard: (id) => set(state => ({
                cards: state.cards.filter(c => c.id !== id)
            })),

            deleteAllData: () => set({
                monthlyIncome: 50000, monthlyExpenses: 54500, emergencySavings: 120000,
                healthScore: 65, goals: defaultGoals, habits: defaultHabits,
                eli15Mode: false, aiCredits: 100000, creditLog: [],
                cards: [],
            }),
        }),
        { name: 'finexa-v2-state' }
    )
);
