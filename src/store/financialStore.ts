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

    // Cards
    addCard: (card: Omit<CardInfo, 'id'>) => void;
    removeCard: (id: string) => void;
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
            cards: [
                { id: 'c1', number: '4231 8821 3765 9012', last4: '9012', holder: 'Arjun Sharma', expiry: '08/28', cvv: '123', type: 'Visa', gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4c1d95 100%)' },
                { id: 'c2', number: '9087 1122 3344 5566', last4: '5566', holder: 'Arjun Sharma', expiry: '12/27', cvv: '456', type: 'Mastercard', gradient: 'linear-gradient(135deg, #0d0b2e 0%, #3b1d8c 70%, #7c3aed 100%)' },
            ],

            setIncome: (income) => {
                const { useCredits } = get();
                useCredits(10, 'Income Strategy Analysis');
                set({ monthlyIncome: income });
            },
            setExpenses: (expenses) => {
                const { useCredits } = get();
                useCredits(10, 'Expense Control Analysis');
                set({ monthlyExpenses: expenses });
            },
            setSavings: (savings) => {
                const { useCredits } = get();
                useCredits(10, 'Capital Reserve Analysis');
                set({ emergencySavings: savings });
            },
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

                    // Each protocol impacts health score by 5 points
                    const scoreAdjustment = isNowCompleted ? 5 : -5;

                    // Deduct 50 credits for approving compliance
                    let newCredits = state.aiCredits;
                    let newLog = state.creditLog;

                    if (isNowCompleted) {
                        if (state.aiCredits < 50) return state; // Insufficient credits
                        newCredits -= 50;
                        newLog = [
                            { reason: 'Protocol Surveillance', amount: 50, ts: Date.now(), type: 'use' },
                            ...state.creditLog.slice(0, 49)
                        ];
                    }

                    return {
                        habits: state.habits.map(h =>
                            h.id === id ? { ...h, completed: isNowCompleted, streak: isNowCompleted ? h.streak + 1 : h.streak } : h
                        ),
                        healthScore: Math.max(0, Math.min(100, state.healthScore + scoreAdjustment)),
                        aiCredits: newCredits,
                        creditLog: newLog
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

            // Cards
            addCard: (card) => set(state => ({
                cards: [...state.cards, { ...card, id: `c_${Date.now()}` }]
            })),
            removeCard: (id) => set(state => ({
                cards: state.cards.filter(c => c.id !== id)
            })),

            deleteAllData: () => set({
                monthlyIncome: 85000, monthlyExpenses: 54500, emergencySavings: 120000,
                healthScore: 65, goals: defaultGoals, habits: defaultHabits,
                eli15Mode: false, aiCredits: 100000, creditLog: [],
                cards: [
                    { id: 'c1', number: '4231 8821 3765 9012', last4: '9012', holder: 'Arjun Sharma', expiry: '08/28', cvv: '123', type: 'Visa', gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #4c1d95 100%)' },
                    { id: 'c2', number: '9087 1122 3344 5566', last4: '5566', holder: 'Arjun Sharma', expiry: '12/27', cvv: '456', type: 'Mastercard', gradient: 'linear-gradient(135deg, #0d0b2e 0%, #3b1d8c 70%, #7c3aed 100%)' },
                ],
            }),
        }),
        { name: 'finexa-v2-state' }
    )
);
