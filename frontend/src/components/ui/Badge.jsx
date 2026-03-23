// frontend/src/components/ui/Badge.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

const badgeVariants = {
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30 hover:bg-primary-500/30',
  secondary: 'bg-surface-500/20 text-surface-300 border-surface-500/30 hover:bg-surface-500/30',
  success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30',
  danger: 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30',
  info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30',
  pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30'
};

const badgeSizes = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm'
};

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className,
  dot,
  pulse,
  icon: Icon,
  ...props
}) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        'transition-colors duration-200',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'primary' && 'bg-primary-400',
            variant === 'success' && 'bg-emerald-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'info' && 'bg-cyan-400',
            pulse && 'animate-pulse'
          )}
        />
      )}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </motion.span>
  );
}
