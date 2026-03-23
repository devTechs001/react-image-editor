// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Defensive check for React
if (!React || !React.useState) {
  console.error('React is not properly imported or available');
  throw new Error('React is not available. Please check your React installation.');
}

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  try {
    const [theme, setTheme] = useState(() => {
      // Check localStorage first
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    });

    const [isDark, setIsDark] = useState(true);

  // Apply theme class to document
    useEffect(() => {
      if (typeof document === 'undefined') return;
      
      const root = document.documentElement;
      
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(systemDark ? 'dark' : 'light');
        setIsDark(systemDark);
      } else {
        root.classList.add(theme);
        setIsDark(theme === 'dark');
      }
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        if (theme === 'system') {
          const root = document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(e.matches ? 'dark' : 'light');
          setIsDark(e.matches);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const value = {
      theme,
      setTheme,
      isDark,
      toggle: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    };

    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  } catch (error) {
    console.error('Error in ThemeProvider:', error);
    // Fallback theme provider
    return (
      <ThemeContext.Provider value={{
        theme: 'dark',
        setTheme: () => {},
        isDark: true,
        toggle: () => {}
      }}>
        {children}
      </ThemeContext.Provider>
    );
  }
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
