// frontend/src/components/ui/Badge.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

const badgeVariants = {
  primary: 'bg-primary-500/10 text-primary-300 border-primary-500/30',
  secondary: 'bg-secondary-500/10 text-secondary-300 border-secondary-500/30',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  neutral: 'bg-surface-500/10 text-surface-300 border-surface-500/30'
};

const badgeSizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm'
};

export default function Badge({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  dot = false,
  animate = false,
  ...props
}) {
  const baseClasses = cn(
    'inline-flex items-center gap-1.5 font-medium rounded-full border',
    badgeVariants[variant],
    badgeSizes[size],
    animate && 'animate-pulse',
    className
  );

  const Component = animate ? motion.span : 'span';

  return (
    <Component
      className={baseClasses}
      initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-rose-400',
          variant === 'info' && 'bg-cyan-400',
          variant === 'primary' && 'bg-primary-400',
          variant === 'secondary' && 'bg-secondary-400',
          variant === 'neutral' && 'bg-surface-400'
        )} />
      )}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </Component>
  );
}
