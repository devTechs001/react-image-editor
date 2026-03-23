// frontend/src/components/layout/BottomNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Folder, Plus, MessageSquare, User, BarChart3, GalleryVerticalEnd } from 'lucide-react';
import { cn } from '@/utils/helpers/cn';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: BarChart3, label: 'Dash', href: '/dashboard' },
  { icon: Plus, label: 'Create', href: '/editor', primary: true },
  { icon: GalleryVerticalEnd, label: 'Gallery', href: '/gallery' },
  { icon: User, label: 'Profile', href: '/profile' }
];

export default function BottomNav({ className }) {
  const location = useLocation();

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'bg-editor-surface/95 backdrop-blur-xl border-t border-editor-border',
      'safe-area-inset-bottom',
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href !== '/' && location.pathname.startsWith(item.href));

          if (item.primary) {
            return (
              <Link
                key={item.label}
                to={item.href}
                className="relative -top-4"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow"
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary-500/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 mb-1 transition-colors',
                  isActive ? 'text-primary-400' : 'text-surface-400'
                )}
              />
              <span className={cn(
                'text-[10px] transition-colors',
                isActive ? 'text-primary-400' : 'text-surface-500'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
