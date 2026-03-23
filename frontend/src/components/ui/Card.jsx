// frontend/src/components/ui/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

export default function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = true,
  onClick,
  ...props
}) {
  const variants = {
    default: 'bg-editor-card border-editor-border',
    glass: 'bg-editor-card/70 backdrop-blur-xl border-primary-500/10',
    elevated: 'bg-editor-card border-editor-border shadow-glow',
    outline: 'bg-transparent border-editor-border',
    primary: 'bg-primary-500/10 border-primary-500/30',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20'
  };

  const paddingClasses = {
    true: 'p-6',
    false: ''
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={cn(
        'rounded-2xl border',
        'transition-all duration-300',
        variants[variant],
        padding && paddingClasses[padding],
        hover && 'hover:shadow-glow-lg hover:border-primary-500/30',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Card Header Component
export function CardHeader({ children, className, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Title Component
export function CardTitle({ children, className, as: Component = 'h3', ...props }) {
  return (
    <Component
      className={cn('text-base font-semibold text-white', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Card Subtitle Component
export function CardSubtitle({ children, className, ...props }) {
  return (
    <p
      className={cn('text-sm text-surface-400', className)}
      {...props}
    >
      {children}
    </p>
  );
}

// Card Content Component
export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

// Card Footer Component
export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn('flex items-center gap-3 pt-4 mt-4 border-t border-editor-border', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Action Component
export function CardAction({ children, className, ...props }) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  );
}
