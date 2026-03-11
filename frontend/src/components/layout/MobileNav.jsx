// frontend/src/components/layout/MobileNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Image, Video, FolderOpen, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Image, label: 'Image', path: '/editor' },
  { icon: Video, label: 'Video', path: '/video-editor' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-editor-surface/95 backdrop-blur-xl border-t border-editor-border safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all relative',
                isActive ? 'text-primary-400' : 'text-surface-400'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveNav"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"
                />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}