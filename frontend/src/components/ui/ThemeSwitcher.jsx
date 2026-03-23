// frontend/src/components/ui/ThemeSwitcher.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';
import { useTheme } from '@/contexts/ThemeContext';
import Button from './Button';

export default function ThemeSwitcher({ variant = 'button' }) {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes'
    },
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean and bright'
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Follow device settings'
    }
  ];

  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <Button variant="ghost" size="icon">
          {theme === 'dark' && <Moon className="w-5 h-5" />}
          {theme === 'light' && <Sun className="w-5 h-5" />}
          {theme === 'system' && <Monitor className="w-5 h-5" />}
        </Button>

        <div className="absolute right-0 top-full mt-2 py-2 w-48 bg-editor-surface rounded-xl border border-editor-border shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {themes.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  theme === t.id
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-surface-300 hover:bg-hover'
                )}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-surface-400">{t.description}</div>
                </div>
                {theme === t.id && (
                  <motion.div
                    layoutId="theme-check"
                    className="ml-auto w-2 h-2 bg-primary-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Button group variant
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-800 rounded-xl">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'relative px-3 py-2 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'text-white'
                : 'text-surface-400 hover:text-white'
            )}
            title={t.description}
          >
            {isActive && (
              <motion.div
                layoutId="theme-bg"
                className="absolute inset-0 bg-primary-500 rounded-lg"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <Icon className="w-4 h-4" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
