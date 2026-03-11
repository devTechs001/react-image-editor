// frontend/src/components/ui/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers/cn';

const cardVariants = {
  default: 'bg-editor-card border border-editor-border',
  elevated: 'bg-editor-card border border-editor-border shadow-elevated',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
  interactive: 'bg-editor-card border border-editor-border hover:border-primary-500/50 transition-colors cursor-pointer'
};

const cardSizes = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

export default function Card({
  children,
  className,
  variant = 'default',
  size = 'md',
  hover = false,
  animate = false,
  onClick,
  ...props
}) {
  const baseClasses = cn(
    'rounded-xl overflow-hidden',
    cardVariants[variant],
    cardSizes[size],
    hover && 'hover:shadow-glow transition-shadow',
    className
  );

  if (animate) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Sub-components
Card.Header = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

Card.Title = ({ children, className, as: Component = 'h3' }) => (
  <Component className={cn('text-base font-semibold text-white', className)}>
    {children}
  </Component>
);

Card.Description = ({ children, className }) => (
  <p className={cn('text-sm text-surface-400 mt-1', className)}>{children}</p>
);

Card.Body = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

Card.Footer = ({ children, className, separator = true }) => (
  <div className={cn('flex items-center gap-3 pt-4 mt-4', separator && 'border-t border-editor-border', className)}>
    {children}
  </div>
);
