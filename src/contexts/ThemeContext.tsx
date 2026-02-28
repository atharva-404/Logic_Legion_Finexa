import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';
interface ThemeCtx { theme: Theme; toggle: () => void; isDark: boolean; }

const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggle: () => { }, isDark: true });

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const s = localStorage.getItem('finexa_theme') as Theme | null;
        return s ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    useEffect(() => {
        // Use 'light' class instead of 'dark', since CSS uses .light selector
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
        localStorage.setItem('finexa_theme', theme);
    }, [theme]);

    const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    return (
        <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
