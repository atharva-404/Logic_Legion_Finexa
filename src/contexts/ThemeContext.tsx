import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    isDark: boolean;
    theme: 'dark' | 'light';
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: true,
    theme: 'dark',
    toggle: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const stored = localStorage.getItem('finexa_theme');
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
        localStorage.setItem('finexa_theme', theme);
    }, [theme]);

    function toggle() {
        setTheme(t => t === 'dark' ? 'light' : 'dark');
    }

    return (
        <ThemeContext.Provider value={{ isDark: theme === 'dark', theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
