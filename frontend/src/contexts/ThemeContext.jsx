// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    name: 'dark',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#0a0a1a',
      surface: '#12121f',
      card: '#1a1a2e',
      border: '#2a2a42',
      text: '#f1f5f9',
      textMuted: '#94a3b8'
    }
  },
  light: {
    name: 'light',
    colors: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      background: '#f8fafc',
      surface: '#ffffff',
      card: '#f1f5f9',
      border: '#e2e8f0',
      text: '#0f172a',
      textMuted: '#64748b'
    }
  },
  midnight: {
    name: 'midnight',
    colors: {
      primary: '#06b6d4',
      secondary: '#14b8a6',
      background: '#020617',
      surface: '#0f172a',
      card: '#1e293b',
      border: '#334155',
      text: '#f8fafc',
      textMuted: '#94a3b8'
    }
  },
  sunset: {
    name: 'sunset',
    colors: {
      primary: '#f97316',
      secondary: '#f59e0b',
      background: '#0c0a09',
      surface: '#1c1917',
      card: '#292524',
      border: '#44403c',
      text: '#fafaf9',
      textMuted: '#a8a29e'
    }
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved && themes[saved] ? saved : 'dark';
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || '#6366f1';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.className = theme;
    
    // Apply theme colors as CSS variables
    const root = document.documentElement;
    const currentTheme = themes[theme];
    
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  const value = {
    theme,
    setTheme,
    themes,
    currentTheme: themes[theme],
    accentColor,
    setAccentColor,
    isDark: theme !== 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;