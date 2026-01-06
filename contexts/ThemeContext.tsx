import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system'); // Initialize with default value
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load theme from localStorage after mounting
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    setMounted(true); // Ensure mounted is set to true after initial load
  }, []);

  useEffect(() => {
    if (!mounted) return; // Don't execute theme logic on first render

    const root = window.document.documentElement;

    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    // Determine actual theme to apply
    let themeToApply: 'light' | 'dark';

    if (theme === 'system') {
      // Check OS preference
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      themeToApply = systemPrefersDark ? 'dark' : 'light';
    } else {
      themeToApply = theme;
    }

    // Apply theme class to root element
    root.classList.add(themeToApply);
    setActualTheme(themeToApply);

    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      const newTheme = e.matches ? 'dark' : 'light';

      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      setActualTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    actualTheme,
    mounted,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
